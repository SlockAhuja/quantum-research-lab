/**
 * Quantum Research Lab (QRL) - Experiment Library
 * Searchable, filterable repository of verified benchmark experiments (QRL-001 through QRL-023).
 * Detailed modal with mathematical formulas, learning objectives, Qiskit/PennyLane code, and export.
 */

import React, { useState } from 'react';
import { BenchmarkExperiment, QuantumCircuit } from '../../types/quantum';
import { VERIFIED_EXPERIMENTS } from '../../lib/quantum/experimentsData';
import {
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  Code2,
  BookOpen,
  Play,
  Download,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

interface ExperimentLibraryProps {
  onLoadExperimentIntoStudio: (circuit: QuantumCircuit) => void;
  onNavigateToSimulation: () => void;
}

export const ExperimentLibrary: React.FC<ExperimentLibraryProps> = ({
  onLoadExperimentIntoStudio,
  onNavigateToSimulation,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeExperiment, setActiveExperiment] = useState<BenchmarkExperiment | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'qiskit' | 'pennylane'>('qiskit');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const categories = [
    'All',
    'Single-Qubit',
    'Phase & Rotation',
    'Controlled & Entanglement',
    'Bell States',
    'GHZ States',
    'Quantum Algorithms',
    'Quantum Machine Learning',
  ];

  const filteredExperiments = VERIFIED_EXPERIMENTS.filter((exp) => {
    const matchesSearch =
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportCsv = (exp: BenchmarkExperiment) => {
    const csvContent = [
      'Experiment Code,Name,Category,Qubits,Depth,Gate Count,CNOT Count,Reference Fidelity',
      `"${exp.code}","${exp.name}","${exp.category}",${exp.numQubits},${exp.circuitDepth},${exp.gateCount},${exp.cnotCount},${exp.referenceFidelity}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exp.code}_metadata.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = (exp: BenchmarkExperiment) => {
    const blob = new Blob([JSON.stringify(exp, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exp.code}_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 overflow-y-auto">
      {/* Header & Filter Ribbon */}
      <div className="p-6 bg-[#0d121f] border-b border-slate-800 shrink-0">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-100">Benchmark Experiment Suite</h1>
              <p className="text-xs text-slate-400 mt-1">
                23 verified baseline quantum protocols spanning single-qubit transformations to multipartite algorithms.
              </p>
            </div>

            {/* Quick stats unboxed metadata */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-cyan-400 font-semibold">{VERIFIED_EXPERIMENTS.length} Verified Baselines</span>
              <span>·</span>
              <span>100% Deterministic Matrix Models</span>
            </div>
          </div>

          {/* Search bar and Category Tabs */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiments by code (e.g. QRL-001), keyword, or gate..."
                className="w-full bg-[#07090e] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* Category Segmented Scrollable Control */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#07090e] border border-slate-800 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Experiment Cards */}
      <div className="p-6 flex-1">
        <div className="max-w-6xl mx-auto">
          {filteredExperiments.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No benchmark experiments match your criteria.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExperiments.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => setActiveExperiment(exp)}
                  className="bg-[#0d121f] rounded-lg border border-slate-800 hover:border-cyan-500/50 p-4 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-0.5 group shadow-sm"
                >
                  <div>
                    {/* Top unboxed kicker and verified marker */}
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-mono text-cyan-400 font-semibold">{exp.code}</span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {exp.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <div>
                      <span>{exp.numQubits}Q</span>
                      <span className="mx-1">·</span>
                      <span>Depth {exp.circuitDepth}</span>
                      <span className="mx-1">·</span>
                      <span>{exp.cnotCount} CNOT</span>
                    </div>

                    <div className="text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Inspect &rarr;
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Experiment Detail Drawer / Modal */}
      {activeExperiment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0d121f] border border-slate-700 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{activeExperiment.code}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-400">{activeExperiment.category}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-100 mt-0.5">{activeExperiment.name}</h2>
              </div>

              <button
                onClick={() => setActiveExperiment(null)}
                className="text-slate-400 hover:text-white text-xs font-mono p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs text-slate-300">
              {/* Description */}
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Experiment Overview</h4>
                <p className="leading-relaxed text-slate-400">{activeExperiment.description}</p>
              </div>

              {/* Learning Objectives */}
              <div className="bg-[#07090e] p-3.5 rounded border border-slate-800">
                <h4 className="font-semibold text-cyan-400 mb-2">Learning Objectives & Outcomes</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {activeExperiment.learningObjectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              {/* Expected Theoretical Behavior & Matrix Formula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#07090e] p-3 rounded border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Theoretical Behavior</div>
                  <div className="text-slate-300 leading-relaxed">{activeExperiment.theoreticalBehavior}</div>
                </div>

                <div className="bg-[#07090e] p-3 rounded border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">Mathematical Operator / State</div>
                  <div className="font-mono text-cyan-300 text-xs bg-slate-900/60 p-2 rounded border border-slate-800 overflow-x-auto">
                    {activeExperiment.matrixFormula || 'U = \\prod_j U_j'}
                  </div>
                </div>
              </div>

              {/* Historical Measurement Calibration Record */}
              {activeExperiment.historicalMeasurement && (
                <div className="bg-[#07090e] p-3.5 rounded border border-amber-500/30">
                  <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                    <span className="text-amber-400 font-semibold">
                      Historical Measurement Record (Archival Calibration)
                    </span>
                    <span className="text-slate-400">
                      {activeExperiment.historicalMeasurement.shots} Shots
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    {activeExperiment.historicalMeasurement.label}. Note: This represents empirical historical benchmark data, distinct from ideal theoretical distributions ($P(|0⟩)=0.5, P(|1⟩)=0.5$) and newly generated simulations.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Outcome |0⟩:</span>
                      <span className="text-cyan-300 font-bold">
                        {activeExperiment.historicalMeasurement.outcome0} counts ({(activeExperiment.historicalMeasurement.frequency0 * 100).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Outcome |1⟩:</span>
                      <span className="text-cyan-300 font-bold">
                        {activeExperiment.historicalMeasurement.outcome1} counts ({(activeExperiment.historicalMeasurement.frequency1 * 100).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Code Viewer (Qiskit & PennyLane) */}
              <div className="bg-[#07090e] rounded border border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveCodeTab('qiskit')}
                      className={`px-2.5 py-1 text-xs font-mono rounded ${
                        activeCodeTab === 'qiskit' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Python Qiskit
                    </button>
                    <button
                      onClick={() => setActiveCodeTab('pennylane')}
                      className={`px-2.5 py-1 text-xs font-mono rounded ${
                        activeCodeTab === 'pennylane' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Python PennyLane
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleCopyCode(
                        activeCodeTab === 'qiskit' ? activeExperiment.qiskitCode : activeExperiment.pennylaneCode
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="p-3 font-mono text-xs text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                  {activeCodeTab === 'qiskit' ? activeExperiment.qiskitCode : activeExperiment.pennylaneCode}
                </pre>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportCsv(activeExperiment)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => handleExportJson(activeExperiment)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Load into studio CTA */}
              <button
                onClick={() => {
                  onLoadExperimentIntoStudio(activeExperiment.circuit);
                  setActiveExperiment(null);
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Load in Circuit Studio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
