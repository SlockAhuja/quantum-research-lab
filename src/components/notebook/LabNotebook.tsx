/**
 * Quantum Research Lab (QRL) - Lab Notebook
 * Scientific journal for logging quantum experiments, circuit snapshots,
 * empirical observations, and research hypotheses.
 */

import React, { useState, useEffect } from 'react';
import { NotebookEntry, QuantumCircuit } from '../../types/quantum';
import { Storage } from '../../lib/quantum/storage';
import {
  BookMarked,
  Plus,
  Trash2,
  Download,
  Calendar,
  Tag,
  CheckCircle2,
  FileText,
  Play,
} from 'lucide-react';

interface LabNotebookProps {
  onLoadCircuitToStudio?: (circuit: QuantumCircuit) => void;
}

export const INITIAL_NOTEBOOK_ENTRIES: NotebookEntry[] = [
  {
    id: 'note-1',
    title: 'Historical Baseline Run: QRL-001 Single-Qubit Superposition',
    timestamp: '2026-03-01T14:32:00Z',
    author: 'Quantum Benchmark Archives',
    status: 'Verified',
    tags: ['Historical Data', 'QRL-001', 'Hadamard', '1024-Shots', 'Shot Noise'],
    metricsSummary: {
      numQubits: 1,
      shots: 1024,
      tvd: 0.0195,
      fidelity: 0.9805,
    },
    notesMarkdown: `[HISTORICAL MEASUREMENT RECORD - DO NOT OVERWRITE]
Archival benchmark execution of QRL-001 (Single-Qubit Superposition) across 1,024 experimental shots.

Recorded Historical Measurement Counts:
- Outcome |0⟩: 532 counts (51.95%)
- Outcome |1⟩: 492 counts (48.05%)
- Total Shots: 1,024

Comparative Analysis:
- Expected Theoretical Model: P(|0⟩) = 0.5000 (50.00%), P(|1⟩) = 0.5000 (50.00%)
- Historical Variation: ΔP(|0⟩) = +1.95%, ΔP(|1⟩) = -1.95%
- Total Variation Distance: D_TV = 0.0195
- Note: This entry preserves calibrated historical measurement data, distinct from ideal theoretical distributions and new in-browser simulations.`,
  },
  {
    id: 'note-2',
    title: 'Bell State |Φ+⟩ Subsystem Entropy & Entanglement Witness',
    timestamp: '2026-03-02T09:15:00Z',
    author: 'Quantum Systems Group',
    status: 'Verified',
    tags: ['Entanglement', 'EPR', 'Bell State', 'Density Matrix'],
    metricsSummary: {
      numQubits: 2,
      shots: 4096,
      tvd: 0.0042,
      fidelity: 0.9992,
    },
    notesMarkdown: `Executed H on q0 and CNOT(0, 1). Correlated outcomes measured:
|00⟩: 2,058 counts (50.24%)
|11⟩: 2,038 counts (49.76%)
|01⟩ and |10⟩: 0 counts (0.00%).
Partial trace of subsystem q0 yields maximally mixed density matrix ρ = diag(0.5, 0.5).
Purity Tr(ρ²) = 0.500 confirmed. Bloch vector collapsed to center of sphere (r = 0.000).`,
  },
];

export const LabNotebook: React.FC<LabNotebookProps> = ({ onLoadCircuitToStudio }) => {
  const [entries, setEntries] = useState<NotebookEntry[]>(() =>
    Storage.loadNotebookEntries(INITIAL_NOTEBOOK_ENTRIES)
  );
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    entries[0]?.id || INITIAL_NOTEBOOK_ENTRIES[0].id
  );

  // Sync to storage whenever entries change
  useEffect(() => {
    Storage.saveNotebookEntries(entries);
  }, [entries]);

  // New entry form state
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTags, setNewTags] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  const activeEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];

  const handleCreateEntry = () => {
    if (!newTitle.trim()) return;

    const entry: NotebookEntry = {
      id: `note-${Date.now()}`,
      title: newTitle,
      timestamp: new Date().toISOString(),
      author: 'Laboratory Researcher',
      status: 'Draft',
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      notesMarkdown: newNotes,
    };

    setEntries([entry, ...entries]);
    setSelectedEntryId(entry.id);
    setIsCreating(false);
    setNewTitle('');
    setNewTags('');
    setNewNotes('');
  };

  const handleDeleteEntry = (id: string) => {
    const remaining = entries.filter((e) => e.id !== id);
    setEntries(remaining);
    if (selectedEntryId === id && remaining.length > 0) {
      setSelectedEntryId(remaining[0].id);
    }
  };

  const handleExportMarkdown = () => {
    const md = entries
      .map(
        (e) => `# ${e.title}
Date: ${new Date(e.timestamp).toUTCString()}
Author: ${e.author}
Status: ${e.status}
Tags: ${e.tags.join(', ')}

${e.notesMarkdown}
----------------------------------------
`
      )
      .join('\n');

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QRL_Lab_Notebook_Export.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#07090e] text-slate-100 overflow-hidden">
      {/* Sidebar: Entry List */}
      <div className="w-full lg:w-80 bg-[#0d121f] border-r border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-200">Lab Notebook</h2>
              <div className="text-[11px] text-slate-400 font-mono">Experimental Logs</div>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded transition-colors"
            title="Create Log Entry"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {entries.map((entry) => {
            const isSelected = entry.id === selectedEntryId && !isCreating;
            return (
              <button
                key={entry.id}
                onClick={() => {
                  setSelectedEntryId(entry.id);
                  setIsCreating(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 text-slate-100 shadow-md'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                  <span className="text-cyan-400 font-semibold">{entry.status}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                  {entry.title}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <button
            onClick={handleExportMarkdown}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Notebook (.MD)</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {isCreating ? (
            /* Creation Form */
            <div className="bg-[#0d121f] p-6 rounded-lg border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-200">New Laboratory Note</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  ✕ Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Log Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Observation of phase drift under Ramsey sequence..."
                  className="w-full bg-[#07090e] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. Entanglement, Bell Test, Decoherence"
                  className="w-full bg-[#07090e] border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Research Notes & Data</label>
                <textarea
                  rows={8}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Record empirical measurements, theoretical derivations, or questions..."
                  className="w-full bg-[#07090e] border border-slate-700 rounded p-2 text-xs text-slate-200 font-mono leading-relaxed focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEntry}
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded"
                >
                  Save Entry
                </button>
              </div>
            </div>
          ) : activeEntry ? (
            /* Selected Entry Details */
            <div className="bg-[#0d121f] p-6 rounded-lg border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{new Date(activeEntry.timestamp).toLocaleString()}</span>
                    <span>·</span>
                    <span className="text-cyan-400 font-semibold">{activeEntry.author}</span>
                    <span>·</span>
                    <span className="text-emerald-400">{activeEntry.status}</span>
                  </div>
                  <h1 className="text-lg font-bold text-slate-100 mt-1">{activeEntry.title}</h1>
                </div>

                <button
                  onClick={() => handleDeleteEntry(activeEntry.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tags strip (unboxed zero-pill text) */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                {activeEntry.tags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span className="text-slate-300">{tag}</span>
                    {idx < activeEntry.tags.length - 1 && <span className="text-slate-600">·</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Metrics Summary Strip if attached */}
              {activeEntry.metricsSummary && (
                <div className="grid grid-cols-4 gap-3 bg-[#07090e] p-3 rounded border border-slate-800 text-xs font-mono">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Qubits</div>
                    <div className="text-cyan-300 font-bold">{activeEntry.metricsSummary.numQubits}Q</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Shots</div>
                    <div className="text-slate-200">{activeEntry.metricsSummary.shots}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">D_TV</div>
                    <div className="text-violet-300">{activeEntry.metricsSummary.tvd.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Fidelity</div>
                    <div className="text-emerald-300">
                      {(activeEntry.metricsSummary.fidelity * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Body Content */}
              <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-[#07090e] p-4 rounded border border-slate-800/80">
                {activeEntry.notesMarkdown}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              No entries logged in notebook.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
