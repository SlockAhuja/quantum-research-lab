/**
 * Quantum Research Lab (QRL) - Research Benchmarks & Parameter Sweep
 * Comparative analytics across the 23-experiment suite and interactive parameter sweep engine.
 */

import React, { useState, useMemo } from 'react';
import { VERIFIED_EXPERIMENTS } from '../../lib/quantum/experimentsData';
import { BenchmarkExperiment } from '../../types/quantum';
import { runQuantumSimulation, getSingleQubitMatrix } from '../../lib/quantum/engine';
import {
  TrendingUp,
  Download,
  Filter,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const ResearchBenchmarks: React.FC = () => {
  const [selectedSweepGate, setSelectedSweepGate] = useState<'RY' | 'RX' | 'RZ'>('RY');
  const [sweepPoints, setSweepPoints] = useState<number>(17); // 0 to 2pi in steps
  const [sweepShots, setSweepShots] = useState<number>(1024);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Compute parameter sweep data live
  const sweepData = useMemo(() => {
    const results: {
      theta: number;
      thetaPi: number;
      prob0_theory: number;
      prob1_theory: number;
      prob0_sampled: number;
      prob1_sampled: number;
    }[] = [];

    for (let i = 0; i < sweepPoints; i++) {
      const theta = (i / (sweepPoints - 1)) * 2 * Math.PI;
      const thetaPi = Number((theta / Math.PI).toFixed(2));

      // Construct 1-qubit circuit with rotation gate
      const simCircuit = {
        id: `sweep-circ-${i}`,
        name: `Sweep ${selectedSweepGate}(${thetaPi}π)`,
        description: 'Parameter sweep evaluation',
        numQubits: 1,
        timeSteps: 3,
        gates: [
          { id: 'g1', type: selectedSweepGate, step: 0, targetQubit: 0, parameter: theta },
        ],
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      };

      const res = runQuantumSimulation(simCircuit, sweepShots);
      const p0_th = res.theoreticalProbabilities['0'] || 0;
      const p1_th = res.theoreticalProbabilities['1'] || 0;
      const p0_samp = res.sampledProbabilities['0'] || 0;
      const p1_samp = res.sampledProbabilities['1'] || 0;

      results.push({
        theta,
        thetaPi,
        prob0_theory: p0_th,
        prob1_theory: p1_th,
        prob0_sampled: p0_samp,
        prob1_sampled: p1_samp,
      });
    }

    return results;
  }, [selectedSweepGate, sweepPoints, sweepShots]);

  const filteredExperiments = VERIFIED_EXPERIMENTS.filter(
    (e) => filterCategory === 'All' || e.category === filterCategory
  );

  const handleExportFullBenchmarkCsv = () => {
    const rows = [
      'Experiment Code,Name,Category,Qubits,Depth,Total Gates,CNOTs,Reference Fidelity,Baseline Status',
      ...VERIFIED_EXPERIMENTS.map(
        (e) =>
          `"${e.code}","${e.name}","${e.category}",${e.numQubits},${e.circuitDepth},${e.gateCount},${e.cnotCount},${e.referenceFidelity},"Verified"`
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QRL_Benchmark_Suite_23.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSweepCsv = () => {
    const rows = [
      'Theta (rad),Theta (pi),P(0) Theory,P(1) Theory,P(0) Sampled,P(1) Sampled',
      ...sweepData.map(
        (d) =>
          `${d.theta.toFixed(4)},${d.thetaPi},${d.prob0_theory.toFixed(4)},${d.prob1_theory.toFixed(4)},${d.prob0_sampled.toFixed(4)},${d.prob1_sampled.toFixed(4)}`
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Parameter_Sweep_${selectedSweepGate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Research Benchmarks & Sweeps</h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparative performance, parameter sweeps, and reproducibility metadata across all verified baselines.
          </p>
        </div>

        <button
          onClick={handleExportFullBenchmarkCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs font-medium transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export 23-Benchmark Suite CSV</span>
        </button>
      </div>

      {/* Parameter Sweep Card */}
      <div className="bg-[#0d121f] rounded-lg border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200">Interactive Continuous Parameter Sweep</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sweeps rotation angle θ ∈ [0, 2π] on |0⟩ to verify statevector oscillation P(|0⟩) = cos²(θ/2).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Gate Type Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs">
              <span className="text-slate-400 mr-2 text-[11px]">Gate:</span>
              <select
                value={selectedSweepGate}
                onChange={(e) => setSelectedSweepGate(e.target.value as any)}
                className="bg-transparent font-mono text-cyan-300 font-semibold focus:outline-hidden"
              >
                <option value="RY" className="bg-slate-900 text-slate-200">RY(θ) [Real Superposition]</option>
                <option value="RX" className="bg-slate-900 text-slate-200">RX(θ) [Bit Flip Axis]</option>
                <option value="RZ" className="bg-slate-900 text-slate-200">RZ(θ) [Phase Ramsey]</option>
              </select>
            </div>

            {/* Sweep Shots */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs">
              <span className="text-slate-400 mr-2 text-[11px]">Shots:</span>
              <select
                value={sweepShots}
                onChange={(e) => setSweepShots(Number(e.target.value))}
                className="bg-transparent font-mono text-slate-200 focus:outline-hidden"
              >
                <option value={100} className="bg-slate-900">100</option>
                <option value={1024} className="bg-slate-900">1,024</option>
                <option value={4096} className="bg-slate-900">4,096</option>
              </select>
            </div>

            <button
              onClick={handleExportSweepCsv}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Curve CSV</span>
            </button>
          </div>
        </div>

        {/* Live SVG Curve Plot: Dual Line Chart */}
        <div className="bg-[#07090e] rounded p-4 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">P(|0⟩) vs Rotation Angle θ (0 to 2π)</span>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
                Theory P(|0⟩) = cos²(θ/2)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                Sampled P(|0⟩) ({sweepShots} shots)
              </span>
            </div>
          </div>

          {/* SVG Canvas for Curves */}
          <div className="h-56 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="65" x2="580" y2="65" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="580" y2="110" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="155" x2="580" y2="155" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="40" y1="175" x2="580" y2="175" stroke="#334155" strokeWidth="1.5" />

              {/* Y Axis Labels */}
              <text x="32" y="24" textAnchor="end" className="text-[9px] font-mono fill-slate-500">1.0</text>
              <text x="32" y="100" textAnchor="end" className="text-[9px] font-mono fill-slate-500">0.5</text>
              <text x="32" y="178" textAnchor="end" className="text-[9px] font-mono fill-slate-500">0.0</text>

              {/* Theoretical Path Line */}
              {(() => {
                const pathD = sweepData
                  .map((pt, idx) => {
                    const x = 40 + (idx / (sweepData.length - 1)) * 540;
                    const y = 175 - pt.prob0_theory * 155;
                    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(' ');

                return <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2.5" />;
              })()}

              {/* Sampled Dots */}
              {sweepData.map((pt, idx) => {
                const x = 40 + (idx / (sweepData.length - 1)) * 540;
                const y = 175 - pt.prob0_sampled * 155;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill="#a855f7"
                    stroke="#07090e"
                    strokeWidth="1"
                    className="hover:r-5 cursor-pointer"
                  >
                    <title>{`θ=${pt.thetaPi}π: P(0)=${pt.prob0_sampled.toFixed(3)}`}</title>
                  </circle>
                );
              })}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between px-10 text-[10px] font-mono text-slate-500 pt-1">
              <span>0</span>
              <span>0.5π</span>
              <span>1.0π</span>
              <span>1.5π</span>
              <span>2.0π</span>
            </div>
          </div>
        </div>
      </div>

      {/* 23-Experiment Comparison Table */}
      <div className="bg-[#0d121f] rounded-lg border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-200">23-Experiment Benchmark Matrix</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Verified analytical baseline models with theoretical fidelity and hardware gate metrics.
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            {['All', 'Single-Qubit', 'Bell States', 'Quantum Algorithms'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  filterCategory === c
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                <th className="pb-2">Protocol Code</th>
                <th className="pb-2">Experiment Name</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Qubits</th>
                <th className="pb-2">Circuit Depth</th>
                <th className="pb-2">Gate Count</th>
                <th className="pb-2">CNOT Gates</th>
                <th className="pb-2">Fidelity</th>
                <th className="pb-2">Baseline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredExperiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 font-bold text-cyan-400">{exp.code}</td>
                  <td className="py-2.5 font-sans font-medium text-slate-200">{exp.name}</td>
                  <td className="py-2.5 text-slate-400 text-[11px]">{exp.category}</td>
                  <td className="py-2.5 tabular-nums">{exp.numQubits}</td>
                  <td className="py-2.5 tabular-nums">{exp.circuitDepth}</td>
                  <td className="py-2.5 tabular-nums">{exp.gateCount}</td>
                  <td className="py-2.5 tabular-nums">{exp.cnotCount}</td>
                  <td className="py-2.5 tabular-nums text-emerald-400">
                    {(exp.referenceFidelity * 100).toFixed(2)}%
                  </td>
                  <td className="py-2.5">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
