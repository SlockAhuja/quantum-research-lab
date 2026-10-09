/**
 * Quantum Research Lab (QRL)
 * Tagline: Explore. Build. Simulate. Discover.
 *
 * Senior Scientific Frontend Workstation connecting Circuit Studio,
 * Exact Statevector Simulation, 3D Bloch Sphere, 23 Benchmark Experiments,
 * and Educational Learning Modules.
 */

import React, { useState, useEffect } from 'react';
import { QuantumCircuit, SimulationResponse, LaboratorySettings } from './types/quantum';
import { CIRCUIT_PRESETS } from './lib/quantum/presets';
import { runQuantumSimulation } from './lib/quantum/engine';
import { Storage } from './lib/quantum/storage';
import { Header } from './components/common/Header';
import { Sidebar, ALL_NAV_SECTIONS } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { CircuitStudio } from './components/circuit/CircuitStudio';
import { SimulationExplorer } from './components/simulation/SimulationExplorer';
import { ExperimentLibrary } from './components/experiments/ExperimentLibrary';
import { LearnQuantum } from './components/learn/LearnQuantum';
import { ResearchBenchmarks } from './components/benchmarks/ResearchBenchmarks';
import { QuantumAlgorithms } from './components/algorithms/QuantumAlgorithms';
import { QuantumMachineLearning } from './components/qml/QuantumMachineLearning';
import { LabNotebook } from './components/notebook/LabNotebook';
import { SettingsAndAbout } from './components/settings/SettingsAndAbout';
import { Menu, X } from 'lucide-react';

const DEFAULT_SETTINGS: LaboratorySettings = {
  floatPrecision: 3,
  angleDisplayUnit: 'radians',
  defaultShots: 1024,
  theme: 'dark',
  highContrast: false,
  reducedMotion: false,
  showStepGridLines: true,
};

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Restore saved settings or fallback to default
  const [settings, setSettings] = useState<LaboratorySettings>(() =>
    Storage.loadSettings(DEFAULT_SETTINGS)
  );

  // Restore saved circuit or fallback to QRL-001 preset
  const [currentCircuit, setCurrentCircuit] = useState<QuantumCircuit>(() =>
    Storage.loadCircuit(CIRCUIT_PRESETS[0])
  );

  // Simulation State & Invalidation flag
  const [simulationResponse, setSimulationResponse] = useState<SimulationResponse | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  // Circuit playback timeline active step (null for final state)
  const [playbackStep, setPlaybackStep] = useState<number | null>(null);

  // Sync theme class to documentElement
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [settings.theme]);

  // Execute initial simulation on boot with saved circuit & shots
  useEffect(() => {
    const initialRes = runQuantumSimulation(currentCircuit, settings.defaultShots);
    setSimulationResponse(initialRes);
    setIsStale(false);
  }, []);

  const handleUpdateCircuit = (updated: QuantumCircuit) => {
    setCurrentCircuit(updated);
    Storage.saveCircuit(updated);
    setIsStale(true);
  };

  const handleUpdateSettings = (newSettings: LaboratorySettings) => {
    setSettings(newSettings);
    Storage.saveSettings(newSettings);
  };

  const handleRunSimulation = (shotsOverride?: number) => {
    const shotsToUse = shotsOverride !== undefined ? shotsOverride : settings.defaultShots;
    const res = runQuantumSimulation(currentCircuit, shotsToUse);
    setSimulationResponse(res);
    setIsStale(false);
  };

  const handleLoadCircuitAndNavigate = (newCircuit: QuantumCircuit, targetSection: string = 'circuit') => {
    setCurrentCircuit(newCircuit);
    Storage.saveCircuit(newCircuit);
    const res = runQuantumSimulation(newCircuit, settings.defaultShots);
    setSimulationResponse(res);
    setIsStale(false);
    setActiveSection(targetSection);
  };

  const handleResetApplicationData = () => {
    Storage.clearAllData();
    const defaultCirc = CIRCUIT_PRESETS[0];
    setCurrentCircuit(defaultCirc);
    setSettings(DEFAULT_SETTINGS);
    const res = runQuantumSimulation(defaultCirc, DEFAULT_SETTINGS.defaultShots);
    setSimulationResponse(res);
    setIsStale(false);
    setActiveSection('dashboard');
  };

  const activeSectionObj = ALL_NAV_SECTIONS.find((s) => s.id === activeSection) || ALL_NAV_SECTIONS[0];

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme === 'light' ? 'light' : ''} bg-[#07090e] text-slate-100 font-sans`}>
      {/* Top 3-Zone Header */}
      <div className="relative z-30 flex items-center bg-[#0d121f]">
        {/* Mobile toggle button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-3 text-slate-400 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex-1">
          <Header
            currentSectionTitle={activeSectionObj.name}
            circuitName={currentCircuit.name}
            onRunSimulation={() => {
              handleRunSimulation();
              setActiveSection('simulation');
            }}
            settings={settings}
            onToggleTheme={() => {
              const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
              handleUpdateSettings({ ...settings, theme: nextTheme });
            }}
          />
        </div>
      </div>

      {/* Main App Body with Sidebar + Workspace Viewport */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(id) => setActiveSection(id)}
          isMobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-[#07090e] overflow-hidden">
          {activeSection === 'dashboard' && (
            <Dashboard
              onNavigate={(sec) => setActiveSection(sec)}
              onLoadCircuitToStudio={(c) => handleLoadCircuitAndNavigate(c, 'circuit')}
              currentCircuit={currentCircuit}
            />
          )}

          {activeSection === 'circuit' && (
            <CircuitStudio
              circuit={currentCircuit}
              onUpdateCircuit={handleUpdateCircuit}
              onRunSimulation={() => {
                handleRunSimulation();
                setActiveSection('simulation');
              }}
              simulationResponse={simulationResponse}
              activePlaybackStep={playbackStep}
              onSelectPlaybackStep={setPlaybackStep}
            />
          )}

          {activeSection === 'simulation' && (
            <SimulationExplorer
              circuit={currentCircuit}
              response={simulationResponse}
              onRerunSimulation={(shots) => handleRunSimulation(shots)}
              isStale={isStale}
            />
          )}

          {activeSection === 'experiments' && (
            <ExperimentLibrary
              onLoadExperimentIntoStudio={(c) => handleLoadCircuitAndNavigate(c, 'circuit')}
              onNavigateToSimulation={() => setActiveSection('simulation')}
            />
          )}

          {activeSection === 'learn' && (
            <LearnQuantum
              onLoadChallengeCircuit={(c) => handleLoadCircuitAndNavigate(c, 'circuit')}
            />
          )}

          {activeSection === 'benchmarks' && <ResearchBenchmarks />}

          {activeSection === 'algorithms' && (
            <QuantumAlgorithms
              onLoadCircuitIntoStudio={(c) => handleLoadCircuitAndNavigate(c, 'circuit')}
            />
          )}

          {activeSection === 'qml' && (
            <QuantumMachineLearning
              onLoadAnsatzIntoStudio={(c) => handleLoadCircuitAndNavigate(c, 'circuit')}
            />
          )}

          {activeSection === 'notebook' && (
            <LabNotebook
              onLoadCircuitToStudio={(c) => handleLoadCircuitAndNavigate(c, 'circuit')}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsAndAbout
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetApplicationData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
