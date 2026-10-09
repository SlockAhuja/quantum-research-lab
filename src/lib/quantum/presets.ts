/**
 * Quantum Research Lab (QRL) - Circuit Presets and Templates
 * Instant loadable circuits for Circuit Studio and research experiments.
 */

import { QuantumCircuit } from '../../types/quantum';

export const CIRCUIT_PRESETS: QuantumCircuit[] = [
  {
    id: 'preset-superposition',
    name: 'Single-Qubit Superposition (QRL-001)',
    description: 'Generates balanced state (|0⟩ + |1⟩)/√2 using Hadamard gate',
    numQubits: 1,
    timeSteps: 4,
    gates: [
      { id: 'p-g1', type: 'H', step: 0, targetQubit: 0 },
      { id: 'p-g2', type: 'M', step: 1, targetQubit: 0 },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'preset-bell-phi-plus',
    name: 'Bell State |Φ+⟩ (EPR Pair)',
    description: 'Maximally entangled state (|00⟩ + |11⟩)/√2 via H and CNOT',
    numQubits: 2,
    timeSteps: 5,
    gates: [
      { id: 'p-b1', type: 'H', step: 0, targetQubit: 0 },
      { id: 'p-b2', type: 'CX', step: 1, targetQubit: 1, controlQubits: [0] },
      { id: 'p-b3', type: 'M', step: 2, targetQubit: 0 },
      { id: 'p-b4', type: 'M', step: 2, targetQubit: 1 },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'preset-ghz-3',
    name: '3-Qubit GHZ Entanglement',
    description: 'Greenberger-Horne-Zeilinger tripartite cat state (|000⟩ + |111⟩)/√2',
    numQubits: 3,
    timeSteps: 6,
    gates: [
      { id: 'p-g1', type: 'H', step: 0, targetQubit: 0 },
      { id: 'p-g2', type: 'CX', step: 1, targetQubit: 1, controlQubits: [0] },
      { id: 'p-g3', type: 'CX', step: 2, targetQubit: 2, controlQubits: [1] },
      { id: 'p-g4', type: 'M', step: 3, targetQubit: 0 },
      { id: 'p-g5', type: 'M', step: 3, targetQubit: 1 },
      { id: 'p-g6', type: 'M', step: 3, targetQubit: 2 },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'preset-grover-2q',
    name: "Grover's 2-Qubit Search",
    description: 'Oracle and diffusion operator concentrating 100% probability on target |11⟩',
    numQubits: 2,
    timeSteps: 8,
    gates: [
      { id: 'gv-1', type: 'H', step: 0, targetQubit: 0 },
      { id: 'gv-2', type: 'H', step: 0, targetQubit: 1 },
      { id: 'gv-3', type: 'CZ', step: 1, targetQubit: 1, controlQubits: [0] },
      { id: 'gv-4', type: 'H', step: 2, targetQubit: 0 },
      { id: 'gv-5', type: 'H', step: 2, targetQubit: 1 },
      { id: 'gv-6', type: 'Z', step: 3, targetQubit: 0 },
      { id: 'gv-7', type: 'Z', step: 3, targetQubit: 1 },
      { id: 'gv-8', type: 'CZ', step: 4, targetQubit: 1, controlQubits: [0] },
      { id: 'gv-9', type: 'H', step: 5, targetQubit: 0 },
      { id: 'gv-10', type: 'H', step: 5, targetQubit: 1 },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'preset-teleportation',
    name: 'Quantum Teleportation Protocol',
    description: 'Transfers unknown state |ψ⟩ from Alice to Bob using an EPR pair and classical feedforward',
    numQubits: 3,
    timeSteps: 8,
    gates: [
      // Step 0: Prepare arbitrary state on q0 (e.g. RY)
      { id: 'tp-1', type: 'RY', step: 0, targetQubit: 0, parameter: 1.0472 }, // pi/3
      // Create EPR pair between q1 (Alice) and q2 (Bob)
      { id: 'tp-2', type: 'H', step: 0, targetQubit: 1 },
      { id: 'tp-3', type: 'CX', step: 1, targetQubit: 2, controlQubits: [1] },
      // Alice Bell measurement on q0 and q1
      { id: 'tp-4', type: 'CX', step: 2, targetQubit: 1, controlQubits: [0] },
      { id: 'tp-5', type: 'H', step: 3, targetQubit: 0 },
      // Correction operations
      { id: 'tp-6', type: 'CX', step: 4, targetQubit: 2, controlQubits: [1] },
      { id: 'tp-7', type: 'CZ', step: 5, targetQubit: 2, controlQubits: [0] },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'preset-ramsey',
    name: 'Ramsey Interferometer RZ(θ)',
    description: 'H - RZ(θ) - H sequence for sensing and phase measurement',
    numQubits: 1,
    timeSteps: 5,
    gates: [
      { id: 'rm-1', type: 'H', step: 0, targetQubit: 0 },
      { id: 'rm-2', type: 'RZ', step: 1, targetQubit: 0, parameter: Math.PI / 3 },
      { id: 'rm-3', type: 'H', step: 2, targetQubit: 0 },
      { id: 'rm-4', type: 'M', step: 3, targetQubit: 0 },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'preset-qft-3',
    name: 'Quantum Fourier Transform (3-Qubit)',
    description: 'Transforms computational basis into frequency basis with continuous phase shifts',
    numQubits: 3,
    timeSteps: 8,
    gates: [
      { id: 'qft-0', type: 'H', step: 0, targetQubit: 0 },
      { id: 'qft-1', type: 'Phase', step: 1, targetQubit: 0, parameter: Math.PI / 2 },
      { id: 'qft-2', type: 'H', step: 2, targetQubit: 1 },
      { id: 'qft-3', type: 'Phase', step: 3, targetQubit: 1, parameter: Math.PI / 2 },
      { id: 'qft-4', type: 'H', step: 4, targetQubit: 2 },
      { id: 'qft-5', type: 'SWAP', step: 5, targetQubit: 0, secondTarget: 2 },
    ],
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
];
