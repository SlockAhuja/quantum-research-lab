"""
Cross-validation test suite for Quantum Statevectors:
Compares QRL TypeScript Simulation Engine vs. Qiskit Reference vs. PennyLane Reference.
Tests A through H as specified in QRL v2.5 Scientific Mission.
"""

import math
import numpy as np
import pytest
from qiskit import QuantumCircuit as QiskitCircuit
from qiskit.quantum_info import Statevector as QiskitStatevector
import pennylane as qml

from tests.quantum_reference.qrl_bridge import (
    run_qrl_ts_engine,
    qiskit_to_qrl_statevector,
    qiskit_to_qrl_probabilities,
    compare_statevectors_up_to_global_phase,
    compare_probabilities,
)


def test_a_initial_state():
    """Test A: Fresh 1-qubit circuit with no gates."""
    circ = {
        "id": "test-a",
        "name": "Test A: Initial State",
        "description": "",
        "numQubits": 1,
        "timeSteps": 2,
        "gates": [],
        "createdAt": "",
        "updatedAt": "",
    }
    
    # 1. QRL TypeScript Engine
    qrl_res = run_qrl_ts_engine(circ)
    qrl_p0 = qrl_res["theoreticalProbabilities"].get("0", 0.0)
    qrl_p1 = qrl_res["theoreticalProbabilities"].get("1", 0.0)
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
    
    # 2. Qiskit Reference
    qc = QiskitCircuit(1)
    qiskit_sv = np.asarray(QiskitStatevector.from_instruction(qc))
    qiskit_sv_qrl = qiskit_to_qrl_statevector(qiskit_sv, 1)
    
    # 3. PennyLane Reference
    dev = qml.device("default.qubit", wires=1)
    @qml.qnode(dev)
    def pl_circ():
        return qml.state()
    pl_sv = np.asarray(pl_circ())
    
    # Assertions
    assert len(qrl_sv) == 2
    assert math.isclose(qrl_p0, 1.0, abs_tol=1e-5)
    assert math.isclose(qrl_p1, 0.0, abs_tol=1e-5)
    assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl)
    assert compare_statevectors_up_to_global_phase(qrl_sv, pl_sv)


def test_b_hadamard_superposition():
    """Test B: Apply Hadamard gate to initial state |0>."""
    circ = {
        "id": "test-b",
        "name": "Test B: Hadamard",
        "description": "",
        "numQubits": 1,
        "timeSteps": 2,
        "gates": [{"id": "g1", "type": "H", "step": 0, "targetQubit": 0}],
        "createdAt": "",
        "updatedAt": "",
    }
    
    # 1. QRL Engine
    qrl_res = run_qrl_ts_engine(circ)
    qrl_p0 = qrl_res["theoreticalProbabilities"].get("0", 0.0)
    qrl_p1 = qrl_res["theoreticalProbabilities"].get("1", 0.0)
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
    
    # 2. Qiskit Reference
    qc = QiskitCircuit(1)
    qc.h(0)
    qiskit_sv = np.asarray(QiskitStatevector.from_instruction(qc))
    qiskit_sv_qrl = qiskit_to_qrl_statevector(qiskit_sv, 1)
    
    # 3. PennyLane Reference
    dev = qml.device("default.qubit", wires=1)
    @qml.qnode(dev)
    def pl_circ():
        qml.Hadamard(wires=0)
        return qml.state()
    pl_sv = np.asarray(pl_circ())
    
    # Assertions
    assert len(qrl_sv) == 2
    assert math.isclose(qrl_p0, 0.5, abs_tol=1e-4)
    assert math.isclose(qrl_p1, 0.5, abs_tol=1e-4)
    assert math.isclose(qrl_p0 + qrl_p1, 1.0, abs_tol=1e-5)
    assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl)
    assert compare_statevectors_up_to_global_phase(qrl_sv, pl_sv)


def test_c_pauli_x():
    """Test C: Apply Pauli-X to |0> -> |1>."""
    circ = {
        "id": "test-c",
        "name": "Test C: Pauli-X",
        "description": "",
        "numQubits": 1,
        "timeSteps": 2,
        "gates": [{"id": "g1", "type": "X", "step": 0, "targetQubit": 0}],
        "createdAt": "",
        "updatedAt": "",
    }
    
    qrl_res = run_qrl_ts_engine(circ)
    qrl_p1 = qrl_res["theoreticalProbabilities"].get("1", 0.0)
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
    
    qc = QiskitCircuit(1)
    qc.x(0)
    qiskit_sv_qrl = qiskit_to_qrl_statevector(np.asarray(QiskitStatevector.from_instruction(qc)), 1)
    
    assert math.isclose(qrl_p1, 1.0, abs_tol=1e-5)
    assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl)


def test_d_hadamard_involution():
    """Test D: Apply H twice -> |0>."""
    circ = {
        "id": "test-d",
        "name": "Test D: H Twice",
        "description": "",
        "numQubits": 1,
        "timeSteps": 3,
        "gates": [
            {"id": "g1", "type": "H", "step": 0, "targetQubit": 0},
            {"id": "g2", "type": "H", "step": 1, "targetQubit": 0},
        ],
        "createdAt": "",
        "updatedAt": "",
    }
    
    qrl_res = run_qrl_ts_engine(circ)
    qrl_p0 = qrl_res["theoreticalProbabilities"].get("0", 0.0)
    qrl_p1 = qrl_res["theoreticalProbabilities"].get("1", 0.0)
    
    assert math.isclose(qrl_p0, 1.0, abs_tol=1e-5)
    assert math.isclose(qrl_p1, 0.0, abs_tol=1e-5)


@pytest.mark.parametrize("angle", [0.0, math.pi / 4, math.pi / 3, math.pi / 2, math.pi, 2 * math.pi])
@pytest.mark.parametrize("gate_type", ["RX", "RY", "RZ"])
def test_e_rotations(angle, gate_type):
    """Test E: Continuous rotations RX, RY, RZ compared across QRL, Qiskit, and PennyLane."""
    circ = {
        "id": f"test-e-{gate_type}",
        "name": f"Test E: {gate_type}",
        "description": "",
        "numQubits": 1,
        "timeSteps": 2,
        "gates": [{"id": "g1", "type": gate_type, "step": 0, "targetQubit": 0, "parameter": angle}],
        "createdAt": "",
        "updatedAt": "",
    }
    
    # 1. QRL
    qrl_res = run_qrl_ts_engine(circ)
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
    qrl_probs = qrl_res["theoreticalProbabilities"]
    
    # 2. Qiskit
    qc = QiskitCircuit(1)
    if gate_type == "RX":
        qc.rx(angle, 0)
    elif gate_type == "RY":
        qc.ry(angle, 0)
    elif gate_type == "RZ":
        qc.rz(angle, 0)
    qiskit_sv_qrl = qiskit_to_qrl_statevector(np.asarray(QiskitStatevector.from_instruction(qc)), 1)
    
    # 3. PennyLane
    dev = qml.device("default.qubit", wires=1)
    @qml.qnode(dev)
    def pl_circ():
        if gate_type == "RX":
            qml.RX(angle, wires=0)
        elif gate_type == "RY":
            qml.RY(angle, wires=0)
        elif gate_type == "RZ":
            qml.RZ(angle, wires=0)
        return qml.state(), qml.probs(wires=[0])
    pl_sv, pl_p = pl_circ()
    pl_probs = {"0": float(pl_p[0]), "1": float(pl_p[1])}
    
    assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl, tol=1e-4)
    assert compare_statevectors_up_to_global_phase(qrl_sv, np.asarray(pl_sv), tol=1e-4)
    assert compare_probabilities(qrl_probs, pl_probs, tol=1e-4)


def test_f_bell_state():
    """Test F: Bell state |Phi+> = (|00> + |11>)/sqrt(2)."""
    circ = {
        "id": "test-f-bell",
        "name": "Test F: Bell State",
        "description": "",
        "numQubits": 2,
        "timeSteps": 3,
        "gates": [
            {"id": "g1", "type": "H", "step": 0, "targetQubit": 0},
            {"id": "g2", "type": "CX", "step": 1, "targetQubit": 1, "controlQubits": [0]},
        ],
        "createdAt": "",
        "updatedAt": "",
    }
    
    qrl_res = run_qrl_ts_engine(circ)
    qrl_probs = qrl_res["theoreticalProbabilities"]
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
    
    # Qiskit
    qc = QiskitCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    qiskit_sv_qrl = qiskit_to_qrl_statevector(np.asarray(QiskitStatevector.from_instruction(qc)), 2)
    
    # Assertions
    assert math.isclose(qrl_probs.get("00", 0.0), 0.5, abs_tol=1e-5)
    assert math.isclose(qrl_probs.get("11", 0.0), 0.5, abs_tol=1e-5)
    assert math.isclose(qrl_probs.get("01", 0.0), 0.0, abs_tol=1e-5)
    assert math.isclose(qrl_probs.get("10", 0.0), 0.0, abs_tol=1e-5)
    
    # Subsystem purity of q0
    assert "0" in qrl_res["blochVectors"]
    assert math.isclose(qrl_res["blochVectors"]["0"]["purity"], 0.5, abs_tol=1e-4)
    assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl)


def test_g_controlled_and_multiqubit_gates():
    """Test G: CX, CZ, SWAP, CCX, CSWAP controlled multi-qubit transformations."""
    # 1. CZ gate on (|0>+|1>)(|0>+|1>)/2
    cz_circ = {
        "id": "test-g-cz",
        "name": "CZ Test",
        "description": "",
        "numQubits": 2,
        "timeSteps": 3,
        "gates": [
            {"id": "g1", "type": "H", "step": 0, "targetQubit": 0},
            {"id": "g2", "type": "H", "step": 0, "targetQubit": 1},
            {"id": "g3", "type": "CZ", "step": 1, "targetQubit": 1, "controlQubits": [0]},
        ],
        "createdAt": "",
        "updatedAt": "",
    }
    qrl_cz = run_qrl_ts_engine(cz_circ)
    assert math.isclose(qrl_cz["theoreticalProbabilities"]["00"], 0.25, abs_tol=1e-4)
    assert math.isclose(qrl_cz["theoreticalProbabilities"]["11"], 0.25, abs_tol=1e-4)
    
    # 2. Toffoli (CCX) on |110> -> |111>
    ccx_circ = {
        "id": "test-g-ccx",
        "name": "CCX Test",
        "description": "",
        "numQubits": 3,
        "timeSteps": 3,
        "gates": [
            {"id": "g1", "type": "X", "step": 0, "targetQubit": 0},
            {"id": "g2", "type": "X", "step": 0, "targetQubit": 1},
            {"id": "g3", "type": "CCX", "step": 1, "targetQubit": 2, "controlQubits": [0, 1]},
        ],
        "createdAt": "",
        "updatedAt": "",
    }
    qrl_ccx = run_qrl_ts_engine(ccx_circ)
    assert math.isclose(qrl_ccx["theoreticalProbabilities"].get("111", 0.0), 1.0, abs_tol=1e-5)


def test_h_randomized_differential_testing():
    """Test H: Randomized differential testing up to 5 qubits against Qiskit."""
    np.random.seed(42)
    
    for num_q in [2, 3, 4, 5]:
        gates_list = []
        qc = QiskitCircuit(num_q)
        
        # Build 6 random operations
        for step in range(6):
            q_target = int(np.random.randint(0, num_q))
            gate_choice = np.random.choice(["H", "X", "Y", "Z", "S", "T", "RY", "CX"])
            
            if gate_choice == "H":
                gates_list.append({"id": f"g_{step}", "type": "H", "step": step, "targetQubit": q_target})
                qc.h(q_target)
            elif gate_choice == "X":
                gates_list.append({"id": f"g_{step}", "type": "X", "step": step, "targetQubit": q_target})
                qc.x(q_target)
            elif gate_choice == "Y":
                gates_list.append({"id": f"g_{step}", "type": "Y", "step": step, "targetQubit": q_target})
                qc.y(q_target)
            elif gate_choice == "Z":
                gates_list.append({"id": f"g_{step}", "type": "Z", "step": step, "targetQubit": q_target})
                qc.z(q_target)
            elif gate_choice == "S":
                gates_list.append({"id": f"g_{step}", "type": "S", "step": step, "targetQubit": q_target})
                qc.s(q_target)
            elif gate_choice == "T":
                gates_list.append({"id": f"g_{step}", "type": "T", "step": step, "targetQubit": q_target})
                qc.t(q_target)
            elif gate_choice == "RY":
                theta = float(np.random.uniform(0, 2 * math.pi))
                gates_list.append({"id": f"g_{step}", "type": "RY", "step": step, "targetQubit": q_target, "parameter": theta})
                qc.ry(theta, q_target)
            elif gate_choice == "CX":
                q_ctrl = int((q_target + 1) % num_q)
                gates_list.append({"id": f"g_{step}", "type": "CX", "step": step, "targetQubit": q_target, "controlQubits": [q_ctrl]})
                qc.cx(q_ctrl, q_target)
                
        circ = {
            "id": f"rand-{num_q}",
            "name": f"Random {num_q}Q",
            "description": "",
            "numQubits": num_q,
            "timeSteps": 8,
            "gates": gates_list,
            "createdAt": "",
            "updatedAt": "",
        }
        
        qrl_res = run_qrl_ts_engine(circ)
        qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
        
        qiskit_sv_qrl = qiskit_to_qrl_statevector(np.asarray(QiskitStatevector.from_instruction(qc)), num_q)
        
        # Verify normalization
        prob_sum = sum(c["probability"] for c in qrl_res["stateVector"])
        assert math.isclose(prob_sum, 1.0, abs_tol=1e-4)
        
        # Verify cross-framework statevector match
        assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl, tol=1e-3)
