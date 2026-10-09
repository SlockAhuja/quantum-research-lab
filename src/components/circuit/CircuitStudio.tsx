/**
 * Quantum Research Lab (QRL) - Interactive Circuit Studio
 * Full-featured quantum circuit designer with configurable qubits, time steps,
 * gate palette, parameter editing, undo/redo, timeline playback, and export.
 */

import React, { useState, useEffect } from 'react';
import {
  GateType,
  PlacedGate,
  QuantumCircuit,
  SimulationResponse,
} from '../../types/quantum';
import { GATE_REGISTRY } from '../../lib/quantum/engine';
import { CIRCUIT_PRESETS } from '../../lib/quantum/presets';
import { exportToQasm, exportToQiskit, exportToPennyLane, validateCircuitJson } from '../../lib/quantum/qasm';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Undo2,
  Redo2,
  Download,
  Upload,
  Plus,
  Minus,
  Sliders,
  Trash2,
  Sparkles,
  Info,
  Check,
  Copy,
  Code2,
} from 'lucide-react';

interface CircuitStudioProps {
  circuit: QuantumCircuit;
  onUpdateCircuit: (updated: QuantumCircuit) => void;
  onRunSimulation: () => void;
  simulationResponse: SimulationResponse | null;
  activePlaybackStep: number | null;
  onSelectPlaybackStep: (step: number | null) => void;
}

export const CircuitStudio: React.FC<CircuitStudioProps> = ({
  circuit,
  onUpdateCircuit,
  onRunSimulation,
  simulationResponse,
  activePlaybackStep,
  onSelectPlaybackStep,
}) => {
  // History for Undo / Redo
  const [history, setHistory] = useState<QuantumCircuit[]>([circuit]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Selected tool from palette (gate type to place on click)
  const [selectedGateType, setSelectedGateType] = useState<GateType>('H');

  // Modal / drawer states
  const [editingGate, setEditingGate] = useState<PlacedGate | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedCodeTab, setCopiedCodeTab] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'qiskit' | 'pennylane' | 'qasm' | 'json'>('qiskit');

  // Playback timer state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Keep history in sync
  const pushState = (newCircuit: QuantumCircuit) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newCircuit);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    onUpdateCircuit(newCircuit);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdateCircuit(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdateCircuit(next);
    }
  };

  // Automated playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onSelectPlaybackStep(
          activePlaybackStep === null || activePlaybackStep >= circuit.timeSteps - 1
            ? 0
            : activePlaybackStep + 1
        );
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activePlaybackStep, circuit.timeSteps]);

  // Handle cell click (place or configure)
  const handleCellClick = (qIndex: number, stepIndex: number) => {
    // Check if an existing gate is already at this position
    const existing = circuit.gates.find(
      (g) => g.step === stepIndex && (g.targetQubit === qIndex || g.controlQubits?.includes(qIndex) || g.secondTarget === qIndex)
    );

    if (existing) {
      // Open editor or remove if measurement/single
      setEditingGate(existing);
      return;
    }

    // Place selected gate
    const meta = GATE_REGISTRY[selectedGateType];
    const newGate: PlacedGate = {
      id: `gate-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: selectedGateType,
      step: stepIndex,
      targetQubit: qIndex,
      parameter: meta.hasParameter ? meta.defaultParameter ?? Math.PI / 2 : undefined,
    };

    // Configure multi-qubit controls
    if (selectedGateType === 'CX' || selectedGateType === 'CZ') {
      const defaultCtrl = qIndex === 0 ? 1 : 0;
      if (defaultCtrl < circuit.numQubits) {
        newGate.controlQubits = [defaultCtrl];
      }
    } else if (selectedGateType === 'SWAP') {
      const defaultTarget2 = (qIndex + 1) % circuit.numQubits;
      newGate.secondTarget = defaultTarget2;
    } else if (selectedGateType === 'CCX') {
      newGate.controlQubits = [0, 1].filter((q) => q !== qIndex);
      if (newGate.controlQubits.length < 2) {
        newGate.controlQubits = [0, 1];
      }
    } else if (selectedGateType === 'CSWAP') {
      newGate.controlQubits = [0];
      newGate.secondTarget = (qIndex + 1) % circuit.numQubits;
    }

    const updated = {
      ...circuit,
      gates: [...circuit.gates, newGate],
      updatedAt: new Date().toISOString(),
    };
    pushState(updated);
  };

  const handleRemoveGate = (gateId: string) => {
    const updated = {
      ...circuit,
      gates: circuit.gates.filter((g) => g.id !== gateId),
      updatedAt: new Date().toISOString(),
    };
    pushState(updated);
    if (editingGate?.id === gateId) setEditingGate(null);
  };

  const handleUpdateEditingGate = (changes: Partial<PlacedGate>) => {
    if (!editingGate) return;
    const updatedGate = { ...editingGate, ...changes };
    const updated = {
      ...circuit,
      gates: circuit.gates.map((g) => (g.id === editingGate.id ? updatedGate : g)),
      updatedAt: new Date().toISOString(),
    };
    setEditingGate(updatedGate);
    pushState(updated);
  };

  const handleResetCircuit = () => {
    const empty: QuantumCircuit = {
      ...circuit,
      gates: [],
      updatedAt: new Date().toISOString(),
    };
    pushState(empty);
  };

  const handleLoadPreset = (preset: QuantumCircuit) => {
    pushState({
      ...preset,
      id: circuit.id,
      updatedAt: new Date().toISOString(),
    });
  };

  const adjustQubitCount = (delta: number) => {
    const nextCount = Math.max(1, Math.min(5, circuit.numQubits + delta));
    if (nextCount === circuit.numQubits) return;
    // Remove gates on trimmed wires
    const filteredGates = circuit.gates.filter(
      (g) =>
        g.targetQubit < nextCount &&
        (!g.controlQubits || g.controlQubits.every((c) => c < nextCount)) &&
        (g.secondTarget === undefined || g.secondTarget < nextCount)
    );
    const updated = {
      ...circuit,
      numQubits: nextCount,
      gates: filteredGates,
      updatedAt: new Date().toISOString(),
    };
    pushState(updated);
  };

  const adjustStepCount = (delta: number) => {
    const nextSteps = Math.max(4, Math.min(14, circuit.timeSteps + delta));
    if (nextSteps === circuit.timeSteps) return;
    const filteredGates = circuit.gates.filter((g) => g.step < nextSteps);
    const updated = {
      ...circuit,
      timeSteps: nextSteps,
      gates: filteredGates,
      updatedAt: new Date().toISOString(),
    };
    pushState(updated);
  };

  const copyToClipboard = (text: string, tab: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeTab(tab);
    setTimeout(() => setCopiedCodeTab(null), 2000);
  };

  // Dimensions for SVG circuit grid
  const CELL_WIDTH = 58;
  const CELL_HEIGHT = 60;
  const HEADER_WIDTH = 64;
  const SVG_WIDTH = HEADER_WIDTH + circuit.timeSteps * CELL_WIDTH + 30;
  const SVG_HEIGHT = circuit.numQubits * CELL_HEIGHT + 30;

  // Gate Palette categorizations
  const singleGates: GateType[] = ['H', 'X', 'Y', 'Z'];
  const phaseGates: GateType[] = ['S', 'Sdg', 'T', 'Tdg'];
  const rotationGates: GateType[] = ['RX', 'RY', 'RZ', 'Phase'];
  const controlledGates: GateType[] = ['CX', 'CZ', 'SWAP', 'CCX', 'CSWAP'];
  const measureGates: GateType[] = ['M', 'I'];

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 overflow-y-auto">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[#0d121f] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-200">{circuit.name}</div>
            <div className="text-[11px] text-slate-400">
              {circuit.numQubits} Qubits · {circuit.timeSteps} Steps · Depth: {simulationResponse?.metrics.circuitDepth ?? 0} · Gates: {circuit.gates.length}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Preset Selector Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-900 border border-slate-700/80 rounded hover:border-slate-600 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Templates</span>
            </button>
            <div className="absolute left-0 mt-1 w-56 py-1 bg-slate-900 border border-slate-800 rounded shadow-xl hidden group-hover:block z-30">
              <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500">Benchmark Circuits</div>
              {CIRCUIT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Undo/Redo, Wire Controls, Run Simulation */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetCircuit}
            title="Reset circuit wires"
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Qubit count steppers */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs">
            <span className="text-slate-400 mr-2 text-[11px]">Qubits:</span>
            <button
              onClick={() => adjustQubitCount(-1)}
              disabled={circuit.numQubits <= 1}
              className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 font-mono font-semibold text-cyan-300">{circuit.numQubits}</span>
            <button
              onClick={() => adjustQubitCount(1)}
              disabled={circuit.numQubits >= 5}
              className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Steps count steppers */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-xs hidden sm:flex">
            <span className="text-slate-400 mr-2 text-[11px]">Steps:</span>
            <button
              onClick={() => adjustStepCount(-1)}
              disabled={circuit.timeSteps <= 4}
              className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-200">{circuit.timeSteps}</span>
            <button
              onClick={() => adjustStepCount(1)}
              disabled={circuit.timeSteps >= 14}
              className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-900 border border-slate-700 hover:border-slate-600 rounded text-slate-200 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code / Export</span>
          </button>

          {/* Run Simulation CTA */}
          <button
            onClick={onRunSimulation}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex flex-col lg:flex-row flex-1 p-6 gap-6">
        {/* Left: Circuit Palette */}
        <div className="w-full lg:w-56 shrink-0 flex flex-col gap-4">
          <div className="bg-[#0d121f] p-4 rounded-lg border border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Gate Palette
            </div>

            <div className="space-y-3">
              {/* Single Qubit */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Single Qubit</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {singleGates.map((gt) => {
                    const meta = GATE_REGISTRY[gt];
                    const isSelected = selectedGateType === gt;
                    return (
                      <button
                        key={gt}
                        onClick={() => setSelectedGateType(gt)}
                        title={meta.name}
                        className={`h-9 rounded font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
                            : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80'
                        }`}
                      >
                        {meta.symbol}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phase Gates */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Phase (Clifford / T)</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {phaseGates.map((gt) => {
                    const meta = GATE_REGISTRY[gt];
                    const isSelected = selectedGateType === gt;
                    return (
                      <button
                        key={gt}
                        onClick={() => setSelectedGateType(gt)}
                        title={meta.name}
                        className={`h-9 rounded font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-violet-500 text-white ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-900'
                            : 'bg-slate-900 hover:bg-slate-800 text-violet-300 border border-slate-700/80'
                        }`}
                      >
                        {meta.symbol}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rotation Gates */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Continuous Rotations</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {rotationGates.map((gt) => {
                    const meta = GATE_REGISTRY[gt];
                    const isSelected = selectedGateType === gt;
                    return (
                      <button
                        key={gt}
                        onClick={() => setSelectedGateType(gt)}
                        title={meta.name}
                        className={`h-9 rounded font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900'
                            : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700/80'
                        }`}
                      >
                        {meta.symbol}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Controlled & Entangling */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Controlled Entanglement</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {controlledGates.map((gt) => {
                    const meta = GATE_REGISTRY[gt];
                    const isSelected = selectedGateType === gt;
                    return (
                      <button
                        key={gt}
                        onClick={() => setSelectedGateType(gt)}
                        title={meta.name}
                        className={`h-9 rounded font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900'
                            : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700/80'
                        }`}
                      >
                        {meta.symbol}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Measurement & Identity */}
              <div>
                <div className="text-[10px] font-mono uppercase text-slate-500 mb-1.5">Readout / Baseline</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {measureGates.map((gt) => {
                    const meta = GATE_REGISTRY[gt];
                    const isSelected = selectedGateType === gt;
                    return (
                      <button
                        key={gt}
                        onClick={() => setSelectedGateType(gt)}
                        title={meta.name}
                        className={`h-9 rounded font-mono text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-slate-200 text-slate-950 ring-2 ring-slate-300 ring-offset-2 ring-offset-slate-900'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                        }`}
                      >
                        {meta.symbol}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Gate Description Card */}
            <div className="mt-4 p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200">{GATE_REGISTRY[selectedGateType].name}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {GATE_REGISTRY[selectedGateType].description}
              </p>
              <div className="mt-2 text-[10px] text-cyan-400 font-mono">
                Click any wire step to place
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Interactive Circuit SVG Canvas & Timeline Playback */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Circuit Canvas Board */}
          <div className="bg-[#0d121f] rounded-lg border border-slate-800 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">Quantum Register & Wire Sequence</span>
              <span className="text-[11px] text-slate-400">
                Click an empty cell to place <span className="font-mono text-cyan-300 font-bold">{selectedGateType}</span> · Click a gate to edit/remove
              </span>
            </div>

            {/* Circuit SVG Interactive Wire Canvas */}
            <div className="overflow-x-auto overflow-y-hidden py-2 bg-[#07090e] rounded border border-slate-800/80">
              <svg width={Math.max(SVG_WIDTH, 600)} height={SVG_HEIGHT} className="select-none">
                {/* Background grid markings for steps */}
                {Array.from({ length: circuit.timeSteps }).map((_, stepIdx) => {
                  const x = HEADER_WIDTH + stepIdx * CELL_WIDTH + CELL_WIDTH / 2;
                  const isActive = activePlaybackStep === stepIdx;
                  return (
                    <g key={`step-col-${stepIdx}`}>
                      {/* Step index label at top */}
                      <text
                        x={x}
                        y={16}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${isActive ? 'fill-cyan-400 font-bold' : 'fill-slate-600'}`}
                      >
                        s{stepIdx}
                      </text>

                      {/* Step column active highlight beam */}
                      {isActive && (
                        <rect
                          x={HEADER_WIDTH + stepIdx * CELL_WIDTH + 6}
                          y={22}
                          width={CELL_WIDTH - 12}
                          height={SVG_HEIGHT - 26}
                          fill="rgba(6, 182, 212, 0.08)"
                          stroke="rgba(6, 182, 212, 0.4)"
                          strokeDasharray="2 2"
                          rx={4}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Qubit Wires */}
                {Array.from({ length: circuit.numQubits }).map((_, qIdx) => {
                  const y = 35 + qIdx * CELL_HEIGHT + CELL_HEIGHT / 2;
                  return (
                    <g key={`wire-${qIdx}`}>
                      {/* Wire Label */}
                      <text
                        x={20}
                        y={y + 4}
                        className="text-xs font-mono font-semibold fill-cyan-400"
                      >
                        q[{qIdx}]
                      </text>
                      <text
                        x={52}
                        y={y + 4}
                        className="text-[11px] font-mono fill-slate-500"
                      >
                        |0⟩
                      </text>

                      {/* Wire Horizontal Line */}
                      <line
                        x1={HEADER_WIDTH}
                        y1={y}
                        x2={SVG_WIDTH - 20}
                        y2={y}
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                    </g>
                  );
                })}

                {/* Multi-qubit connecting vertical lines (CNOT, CZ, SWAP, CCX) */}
                {circuit.gates.map((gate) => {
                  if (['CX', 'CZ', 'CCX', 'SWAP', 'CSWAP'].includes(gate.type)) {
                    const x = HEADER_WIDTH + gate.step * CELL_WIDTH + CELL_WIDTH / 2;
                    let minY = 35 + gate.targetQubit * CELL_HEIGHT + CELL_HEIGHT / 2;
                    let maxY = minY;

                    if (gate.controlQubits) {
                      gate.controlQubits.forEach((cq) => {
                        const cy = 35 + cq * CELL_HEIGHT + CELL_HEIGHT / 2;
                        minY = Math.min(minY, cy);
                        maxY = Math.max(maxY, cy);
                      });
                    }

                    if (gate.secondTarget !== undefined) {
                      const sy = 35 + gate.secondTarget * CELL_HEIGHT + CELL_HEIGHT / 2;
                      minY = Math.min(minY, sy);
                      maxY = Math.max(maxY, sy);
                    }

                    return (
                      <g key={`conn-${gate.id}`}>
                        <line
                          x1={x}
                          y1={minY}
                          x2={x}
                          y2={maxY}
                          stroke="#06b6d4"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  }
                  return null;
                })}

                {/* Clickable Matrix Cells (either empty placeholder or Placed Gate) */}
                {Array.from({ length: circuit.numQubits }).map((_, qIdx) =>
                  Array.from({ length: circuit.timeSteps }).map((_, stepIdx) => {
                    const x = HEADER_WIDTH + stepIdx * CELL_WIDTH + CELL_WIDTH / 2;
                    const y = 35 + qIdx * CELL_HEIGHT + CELL_HEIGHT / 2;

                    // Find if any gate touches this cell
                    const placed = circuit.gates.find(
                      (g) =>
                        g.step === stepIdx &&
                        (g.targetQubit === qIdx ||
                          g.controlQubits?.includes(qIdx) ||
                          g.secondTarget === qIdx)
                    );

                    if (!placed) {
                      // Empty clickable cell
                      return (
                        <g
                          key={`empty-${qIdx}-${stepIdx}`}
                          className="cursor-pointer group"
                          onClick={() => handleCellClick(qIdx, stepIdx)}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={14}
                            fill="transparent"
                            stroke="transparent"
                            className="group-hover:stroke-cyan-500/50 group-hover:fill-cyan-950/40 transition-colors"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r={2}
                            fill="#475569"
                            className="group-hover:fill-cyan-400"
                          />
                        </g>
                      );
                    }

                    // Render placed gate entity
                    const isControl = placed.controlQubits?.includes(qIdx);
                    const isSecondTarget = placed.secondTarget === qIdx;
                    const isPrimaryTarget = placed.targetQubit === qIdx;

                    if (isControl) {
                      // Control Dot
                      return (
                        <g
                          key={`ctrl-${placed.id}-${qIdx}`}
                          className="cursor-pointer"
                          onClick={() => setEditingGate(placed)}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={6}
                            fill="#06b6d4"
                            stroke="#07090e"
                            strokeWidth="2"
                          />
                        </g>
                      );
                    }

                    if (isSecondTarget && (placed.type === 'SWAP' || placed.type === 'CSWAP')) {
                      // SWAP cross marker
                      return (
                        <g
                          key={`swap2-${placed.id}-${qIdx}`}
                          className="cursor-pointer"
                          onClick={() => setEditingGate(placed)}
                        >
                          <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke="#10b981" strokeWidth="2.5" />
                          <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} stroke="#10b981" strokeWidth="2.5" />
                        </g>
                      );
                    }

                    // Primary target gate box
                    let boxFill = '#0f172a';
                    let boxStroke = '#06b6d4';
                    let textColor = '#38bdf8';

                    if (['CX', 'CZ', 'CCX', 'CSWAP'].includes(placed.type)) {
                      boxStroke = '#06b6d4';
                      boxFill = '#164e63';
                    } else if (['S', 'Sdg', 'T', 'Tdg'].includes(placed.type)) {
                      boxStroke = '#8b5cf6';
                      textColor = '#c4b5fd';
                    } else if (['RX', 'RY', 'RZ', 'Phase'].includes(placed.type)) {
                      boxStroke = '#f59e0b';
                      textColor = '#fcd34d';
                    } else if (placed.type === 'SWAP') {
                      // Swap cross
                      return (
                        <g
                          key={`swap1-${placed.id}-${qIdx}`}
                          className="cursor-pointer"
                          onClick={() => setEditingGate(placed)}
                        >
                          <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke="#10b981" strokeWidth="2.5" />
                          <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} stroke="#10b981" strokeWidth="2.5" />
                        </g>
                      );
                    } else if (placed.type === 'M') {
                      boxStroke = '#94a3b8';
                      textColor = '#e2e8f0';
                    }

                    return (
                      <g
                        key={`gate-box-${placed.id}`}
                        className="cursor-pointer hover:opacity-90"
                        onClick={() => setEditingGate(placed)}
                      >
                        <rect
                          x={x - 18}
                          y={y - 18}
                          width={36}
                          height={36}
                          rx={5}
                          fill={boxFill}
                          stroke={boxStroke}
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={placed.parameter !== undefined ? y - 1 : y + 4}
                          textAnchor="middle"
                          fill={textColor}
                          className="text-xs font-mono font-bold"
                        >
                          {GATE_REGISTRY[placed.type].symbol}
                        </text>
                        {placed.parameter !== undefined && (
                          <text
                            x={x}
                            y={y + 11}
                            textAnchor="middle"
                            fill="#94a3b8"
                            className="text-[8px] font-mono"
                          >
                            {(placed.parameter / Math.PI).toFixed(2)}π
                          </text>
                        )}
                      </g>
                    );
                  })
                )}
              </svg>
            </div>
          </div>

          {/* Timeline Playback Bar */}
          <div className="bg-[#0d121f] rounded-lg border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectPlaybackStep(0)}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Restart from step 0"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
              </button>
              <button
                onClick={() =>
                  onSelectPlaybackStep(
                    activePlaybackStep === null ? 0 : Math.min(circuit.timeSteps - 1, activePlaybackStep + 1)
                  )
                }
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Step forward"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Step scrubber slider */}
            <div className="flex items-center gap-3 w-full sm:w-80">
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                Step: {activePlaybackStep !== null ? activePlaybackStep : 'End'}
              </span>
              <input
                type="range"
                min={-1}
                max={circuit.timeSteps - 1}
                value={activePlaybackStep !== null ? activePlaybackStep : circuit.timeSteps - 1}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onSelectPlaybackStep(val === circuit.timeSteps - 1 ? null : val);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <button
                onClick={() => onSelectPlaybackStep(null)}
                className="text-[11px] font-mono text-cyan-400 hover:underline shrink-0"
              >
                Final State
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gate Configuration Drawer / Modal */}
      {editingGate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d121f] border border-slate-700 rounded-lg p-5 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200">
                  Configure Gate: {GATE_REGISTRY[editingGate.type].name}
                </span>
              </div>
              <button
                onClick={() => setEditingGate(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Qubit (Primary Wire)</label>
                <select
                  value={editingGate.targetQubit}
                  onChange={(e) => handleUpdateEditingGate({ targetQubit: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                >
                  {Array.from({ length: circuit.numQubits }).map((_, i) => (
                    <option key={i} value={i}>
                      q[{i}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Control Qubits for CX, CZ, CCX */}
              {['CX', 'CZ', 'CCX', 'CSWAP'].includes(editingGate.type) && (
                <div>
                  <label className="block text-slate-400 mb-1">Control Qubit 1</label>
                  <select
                    value={editingGate.controlQubits?.[0] ?? 0}
                    onChange={(e) => {
                      const newC1 = Number(e.target.value);
                      const rest = editingGate.controlQubits?.slice(1) || [];
                      handleUpdateEditingGate({ controlQubits: [newC1, ...rest] });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  >
                    {Array.from({ length: circuit.numQubits })
                      .filter((_, i) => i !== editingGate.targetQubit)
                      .map((_, i) => (
                        <option key={i} value={i}>
                          q[{i}]
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Rotation Angle Parameter Slider for RX, RY, RZ, Phase */}
              {editingGate.parameter !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">Rotation Angle (θ / λ)</label>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {(editingGate.parameter / Math.PI).toFixed(3)} π &nbsp;({((editingGate.parameter * 180) / Math.PI).toFixed(1)}°)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2 * Math.PI}
                    step={0.05}
                    value={editingGate.parameter}
                    onChange={(e) => handleUpdateEditingGate({ parameter: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  {/* Preset Quick Angle Buttons */}
                  <div className="flex gap-1.5 mt-2">
                    {[
                      { label: 'π/4', val: Math.PI / 4 },
                      { label: 'π/2', val: Math.PI / 2 },
                      { label: 'π', val: Math.PI },
                      { label: '3π/2', val: (3 * Math.PI) / 2 },
                      { label: '2π', val: 2 * Math.PI },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => handleUpdateEditingGate({ parameter: btn.val })}
                        className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-slate-300"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time step shift */}
              <div>
                <label className="block text-slate-400 mb-1">Time Step Column</label>
                <input
                  type="number"
                  min={0}
                  max={circuit.timeSteps - 1}
                  value={editingGate.step}
                  onChange={(e) => handleUpdateEditingGate({ step: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => handleRemoveGate(editingGate.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Gate</span>
              </button>

              <button
                onClick={() => setEditingGate(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export / Code Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d121f] border border-slate-700 rounded-lg p-5 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold text-slate-200">Circuit Code & Scientific Export</span>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Format Tabs */}
            <div className="flex border-b border-slate-800 mb-3 gap-2 shrink-0">
              {(['qiskit', 'pennylane', 'qasm', 'json'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-3 py-1.5 text-xs font-mono font-medium border-b-2 transition-colors ${
                    exportFormat === fmt
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fmt === 'qiskit' && 'Python Qiskit'}
                  {fmt === 'pennylane' && 'Python PennyLane'}
                  {fmt === 'qasm' && 'OpenQASM 2.0'}
                  {fmt === 'json' && 'QRL JSON Schema'}
                </button>
              ))}
            </div>

            {/* Code Output Window */}
            <div className="flex-1 bg-[#07090e] p-4 rounded border border-slate-800 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre">
              {exportFormat === 'qiskit' && exportToQiskit(circuit)}
              {exportFormat === 'pennylane' && exportToPennyLane(circuit)}
              {exportFormat === 'qasm' && exportToQasm(circuit)}
              {exportFormat === 'json' && JSON.stringify(circuit, null, 2)}
            </div>

            {/* Copy CTA */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400">
                Ready for Antigravity, local Jupyter notebook, or backend execution.
              </span>
              <button
                onClick={() => {
                  let text = '';
                  if (exportFormat === 'qiskit') text = exportToQiskit(circuit);
                  else if (exportFormat === 'pennylane') text = exportToPennyLane(circuit);
                  else if (exportFormat === 'qasm') text = exportToQasm(circuit);
                  else text = JSON.stringify(circuit, null, 2);
                  copyToClipboard(text, exportFormat);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded transition-colors"
              >
                {copiedCodeTab === exportFormat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeTab === exportFormat ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
