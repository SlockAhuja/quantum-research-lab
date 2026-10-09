"""
QRL Python Cross-Validation Bridge
Connects QRL TypeScript simulation engine with Qiskit, PennyLane, and NumPy.
Handles wire-ordering conventions, global phase alignment, and numerical comparisons.
"""

import json
import math
import subprocess
import numpy as np

def run_qrl_ts_engine(circuit_dict: dict, shots: int = 1024) -> dict:
    """
    Executes a circuit dictionary through the actual QRL TypeScript engine using Node/TSX CLI.
    """
    payload = json.dumps({"circuit": circuit_dict, "shots": shots})
    cmd = ["npx", "tsx", "src/lib/quantum/simulate-cli.ts"]
    proc = subprocess.run(
        cmd,
        input=payload,
        text=True,
        capture_output=True,
        shell=True,
        check=True
    )
    return json.loads(proc.stdout)

def qiskit_to_qrl_statevector(qiskit_sv: np.ndarray, num_qubits: int) -> np.ndarray:
    """
    Reorders a Qiskit statevector (little-endian: q(n-1)...q0)
    to QRL/PennyLane convention (big-endian: q0...q(n-1)).
    """
    dim = 1 << num_qubits
    qrl_sv = np.zeros(dim, dtype=complex)
    for i in range(dim):
        # Reverse the binary bits for num_qubits length
        bits = f"{i:0{num_qubits}b}"
        rev_bits = bits[::-1]
        j = int(rev_bits, 2)
        qrl_sv[j] = qiskit_sv[i]
    return qrl_sv

def get_all_qrl_experiments() -> list:
    """
    Retrieves all 23 verified benchmark experiments defined in QRL.
    """
    cmd = ["npx", "tsx", "src/lib/quantum/simulate-cli.ts", "--experiments"]
    proc = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        shell=True,
        check=True
    )
    return json.loads(proc.stdout)

def qiskit_to_qrl_probabilities(qiskit_probs: dict, num_qubits: int) -> dict:
    """
    Reverses Qiskit bitstring keys to QRL wire ordering.
    """
    qrl_probs = {}
    for bitstring, prob in qiskit_probs.items():
        rev_bitstring = bitstring[::-1]
        qrl_probs[rev_bitstring] = prob
    return qrl_probs

def compare_statevectors_up_to_global_phase(sv1: np.ndarray, sv2: np.ndarray, tol: float = 1e-4) -> bool:
    """
    Compares two quantum statevectors allowing for an arbitrary global phase:
    sv2 = e^(i phi) * sv1.
    Uses maximum amplitude index for numerical stability.
    """
    assert len(sv1) == len(sv2), f"Dimension mismatch: {len(sv1)} vs {len(sv2)}"
    
    # Pick the index with the maximum amplitude to avoid dividing by near-zero numerical noise
    idx = int(np.argmax(np.abs(sv1)))
    if abs(sv1[idx]) < 1e-6:
        return np.allclose(sv1, sv2, atol=tol)
        
    if abs(sv2[idx]) < 1e-6:
        return False
        
    phase_factor = sv2[idx] / sv1[idx]
    phase_factor = phase_factor / abs(phase_factor)
    
    aligned_sv1 = sv1 * phase_factor
    return np.allclose(aligned_sv1, sv2, atol=tol)

def compare_probabilities(p1: dict, p2: dict, tol: float = 1e-4) -> bool:
    """
    Compares two probability distributions across all basis states.
    """
    all_keys = set(p1.keys()).union(set(p2.keys()))
    for k in all_keys:
        v1 = p1.get(k, 0.0)
        v2 = p2.get(k, 0.0)
        if abs(v1 - v2) > tol:
            return False
    return True

def build_qiskit_circuit(circuit_dict: dict):
    from qiskit import QuantumCircuit as QiskitCircuit
    n = circuit_dict["numQubits"]
    qc = QiskitCircuit(n)
    sorted_gates = sorted(circuit_dict.get("gates", []), key=lambda g: g.get("step", 0))
    for g in sorted_gates:
        gtype = g["type"]
        t = g["targetQubit"]
        p = g.get("parameter", 0.0)
        if gtype == "I":
            qc.id(t)
        elif gtype == "H":
            qc.h(t)
        elif gtype == "X":
            qc.x(t)
        elif gtype == "Y":
            qc.y(t)
        elif gtype == "Z":
            qc.z(t)
        elif gtype == "S":
            qc.s(t)
        elif gtype == "Sdg":
            qc.sdg(t)
        elif gtype == "T":
            qc.t(t)
        elif gtype == "Tdg":
            qc.tdg(t)
        elif gtype == "RX":
            qc.rx(p, t)
        elif gtype == "RY":
            qc.ry(p, t)
        elif gtype == "RZ":
            qc.rz(p, t)
        elif gtype == "Phase":
            qc.p(p, t)
        elif gtype == "CX":
            ctrl = g.get("controlQubits", [1 if t == 0 else 0])[0]
            qc.cx(ctrl, t)
        elif gtype == "CZ":
            ctrl = g.get("controlQubits", [1 if t == 0 else 0])[0]
            qc.cz(ctrl, t)
        elif gtype == "SWAP":
            t2 = g.get("secondTarget", (t + 1) % n)
            qc.swap(t, t2)
        elif gtype == "CCX":
            ctrls = g.get("controlQubits", [0, 1])
            qc.ccx(ctrls[0], ctrls[1], t)
        elif gtype == "CSWAP":
            ctrl = g.get("controlQubits", [0])[0]
            t2 = g.get("secondTarget", (t + 1) % n)
            qc.cswap(ctrl, t, t2)
    return qc

def simulate_pennylane_circuit(circuit_dict: dict) -> np.ndarray:
    import pennylane as qml
    n = circuit_dict["numQubits"]
    dev = qml.device("default.qubit", wires=n)
    sorted_gates = sorted(circuit_dict.get("gates", []), key=lambda g: g.get("step", 0))

    @qml.qnode(dev)
    def pl_circuit():
        for g in sorted_gates:
            gtype = g["type"]
            t = g["targetQubit"]
            p = g.get("parameter", 0.0)
            if gtype == "I":
                qml.Identity(wires=t)
            elif gtype == "H":
                qml.Hadamard(wires=t)
            elif gtype == "X":
                qml.PauliX(wires=t)
            elif gtype == "Y":
                qml.PauliY(wires=t)
            elif gtype == "Z":
                qml.PauliZ(wires=t)
            elif gtype == "S":
                qml.S(wires=t)
            elif gtype == "Sdg":
                qml.adjoint(qml.S)(wires=t)
            elif gtype == "T":
                qml.T(wires=t)
            elif gtype == "Tdg":
                qml.adjoint(qml.T)(wires=t)
            elif gtype == "RX":
                qml.RX(p, wires=t)
            elif gtype == "RY":
                qml.RY(p, wires=t)
            elif gtype == "RZ":
                qml.RZ(p, wires=t)
            elif gtype == "Phase":
                qml.PhaseShift(p, wires=t)
            elif gtype == "CX":
                ctrl = g.get("controlQubits", [1 if t == 0 else 0])[0]
                qml.CNOT(wires=[ctrl, t])
            elif gtype == "CZ":
                ctrl = g.get("controlQubits", [1 if t == 0 else 0])[0]
                qml.CZ(wires=[ctrl, t])
            elif gtype == "SWAP":
                t2 = g.get("secondTarget", (t + 1) % n)
                qml.SWAP(wires=[t, t2])
            elif gtype == "CCX":
                ctrls = g.get("controlQubits", [0, 1])
                qml.Toffoli(wires=[ctrls[0], ctrls[1], t])
            elif gtype == "CSWAP":
                ctrl = g.get("controlQubits", [0])[0]
                t2 = g.get("secondTarget", (t + 1) % n)
                qml.CSWAP(wires=[ctrl, t, t2])
        return qml.state()

    return np.asarray(pl_circuit())
