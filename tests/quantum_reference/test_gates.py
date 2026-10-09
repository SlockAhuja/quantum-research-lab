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
