/**
 * Quantum Research Lab (QRL) - Scientific Dashboard
 * Clean, approachable home screen for students and researchers.
 * Highlights three primary paths: Learn, Build a Circuit, and Run an Experiment.
 */

import React from 'react';
import { QuantumCircuit } from '../../types/quantum';
import { CIRCUIT_PRESETS } from '../../lib/quantum/presets';
import {
  GraduationCap,
  Cpu,
  FlaskConical,
  Play,
  ArrowRight,
  Compass,
  CheckCircle2,
  Atom,
  Sparkles,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: string) => void;
  onLoadCircuitToStudio: (circuit: QuantumCircuit) => void;
  currentCircuit?: QuantumCircuit;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onLoadCircuitToStudio,
  currentCircuit,
}) => {
  const quickProtocols = [
    {
      code: 'QRL-001',
      name: 'Single-Qubit Superposition',
      desc: 'Hadamard transformation on |0⟩ producing balanced 50/50 measurement probabilities.',
      circuit: CIRCUIT_PRESETS[0],
    },
    {
      code: 'QRL-010',
      name: 'Bell State |Φ+⟩ (EPR Pair)',
      desc: 'Maximally entangled two-qubit Einstein-Podolsky-Rosen non-local state.',
      circuit: CIRCUIT_PRESETS[1],
    },
    {
      code: 'QRL-014',
      name: '3-Qubit GHZ Entanglement',
      desc: 'Multipartite Greenberger-Horne-Zeilinger Schrödinger cat state.',
      circuit: CIRCUIT_PRESETS[2],
    },
    {
      code: 'QRL-021',
      name: "Grover's 2-Qubit Search",
      desc: 'Quadratic speedup oracle phase inversion and diffusion operator.',
      circuit: CIRCUIT_PRESETS[3],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 overflow-y-auto p-6 md:p-8 space-y-8">
      {/* Welcome Hero Strip */}
      <div className="max-w-6xl mx-auto w-full space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span>Quantum Research Lab</span>
          <span>·</span>
          <span>Workstation v2.4</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-100 text-balance">
          Explore. Build. Simulate. Discover.
        </h1>

        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Welcome to your quantum computing workstation. Assemble unitary circuits, track real-time statevectors and 3D Bloch sphere projections, explore 23 verified benchmark protocols, and practice with guided lessons and viva examinations.
        </p>
      </div>

      {/* 4 Clear Primary Entry Points */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Entry 1: Learn Quantum */}
        <div className="bg-[#0d121f] rounded-xl border border-slate-800 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Learn Quantum</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Step-by-step interactive modules from basic qubits to entanglement and viva-voce practice.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('learn')}
            className="mt-5 flex items-center justify-between w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <span>Start Tutorials</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Entry 2: Build a Circuit */}
        <div className="bg-[#0d121f] rounded-xl border border-slate-800 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Build a Circuit</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Design multi-qubit circuits on an interactive canvas with 18 unitary gates and live undo/redo.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('circuit')}
            className="mt-5 flex items-center justify-between w-full px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm shadow-cyan-500/20 transition-all hover:scale-[1.01]"
          >
            <span>Circuit Studio</span>
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Entry 3: Run an Experiment */}
        <div className="bg-[#0d121f] rounded-xl border border-slate-800 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Run Experiments</h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Explore 23 verified baseline protocols, including QRL-001, Bell states, Grover, and QFT.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('experiments')}
            className="mt-5 flex items-center justify-between w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <span>23 Protocols</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Entry 4: Continue Previous Session */}
        <div className="bg-[#0d121f] rounded-xl border border-slate-800 hover:border-cyan-500/40 p-5 flex flex-col justify-between transition-all group shadow-sm">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-100">Continue Session</h2>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed truncate font-mono">
                {currentCircuit?.name || 'Active Workspace'}
              </p>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {currentCircuit?.numQubits || 1}Q Register · {currentCircuit?.gates?.length || 0} Gates
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('circuit')}
            className="mt-5 flex items-center justify-between w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-emerald-300 text-xs font-semibold rounded-lg transition-colors"
          >
            <span>Resume Session</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Featured Protocols Strip */}
      <div className="max-w-5xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Featured Baseline Protocols
          </h3>
          <button
            onClick={() => onNavigate('experiments')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
          >
            <span>View All 23</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickProtocols.map((p) => (
            <div
              key={p.code}
              className="bg-[#0d121f] rounded-lg border border-slate-800 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-cyan-400 font-semibold">{p.code}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{p.circuit.numQubits}Q Wire</span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <button
                onClick={() => onLoadCircuitToStudio(p.circuit)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded transition-colors"
              >
                <Play className="w-3 h-3 fill-current text-cyan-400" />
                <span>Load in Studio</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Unboxed System Status Strip */}
      <div className="max-w-5xl mx-auto w-full pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-slate-400">Local Matrix Statevector Simulator</span>
          <span>·</span>
          <span>1 to 5 Qubits (32 Amplitudes)</span>
        </div>

        <div className="flex items-center gap-4">
          <span>18 Unitary Gates</span>
          <span>·</span>
          <span>OpenQASM 2.0 / Qiskit Export</span>
        </div>
      </div>
    </div>
  );
};
