/**
 * Quantum Research Lab (QRL) - Scientific Workstation Top Header
 * Follows strict 3-zone layout contract: Brand, Telemetry/Breadcrumbs, Primary Action.
 */

import React from 'react';
import { Play, Sparkles, Moon, Sun, Layers, Atom } from 'lucide-react';
import { LaboratorySettings } from '../../types/quantum';

interface HeaderProps {
  currentSectionTitle: string;
  circuitName: string;
  onRunSimulation: () => void;
  settings: LaboratorySettings;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSectionTitle,
  circuitName,
  onRunSimulation,
  settings,
  onToggleTheme,
}) => {
  return (
    <header className="h-14 bg-[#0d121f] border-b border-slate-800 px-6 flex items-center justify-between gap-8 shrink-0 select-none z-20">
      {/* Zone 1: Wordmark Brand Title (single element) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Atom className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Quantum Research Lab
          </span>
          <span className="text-[10px] font-mono text-cyan-400 leading-none">
            QRL Workstation
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Breadcrumb & System Telemetry */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Workspace /</span>
          <span className="text-slate-200 font-semibold">{currentSectionTitle}</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span>Matrix Engine Nominal</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 truncate max-w-48">{circuitName}</span>
        </div>
      </div>

      {/* Zone 3: Actions & Theme Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          title="Toggle light / dark mode"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        <button
          onClick={onRunSimulation}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-sm shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Sim</span>
        </button>
      </div>
    </header>
  );
};
