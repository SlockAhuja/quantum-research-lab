/**
 * Quantum Research Lab (QRL) - Scientific Sidebar Navigation
 * Structured for undergraduate approachable workflow:
 * - Primary: Dashboard, Learn, Circuit Studio, Simulation Explorer, Experiment Library
 * - Advanced Research: Benchmarks, Algorithms, Quantum ML (collapsible group)
 * - Workspace: Lab Notebook, Settings & About
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Cpu,
  Compass,
  FlaskConical,
  GraduationCap,
  TrendingUp,
  Binary,
  Brain,
  BookMarked,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface NavSectionItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
  group?: 'primary' | 'advanced' | 'workspace';
}

export const PRIMARY_NAV: NavSectionItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, group: 'primary' },
  { id: 'learn', name: 'Learn', icon: GraduationCap, tag: 'Tutorials', group: 'primary' },
  { id: 'circuit', name: 'Circuit Studio', icon: Cpu, group: 'primary' },
  { id: 'simulation', name: 'Simulation Explorer', icon: Compass, group: 'primary' },
  { id: 'experiments', name: 'Experiment Library', icon: FlaskConical, tag: '23 Tests', group: 'primary' },
];

export const ADVANCED_NAV: NavSectionItem[] = [
  { id: 'benchmarks', name: 'Research Benchmarks', icon: TrendingUp, group: 'advanced' },
  { id: 'algorithms', name: 'Quantum Algorithms', icon: Binary, group: 'advanced' },
  { id: 'qml', name: 'Quantum ML', icon: Brain, group: 'advanced' },
];

export const WORKSPACE_NAV: NavSectionItem[] = [
  { id: 'notebook', name: 'Lab Notebook', icon: BookMarked, group: 'workspace' },
  { id: 'settings', name: 'Settings & About', icon: Settings, group: 'workspace' },
];

export const ALL_NAV_SECTIONS: NavSectionItem[] = [
  ...PRIMARY_NAV,
  ...ADVANCED_NAV,
  ...WORKSPACE_NAV,
];

interface SidebarProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  isMobileOpen,
  onCloseMobile,
}) => {
  const isAdvancedActive = ADVANCED_NAV.some((item) => item.id === activeSection);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState<boolean>(true);

  // Auto-expand if user navigates to an advanced route
  useEffect(() => {
    if (isAdvancedActive) {
      setIsAdvancedExpanded(true);
    }
  }, [isAdvancedActive]);

  const renderNavItem = (item: NavSectionItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;

    return (
      <button
        key={item.id}
        onClick={() => {
          onSelectSection(item.id);
          onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left group ${
          isActive
            ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            className={`w-4 h-4 transition-colors ${
              isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />
          <span className="truncate">{item.name}</span>
        </div>

        {item.tag && (
          <span className="text-[10px] font-mono text-cyan-400">{item.tag}</span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-14 bottom-0 left-0 w-64 bg-[#0a0e1a] border-r border-slate-800 flex flex-col justify-between p-3 z-40 transition-transform lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Primary Navigation (Beginner & Core Student Flow) */}
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              Core Modules
            </div>
            <nav className="space-y-0.5">
              {PRIMARY_NAV.map(renderNavItem)}
            </nav>
          </div>

          {/* Advanced Research (Collapsible Group) */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Advanced Research</span>
                {isAdvancedActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </div>
              {isAdvancedExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {isAdvancedExpanded && (
              <nav className="space-y-0.5 pl-1">
                {ADVANCED_NAV.map(renderNavItem)}
              </nav>
            )}
          </div>

          {/* Workspace & Tools */}
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              Workspace & Tools
            </div>
            <nav className="space-y-0.5">
              {WORKSPACE_NAV.map(renderNavItem)}
            </nav>
          </div>
        </div>

        {/* Bottom Tagline info */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="p-3 bg-[#0d121f] rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="text-slate-200 font-semibold">Quantum Research Lab</div>
            <div className="text-[10px] text-slate-500">Explore. Build. Simulate. Discover.</div>
          </div>
        </div>
      </aside>
    </>
  );
};
