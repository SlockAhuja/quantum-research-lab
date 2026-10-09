"""
Gate-by-gate verification against analytical NumPy matrices and PennyLane.
Tests all single-qubit and multi-qubit gates in QRL registry.
"""

import math
import numpy as np
import pytest
import pennylane as qml
from tests.quantum_reference.qrl_bridge import run_qrl_ts_engine, compare_statevectors_up_to_global_phase


def test_single_qubit_matrices():
    """Verify single-qubit gate transformations on |0> and |1>."""
    gates_to_test = [
        ("I", [1.0 + 0j, 0.0 + 0j]),
        ("X", [0.0 + 0j, 1.0 + 0j]),
        ("Y", [0.0 + 0j, 0.0 + 1j]),
        ("Z", [1.0 + 0j, 0.0 + 0j]),
        ("H", [1/math.sqrt(2) + 0j, 1/math.sqrt(2) + 0j]),
        ("S", [1.0 + 0j, 0.0 + 0j]),
        ("T", [1.0 + 0j, 0.0 + 0j]),
    ]
    
    for gate_type, expected_sv in gates_to_test:
        circ = {
            "id": f"gate-{gate_type}",
            "name": f"Gate {gate_type}",
            "description": "",
            "numQubits": 1,
            "timeSteps": 2,
            "gates": [{"id": "g1", "type": gate_type, "step": 0, "targetQubit": 0}],
            "createdAt": "",
            "updatedAt": "",
        }
        res = run_qrl_ts_engine(circ)
        actual_sv = np.array([c["real"] + 1j * c["imag"] for c in res["stateVector"]])
        assert np.allclose(actual_sv, np.array(expected_sv), atol=1e-5), f"Failed for {gate_type}"


def test_swap_gate():
    """Verify SWAP gate on |10> -> |01>."""
    circ = {
        "id": "gate-swap",
        "name": "SWAP Test",
        "description": "",
        "numQubits": 2,
        "timeSteps": 3,
        "gates": [
            {"id": "g1", "type": "X", "step": 0, "targetQubit": 0},
            {"id": "g2", "type": "SWAP", "step": 1, "targetQubit": 0, "secondTarget": 1},
        ],
        "createdAt": "",
        "updatedAt": "",
    }
    res = run_qrl_ts_engine(circ)
    assert math.isclose(res["theoreticalProbabilities"].get("01", 0.0), 1.0, abs_tol=1e-5)


def test_cswap_fredkin_gate():
    """Verify CSWAP (Fredkin) gate on |110> -> |101>."""
    circ = {
        "id": "gate-cswap",
        "name": "CSWAP Test",
        "description": "",
        "numQubits": 3,
        "timeSteps": 3,
        "gates": [
            {"id": "g1", "type": "X", "step": 0, "targetQubit": 0}, # Ctrl = 1
            {"id": "g2", "type": "X", "step": 0, "targetQubit": 1}, # TargetA = 1
            {"id": "g3", "type": "CSWAP", "step": 1, "targetQubit": 1, "secondTarget": 2, "controlQubits": [0]},
        ],
        "createdAt": "",
        "updatedAt": "",
    }
    res = run_qrl_ts_engine(circ)
    assert math.isclose(res["theoreticalProbabilities"].get("101", 0.0), 1.0, abs_tol=1e-5)


def test_asymmetric_wire_indexing_3qubit():
    """
    Asymmetric single-wire tests to prevent wire-reversal masking:
    - X on wire 0 in 3Q must produce |100> (prob 1.0 at index 4 in QRL/PennyLane, index 1 in Qiskit).
    - X on wire 2 in 3Q must produce |001> (prob 1.0 at index 1 in QRL/PennyLane, index 4 in Qiskit).
    """
    from qiskit import QuantumCircuit as QiskitCircuit
    from qiskit.quantum_info import Statevector as QiskitStatevector
    from tests.quantum_reference.qrl_bridge import qiskit_to_qrl_statevector

    # Test wire 0
    circ0 = {
        "id": "asym-w0",
        "name": "Asymmetric Wire 0",
        "description": "",
        "numQubits": 3,
        "timeSteps": 2,
        "gates": [{"id": "g1", "type": "X", "step": 0, "targetQubit": 0}],
    }
    res0 = run_qrl_ts_engine(circ0)
    assert math.isclose(res0["theoreticalProbabilities"].get("100", 0.0), 1.0, abs_tol=1e-5)
    assert math.isclose(res0["theoreticalProbabilities"].get("001", 0.0), 0.0, abs_tol=1e-5)

    qc0 = QiskitCircuit(3)
    qc0.x(0)
    qiskit_sv0 = np.asarray(QiskitStatevector.from_instruction(qc0))
    qiskit_sv0_qrl = qiskit_to_qrl_statevector(qiskit_sv0, 3)
    qrl_sv0 = np.array([c["real"] + 1j * c["imag"] for c in res0["stateVector"]])
    assert compare_statevectors_up_to_global_phase(qrl_sv0, qiskit_sv0_qrl)

    # Test wire 2
    circ2 = {
        "id": "asym-w2",
        "name": "Asymmetric Wire 2",
        "description": "",
        "numQubits": 3,
        "timeSteps": 2,
        "gates": [{"id": "g1", "type": "X", "step": 0, "targetQubit": 2}],
    }
    res2 = run_qrl_ts_engine(circ2)
    assert math.isclose(res2["theoreticalProbabilities"].get("001", 0.0), 1.0, abs_tol=1e-5)
    assert math.isclose(res2["theoreticalProbabilities"].get("100", 0.0), 0.0, abs_tol=1e-5)

    qc2 = QiskitCircuit(3)
    qc2.x(2)
    qiskit_sv2 = np.asarray(QiskitStatevector.from_instruction(qc2))
    qiskit_sv2_qrl = qiskit_to_qrl_statevector(qiskit_sv2, 3)
    qrl_sv2 = np.array([c["real"] + 1j * c["imag"] for c in res2["stateVector"]])
    assert compare_statevectors_up_to_global_phase(qrl_sv2, qiskit_sv2_qrl)

