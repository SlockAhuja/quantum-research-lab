import { VERIFIED_EXPERIMENTS } from './src/lib/quantum/experimentsData';
import { runQuantumSimulation } from './src/lib/quantum/engine';
import { exportToQasm, exportToQiskit, exportToPennyLane, validateCircuitJson } from './src/lib/quantum/qasm';

console.log('Testing all 23 experiments in QRL:');
let passed = 0;
let failed = 0;

for (const exp of VERIFIED_EXPERIMENTS) {
  try {
    const res = runQuantumSimulation(exp.circuit, 1024);
    const sumProbs = Object.values(res.theoreticalProbabilities).reduce((a, b) => a + b, 0);
    const validNorm = Math.abs(sumProbs - 1.0) < 1e-4;
    const shotSum = Object.values(res.sampledCounts).reduce((a, b) => a + b, 0);
    const validShots = shotSum === 1024;
    const qasm = exportToQasm(exp.circuit);
    const qiskit = exportToQiskit(exp.circuit);
    const pennylane = exportToPennyLane(exp.circuit);
    const jsonStr = JSON.stringify(exp.circuit);
    const validJson = validateCircuitJson(jsonStr);

    if (validNorm && validShots && qasm && qiskit && pennylane && validJson.valid) {
      passed++;
      const topStates = Object.entries(res.theoreticalProbabilities)
        .filter(([_, p]) => p > 0.01)
        .map(([k, p]) => `|${k}>: ${(p * 100).toFixed(1)}%`)
        .join(', ');
      console.log(`[PASS] ${exp.code} - ${exp.name} (${exp.numQubits}Q) -> ${topStates}`);
    } else {
      failed++;
      console.error(`[FAIL] ${exp.code} - ${exp.name}`, { validNorm, validShots, validJson });
    }
  } catch (err) {
    failed++;
    console.error(`[ERROR] ${exp.code} - ${exp.name}:`, err);
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${VERIFIED_EXPERIMENTS.length} experiments.`);
if (failed > 0) process.exit(1);
