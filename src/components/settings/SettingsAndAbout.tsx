/**
 * Quantum Research Lab (QRL) - Settings and About
 * Scientific calculation tolerances, angle formatting, theme controls,
 * and FastAPI backend integration readiness documentation.
 */

import React from 'react';
import { LaboratorySettings } from '../../types/quantum';
import {
  Settings,
  Info,
  Server,
  Code2,
  Download,
  Upload,
  CheckCircle2,
  Sliders,
  Moon,
  Sun,
  ShieldAlert,
} from 'lucide-react';

interface SettingsAndAboutProps {
  settings: LaboratorySettings;
  onUpdateSettings: (newSettings: LaboratorySettings) => void;
  onResetAllData?: () => void;
}

export const SettingsAndAbout: React.FC<SettingsAndAboutProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [showResetConfirm, setShowResetConfirm] = React.useState<boolean>(false);

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: nextTheme });
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#07090e] text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100">Workstation Settings & Architecture</h1>
        <p className="text-xs text-slate-400 mt-1">
          Precision configuration, display preferences, and backend API integration contract.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Scientific Settings */}
        <div className="bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-200">Scientific Calibration Settings</h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Float precision */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">
                Floating Point Decimal Precision
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 6].map((p) => (
                  <button
                    key={p}
                    onClick={() => onUpdateSettings({ ...settings, floatPrecision: p })}
                    className={`py-1.5 rounded font-mono transition-colors ${
                      settings.floatPrecision === p
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {p} Decimals
                  </button>
                ))}
              </div>
            </div>

            {/* Angle display unit */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Angle Units</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ ...settings, angleDisplayUnit: 'radians' })}
                  className={`py-1.5 rounded font-mono transition-colors ${
                    settings.angleDisplayUnit === 'radians'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  Radians (π format)
                </button>
                <button
                  onClick={() => onUpdateSettings({ ...settings, angleDisplayUnit: 'degrees' })}
                  className={`py-1.5 rounded font-mono transition-colors ${
                    settings.angleDisplayUnit === 'degrees'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  Degrees (0° - 360°)
                </button>
              </div>
            </div>

            {/* Default Shot Count */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Default Shot Budget</label>
              <select
                value={settings.defaultShots}
                onChange={(e) => onUpdateSettings({ ...settings, defaultShots: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
              >
                <option value={0}>0 (Exact Analytical Statevector)</option>
                <option value={1024}>1,024 Shots (Standard)</option>
                <option value={4096}>4,096 Shots (High Resolution)</option>
                <option value={8192}>8,192 Shots (Precision Benchmark)</option>
              </select>
            </div>

            {/* Theme & Display Mode */}
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Theme Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleTheme}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded transition-colors ${
                    settings.theme === 'dark'
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Deep Navy (Dark)</span>
                </button>
                <button
                  onClick={handleToggleTheme}
                  className={`flex items-center justify-center gap-2 py-1.5 rounded transition-colors ${
                    settings.theme === 'light'
                      ? 'bg-slate-100 text-slate-950 font-semibold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lab Slate (Light)</span>
                </button>
              </div>
            </div>

            {/* Local Storage & Cache Management */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-slate-400 font-medium">Local Storage & Cache</label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Circuit designs, custom notes, user preferences, and tutorial progress are saved safely in your browser's local storage.
              </p>
              {onResetAllData && (
                <div>
                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs rounded transition-colors"
                    >
                      Reset Saved Application Data
                    </button>
                  ) : (
                    <div className="p-3 rounded bg-rose-950/20 border border-rose-500/40 space-y-2">
                      <div className="text-xs text-rose-300 font-semibold">
                        Confirm reset all saved circuits and notes?
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            onResetAllData();
                            setShowResetConfirm(false);
                          }}
                          className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-semibold text-xs rounded transition-colors"
                        >
                          Yes, Clear Data & Reset
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Backend Integration Readiness */}
        <div className="bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-200">FastAPI & Antigravity Backend Readiness</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Quantum Research Lab is engineered with a strict separation between UI, state management,
            and simulation logic. The frontend statevector engine conforms to the Antigravity FastAPI service interface.
          </p>

          {/* API Contract Endpoints */}
          <div className="space-y-2 text-xs">
            <div className="text-[10px] uppercase font-mono text-slate-500">Service API Contract</div>
            <div className="p-2.5 rounded bg-[#07090e] border border-slate-800 font-mono space-y-1">
              <div className="text-cyan-400">POST /api/v1/quantum/simulate</div>
              <div className="text-slate-400 text-[11px]">Payload: QuantumCircuit + shots + noise_model</div>
              <div className="text-slate-500 text-[11px]">Returns: StateVector, counts, BlochVector, TVD</div>
            </div>
            <div className="p-2.5 rounded bg-[#07090e] border border-slate-800 font-mono space-y-1">
              <div className="text-violet-400">POST /api/v1/quantum/transpile</div>
              <div className="text-slate-400 text-[11px]">Payload: Circuit JSON &rarr; Qiskit / PennyLane transpilation</div>
            </div>
          </div>

          {/* Provenance and Integrity Box */}
          <div className="p-3 rounded bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scientific Data Provenance</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Demonstration outputs are strictly generated by our verified local 2ⁿ statevector matrix simulator.
              Mock outputs are never falsely labelled as physical quantum hardware executions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
