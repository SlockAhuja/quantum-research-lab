/**
 * Quantum Research Lab (QRL) - Scientific Quantum Statevector Simulator
 * Real, exact matrix evolution for up to 5 qubits.
 * Includes partial trace for Bloch sphere extraction, TVD, and Hellinger distances.
 */

import { Complex } from './complex';
import {
  GateMetadata,
  GateType,
  PlacedGate,
  QuantumCircuit,
  SimulationResponse,
  StateVectorComponent,
  BlochVector,
} from '../../types/quantum';

// Gate metadata dictionary
export const GATE_REGISTRY: Record<GateType, GateMetadata> = {
  I: {
    type: 'I',
    name: 'Identity',
    symbol: 'I',
    category: 'single',
    qubitCount: 1,
    hasParameter: false,
    description: 'Leaves the qubit state unchanged.',
  },
  H: {
    type: 'H',
    name: 'Hadamard',
    symbol: 'H',
    category: 'single',
    qubitCount: 1,
    hasParameter: false,
    description: 'Creates an equal superposition state: |0⟩ → (|0⟩+|1⟩)/√2 and |1⟩ → (|0⟩-|1⟩)/√2.',
  },
  X: {
    type: 'X',
    name: 'Pauli-X (NOT)',
    symbol: 'X',
    category: 'single',
    qubitCount: 1,
    hasParameter: false,
    description: 'Bit-flip operator: |0⟩ → |1⟩ and |1⟩ → |0⟩ (π rotation around X axis).',
  },
  Y: {
    type: 'Y',
    name: 'Pauli-Y',
    symbol: 'Y',
    category: 'single',
    qubitCount: 1,
    hasParameter: false,
    description: 'Bit-and-phase flip: |0⟩ → i|1⟩ and |1⟩ → -i|0⟩ (π rotation around Y axis).',
  },
  Z: {
    type: 'Z',
    name: 'Pauli-Z',
    symbol: 'Z',
    category: 'single',
    qubitCount: 1,
    hasParameter: false,
    description: 'Phase-flip operator: |0⟩ → |0⟩ and |1⟩ → -|1⟩ (π rotation around Z axis).',
  },
  S: {
    type: 'S',
    name: 'Phase (S / √Z)',
    symbol: 'S',
    category: 'phase',
    qubitCount: 1,
    hasParameter: false,
    description: 'Applies a π/2 phase shift to |1⟩: diag(1, i).',
  },
  Sdg: {
    type: 'Sdg',
    name: 'S† (S-Dagger)',
    symbol: 'S†',
    category: 'phase',
    qubitCount: 1,
    hasParameter: false,
    description: 'Applies a -π/2 phase shift to |1⟩: diag(1, -i).',
  },
  T: {
    type: 'T',
    name: 'π/8 (T / ∜Z)',
    symbol: 'T',
    category: 'phase',
    qubitCount: 1,
    hasParameter: false,
    description: 'Applies a π/4 phase shift to |1⟩: diag(1, e^(iπ/4)).',
  },
  Tdg: {
    type: 'Tdg',
    name: 'T† (T-Dagger)',
    symbol: 'T†',
    category: 'phase',
    qubitCount: 1,
    hasParameter: false,
    description: 'Applies a -π/4 phase shift to |1⟩: diag(1, e^(-iπ/4)).',
  },
  RX: {
    type: 'RX',
    name: 'X-Rotation (RX)',
    symbol: 'RX',
    category: 'rotation',
    qubitCount: 1,
    hasParameter: true,
    parameterName: 'θ',
    defaultParameter: Math.PI / 2,
    description: 'Arbitrary angle rotation around the Bloch X-axis: exp(-i θ X / 2).',
  },
  RY: {
    type: 'RY',
    name: 'Y-Rotation (RY)',
    symbol: 'RY',
    category: 'rotation',
    qubitCount: 1,
    hasParameter: true,
    parameterName: 'θ',
    defaultParameter: Math.PI / 2,
    description: 'Arbitrary angle rotation around the Bloch Y-axis: exp(-i θ Y / 2).',
  },
  RZ: {
    type: 'RZ',
    name: 'Z-Rotation (RZ)',
    symbol: 'RZ',
    category: 'rotation',
    qubitCount: 1,
    hasParameter: true,
    parameterName: 'θ',
    defaultParameter: Math.PI / 2,
    description: 'Arbitrary angle rotation around the Bloch Z-axis: exp(-i θ Z / 2).',
  },
  Phase: {
    type: 'Phase',
    name: 'Arbitrary Phase (P)',
    symbol: 'P',
    category: 'rotation',
    qubitCount: 1,
    hasParameter: true,
    parameterName: 'λ',
    defaultParameter: Math.PI / 2,
    description: 'General phase shift: diag(1, e^(iλ)).',
  },
  CX: {
    type: 'CX',
    name: 'Controlled-NOT (CNOT)',
    symbol: 'CX',
    category: 'controlled',
    qubitCount: 2,
    hasParameter: false,
    description: 'Flips the target qubit if the control qubit is |1⟩. Generates entanglement.',
  },
  CZ: {
    type: 'CZ',
    name: 'Controlled-Z',
    symbol: 'CZ',
    category: 'controlled',
    qubitCount: 2,
    hasParameter: false,
    description: 'Applies Z gate to the target qubit if the control qubit is |1⟩.',
  },
  SWAP: {
    type: 'SWAP',
    name: 'SWAP',
    symbol: 'SW',
    category: 'controlled',
    qubitCount: 2,
    hasParameter: false,
    description: 'Exchanges the states of two qubits.',
  },
  CSWAP: {
    type: 'CSWAP',
    name: 'Controlled-SWAP (Fredkin)',
    symbol: 'CSW',
    category: 'controlled',
    qubitCount: 3,
    hasParameter: false,
    description: 'Swaps two target qubits conditionally on control qubit being |1⟩.',
  },
  CCX: {
    type: 'CCX',
    name: 'Toffoli (CCNOT)',
    symbol: 'CCX',
    category: 'controlled',
    qubitCount: 3,
    hasParameter: false,
    description: 'Applies NOT to target if both control qubits are |1⟩ (universal classical gate).',
  },
  M: {
    type: 'M',
    name: 'Measurement',
    symbol: 'M',
    category: 'measurement',
    qubitCount: 1,
    hasParameter: false,
    description: 'Measures qubit in the standard computational basis {|0⟩, |1⟩}.',
  },
};

// 2x2 Matrix type: 2 rows of 2 Complex numbers
export type Matrix2x2 = [[Complex, Complex], [Complex, Complex]];

export function getSingleQubitMatrix(type: GateType, param: number = 0): Matrix2x2 {
  const INV_SQRT2 = 1 / Math.SQRT2;
  switch (type) {
    case 'I':
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), Complex.one()],
      ];
    case 'H':
      return [
        [Complex.create(INV_SQRT2, 0), Complex.create(INV_SQRT2, 0)],
        [Complex.create(INV_SQRT2, 0), Complex.create(-INV_SQRT2, 0)],
      ];
    case 'X':
      return [
        [Complex.zero(), Complex.one()],
        [Complex.one(), Complex.zero()],
      ];
    case 'Y':
      return [
        [Complex.zero(), Complex.create(0, -1)],
        [Complex.create(0, 1), Complex.zero()],
      ];
    case 'Z':
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), Complex.create(-1, 0)],
      ];
    case 'S':
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), Complex.create(0, 1)],
      ];
    case 'Sdg':
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), Complex.create(0, -1)],
      ];
    case 'T': {
      const e_it = Complex.fromPolar(1, Math.PI / 4);
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), e_it],
      ];
    }
    case 'Tdg': {
      const e_mit = Complex.fromPolar(1, -Math.PI / 4);
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), e_mit],
      ];
    }
    case 'RX': {
      const half = param / 2;
      return [
        [Complex.create(Math.cos(half), 0), Complex.create(0, -Math.sin(half))],
        [Complex.create(0, -Math.sin(half)), Complex.create(Math.cos(half), 0)],
      ];
    }
    case 'RY': {
      const half = param / 2;
      return [
        [Complex.create(Math.cos(half), 0), Complex.create(-Math.sin(half), 0)],
        [Complex.create(Math.sin(half), 0), Complex.create(Math.cos(half), 0)],
      ];
    }
    case 'RZ': {
      const half = param / 2;
      return [
        [Complex.fromPolar(1, -half), Complex.zero()],
        [Complex.zero(), Complex.fromPolar(1, half)],
      ];
    }
    case 'Phase': {
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), Complex.fromPolar(1, param)],
      ];
    }
    default:
      return [
        [Complex.one(), Complex.zero()],
        [Complex.zero(), Complex.one()],
      ];
  }
}

/**
 * Apply 1-qubit matrix U to target qubit in an N-qubit statevector.
 * State indices correspond to |q0 q1 ... q(N-1)> where q0 is MSB or LSB.
 * By convention: q0 is top wire (index 0).
 */
export function applySingleQubitGate(
  state: Complex[],
  numQubits: number,
  targetQubit: number,
  matrix: Matrix2x2
): Complex[] {
  const dim = 1 << numQubits;
  const nextState: Complex[] = new Array(dim);
  // Bit shift for target qubit (with wire 0 as MSB): shift = numQubits - 1 - targetQubit
  const shift = numQubits - 1 - targetQubit;
  const bitMask = 1 << shift;

  for (let i = 0; i < dim; i++) {
    if ((i & bitMask) === 0) {
      const i0 = i;
      const i1 = i | bitMask;
      const v0 = state[i0];
      const v1 = state[i1];

      // [u00 u01] [v0]
      // [u10 u11] [v1]
      const u00_v0 = Complex.mul(matrix[0][0], v0);
      const u01_v1 = Complex.mul(matrix[0][1], v1);
      const u10_v0 = Complex.mul(matrix[1][0], v0);
      const u11_v1 = Complex.mul(matrix[1][1], v1);

      nextState[i0] = Complex.add(u00_v0, u01_v1);
      nextState[i1] = Complex.add(u10_v0, u11_v1);
    }
  }

  return nextState;
}

/**
 * Apply 2-qubit CNOT gate
 */
export function applyCXGate(
  state: Complex[],
  numQubits: number,
  controlQubit: number,
  targetQubit: number
): Complex[] {
  const dim = 1 << numQubits;
  const nextState: Complex[] = [...state];
  const ctrlShift = numQubits - 1 - controlQubit;
  const tgtShift = numQubits - 1 - targetQubit;
  const ctrlMask = 1 << ctrlShift;
  const tgtMask = 1 << tgtShift;

  for (let i = 0; i < dim; i++) {
    // If control bit is 1 and target bit is 0, swap amplitude with target bit = 1
    if ((i & ctrlMask) !== 0 && (i & tgtMask) === 0) {
      const iPair = i | tgtMask;
      const temp = nextState[i];
      nextState[i] = nextState[iPair];
      nextState[iPair] = temp;
    }
  }

  return nextState;
}

/**
 * Apply Controlled-Z gate
 */
export function applyCZGate(
  state: Complex[],
  numQubits: number,
  controlQubit: number,
  targetQubit: number
): Complex[] {
  const dim = 1 << numQubits;
  const nextState: Complex[] = [...state];
  const ctrlShift = numQubits - 1 - controlQubit;
  const tgtShift = numQubits - 1 - targetQubit;
  const ctrlMask = 1 << ctrlShift;
  const tgtMask = 1 << tgtShift;

  for (let i = 0; i < dim; i++) {
    // If both control bit and target bit are 1, flip phase: |11> -> -|11>
    if ((i & ctrlMask) !== 0 && (i & tgtMask) !== 0) {
      nextState[i] = Complex.scale(nextState[i], -1);
    }
  }

  return nextState;
}

/**
 * Apply SWAP gate
 */
export function applySWAPGate(
  state: Complex[],
  numQubits: number,
  qubitA: number,
  qubitB: number
): Complex[] {
  const dim = 1 << numQubits;
  const nextState: Complex[] = [...state];
  const aShift = numQubits - 1 - qubitA;
  const bShift = numQubits - 1 - qubitB;
  const aMask = 1 << aShift;
  const bMask = 1 << bShift;

  for (let i = 0; i < dim; i++) {
    const bitA = (i & aMask) !== 0;
    const bitB = (i & bMask) !== 0;
    if (bitA && !bitB) {
      const swappedIndex = (i & ~aMask) | bMask;
      const temp = nextState[i];
      nextState[i] = nextState[swappedIndex];
      nextState[swappedIndex] = temp;
    }
  }

  return nextState;
}

/**
 * Apply Toffoli (CCNOT) gate
 */
export function applyCCXGate(
  state: Complex[],
  numQubits: number,
  ctrlA: number,
  ctrlB: number,
  targetQubit: number
): Complex[] {
  const dim = 1 << numQubits;
  const nextState: Complex[] = [...state];
  const aMask = 1 << (numQubits - 1 - ctrlA);
  const bMask = 1 << (numQubits - 1 - ctrlB);
  const tgtMask = 1 << (numQubits - 1 - targetQubit);

  for (let i = 0; i < dim; i++) {
    if ((i & aMask) !== 0 && (i & bMask) !== 0 && (i & tgtMask) === 0) {
      const iPair = i | tgtMask;
      const temp = nextState[i];
      nextState[i] = nextState[iPair];
      nextState[iPair] = temp;
    }
  }

  return nextState;
}

/**
 * Apply Fredkin (CSWAP) gate
 */
export function applyCSWAPGate(
  state: Complex[],
  numQubits: number,
  ctrl: number,
  targetA: number,
  targetB: number
): Complex[] {
  const dim = 1 << numQubits;
  const nextState: Complex[] = [...state];
  const ctrlMask = 1 << (numQubits - 1 - ctrl);
  const aMask = 1 << (numQubits - 1 - targetA);
  const bMask = 1 << (numQubits - 1 - targetB);

  for (let i = 0; i < dim; i++) {
    if ((i & ctrlMask) !== 0) {
      const bitA = (i & aMask) !== 0;
      const bitB = (i & bMask) !== 0;
      if (bitA && !bitB) {
        const swappedIndex = (i & ~aMask) | bMask;
        const temp = nextState[i];
        nextState[i] = nextState[swappedIndex];
        nextState[swappedIndex] = temp;
      }
    }
  }

  return nextState;
}

/**
 * Compute reduced density matrix rho_k for a single qubit k and extract Bloch vector (u, v, w)
 */
export function computeBlochVector(
  state: Complex[],
  numQubits: number,
  qubitIndex: number
): BlochVector {
  // 2x2 reduced density matrix elements: rho00, rho01, rho10, rho11
  let rho00 = 0;
  let rho11 = 0;
  let rho01 = Complex.zero();

  const dim = 1 << numQubits;
  const shift = numQubits - 1 - qubitIndex;
  const mask = 1 << shift;

  for (let i = 0; i < dim; i++) {
    const isZero = (i & mask) === 0;
    if (isZero) {
      const i1 = i | mask;
      const amp0 = state[i];
      const amp1 = state[i1];

      rho00 += Complex.absSq(amp0);
      rho11 += Complex.absSq(amp1);

      // amp0 * conj(amp1)
      const term01 = Complex.mul(amp0, Complex.conj(amp1));
      rho01 = Complex.add(rho01, term01);
    }
  }

  // <X> = 2 * Re(rho01)
  // <Y> = 2 * Im(rho10) = -2 * Im(rho01)
  // <Z> = rho00 - rho11
  const u = 2 * rho01.re;
  const v = -2 * rho01.im;
  const w = rho00 - rho11;

  const r = Math.sqrt(u * u + v * v + w * w);
  const clampedW = Math.max(-1, Math.min(1, r > 1e-7 ? w / r : w));
  const theta = Math.acos(clampedW);
  let phi = Math.atan2(v, u);
  if (phi < 0) phi += 2 * Math.PI;

  // Purity Tr(rho^2) = (1 + r^2) / 2
  const purity = (1 + r * r) / 2;

  return {
    qubitIndex,
    u,
    v,
    w,
    theta,
    phi,
    purity,
  };
}

/**
 * Statistical distance metrics
 */
export function computeTotalVariationDistance(
  pTheory: Record<string, number>,
  pSampled: Record<string, number>
): number {
  const keys = new Set([...Object.keys(pTheory), ...Object.keys(pSampled)]);
  let sumDiff = 0;
  keys.forEach((k) => {
    const pt = pTheory[k] || 0;
    const ps = pSampled[k] || 0;
    sumDiff += Math.abs(pt - ps);
  });
  return 0.5 * sumDiff;
}

export function computeHellingerDistance(
  pTheory: Record<string, number>,
  pSampled: Record<string, number>
): number {
  const keys = new Set([...Object.keys(pTheory), ...Object.keys(pSampled)]);
  let sumSqDiff = 0;
  keys.forEach((k) => {
    const pt = pTheory[k] || 0;
    const ps = pSampled[k] || 0;
    const diff = Math.sqrt(pt) - Math.sqrt(ps);
    sumSqDiff += diff * diff;
  });
  return (1 / Math.SQRT2) * Math.sqrt(sumSqDiff);
}

/**
 * Main simulation runner
 */
export function runQuantumSimulation(
  circuit: QuantumCircuit,
  shots: number = 1024
): SimulationResponse {
  const startTime = performance.now();
  const numQubits = Math.max(1, Math.min(5, circuit.numQubits));
  const dim = 1 << numQubits;

  // Initialize state |0...0>
  let currentState: Complex[] = new Array(dim).fill(null).map(() => Complex.zero());
  currentState[0] = Complex.one();

  // Sort gates by time step
  const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);

  const stepSnapshots: SimulationResponse['stepByStepSnapshots'] = [];

  // Snapshot step 0 initial state
  stepSnapshots.push({
    step: -1,
    stateVector: formatStateVector(currentState, numQubits),
  });

  // Calculate circuit depth and gate counts
  let singleCount = 0;
  let multiCount = 0;
  const stepHasGate: Record<number, boolean> = {};

  // Group gates by step
  const maxStep = circuit.timeSteps;
  for (let s = 0; s < maxStep; s++) {
    const gatesInStep = sortedGates.filter((g) => g.step === s);

    for (const gate of gatesInStep) {
      stepHasGate[s] = true;
      if (gate.type === 'M') {
        // Measurement in computational basis does not alter probability distribution
        continue;
      }

      if (['CX', 'CZ', 'SWAP', 'CSWAP', 'CCX'].includes(gate.type)) {
        multiCount++;
      } else {
        singleCount++;
      }

      switch (gate.type) {
        case 'CX': {
          const ctrl = gate.controlQubits?.[0] ?? (gate.targetQubit === 0 ? 1 : 0);
          currentState = applyCXGate(currentState, numQubits, ctrl, gate.targetQubit);
          break;
        }
        case 'CZ': {
          const ctrl = gate.controlQubits?.[0] ?? (gate.targetQubit === 0 ? 1 : 0);
          currentState = applyCZGate(currentState, numQubits, ctrl, gate.targetQubit);
          break;
        }
        case 'SWAP': {
          const target2 = gate.secondTarget ?? (gate.targetQubit + 1) % numQubits;
          currentState = applySWAPGate(currentState, numQubits, gate.targetQubit, target2);
          break;
        }
        case 'CCX': {
          const ctrlA = gate.controlQubits?.[0] ?? 0;
          const ctrlB = gate.controlQubits?.[1] ?? 1;
          currentState = applyCCXGate(currentState, numQubits, ctrlA, ctrlB, gate.targetQubit);
          break;
        }
        case 'CSWAP': {
          const ctrl = gate.controlQubits?.[0] ?? 0;
          const tA = gate.targetQubit;
          const tB = gate.secondTarget ?? (gate.targetQubit + 1) % numQubits;
          currentState = applyCSWAPGate(currentState, numQubits, ctrl, tA, tB);
          break;
        }
        default: {
          const mat = getSingleQubitMatrix(gate.type, gate.parameter ?? 0);
          currentState = applySingleQubitGate(currentState, numQubits, gate.targetQubit, mat);
          break;
        }
      }
    }

    if (gatesInStep.length > 0) {
      stepSnapshots.push({
        step: s,
        activeGateId: gatesInStep[0]?.id,
        stateVector: formatStateVector(currentState, numQubits),
      });
    }
  }

  const circuitDepth = Object.keys(stepHasGate).length;

  // Format final statevector components
  const finalStateVector = formatStateVector(currentState, numQubits);

  // Compute theoretical probabilities
  const theoreticalProbabilities: Record<string, number> = {};
  for (const comp of finalStateVector) {
    theoreticalProbabilities[comp.binaryLabel] = comp.probability;
  }

  // Multinomial measurement sampling
  const sampledCounts: Record<string, number> = {};
  const sampledProbabilities: Record<string, number> = {};
  for (const comp of finalStateVector) {
    sampledCounts[comp.binaryLabel] = 0;
    sampledProbabilities[comp.binaryLabel] = 0;
  }

  const effectiveShots = shots > 0 ? shots : 1024;
  if (shots > 0) {
    // Generate CDF
    const cdf: { label: string; cumProb: number }[] = [];
    let cumulative = 0;
    for (const comp of finalStateVector) {
      cumulative += comp.probability;
      cdf.push({ label: comp.binaryLabel, cumProb: cumulative });
    }

    for (let i = 0; i < shots; i++) {
      const rand = Math.random();
      for (const item of cdf) {
        if (rand <= item.cumProb || item === cdf[cdf.length - 1]) {
          sampledCounts[item.label] = (sampledCounts[item.label] || 0) + 1;
          break;
        }
      }
    }

    for (const label in sampledCounts) {
      sampledProbabilities[label] = sampledCounts[label] / shots;
    }
  } else {
    // Exact analytical (0 shots)
    for (const comp of finalStateVector) {
      sampledCounts[comp.binaryLabel] = Math.round(comp.probability * 1000);
      sampledProbabilities[comp.binaryLabel] = comp.probability;
    }
  }

  // Statistical distances
  const tvd = computeTotalVariationDistance(theoreticalProbabilities, sampledProbabilities);
  const hellinger = computeHellingerDistance(theoreticalProbabilities, sampledProbabilities);

  // Compute Bloch vectors for each qubit
  const blochVectors: Record<number, BlochVector> = {};
  for (let q = 0; q < numQubits; q++) {
    blochVectors[q] = computeBlochVector(currentState, numQubits, q);
  }

  const endTime = performance.now();

  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    circuitId: circuit.id,
    timestamp: new Date().toISOString(),
    executionTimeMs: Math.max(0.1, Number((endTime - startTime).toFixed(2))),
    backend: 'local_statevector',
    provenanceLabel: 'Local Matrix Statevector Engine (Analytical + PRNG Sampled)',
    shots: shots,
    numQubits,
    stateVector: finalStateVector,
    theoreticalProbabilities,
    sampledCounts,
    sampledProbabilities,
    metrics: {
      totalVariationDistance: Number(tvd.toFixed(4)),
      hellingerDistance: Number(hellinger.toFixed(4)),
      fidelity: Number((1.0 - tvd).toFixed(4)),
      circuitDepth,
      totalGateCount: singleCount + multiCount,
      singleQubitGateCount: singleCount,
      multiQubitGateCount: multiCount,
    },
    blochVectors,
    stepByStepSnapshots: stepSnapshots,
  };
}

function formatStateVector(state: Complex[], numQubits: number): StateVectorComponent[] {
  const dim = 1 << numQubits;
  return state.map((c, idx) => {
    const binaryLabel = idx.toString(2).padStart(numQubits, '0');
    const magnitude = Complex.abs(c);
    const probability = Complex.absSq(c);
    const phaseRad = Complex.phase(c);
    let phaseDeg = (phaseRad * 180) / Math.PI;
    if (phaseDeg < 0) phaseDeg += 360;

    return {
      index: idx,
      binaryLabel,
      real: Number(c.re.toFixed(6)),
      imag: Number(c.im.toFixed(6)),
      magnitude: Number(magnitude.toFixed(6)),
      probability: Number(probability.toFixed(6)),
      phaseRad: Number(phaseRad.toFixed(4)),
      phaseDeg: Number(phaseDeg.toFixed(1)),
    };
  });
}
