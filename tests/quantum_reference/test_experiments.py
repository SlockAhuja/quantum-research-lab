"""
Quantum Research Lab (QRL) - Benchmark Experiments Cross-Validation Suite
Tests all 23 benchmark experiments (QRL-001 through QRL-023) against independent
Qiskit and PennyLane quantum references.
Also verifies historical archival data integrity and the 5-qubit deterministic state |11001>.
"""

import math
import numpy as np
import pytest
from qiskit.quantum_info import Statevector as QiskitStatevector

from tests.quantum_reference.qrl_bridge import (
    get_all_qrl_experiments,
    run_qrl_ts_engine,
    build_qiskit_circuit,
    simulate_pennylane_circuit,
    qiskit_to_qrl_statevector,
    compare_statevectors_up_to_global_phase,
    compare_probabilities,
)

# Fetch all 23 experiments from QRL TypeScript definition
EXPERIMENTS = get_all_qrl_experiments()


def test_experiments_count():
    """Verify that exactly 23 verified benchmark experiments are present."""
    assert len(EXPERIMENTS) == 23, f"Expected 23 benchmark experiments, found {len(EXPERIMENTS)}"


def test_qrl_001_historical_archive():
    """
    Preserve the QRL-001 archival record:
    Shots: 1,024
    Outcome 0: 532
    Outcome 1: 492
    Frequencies: approx 51.95% and 48.05%
    Explicitly labeled as a historical empirical observation.
    """
    exp1 = next((e for e in EXPERIMENTS if e["code"] == "QRL-001"), None)
    assert exp1 is not None, "QRL-001 not found in experiments"
    assert "historicalMeasurement" in exp1, "Historical measurement record missing in QRL-001"
    hm = exp1["historicalMeasurement"]
    assert hm["shots"] == 1024
    assert hm["outcome0"] == 532
    assert hm["outcome1"] == 492
    assert math.isclose(hm["frequency0"], 0.5195, abs_tol=1e-4)
    assert math.isclose(hm["frequency1"], 0.4805, abs_tol=1e-4)
    assert "Historical Benchmark" in hm["label"]


def test_qrl_023_documentation():
    """
    Verify QRL-023 is documented as a variational ansatz / proxy optimization layer.
    """
    exp23 = next((e for e in EXPERIMENTS if e["code"] == "QRL-023"), None)
    assert exp23 is not None, "QRL-023 not found"
    desc = exp23["description"] + " " + exp23["theoreticalBehavior"]
    assert "Variational" in desc or "ansatz" in desc.lower() or "VQC" in exp23["name"]


def test_five_qubit_11001_state():
    """
    Investigate the reported five-qubit result in which |11001> has amplitude 1.0000.
    In a 5-qubit register, applying Pauli-X to q0, q1, and q4 produces |11001> with 100% probability.
    Verify this mathematically across QRL, Qiskit, and PennyLane.
    """
    circ = {
        "id": "test-5q-11001",
        "name": "5-Qubit |11001> Basis State Generation",
        "description": "Applies X on q0, q1, q4 in a 5-qubit register",
        "numQubits": 5,
        "timeSteps": 2,
        "gates": [
            {"id": "g1", "type": "X", "step": 0, "targetQubit": 0},
            {"id": "g2", "type": "X", "step": 0, "targetQubit": 1},
            {"id": "g3", "type": "X", "step": 0, "targetQubit": 4},
        ],
        "createdAt": "",
        "updatedAt": "",
    }

    # QRL simulation
    qrl_res = run_qrl_ts_engine(circ)
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
    qrl_probs = qrl_res["theoreticalProbabilities"]

    # Qiskit simulation
    qc = build_qiskit_circuit(circ)
    qiskit_sv = np.asarray(QiskitStatevector.from_instruction(qc))
    qiskit_sv_qrl = qiskit_to_qrl_statevector(qiskit_sv, 5)

    # PennyLane simulation
    pl_sv = simulate_pennylane_circuit(circ)

    # Basis state 11001 in binary is decimal 25 (16 + 8 + 1)
    assert len(qrl_sv) == 32
    assert math.isclose(qrl_probs.get("11001", 0.0), 1.0, abs_tol=1e-5)
    assert math.isclose(abs(qrl_sv[25]) ** 2, 1.0, abs_tol=1e-5)
    assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl)
    assert compare_statevectors_up_to_global_phase(qrl_sv, pl_sv)


@pytest.mark.parametrize("exp", EXPERIMENTS, ids=[e["code"] for e in EXPERIMENTS])
def test_experiment_cross_validation(exp):
    """
    Cross-validates each of the 23 verified benchmark experiments against Qiskit and PennyLane.
    """
    circuit = exp["circuit"]
    n_qubits = circuit["numQubits"]

    # 1. Run QRL TypeScript Engine
    qrl_res = run_qrl_ts_engine(circuit, shots=1024)
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in qrl_res["stateVector"]])
    qrl_probs = qrl_res["theoreticalProbabilities"]

    # Check total probability normalization
    total_prob = sum(qrl_probs.values())
    assert math.isclose(total_prob, 1.0, abs_tol=1e-4), f"Probability not normalized in {exp['code']}: {total_prob}"
    assert len(qrl_sv) == (1 << n_qubits), f"Statevector dimension mismatch in {exp['code']}"

    # 2. Build and run Qiskit reference
    qc = build_qiskit_circuit(circuit)
    qiskit_sv = np.asarray(QiskitStatevector.from_instruction(qc))
    qiskit_sv_qrl = qiskit_to_qrl_statevector(qiskit_sv, n_qubits)

    # 3. Build and run PennyLane reference
    pl_sv = simulate_pennylane_circuit(circuit)

    # 4. Compare statevectors and probabilities
    assert compare_statevectors_up_to_global_phase(qrl_sv, qiskit_sv_qrl, tol=1e-4), (
        f"QRL vs Qiskit statevector mismatch for {exp['code']} ({exp['name']})"
    )
    assert compare_statevectors_up_to_global_phase(qrl_sv, pl_sv, tol=1e-4), (
        f"QRL vs PennyLane statevector mismatch for {exp['code']} ({exp['name']})"
    )
