/**
 * Quantum Research Lab (QRL) - Simulation Explorer
 * Comprehensive scientific inspector for statevectors, measurement counts,
 * probability distributions, Bloch sphere 3D visualization, TVD, and Hellinger distance.
 */

import React, { useState } from 'react';
import {
  QuantumCircuit,
  SimulationResponse,
  StateVectorComponent,
} from '../../types/quantum';
import { BlochSphere3D } from './BlochSphere3D';
import { Complex } from '../../lib/quantum/complex';
import {
  BarChart2,
  PieChart,
  Layers,
  Clock,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
} from 'lucide-react';

interface SimulationExplorerProps {
  circuit: QuantumCircuit;
  response: SimulationResponse | null;
  onRerunSimulation: (shots: number) => void;
  isStale: boolean;
}

export const SimulationExplorer: React.FC<SimulationExplorerProps> = ({
  circuit,
  response,
  onRerunSimulation,
  isStale,
}) => {
  const [selectedShots, setSelectedShots] = useState<number>(response?.shots ?? 1024);
  const [selectedBlochQubit, setSelectedBlochQubit] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'probabilities' | 'statevector' | 'matrices'>('probabilities');

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#07090e] text-slate-400">
        <Layers className="w-12 h-12 text-slate-600 mb-3" />
        <div className="text-base font-semibold text-slate-300">No Simulation Results Generated</div>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Open the Circuit Studio and click <span className="text-cyan-400">Run Simulation</span> to calculate statevector amplitudes, probability distributions, and the Bloch sphere.
        </p>
        <button
          onClick={() => onRerunSimulation(1024)}
          className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded transition-colors"
        >
          Execute Baseline Simulation
        </button>
      </div>
    );
  }

  const {
    stateVector,
    theoreticalProbabilities,
    sampledCounts,
    sampledProbabilities,
    metrics,
    blochVectors,
    shots,
    executionTimeMs,
    provenanceLabel,
  } = response;

  const currentBlochVector = blochVectors[selectedBlochQubit] || {
    qubitIndex: selectedBlochQubit,
    u: 0,
    v: 0,
    w: 1,
    theta: 0,
    phi: 0,
    purity: 1,
  };

  const basisStates = Object.keys(theoreticalProbabilities);

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 overflow-y-auto">
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#0d121f] border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Simulation Output Telemetry</span>
              {isStale ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Circuit modified · Stale
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synchronized
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Engine: {provenanceLabel} · Runtime: {executionTimeMs.toFixed(2)} ms
            </div>
          </div>
        </div>

        {/* Shot selector & Re-run control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-xs">
            <span className="text-slate-400 text-[11px] mr-2">Shot Count:</span>
            <select
              value={selectedShots}
              onChange={(e) => setSelectedShots(Number(e.target.value))}
              className="bg-transparent font-mono text-cyan-300 font-semibold focus:outline-hidden"
            >
              <option value={0} className="bg-slate-900 text-slate-200">Exact Analytical (0)</option>
              <option value={100} className="bg-slate-900 text-slate-200">100 Shots</option>
              <option value={500} className="bg-slate-900 text-slate-200">500 Shots</option>
              <option value={1024} className="bg-slate-900 text-slate-200">1,024 Shots</option>
              <option value={4096} className="bg-slate-900 text-slate-200">4,096 Shots</option>
              <option value={8192} className="bg-slate-900 text-slate-200">8,192 Shots</option>
            </select>
          </div>

          <button
            onClick={() => onRerunSimulation(selectedShots)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-all ${
              isStale
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isStale ? 'Re-run Outdated Sim' : 'Re-run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizations & Tables */}
      <div className="p-6 space-y-6">
        {/* Statistical Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0d121f] p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono uppercase text-slate-400">Total Variation Dist (TVD)</div>
            <div className="text-2xl font-mono font-bold text-cyan-300 tabular-nums mt-1">
              {metrics.totalVariationDistance.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              D_TV = 0.5 · ∑ |P_th - P_samp|
            </div>
          </div>

          <div className="bg-[#0d121f] p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono uppercase text-slate-400">Hellinger Distance</div>
            <div className="text-2xl font-mono font-bold text-violet-300 tabular-nums mt-1">
              {metrics.hellingerDistance.toFixed(4)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              H(P, Q) statistical divergence
            </div>
          </div>

          <div className="bg-[#0d121f] p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono uppercase text-slate-400">Empirical Fidelity</div>
            <div className="text-2xl font-mono font-bold text-emerald-300 tabular-nums mt-1">
              {(metrics.fidelity * 100).toFixed(2)}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Statistical overlap vs exact theory
            </div>
          </div>

          <div className="bg-[#0d121f] p-3.5 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono uppercase text-slate-400">Circuit Complexity</div>
            <div className="text-2xl font-mono font-bold text-slate-200 tabular-nums mt-1">
              {metrics.totalGateCount} <span className="text-xs font-normal text-slate-400">gates</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Depth: {metrics.circuitDepth} · Multi-qubit: {metrics.multiQubitGateCount}
            </div>
          </div>
        </div>

        {/* 2-Column Split: Left is Probability Histogram / Tabs; Right is 3D Bloch Sphere */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Visual Inspector (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-[#0d121f] rounded-lg border border-slate-800 p-5">
            {/* View Selector Tabs */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('probabilities')}
                  className={`px-3 py-1 font-medium rounded transition-colors ${
                    activeTab === 'probabilities'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Measurement Histogram
                </button>
                <button
                  onClick={() => setActiveTab('statevector')}
                  className={`px-3 py-1 font-medium rounded transition-colors ${
                    activeTab === 'statevector'
                      ? 'bg-slate-800 text-cyan-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Statevector Amplitudes & Phases
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                {basisStates.length} computational states
              </span>
            </div>

            {/* Tab 1: Histogram */}
            {activeTab === 'probabilities' && (
              <div className="flex-1 flex flex-col">
                <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
                  <span>Theoretical probability (cyan line) vs Sampled count (blue bars)</span>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500 inline-block" />
                      Theoretical
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-600 inline-block" />
                      Sampled
                    </span>
                  </div>
                </div>

                {/* SVG Bar Chart with Hairline Grid */}
                <div className="flex-1 min-h-[260px] bg-[#07090e] rounded p-4 border border-slate-800 flex flex-col justify-end">
                  <div className="h-48 flex items-end gap-3 px-2 border-b border-slate-800 pb-1">
                    {basisStates.map((label) => {
                      const thProb = theoreticalProbabilities[label] || 0;
                      const sampProb = sampledProbabilities[label] || 0;
                      const count = sampledCounts[label] || 0;
                      const maxVal = Math.max(...Object.values(theoreticalProbabilities), ...Object.values(sampledProbabilities), 0.01);
                      const barHeight = Math.max(2, (sampProb / maxVal) * 160);
                      const theoryMarkerY = (thProb / maxVal) * 160;

                      return (
                        <div key={label} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          {/* Tooltip on Hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-slate-900 border border-slate-700 p-1.5 rounded shadow-xl text-[10px] font-mono pointer-events-none z-20 whitespace-nowrap">
                            <div className="text-cyan-300 font-bold">|{label}⟩</div>
                            <div>Theory: {(thProb * 100).toFixed(2)}%</div>
                            <div>Sampled: {(sampProb * 100).toFixed(2)}% ({count} shots)</div>
                          </div>

                          {/* Theory line indicator */}
                          <div
                            className="absolute w-full h-0.5 bg-cyan-400 z-10 pointer-events-none transition-all"
                            style={{ bottom: `${theoryMarkerY}px` }}
                          />

                          {/* Sampled Bar */}
                          <div
                            className="w-full bg-slate-700 group-hover:bg-cyan-600/70 rounded-t-xs transition-all"
                            style={{ height: `${barHeight}px` }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* X Axis Labels */}
                  <div className="flex gap-3 px-2 pt-2">
                    {basisStates.map((label) => (
                      <div
                        key={label}
                        className="flex-1 text-center font-mono text-[10px] text-slate-400 truncate"
                        title={`|${label}⟩`}
                      >
                        |{label}⟩
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Statevector Table */}
            {activeTab === 'statevector' && (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                      <th className="pb-2">State</th>
                      <th className="pb-2">Complex Amplitude (c_i)</th>
                      <th className="pb-2">Probability (|c_i|²)</th>
                      <th className="pb-2">Phase (rad)</th>
                      <th className="pb-2">Phase (deg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {stateVector.map((comp) => {
                      const c = Complex.create(comp.real, comp.imag);
                      const isNonZero = comp.probability > 0.0001;
                      return (
                        <tr
                          key={comp.index}
                          className={`hover:bg-slate-800/30 ${isNonZero ? 'text-slate-200' : 'text-slate-600'}`}
                        >
                          <td className="py-2 font-bold text-cyan-300">|{comp.binaryLabel}⟩</td>
                          <td className="py-2 tabular-nums">{Complex.format(c, 4)}</td>
                          <td className="py-2 tabular-nums">{(comp.probability * 100).toFixed(2)}%</td>
                          <td className="py-2 tabular-nums">{comp.phaseRad.toFixed(3)} rad</td>
                          <td className="py-2 tabular-nums">{comp.phaseDeg.toFixed(1)}°</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: 3D Bloch Sphere Viewport (5 cols) */}
          <div className="lg:col-span-5 h-[420px] lg:h-auto">
            <BlochSphere3D
              blochVector={currentBlochVector}
              qubitIndex={selectedBlochQubit}
              totalQubits={circuit.numQubits}
              onSelectQubit={setSelectedBlochQubit}
            />
          </div>
        </div>

        {/* Detailed Empirical vs Theoretical Distribution Table */}
        <div className="bg-[#0d121f] rounded-lg border border-slate-800 p-5">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Theoretical vs Sampled Measurement Distribution Matrix
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                  <th className="pb-2">Basis State |x⟩</th>
                  <th className="pb-2">Theoretical P_th(x)</th>
                  <th className="pb-2">Sampled Counts</th>
                  <th className="pb-2">Empirical P_samp(x)</th>
                  <th className="pb-2">Absolute Error |ΔP|</th>
                  <th className="pb-2">Relative Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {basisStates.map((label) => {
                  const pTh = theoreticalProbabilities[label] || 0;
                  const count = sampledCounts[label] || 0;
                  const pSamp = sampledProbabilities[label] || 0;
                  const delta = Math.abs(pTh - pSamp);

                  return (
                    <tr key={label} className="hover:bg-slate-800/30 text-slate-300">
                      <td className="py-2 font-bold text-cyan-300">|{label}⟩</td>
                      <td className="py-2 tabular-nums text-slate-200">{(pTh * 100).toFixed(3)}%</td>
                      <td className="py-2 tabular-nums text-slate-400">{count}</td>
                      <td className="py-2 tabular-nums text-slate-200">{(pSamp * 100).toFixed(3)}%</td>
                      <td className="py-2 tabular-nums">
                        <span className={delta > 0.05 ? 'text-amber-400' : 'text-emerald-400'}>
                          {(delta * 100).toFixed(3)}%
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="w-32 bg-slate-800 h-2 rounded-xs overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-xs"
                            style={{ width: `${Math.min(100, pTh * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
