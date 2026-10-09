/**
 * Quantum Research Lab (QRL) - Quantum Algorithms Dossier
 * Deep mathematical walkthroughs of iconic speedup algorithms,
 * query complexity comparisons, and direct load to Circuit Studio.
 */

import React, { useState } from 'react';
import { QuantumCircuit } from '../../types/quantum';
import { CIRCUIT_PRESETS } from '../../lib/quantum/presets';
import {
  Cpu,
  ArrowRight,
  Play,
  CheckCircle2,
  HelpCircle,
  Binary,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AlgorithmItem {
  id: string;
  name: string;
  discoverer: string;
  year: number;
  complexityClassical: string;
  complexityQuantum: string;
  speedupType: 'Exponential' | 'Quadratic' | 'Polynomial';
  summary: string;
  steps: { title: string; desc: string; math?: string }[];
  associatedPresetId?: string;
}

const ALGORITHMS: AlgorithmItem[] = [
  {
    id: 'grover',
    name: "Grover's Unstructured Search Algorithm",
    discoverer: 'Lov Grover',
    year: 1996,
    complexityClassical: 'O(N)',
    complexityQuantum: 'O(√N)',
    speedupType: 'Quadratic',
    summary: 'Finds a unique marked item in an unsorted database of N items using oracle phase inversion followed by diffusion about the mean.',
    associatedPresetId: 'preset-grover-2q',
    steps: [
      {
        title: '1. Equal Superposition Initialization',
        desc: 'Apply Hadamard gates across all n qubits to prepare uniform state |s⟩ = (1/√N) ∑ |x⟩.',
        math: '|s\\rangle = H^{\\otimes n} |0\\rangle^{\\otimes n} = \\frac{1}{\\sqrt{N}} \\sum_{x=0}^{N-1} |x\\rangle',
      },
      {
        title: '2. Oracle Phase Inversion (U_ω)',
        desc: 'The oracle marks the target state |ω⟩ by flipping its sign: U_ω|x⟩ = -|x⟩ if x = ω, otherwise |x⟩.',
        math: 'U_\\omega = I - 2|\\omega\\rangle\\langle\\omega|',
      },
      {
        title: '3. Grover Diffusion Operator (Inversion About Mean)',
        desc: 'Reflects the amplitude of all states about the average amplitude, boosting the target state amplitude while suppressing non-target states.',
        math: 'U_s = 2|s\\rangle\\langle s| - I',
      },
      {
        title: '4. Measurement Collapse',
        desc: 'After approximately R ≈ (π/4)√N iterations, the statevector concentrates probability mass on |ω⟩ with near 100% confidence.',
      },
    ],
  },
  {
    id: 'qft',
    name: 'Quantum Fourier Transform (QFT)',
    discoverer: 'Don Coppersmith',
    year: 1994,
    complexityClassical: 'O(N log N) where N = 2ⁿ',
    complexityQuantum: 'O(n²) gates where n = log N',
    speedupType: 'Exponential',
    summary: 'The quantum analogue of the Discrete Fourier Transform, mapping computational basis states into phase frequencies.',
    associatedPresetId: 'preset-qft-3',
    steps: [
      {
        title: '1. State Transformation Definition',
        desc: 'Maps state |j⟩ to a normalized superposition weighted by complex roots of unity.',
        math: '|j\\rangle \\mapsto \\frac{1}{\\sqrt{2^n}} \\sum_{k=0}^{2^n-1} \\exp\\left(\\frac{2\\pi i j k}{2^n}\\right) |k\\rangle',
      },
      {
        title: '2. Cascade of Controlled Phase Rotations',
        desc: 'On each wire j, apply Hadamard H followed by controlled-R_k rotations conditioned on lower wires.',
        math: 'R_k = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{2\\pi i / 2^k} \\end{pmatrix}',
      },
      {
        title: '3. Qubit Reversal (SWAP Gates)',
        desc: 'Because binary digit phases are calculated in reverse bit order, swap gates reverse qubit order at output.',
      },
    ],
  },
  {
    id: 'deutsch-jozsa',
    name: 'Deutsch-Jozsa Algorithm',
    discoverer: 'David Deutsch & Richard Jozsa',
    year: 1992,
    complexityClassical: 'O(2ⁿ⁻¹ + 1) queries',
    complexityQuantum: '1 query',
    speedupType: 'Exponential',
    summary: 'Determines whether a black-box boolean function f:{0,1}ⁿ → {0,1} is constant or balanced in a single quantum evaluation.',
    steps: [
      {
        title: '1. Ancilla Preparation and Phase Kickback',
        desc: 'Initialize n input qubits to |0⟩ and ancilla to |1⟩. Apply H to all wires.',
        math: '|\\psi_0\\rangle = \\left(\\frac{1}{\\sqrt{2^n}}\\sum_{x=0}^{2^n-1} |x\\rangle\\right) \\otimes |-\\rangle',
      },
      {
        title: '2. Oracle Query with Phase Kickback',
        desc: 'Evaluating U_f imparts (-1)^f(x) directly into input superposition phases.',
        math: 'U_f |x\\rangle |-\\rangle = (-1)^{f(x)} |x\\rangle |-\\rangle',
      },
      {
        title: '3. Interference Analysis via Hadamard',
        desc: 'If f is constant, all phases interfere constructively onto |00...0⟩. If balanced, amplitude at |00...0⟩ is exactly 0.',
      },
    ],
  },
  {
    id: 'teleportation',
    name: 'Quantum Teleportation Protocol',
    discoverer: 'Bennett, Brassard, Crépeau, Jozsa, Peres, Wootters',
    year: 1993,
    complexityClassical: 'Impossible (No-cloning & non-locality)',
    complexityQuantum: 'Instantaneous state transfer via 2 classical bits + EPR',
    speedupType: 'Exponential',
    summary: 'Transfers an arbitrary unknown single-qubit quantum state |ψ⟩ from Alice to Bob without physically transmitting the qubit itself.',
    associatedPresetId: 'preset-teleportation',
    steps: [
      {
        title: '1. Entangled Resource Distribution',
        desc: 'Alice and Bob share an entangled Bell pair |Φ+⟩ = (|00⟩ + |11⟩)/√2.',
      },
      {
        title: '2. Alice Bell-State Measurement',
        desc: 'Alice performs CNOT and Hadamard on her unknown state and her half of the Bell pair, then measures both.',
      },
      {
        title: '3. Classical Transmission and Bob Unitary Correction',
        desc: 'Alice transmits 2 classical bits to Bob. Bob applies Pauli operators (X^m1 Z^m0) to reconstruct |ψ⟩ with 100% fidelity.',
      },
    ],
  },
];

interface QuantumAlgorithmsProps {
  onLoadCircuitIntoStudio: (circuit: QuantumCircuit) => void;
}

export const QuantumAlgorithms: React.FC<QuantumAlgorithmsProps> = ({ onLoadCircuitIntoStudio }) => {
  const [selectedAlgId, setSelectedAlgId] = useState<string>('grover');
  const activeAlg = ALGORITHMS.find((a) => a.id === selectedAlgId) || ALGORITHMS[0];

  const handleLoadPreset = (presetId?: string) => {
    if (!presetId) return;
    const preset = CIRCUIT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onLoadCircuitIntoStudio(preset);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#07090e] text-slate-100 overflow-hidden">
      {/* Sidebar: Algorithm List */}
      <div className="w-full lg:w-80 bg-[#0d121f] border-r border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-200">Quantum Algorithms</h2>
            <div className="text-[11px] text-slate-400 font-mono">Foundational Complexity Breakthroughs</div>
          </div>
        </div>

        <div className="space-y-2">
          {ALGORITHMS.map((alg) => {
            const isSelected = alg.id === selectedAlgId;
            return (
              <button
                key={alg.id}
                onClick={() => setSelectedAlgId(alg.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 text-slate-100 shadow-md'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-cyan-400 font-semibold">{alg.speedupType} Speedup</span>
                  <span>{alg.year}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{alg.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Algorithm Walkthrough View */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-cyan-400">{activeAlg.discoverer} ({activeAlg.year})</span>
                <h1 className="text-lg font-bold text-slate-100 mt-0.5">{activeAlg.name}</h1>
              </div>

              {activeAlg.associatedPresetId && (
                <button
                  onClick={() => handleLoadPreset(activeAlg.associatedPresetId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load Algorithm into Circuit Studio</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeAlg.summary}</p>

            {/* Complexity Comparison Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#07090e] p-2.5 rounded border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Classical Complexity</div>
                <div className="text-xs font-mono font-bold text-rose-300 mt-0.5">
                  {activeAlg.complexityClassical}
                </div>
              </div>

              <div className="bg-[#07090e] p-2.5 rounded border border-slate-800">
                <div className="text-[10px] uppercase font-mono text-slate-500">Quantum Complexity</div>
                <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
                  {activeAlg.complexityQuantum}
                </div>
              </div>

              <div className="bg-[#07090e] p-2.5 rounded border border-slate-800 col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-mono text-slate-500">Theoretical Advantage</div>
                <div className="text-xs font-mono font-bold text-emerald-300 mt-0.5">
                  {activeAlg.speedupType} Speedup
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-Step Mathematical Walkthrough */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Step-by-Step Operator Progression & Derivation
            </h3>

            {activeAlg.steps.map((st, i) => (
              <div key={i} className="bg-[#0d121f] p-4 rounded-lg border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                {st.math && (
                  <div className="p-2.5 rounded bg-[#07090e] border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                    {st.math}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
