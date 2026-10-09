/**
 * Quantum Research Lab (QRL) - Code Generator and Export Formats
 * Exports circuits to OpenQASM 2.0, Python Qiskit, Python PennyLane, and documented JSON.
 */

import { QuantumCircuit } from '../../types/quantum';

export function exportToQasm(circuit: QuantumCircuit): string {
  const lines: string[] = [
    '// Quantum Research Lab (QRL) - Circuit OpenQASM 2.0 Export',
    '// Circuit: ' + circuit.name,
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    `qreg q[${circuit.numQubits}];`,
    `creg c[${circuit.numQubits}];`,
    '',
  ];

  const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);

  for (const gate of sortedGates) {
    const t = gate.targetQubit;
    const p = gate.parameter !== undefined ? gate.parameter.toFixed(4) : '0';

    switch (gate.type) {
      case 'I':
        lines.push(`id q[${t}];`);
        break;
      case 'H':
        lines.push(`h q[${t}];`);
        break;
      case 'X':
        lines.push(`x q[${t}];`);
        break;
      case 'Y':
        lines.push(`y q[${t}];`);
        break;
      case 'Z':
        lines.push(`z q[${t}];`);
        break;
      case 'S':
        lines.push(`s q[${t}];`);
        break;
      case 'Sdg':
        lines.push(`sdg q[${t}];`);
        break;
      case 'T':
        lines.push(`t q[${t}];`);
        break;
      case 'Tdg':
        lines.push(`tdg q[${t}];`);
        break;
      case 'RX':
        lines.push(`rx(${p}) q[${t}];`);
        break;
      case 'RY':
        lines.push(`ry(${p}) q[${t}];`);
        break;
      case 'RZ':
        lines.push(`rz(${p}) q[${t}];`);
        break;
      case 'Phase':
        lines.push(`u1(${p}) q[${t}];`);
        break;
      case 'CX': {
        const c = gate.controlQubits?.[0] ?? (t === 0 ? 1 : 0);
        lines.push(`cx q[${c}], q[${t}];`);
        break;
      }
      case 'CZ': {
        const c = gate.controlQubits?.[0] ?? (t === 0 ? 1 : 0);
        lines.push(`cz q[${c}], q[${t}];`);
        break;
      }
      case 'SWAP': {
        const t2 = gate.secondTarget ?? (t + 1) % circuit.numQubits;
        lines.push(`swap q[${t}], q[${t2}];`);
        break;
      }
      case 'CCX': {
        const c1 = gate.controlQubits?.[0] ?? 0;
        const c2 = gate.controlQubits?.[1] ?? 1;
        lines.push(`ccx q[${c1}], q[${c2}], q[${t}];`);
        break;
      }
      case 'CSWAP': {
        const c = gate.controlQubits?.[0] ?? 0;
        const t2 = gate.secondTarget ?? (t + 1) % circuit.numQubits;
        lines.push(`cswap q[${c}], q[${t}], q[${t2}];`);
        break;
      }
      case 'M':
        lines.push(`measure q[${t}] -> c[${t}];`);
        break;
    }
  }

  return lines.join('\n');
}

export function exportToQiskit(circuit: QuantumCircuit): string {
  const lines: string[] = [
    '# ==========================================================',
    '# Quantum Research Lab (QRL) - Python Qiskit Export',
    '# Circuit: ' + circuit.name,
    '# ==========================================================',
    'from qiskit import QuantumCircuit, transpile',
    'from qiskit_aer import AerSimulator',
    'from qiskit.visualization import plot_histogram',
    'import numpy as np',
    '',
    `# Initialize circuit with ${circuit.numQubits} qubits and classical registers`,
    `qc = QuantumCircuit(${circuit.numQubits}, ${circuit.numQubits})`,
    '',
  ];

  const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);

  for (const gate of sortedGates) {
    const t = gate.targetQubit;
    const p = gate.parameter !== undefined ? gate.parameter.toFixed(4) : '0';

    switch (gate.type) {
      case 'I':
        lines.push(`qc.id(${t})`);
        break;
      case 'H':
        lines.push(`qc.h(${t})`);
        break;
      case 'X':
        lines.push(`qc.x(${t})`);
        break;
      case 'Y':
        lines.push(`qc.y(${t})`);
        break;
      case 'Z':
        lines.push(`qc.z(${t})`);
        break;
      case 'S':
        lines.push(`qc.s(${t})`);
        break;
      case 'Sdg':
        lines.push(`qc.sdg(${t})`);
        break;
      case 'T':
        lines.push(`qc.t(${t})`);
        break;
      case 'Tdg':
        lines.push(`qc.tdg(${t})`);
        break;
      case 'RX':
        lines.push(`qc.rx(${p}, ${t})`);
        break;
      case 'RY':
        lines.push(`qc.ry(${p}, ${t})`);
        break;
      case 'RZ':
        lines.push(`qc.rz(${p}, ${t})`);
        break;
      case 'Phase':
        lines.push(`qc.p(${p}, ${t})`);
        break;
      case 'CX': {
        const c = gate.controlQubits?.[0] ?? (t === 0 ? 1 : 0);
        lines.push(`qc.cx(${c}, ${t})`);
        break;
      }
      case 'CZ': {
        const c = gate.controlQubits?.[0] ?? (t === 0 ? 1 : 0);
        lines.push(`qc.cz(${c}, ${t})`);
        break;
      }
      case 'SWAP': {
        const t2 = gate.secondTarget ?? (t + 1) % circuit.numQubits;
        lines.push(`qc.swap(${t}, ${t2})`);
        break;
      }
      case 'CCX': {
        const c1 = gate.controlQubits?.[0] ?? 0;
        const c2 = gate.controlQubits?.[1] ?? 1;
        lines.push(`qc.ccx(${c1}, ${c2}, ${t})`);
        break;
      }
      case 'CSWAP': {
        const c = gate.controlQubits?.[0] ?? 0;
        const t2 = gate.secondTarget ?? (t + 1) % circuit.numQubits;
        lines.push(`qc.cswap(${c}, ${t}, ${t2})`);
        break;
      }
      case 'M':
        lines.push(`qc.measure(${t}, ${t})`);
        break;
    }
  }

  lines.push('');
  lines.push('# Run simulation on AerSimulator backend');
  lines.push('simulator = AerSimulator()');
  lines.push('compiled_circuit = transpile(qc, simulator)');
  lines.push('job = simulator.run(compiled_circuit, shots=1024)');
  lines.push('result = job.result()');
  lines.push('counts = result.get_counts(qc)');
  lines.push('print("Measurement counts:", counts)');

  return lines.join('\n');
}

export function exportToPennyLane(circuit: QuantumCircuit): string {
  const lines: string[] = [
    '# ==========================================================',
    '# Quantum Research Lab (QRL) - Python PennyLane Export',
    '# Circuit: ' + circuit.name,
    '# ==========================================================',
    'import pennylane as qml',
    'import numpy as np',
    '',
    `# Initialize ${circuit.numQubits}-qubit statevector device`,
    `dev = qml.device("default.qubit", wires=${circuit.numQubits}, shots=1024)`,
    '',
    '@qml.qnode(dev)',
    'def circuit():',
  ];

  const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);

  if (sortedGates.length === 0) {
    lines.push('    # Identity pass');
    lines.push('    return qml.probs(wires=range(len(dev.wires)))');
  } else {
    for (const gate of sortedGates) {
      const t = gate.targetQubit;
      const p = gate.parameter !== undefined ? gate.parameter.toFixed(4) : '0';

      switch (gate.type) {
        case 'I':
          lines.push(`    qml.Identity(wires=${t})`);
          break;
        case 'H':
          lines.push(`    qml.Hadamard(wires=${t})`);
          break;
        case 'X':
          lines.push(`    qml.PauliX(wires=${t})`);
          break;
        case 'Y':
          lines.push(`    qml.PauliY(wires=${t})`);
          break;
        case 'Z':
          lines.push(`    qml.PauliZ(wires=${t})`);
          break;
        case 'S':
          lines.push(`    qml.S(wires=${t})`);
          break;
        case 'Sdg':
          lines.push(`    qml.adjoint(qml.S)(wires=${t})`);
          break;
        case 'T':
          lines.push(`    qml.T(wires=${t})`);
          break;
        case 'Tdg':
          lines.push(`    qml.adjoint(qml.T)(wires=${t})`);
          break;
        case 'RX':
          lines.push(`    qml.RX(${p}, wires=${t})`);
          break;
        case 'RY':
          lines.push(`    qml.RY(${p}, wires=${t})`);
          break;
        case 'RZ':
          lines.push(`    qml.RZ(${p}, wires=${t})`);
          break;
        case 'Phase':
          lines.push(`    qml.PhaseShift(${p}, wires=${t})`);
          break;
        case 'CX': {
          const c = gate.controlQubits?.[0] ?? (t === 0 ? 1 : 0);
          lines.push(`    qml.CNOT(wires=[${c}, ${t}])`);
          break;
        }
        case 'CZ': {
          const c = gate.controlQubits?.[0] ?? (t === 0 ? 1 : 0);
          lines.push(`    qml.CZ(wires=[${c}, ${t}])`);
          break;
        }
        case 'SWAP': {
          const t2 = gate.secondTarget ?? (t + 1) % circuit.numQubits;
          lines.push(`    qml.SWAP(wires=[${t}, ${t2}])`);
          break;
        }
        case 'CCX': {
          const c1 = gate.controlQubits?.[0] ?? 0;
          const c2 = gate.controlQubits?.[1] ?? 1;
          lines.push(`    qml.Toffoli(wires=[${c1}, ${c2}, ${t}])`);
          break;
        }
        case 'CSWAP': {
          const c = gate.controlQubits?.[0] ?? 0;
          const t2 = gate.secondTarget ?? (t + 1) % circuit.numQubits;
          lines.push(`    qml.CSWAP(wires=[${c}, ${t}, ${t2}])`);
          break;
        }
      }
    }
    lines.push(`    return qml.probs(wires=range(${circuit.numQubits}))`);
  }

  lines.push('');
  lines.push('# Execute and print probabilities');
  lines.push('probabilities = circuit()');
  lines.push('print("Probability distribution:", probabilities)');

  return lines.join('\n');
}

export function validateCircuitJson(jsonStr: string): { valid: boolean; error?: string; circuit?: QuantumCircuit } {
  try {
    const obj = JSON.parse(jsonStr);
    if (!obj || typeof obj !== 'object') {
      return { valid: false, error: 'Input must be a valid JSON object.' };
    }
    if (typeof obj.numQubits !== 'number' || obj.numQubits < 1 || obj.numQubits > 5) {
      return { valid: false, error: 'Circuit must specify numQubits between 1 and 5.' };
    }
    if (!Array.isArray(obj.gates)) {
      return { valid: false, error: 'Circuit must contain a gates array.' };
    }

    const circuit: QuantumCircuit = {
      id: obj.id || `circuit-${Date.now()}`,
      name: obj.name || 'Imported Circuit',
      description: obj.description || 'Imported via Quantum Research Lab JSON schema',
      numQubits: obj.numQubits,
      timeSteps: typeof obj.timeSteps === 'number' ? Math.max(obj.timeSteps, 8) : 8,
      gates: obj.gates,
      createdAt: obj.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { valid: true, circuit };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid JSON format';
    return { valid: false, error: errorMsg };
  }
}
