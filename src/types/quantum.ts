/**
 * Quantum Research Lab (QRL) - Core Type Definitions
 * Strict types for quantum circuits, simulation requests/responses,
 * benchmark suites, and educational modules.
 */

export type GateType =
  | 'I'
  | 'X'
  | 'Y'
  | 'Z'
  | 'H'
  | 'S'
  | 'Sdg'
  | 'T'
  | 'Tdg'
  | 'RX'
  | 'RY'
  | 'RZ'
  | 'Phase'
  | 'CX'
  | 'CZ'
  | 'SWAP'
  | 'CSWAP'
  | 'CCX'
  | 'M';

export type GateCategory = 'single' | 'phase' | 'rotation' | 'controlled' | 'measurement';

export interface GateMetadata {
  type: GateType;
  name: string;
  symbol: string;
  category: GateCategory;
  qubitCount: number;
  hasParameter: boolean;
  parameterName?: string;
  defaultParameter?: number; // In radians
  description: string;
  matrixLatex?: string;
}

export interface PlacedGate {
  id: string;
  type: GateType;
  step: number; // Time step index (column 0, 1, 2...)
  targetQubit: number; // Primary wire index
  controlQubits?: number[]; // For CX, CZ, CCX, CSWAP
  secondTarget?: number; // For SWAP, CSWAP
  parameter?: number; // e.g. theta in radians for RX, RY, RZ, Phase
}

export interface QuantumCircuit {
  id: string;
  name: string;
  description: string;
  numQubits: number;
  timeSteps: number;
  gates: PlacedGate[];
  createdAt: string;
  updatedAt: string;
}

export interface StateVectorComponent {
  index: number;
  binaryLabel: string;
  real: number;
  imag: number;
  magnitude: number;
  probability: number;
  phaseRad: number;
  phaseDeg: number;
}

export interface BlochVector {
  qubitIndex: number;
  u: number; // <X>
  v: number; // <Y>
  w: number; // <Z>
  theta: number; // Polar angle in [0, pi]
  phi: number; // Azimuthal angle in [0, 2pi)
  purity: number; // 1.0 for pure state, < 1.0 for mixed state
}

export type SimulatorBackend = 'local_statevector' | 'antigravity_fastapi';

export interface SimulationRequest {
  circuit: QuantumCircuit;
  shots: number; // 0 for exact analytical, >0 for sampled shots
  backend: SimulatorBackend;
}

export interface SimulationResponse {
  id: string;
  circuitId: string;
  timestamp: string;
  executionTimeMs: number;
  backend: SimulatorBackend;
  provenanceLabel: string;
  shots: number;
  numQubits: number;
  stateVector: StateVectorComponent[];
  theoreticalProbabilities: Record<string, number>;
  sampledCounts: Record<string, number>;
  sampledProbabilities: Record<string, number>;
  metrics: {
    totalVariationDistance: number;
    hellingerDistance: number;
    fidelity: number;
    circuitDepth: number;
    totalGateCount: number;
    singleQubitGateCount: number;
    multiQubitGateCount: number;
  };
  blochVectors: Record<number, BlochVector>;
  stepByStepSnapshots: Array<{
    step: number;
    activeGateId?: string;
    stateVector: StateVectorComponent[];
  }>;
}

export interface BenchmarkExperiment {
  id: string;
  code: string; // e.g. QRL-001
  name: string;
  category: 'Single-Qubit' | 'Phase & Rotation' | 'Controlled & Entanglement' | 'Bell States' | 'GHZ States' | 'Quantum Algorithms' | 'Quantum Machine Learning';
  numQubits: number;
  circuitDepth: number;
  gateCount: number;
  cnotCount: number;
  description: string;
  learningObjectives: string[];
  theoreticalBehavior: string;
  matrixFormula?: string;
  circuit: QuantumCircuit;
  qiskitCode: string;
  pennylaneCode: string;
  referenceFidelity: number;
  verifiedBaseline: boolean;
  historicalMeasurement?: {
    shots: number;
    outcome0: number;
    outcome1: number;
    frequency0: number;
    frequency1: number;
    label: string;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

export interface PredictChallenge {
  id: string;
  title: string;
  prompt: string;
  circuit: QuantumCircuit;
  targetQubit: number;
  possibleOutcomes: {
    label: string;
    description: string;
  }[];
  correctLabel: string;
  explanation: string;
}

export interface VivaQuestion {
  id?: string;
  question: string;
  expectedKeywords: string[];
  modelAnswer: string;
  difficulty: 'Core' | 'Advanced' | 'Mastery';
}

export interface LearningLesson {
  id: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  summary: string;
  mathPrerequisites: string[];
  contentSections: {
    title: string;
    bodyMarkdown: string;
    keyTakeaway: string;
  }[];
  challenge?: PredictChallenge;
  quiz: QuizQuestion[];
  vivaQuestions: VivaQuestion[];
}

export interface NotebookEntry {
  id: string;
  title: string;
  timestamp: string;
  tags: string[];
  circuitId?: string;
  circuitSnapshot?: QuantumCircuit;
  notesMarkdown: string;
  author: string;
  status: 'Draft' | 'Verified' | 'Archived';
  metricsSummary?: {
    numQubits: number;
    shots: number;
    tvd: number;
    fidelity: number;
  };
}

export interface LaboratorySettings {
  floatPrecision: number; // 2, 3, 4, 6
  angleDisplayUnit: 'radians' | 'degrees';
  defaultShots: number;
  theme: 'dark' | 'light';
  highContrast: boolean;
  reducedMotion: boolean;
  showStepGridLines: boolean;
}
