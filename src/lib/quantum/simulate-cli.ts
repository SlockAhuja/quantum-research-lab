/**
 * QRL TypeScript Simulation CLI Bridge
 * Accepts circuit JSON via stdin or file argument and outputs SimulationResponse JSON.
 */

import { runQuantumSimulation } from './engine';
import { VERIFIED_EXPERIMENTS } from './experimentsData';
import { QuantumCircuit } from '../../types/quantum';
import * as fs from 'fs';

function main() {
  if (process.argv.includes('--experiments')) {
    console.log(JSON.stringify(VERIFIED_EXPERIMENTS));
    return;
  }

  let inputJson = '';
  if (process.argv.length > 2 && !process.argv[2].startsWith('--')) {
    const filePath = process.argv[2];
    inputJson = fs.readFileSync(filePath, 'utf-8');
  } else {
    inputJson = fs.readFileSync(0, 'utf-8');
  }

  const payload = JSON.parse(inputJson);
  const circuit: QuantumCircuit = payload.circuit || payload;
  const shots: number = payload.shots !== undefined ? payload.shots : 1024;

  const result = runQuantumSimulation(circuit, shots);
  console.log(JSON.stringify(result));
}

main();
