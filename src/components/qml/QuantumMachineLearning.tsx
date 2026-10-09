/**
 * Quantum Research Lab (QRL) - Quantum Machine Learning (QML)
 * Variational quantum circuits (VQC), data encoding paradigms,
 * and interactive gradient-based parameter training visualization.
 */

import React, { useState } from 'react';
import { QuantumCircuit } from '../../types/quantum';
import {
  Brain,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface QuantumMachineLearningProps {
  onLoadAnsatzIntoStudio: (circuit: QuantumCircuit) => void;
}

export const QuantumMachineLearning: React.FC<QuantumMachineLearningProps> = ({
  onLoadAnsatzIntoStudio,
}) => {
  // Interactive Training State
  const [paramTheta, setParamTheta] = useState<number>(1.2);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [lossHistory, setLossHistory] = useState<number[]>([0.72, 0.65, 0.54, 0.41, 0.32, 0.21, 0.14]);
  const [selectedEncoding, setSelectedEncoding] = useState<'angle' | 'amplitude' | 'basis'>('angle');

  // Synthetic loss function: L(theta) = 0.5 * (1 + cos(theta - 2.5))^2 + 0.05
  const currentLoss = Number((0.5 * Math.pow(1 + Math.cos(paramTheta - 2.5), 2) + 0.05).toFixed(3));

  const handleStepOptimization = () => {
    // Gradient step towards theta = 2.5
    const grad = -(1 + Math.cos(paramTheta - 2.5)) * Math.sin(paramTheta - 2.5);
    const lr = 0.25;
    const newTheta = Math.max(0, Math.min(Math.PI * 2, paramTheta - lr * grad));
    setParamTheta(newTheta);
    setCurrentEpoch((prev) => prev + 1);
    setLossHistory((prev) => [...prev.slice(-12), currentLoss]);
  };

  const handleResetTraining = () => {
    setParamTheta(1.2);
    setCurrentEpoch(0);
    setLossHistory([0.72, 0.65, 0.54]);
  };

  const handleLoadVqcCircuit = () => {
    const vqcCircuit: QuantumCircuit = {
      id: `vqc-${Date.now()}`,
      name: 'VQC Hardware-Efficient Ansatz',
      description: 'Angle encoding + parameterized RY layers + CNOT entangling ladder',
      numQubits: 2,
      timeSteps: 6,
      gates: [
        { id: 'vqc-1', type: 'RY', step: 0, targetQubit: 0, parameter: 0.7854 },
        { id: 'vqc-2', type: 'RY', step: 0, targetQubit: 1, parameter: 1.5708 },
        { id: 'vqc-3', type: 'CX', step: 1, targetQubit: 1, controlQubits: [0] },
        { id: 'vqc-4', type: 'RY', step: 2, targetQubit: 0, parameter: paramTheta },
        { id: 'vqc-5', type: 'RZ', step: 3, targetQubit: 1, parameter: paramTheta / 2 },
      ],
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    };
    onLoadAnsatzIntoStudio(vqcCircuit);
  };

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100">Quantum Machine Learning (QML)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid classical-quantum optimization, parameterized quantum circuits (PQC), and variational classifiers.
          </p>
        </div>

        <button
          onClick={handleLoadVqcCircuit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded transition-colors"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Load VQC Ansatz into Studio</span>
        </button>
      </div>

      {/* 2-Column Split: Encoding Paradigms & Interactive Training Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Data Encoding Paradigms (5 cols) */}
        <div className="lg:col-span-5 bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quantum Feature Encoding Schemes
          </div>

          <div className="flex gap-1.5 p-1 bg-[#07090e] border border-slate-800 rounded">
            {(['angle', 'amplitude', 'basis'] as const).map((enc) => (
              <button
                key={enc}
                onClick={() => setSelectedEncoding(enc)}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                  selectedEncoding === enc
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {enc === 'angle' && 'Angle Encoding'}
                {enc === 'amplitude' && 'Amplitude'}
                {enc === 'basis' && 'Basis'}
              </button>
            ))}
          </div>

          {selectedEncoding === 'angle' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-slate-200">Angle Encoding (Tensor Product Feature Map)</h4>
              <p className="leading-relaxed text-slate-400">
                Encodes continuous classical feature values $x_i$ as rotation angles on independent single qubits:
              </p>
              <div className="p-2.5 rounded bg-[#07090e] border border-slate-800 font-mono text-cyan-300">
                |x⟩ = ⨂ R_y(x_i) |0⟩
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Requires N qubits for N features</li>
                <li>Constant O(1) circuit depth</li>
                <li>Robust against physical noise on NISQ hardware</li>
              </ul>
            </div>
          )}

          {selectedEncoding === 'amplitude' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-slate-200">Amplitude Encoding</h4>
              <p className="leading-relaxed text-slate-400">
                Encodes an N-dimensional normalized vector as the complex amplitudes of a log₂(N)-qubit statevector:
              </p>
              <div className="p-2.5 rounded bg-[#07090e] border border-slate-800 font-mono text-cyan-300">
                |x⟩ = ∑ x_i |i⟩
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Exponential data compression: 2ⁿ features in n qubits</li>
                <li>High circuit depth O(2ⁿ) to state-prep general vectors</li>
              </ul>
            </div>
          )}

          {selectedEncoding === 'basis' && (
            <div className="space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-slate-200">Computational Basis Encoding</h4>
              <p className="leading-relaxed text-slate-400">
                Directly maps binary strings (e.g. x = 101) into computational basis eigenstates:
              </p>
              <div className="p-2.5 rounded bg-[#07090e] border border-slate-800 font-mono text-cyan-300">
                |x⟩ = |101⟩
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Suitable for discrete combinatorial inputs</li>
                <li>Applies X gates to wires where bits equal 1</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Parameter Optimization Engine (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Variational Classifier Training Landscape</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Optimize variational ansatz weight θ via parameter-shift gradient descent.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleResetTraining}
                className="p-1.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded"
                title="Reset Training"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStepOptimization}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded transition-colors"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Gradient Step</span>
              </button>
            </div>
          </div>

          {/* Parameter Readouts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#07090e] p-3 rounded border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-500">Epoch / Steps</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-0.5">{currentEpoch}</div>
            </div>

            <div className="bg-[#07090e] p-3 rounded border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-500">Weight Parameter θ</div>
              <div className="text-lg font-mono font-bold text-cyan-300 mt-0.5">
                {paramTheta.toFixed(3)} rad
              </div>
            </div>

            <div className="bg-[#07090e] p-3 rounded border border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-500">Cost / Cross-Entropy</div>
              <div className="text-lg font-mono font-bold text-emerald-300 mt-0.5">
                {currentLoss}
              </div>
            </div>
          </div>

          {/* Manual Slider Override */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Manual parameter scrub:</span>
              <span className="font-mono text-cyan-300 font-bold">{paramTheta.toFixed(3)} rad</span>
            </div>
            <input
              type="range"
              min={0}
              max={2 * Math.PI}
              step={0.02}
              value={paramTheta}
              onChange={(e) => setParamTheta(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Loss Curve SVG */}
          <div className="bg-[#07090e] p-3 rounded border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-500 mb-2">
              Loss Convergence History
            </div>
            <div className="h-28 w-full flex items-end gap-2 px-2 border-b border-slate-800 pb-1">
              {lossHistory.map((l, idx) => {
                const height = Math.max(8, (l / 1.0) * 80);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-900 border border-slate-700 p-1 rounded text-[9px] font-mono text-cyan-300">
                      {l.toFixed(3)}
                    </div>
                    <div
                      className="w-full bg-cyan-500/70 group-hover:bg-cyan-400 rounded-t-xs transition-all"
                      style={{ height: `${height}px` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
