/**
 * Quantum Research Lab (QRL) - Safe Local Storage Persistence Layer
 * Handles serialization, schema validation, quota management, and graceful recovery.
 */

import { QuantumCircuit, LaboratorySettings, NotebookEntry } from '../../types/quantum';
import { CIRCUIT_PRESETS } from './presets';

const STORAGE_KEYS = {
  CIRCUIT: 'qrl_current_circuit_v1',
  SETTINGS: 'qrl_settings_v1',
  NOTEBOOK: 'qrl_notebook_entries_v1',
  LEARNING: 'qrl_learning_progress_v1',
} as const;

export interface LearningProgress {
  completedLessons: Record<string, boolean>;
  quizScores: Record<string, number>;
  challengeCompleted: Record<string, boolean>;
  lastActiveLessonId?: string;
}

export const Storage = {
  /**
   * Check if localStorage is available and functional
   */
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__qrl_test_storage__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Load current circuit with validation and fallback to default preset
   */
  loadCircuit(fallback: QuantumCircuit = CIRCUIT_PRESETS[0]): QuantumCircuit {
    if (!this.isAvailable()) return fallback;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.CIRCUIT);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);

      // Validate circuit structure
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.id === 'string' &&
        typeof parsed.name === 'string' &&
        typeof parsed.numQubits === 'number' &&
        parsed.numQubits >= 1 &&
        parsed.numQubits <= 5 &&
        typeof parsed.timeSteps === 'number' &&
        Array.isArray(parsed.gates)
      ) {
        return parsed as QuantumCircuit;
      }
      return fallback;
    } catch (e) {
      console.warn('[QRL Storage] Failed to load circuit from localStorage, using fallback.', e);
      return fallback;
    }
  },

  /**
   * Save circuit with quota protection
   */
  saveCircuit(circuit: QuantumCircuit): boolean {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEYS.CIRCUIT, JSON.stringify(circuit));
      return true;
    } catch (e) {
      console.warn('[QRL Storage] Quota exceeded or error saving circuit:', e);
      return false;
    }
  },

  /**
   * Load user settings with fallback
   */
  loadSettings(fallback: LaboratorySettings): LaboratorySettings {
    if (!this.isAvailable()) return fallback;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === 'object') {
        return {
          floatPrecision: typeof parsed.floatPrecision === 'number' ? parsed.floatPrecision : fallback.floatPrecision,
          angleDisplayUnit: parsed.angleDisplayUnit === 'degrees' ? 'degrees' : 'radians',
          defaultShots: typeof parsed.defaultShots === 'number' ? parsed.defaultShots : fallback.defaultShots,
          theme: parsed.theme === 'light' ? 'light' : 'dark',
          highContrast: Boolean(parsed.highContrast),
          reducedMotion: Boolean(parsed.reducedMotion),
          showStepGridLines: parsed.showStepGridLines !== undefined ? Boolean(parsed.showStepGridLines) : fallback.showStepGridLines,
        };
      }
      return fallback;
    } catch (e) {
      console.warn('[QRL Storage] Failed to load settings from localStorage, using fallback.', e);
      return fallback;
    }
  },

  /**
   * Save user settings
   */
  saveSettings(settings: LaboratorySettings): boolean {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.warn('[QRL Storage] Error saving settings:', e);
      return false;
    }
  },

  /**
   * Load notebook entries with fallback
   */
  loadNotebookEntries(fallback: NotebookEntry[]): NotebookEntry[] {
    if (!this.isAvailable()) return fallback;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.NOTEBOOK);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed) && parsed.length > 0) {
        // Validate each entry has required fields
        const valid = parsed.filter(
          (item) => item && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.notesMarkdown === 'string'
        );
        return valid.length > 0 ? (valid as NotebookEntry[]) : fallback;
      }
      return fallback;
    } catch (e) {
      console.warn('[QRL Storage] Failed to load notebook from localStorage, using fallback.', e);
      return fallback;
    }
  },

  /**
   * Save notebook entries
   */
  saveNotebookEntries(entries: NotebookEntry[]): boolean {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEYS.NOTEBOOK, JSON.stringify(entries));
      return true;
    } catch (e) {
      console.warn('[QRL Storage] Error saving notebook entries:', e);
      return false;
    }
  },

  /**
   * Load learning progress
   */
  loadLearningProgress(): LearningProgress {
    const defaultProgress: LearningProgress = {
      completedLessons: {},
      quizScores: {},
      challengeCompleted: {},
    };
    if (!this.isAvailable()) return defaultProgress;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.LEARNING);
      if (!raw) return defaultProgress;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          completedLessons: parsed.completedLessons || {},
          quizScores: parsed.quizScores || {},
          challengeCompleted: parsed.challengeCompleted || {},
          lastActiveLessonId: parsed.lastActiveLessonId,
        };
      }
      return defaultProgress;
    } catch (e) {
      console.warn('[QRL Storage] Failed to load learning progress, using default.', e);
      return defaultProgress;
    }
  },

  /**
   * Save learning progress
   */
  saveLearningProgress(progress: LearningProgress): boolean {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(progress));
      return true;
    } catch (e) {
      console.warn('[QRL Storage] Error saving learning progress:', e);
      return false;
    }
  },

  /**
   * Clear all QRL saved application data and restore defaults
   */
  clearAllData(): void {
    if (!this.isAvailable()) return;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        window.localStorage.removeItem(key);
      });
    } catch (e) {
      console.warn('[QRL Storage] Error resetting data:', e);
    }
  },
};
