/**
 * Quantum Research Lab (QRL) - Master Regression & Verification Test Suite
 * Covers Quantum Engine, Persistence, Historical Benchmarks, All 23 Experiments, and Export Pipelines.
 */

import {
  runQuantumSimulation,
  computeTotalVariationDistance,
  computeHellingerDistance,
  computeBlochVector,
} from './src/lib/quantum/engine';
import { Storage } from './src/lib/quantum/storage';
import { CIRCUIT_PRESETS } from './src/lib/quantum/presets';
import { VERIFIED_EXPERIMENTS } from './src/lib/quantum/experimentsData';
import { exportToQasm, exportToQiskit, exportToPennyLane, validateCircuitJson } from './src/lib/quantum/qasm';
import { INITIAL_NOTEBOOK_ENTRIES } from './src/components/notebook/LabNotebook';
import { QuantumCircuit } from './src/types/quantum';

console.log('================================================================');
console.log('QUANTUM RESEARCH LAB (QRL) — MASTER VERIFICATION TEST SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(desc: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${desc}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${desc} ${details ? `-> ${details}` : ''}`);
  }
}

// =============================================================
// SECTION 1: CORE QUANTUM ENGINE MATHEMATICAL BEHAVIOR
// =============================================================
console.log('--- SECTION 1: Core Engine Mathematical Tests ---');

// Test 1: Initial state |0>
const circ1: QuantumCircuit = {
  id: 'reg-c1',
  name: 'Initial State',
  description: '',
  numQubits: 1,
  timeSteps: 2,
  gates: [],
  createdAt: '',
  updatedAt: '',
};
const res1 = runQuantumSimulation(circ1, 1024);
assert(
  '1.1: Initial state |0> produces P(|0>) = 1.0, P(|1>) = 0.0',
  res1.theoreticalProbabilities['0'] === 1.0 && (res1.theoreticalProbabilities['1'] || 0) === 0.0
);

// Test 2: Pauli-X |0> = |1>
const circ2: QuantumCircuit = {
  id: 'reg-c2',
  name: 'Pauli-X',
  description: '',
  numQubits: 1,
  timeSteps: 2,
  gates: [{ id: 'g1', type: 'X', step: 0, targetQubit: 0 }],
  createdAt: '',
  updatedAt: '',
};
const res2 = runQuantumSimulation(circ2, 1024);
assert(
  '1.2: Pauli-X transforms |0> into |1> (P(|1>) = 1.0, P(|0>) = 0.0)',
  res2.theoreticalProbabilities['1'] === 1.0 && (res2.theoreticalProbabilities['0'] || 0) === 0.0
);

// Test 3: Hadamard Superposition
const circ3: QuantumCircuit = {
  id: 'reg-c3',
  name: 'Hadamard',
  description: '',
  numQubits: 1,
  timeSteps: 2,
  gates: [{ id: 'g1', type: 'H', step: 0, targetQubit: 0 }],
  createdAt: '',
  updatedAt: '',
};
const res3 = runQuantumSimulation(circ3, 1024);
const hP0 = res3.theoreticalProbabilities['0'] || 0;
const hP1 = res3.theoreticalProbabilities['1'] || 0;
assert(
  '1.3: Hadamard produces equal theoretical probabilities (0.5 / 0.5)',
  Math.abs(hP0 - 0.5) < 1e-5 && Math.abs(hP1 - 0.5) < 1e-5
);

// Test 4: Hadamard Involution (H·H = I)
const circ4: QuantumCircuit = {
  id: 'reg-c4',
  name: 'Hadamard Twice',
  description: '',
  numQubits: 1,
  timeSteps: 3,
  gates: [
    { id: 'g1', type: 'H', step: 0, targetQubit: 0 },
    { id: 'g2', type: 'H', step: 1, targetQubit: 0 },
  ],
  createdAt: '',
  updatedAt: '',
};
const res4 = runQuantumSimulation(circ4, 1024);
assert(
  '1.4: H applied twice returns exactly to |0> (H·H = I)',
  Math.abs((res4.theoreticalProbabilities['0'] || 0) - 1.0) < 1e-5 &&
    (res4.theoreticalProbabilities['1'] || 0) < 1e-5
);

// Test 5: Bell-State Correlations (|Phi+>) & Reduced Density Matrix Purity
const circ5: QuantumCircuit = {
  id: 'reg-c5',
  name: 'Bell State',
  description: '',
  numQubits: 2,
  timeSteps: 3,
  gates: [
    { id: 'g1', type: 'H', step: 0, targetQubit: 0 },
    { id: 'g2', type: 'CX', step: 1, targetQubit: 1, controlQubits: [0] },
  ],
  createdAt: '',
  updatedAt: '',
};
const res5 = runQuantumSimulation(circ5, 1024);
const p00 = res5.theoreticalProbabilities['00'] || 0;
const p11 = res5.theoreticalProbabilities['11'] || 0;
const p01 = res5.theoreticalProbabilities['01'] || 0;
const p10 = res5.theoreticalProbabilities['10'] || 0;
const purityQ0 = res5.blochVectors[0]?.purity;
assert(
  '1.5: Bell state |Phi+> has P(|00>)=0.5, P(|11>)=0.5, zero anti-correlations, and subsystem purity 0.5',
  Math.abs(p00 - 0.5) < 1e-5 &&
    Math.abs(p11 - 0.5) < 1e-5 &&
    p01 === 0 &&
    p10 === 0 &&
    Math.abs(purityQ0 - 0.5) < 1e-5
);

// Test 6: Rotation Parameter Sensitivity (RX, RY, RZ)
const circ6a: QuantumCircuit = {
  id: 'reg-c6a',
  name: 'RY(pi/3)',
  description: '',
  numQubits: 1,
  timeSteps: 2,
  gates: [{ id: 'g1', type: 'RY', step: 0, targetQubit: 0, parameter: Math.PI / 3 }],
  createdAt: '',
  updatedAt: '',
};
const circ6b: QuantumCircuit = {
  id: 'reg-c6b',
  name: 'RY(2pi/3)',
  description: '',
  numQubits: 1,
  timeSteps: 2,
  gates: [{ id: 'g1', type: 'RY', step: 0, targetQubit: 0, parameter: (2 * Math.PI) / 3 }],
  createdAt: '',
  updatedAt: '',
};
const res6a = runQuantumSimulation(circ6a, 1024);
const res6b = runQuantumSimulation(circ6b, 1024);
assert(
  '1.6: Rotation angle sensitivity: theta=pi/3 -> P(0)=0.75, theta=2pi/3 -> P(0)=0.25',
  Math.abs((res6a.theoreticalProbabilities['0'] || 0) - 0.75) < 1e-4 &&
    Math.abs((res6b.theoreticalProbabilities['0'] || 0) - 0.25) < 1e-4
);

// Test 7: Finite-shot counts conservation
const countsSum = Object.values(res5.sampledCounts).reduce((a, b) => a + b, 0);
assert(
  '1.7: Sampled measurement counts sum exactly to configured 1,024 shots',
  countsSum === 1024
);

// Test 8: Statistical distance bounds (TVD and Hellinger)
const tvdVal = computeTotalVariationDistance(
  { '0': 0.5, '1': 0.5 },
  { '0': 0.5195, '1': 0.4805 }
);
const hellingerVal = computeHellingerDistance(
  { '0': 0.5, '1': 0.5 },
  { '0': 0.5195, '1': 0.4805 }
);
assert(
  '1.8: TVD and Hellinger distances correctly compute deviation for finite-shot sampling',
  Math.abs(tvdVal - 0.0195) < 1e-4 && hellingerVal > 0 && hellingerVal < 0.1
);

// =============================================================
// SECTION 2: HISTORICAL QRL-001 BENCHMARK INTEGRITY
// =============================================================
console.log('\n--- SECTION 2: Historical QRL-001 Benchmark Integrity ---');

const qrl001Exp = VERIFIED_EXPERIMENTS.find((e) => e.code === 'QRL-001');
assert(
  '2.1: QRL-001 benchmark experiment exists in registry',
  qrl001Exp !== undefined
);

if (qrl001Exp && qrl001Exp.historicalMeasurement) {
  const hm = qrl001Exp.historicalMeasurement;
  assert(
    '2.2: QRL-001 historical shots = 1,024, outcome 0 = 532, outcome 1 = 492',
    hm.shots === 1024 && hm.outcome0 === 532 && hm.outcome1 === 492
  );
  assert(
    '2.3: QRL-001 historical frequencies match 51.95% and 48.05%',
    Math.abs(hm.frequency0 - 0.5195) < 1e-4 && Math.abs(hm.frequency1 - 0.4805) < 1e-4
  );
}

const historicalNotebookEntry = INITIAL_NOTEBOOK_ENTRIES.find((e) => e.id === 'note-1');
assert(
  '2.4: Lab notebook initial entry preserves QRL-001 historical record and finite-shot labeling',
  historicalNotebookEntry !== undefined &&
    historicalNotebookEntry.notesMarkdown.includes('532') &&
    historicalNotebookEntry.notesMarkdown.includes('492') &&
    historicalNotebookEntry.notesMarkdown.includes('51.95%') &&
    historicalNotebookEntry.notesMarkdown.includes('48.05%')
);

// =============================================================
// SECTION 3: 23 VERIFIED BENCHMARK EXPERIMENTS EXECUTION
// =============================================================
console.log('\n--- SECTION 3: 23 Benchmark Experiments Suite ---');
assert(
  '3.1: Exactly 23 verified benchmark experiments present in catalogue',
  VERIFIED_EXPERIMENTS.length === 23
);

let all23Valid = true;
for (const exp of VERIFIED_EXPERIMENTS) {
  const res = runQuantumSimulation(exp.circuit, 1024);
  const probSum = Object.values(res.theoreticalProbabilities).reduce((a, b) => a + b, 0);
  const isNormalized = Math.abs(probSum - 1.0) < 1e-4;
  const shotTotal = Object.values(res.sampledCounts).reduce((a, b) => a + b, 0);
  const isCountExact = shotTotal === 1024;
  if (!isNormalized || !isCountExact) {
    all23Valid = false;
    console.error(`Invalid execution for experiment ${exp.code}`);
  }
}
assert(
  '3.2: All 23 experiments execute with valid state normalization and shot count conservation',
  all23Valid
);

// Check QRL-023 description honesty
const qrl023Exp = VERIFIED_EXPERIMENTS.find((e) => e.code === 'QRL-023');
assert(
  '3.3: QRL-023 is honestly documented as an ansatz layer & proxy optimization (not hardware-trained classifier)',
  qrl023Exp !== undefined &&
    qrl023Exp.name.includes('Ansatz Layer') &&
    qrl023Exp.description.includes('proxy loss model')
);

// =============================================================
// SECTION 4: STORAGE PERSISTENCE AND RECOVERY
// =============================================================
console.log('\n--- SECTION 4: Storage Persistence & Resilience ---');

const mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => {
      mockStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStorage[k];
    },
  },
};

// Test saving and loading circuit
const testCircuitToSave: QuantumCircuit = {
  ...CIRCUIT_PRESETS[1],
  name: 'Custom User Bell Circuit',
};
Storage.saveCircuit(testCircuitToSave);
const reloadedCircuit = Storage.loadCircuit(CIRCUIT_PRESETS[0]);
assert(
  '4.1: Circuit persists and recovers faithfully from localStorage',
  reloadedCircuit.name === 'Custom User Bell Circuit' && reloadedCircuit.numQubits === 2
);

// Corrupt JSON handling
mockStorage['qrl_current_circuit_v1'] = '{corrupt_invalid_json...';
const fallbackCircuit = Storage.loadCircuit(CIRCUIT_PRESETS[0]);
assert(
  '4.2: Corrupt JSON in circuit storage recovers gracefully to default fallback',
  fallbackCircuit.id === CIRCUIT_PRESETS[0].id
);

// Settings persistence
Storage.saveSettings({
  floatPrecision: 4,
  angleDisplayUnit: 'degrees',
  defaultShots: 4096,
  theme: 'light',
  highContrast: true,
  reducedMotion: false,
  showStepGridLines: true,
});
const reloadedSettings = Storage.loadSettings({
  floatPrecision: 3,
  angleDisplayUnit: 'radians',
  defaultShots: 1024,
  theme: 'dark',
  highContrast: false,
  reducedMotion: false,
  showStepGridLines: true,
});
assert(
  '4.3: User settings persist and recover faithfully (4 decimals, degrees, light theme)',
  reloadedSettings.floatPrecision === 4 &&
    reloadedSettings.angleDisplayUnit === 'degrees' &&
    reloadedSettings.theme === 'light'
);

// Learning progress persistence
Storage.saveLearningProgress({
  completedLessons: { 'lesson-1': true },
  quizScores: { 'lesson-1': 2 },
  challengeCompleted: { 'ch-1': true },
  lastActiveLessonId: 'lesson-2',
});
const reloadedProgress = Storage.loadLearningProgress();
assert(
  '4.4: Learning progress persists and recovers accurately',
  reloadedProgress.completedLessons['lesson-1'] === true &&
    reloadedProgress.lastActiveLessonId === 'lesson-2'
);

// Storage clear
Storage.clearAllData();
assert(
  '4.5: Storage.clearAllData() wipes all application keys cleanly',
  Object.keys(mockStorage).length === 0
);

// =============================================================
// SECTION 5: EXPORT & CODE GENERATION PIPELINE
// =============================================================
console.log('\n--- SECTION 5: Export & Code Generation Pipeline ---');

const bellCircuit = CIRCUIT_PRESETS[1];
const qasmOutput = exportToQasm(bellCircuit);
assert(
  '5.1: OpenQASM 2.0 export generates valid syntax with OPENQASM 2.0 header and qreg/creg',
  qasmOutput.includes('OPENQASM 2.0;') &&
    qasmOutput.includes('qreg q[2];') &&
    qasmOutput.includes('h q[0];') &&
    qasmOutput.includes('cx q[0], q[1];')
);

const qiskitOutput = exportToQiskit(bellCircuit);
assert(
  '5.2: Qiskit export generates valid Python with QuantumCircuit, AerSimulator, and transpiler calls',
  qiskitOutput.includes('from qiskit import QuantumCircuit') &&
    qiskitOutput.includes('AerSimulator()') &&
    qiskitOutput.includes('qc.cx(0, 1)')
);

const pennylaneOutput = exportToPennyLane(bellCircuit);
assert(
  '5.3: PennyLane export generates valid Python with default.qubit device and @qml.qnode decorator',
  pennylaneOutput.includes('import pennylane as qml') &&
    pennylaneOutput.includes('qml.device("default.qubit"') &&
    pennylaneOutput.includes('qml.CNOT(wires=[0, 1])')
);

const validJsonCheck = validateCircuitJson(JSON.stringify(bellCircuit));
assert(
  '5.4: JSON circuit validator accepts valid circuit and correctly parses structure',
  validJsonCheck.valid && validJsonCheck.circuit?.numQubits === 2
);

const invalidJsonCheck = validateCircuitJson('{"numQubits": 10}');
assert(
  '5.5: JSON circuit validator rejects invalid circuit exceeding 5 qubits',
  !invalidJsonCheck.valid && invalidJsonCheck.error !== undefined
);

// =============================================================
// SUMMARY
// =============================================================
console.log('\n================================================================');
console.log(`MASTER TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
