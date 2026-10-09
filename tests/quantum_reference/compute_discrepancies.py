"""
Diagnostic script: computes exact maximum numerical discrepancies across all 23 experiments
and differential tests between QRL, Qiskit, and PennyLane.
"""

import math
import numpy as np
from qiskit.quantum_info import Statevector as QiskitStatevector
from tests.quantum_reference.qrl_bridge import (
    get_all_qrl_experiments,
    run_qrl_ts_engine,
    build_qiskit_circuit,
    simulate_pennylane_circuit,
    qiskit_to_qrl_statevector,
)

experiments = get_all_qrl_experiments()
print("=" * 80)
print(f"{'Code':<10} {'Name':<35} {'Qubits':<8} {'Max Err Qiskit':<16} {'Max Err PennyLane':<16}")
print("=" * 80)

max_qiskit_err = 0.0
max_pl_err = 0.0
max_norm_err = 0.0

for exp in experiments:
    circ = exp["circuit"]
    n = circ["numQubits"]
    
    # 1. QRL
    res = run_qrl_ts_engine(circ)
    qrl_sv = np.array([c["real"] + 1j * c["imag"] for c in res["stateVector"]])
    norm = np.sum(np.abs(qrl_sv) ** 2)
    max_norm_err = max(max_norm_err, abs(norm - 1.0))
    
    # 2. Qiskit
    qc = build_qiskit_circuit(circ)
    qiskit_sv = np.asarray(QiskitStatevector.from_instruction(qc))
    qiskit_sv_qrl = qiskit_to_qrl_statevector(qiskit_sv, n)
    
    # Phase align at max amplitude
    idx = int(np.argmax(np.abs(qrl_sv)))
    if abs(qrl_sv[idx]) > 1e-6 and abs(qiskit_sv_qrl[idx]) > 1e-6:
        pf = qiskit_sv_qrl[idx] / qrl_sv[idx]
        pf = pf / abs(pf)
        aligned_qrl = qrl_sv * pf
        err_qiskit = float(np.max(np.abs(aligned_qrl - qiskit_sv_qrl)))
    else:
        err_qiskit = float(np.max(np.abs(qrl_sv - qiskit_sv_qrl)))
    max_qiskit_err = max(max_qiskit_err, err_qiskit)
    
    # 3. PennyLane
    pl_sv = simulate_pennylane_circuit(circ)
    if abs(qrl_sv[idx]) > 1e-6 and abs(pl_sv[idx]) > 1e-6:
        pf_pl = pl_sv[idx] / qrl_sv[idx]
        pf_pl = pf_pl / abs(pf_pl)
        aligned_qrl_pl = qrl_sv * pf_pl
        err_pl = float(np.max(np.abs(aligned_qrl_pl - pl_sv)))
    else:
        err_pl = float(np.max(np.abs(qrl_sv - pl_sv)))
    max_pl_err = max(max_pl_err, err_pl)
    
    print(f"{exp['code']:<10} {exp['name'][:34]:<35} {n:<8} {err_qiskit:<16.2e} {err_pl:<16.2e}")

print("=" * 80)
print(f"MAX OBSERVED NORMALIZATION DEVIATION: {max_norm_err:.2e}")
print(f"MAX OBSERVED QISKIT STATEVECTOR DEVIATION: {max_qiskit_err:.2e}")
print(f"MAX OBSERVED PENNYLANE STATEVECTOR DEVIATION: {max_pl_err:.2e}")
print("=" * 80)
