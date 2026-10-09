# Quantum Research Lab (QRL) v2.4.0 — Release Notes

**Release Date**: October 2026  
**Tagline**: *Explore. Build. Simulate. Discover.*  
**Build Status**: Verified (25/25 Tests Passing, TypeScript Clean, Production Build Generated)

---

## 1. Overview
Quantum Research Lab (QRL) v2.4.0 is a specialized scientific workstation and educational laboratory designed for exploring quantum circuits, exact statevector dynamics, 3D Bloch sphere projections, benchmark protocols, and algorithmic interference.

---

## 2. Key Release Capabilities

### A. Analytical Simulation Engine
- **Local Matrix Simulation**: Simulates $N$-qubit registers ($1 \le N \le 5$, up to 32 complex statevector amplitudes) using exact matrix evolution.
- **Unitary Gate Registry**: Full support for Pauli operators ($I, X, Y, Z$), Clifford/Phase gates ($S, S^\dagger, T, T^\dagger$), continuous rotations ($R_X(\theta), R_Y(\theta), R_Z(\theta), P(\lambda)$), and multi-qubit entanglers ($CX, CZ, SWAP, CCX, CSWAP$).
- **Subsystem Partial Tracing**: Computes single-qubit reduced density matrices $\rho_k$, subsystem purity $\text{Tr}(\rho_k^2)$, and Bloch vector coordinates $\vec{r} = (\langle X \rangle, \langle Y \rangle, \langle Z \rangle)$.
- **Statistical Distance Metrics**: Computes exact Total Variation Distance ($D_{\text{TV}}$) and Hellinger distance against theoretical probability distributions.
- **Stale State Protection**: Circuit edits immediately invalidate previous simulation outputs until rerun.

### B. Historical QRL-001 Benchmark Preservation
- Preserved archival finite-shot benchmark calibration record for **QRL-001 (Single-Qubit Superposition)**:
  - **Configured Shots**: 1,024
  - **Outcome |0⟩**: 532 counts (51.95%)
  - **Outcome |1⟩**: 492 counts (48.05%)
  - **Theoretical Distribution**: $P(|0\rangle) = 0.5000$, $P(|1\rangle) = 0.5000$ ($D_{\text{TV}} = 0.0195$)
  - **Integrity**: Explicitly labeled as an archival empirical observation illustrating quantum shot noise, protected against overwrite by newly executed simulations.

### C. 23 Verified Benchmark Protocols
- Includes verified baseline circuits QRL-001 through QRL-023.
- **QRL-023** is scientifically documented as **Variational Quantum Classifier (Ansatz Layer & Proxy Optimization)**, accurately explaining parameterized ansatz simulation without false claims of physical QPU hardware training.

### D. Safe Client-Side Persistence
- Dedicated storage module (`src/lib/quantum/storage.ts`) with versioned schema keys (`qrl_current_circuit_v1`, `qrl_settings_v1`, `qrl_notebook_entries_v1`, `qrl_learning_progress_v1`).
- Graceful recovery and fallback to default presets upon encountering corrupted JSON, storage quota boundaries, or unavailable browser storage.
- Full workspace reset via `Storage.clearAllData()`.

### E. Multi-Framework Code Generation
- Generates standards-compliant OpenQASM 2.0, Python Qiskit (`QuantumCircuit`, `AerSimulator`), Python PennyLane (`@qml.qnode`), typed JSON schema, CSV benchmark tables, and Markdown notebook journals.

---

## 3. Explicit Boundaries & Scientific Limitations

1. **Five-Qubit Simulation Boundary**: The browser-based JavaScript simulator is strictly scoped to registers of 1 to 5 qubits ($2^5 = 32$ complex amplitudes), optimized for sub-millisecond local execution without UI lag.
2. **Ideal Statevector Evolution**: Simulations execute ideal unitary operations with multinomial shot noise; hardware decoherence noise models ($T_1, T_2$ relaxation) are reserved for future backend extensions.
3. **No Physical QPU Execution**: All displayed simulation results are calculated locally in the browser by the analytical TypeScript engine; no physical quantum hardware execution is claimed.
4. **Client-Side Storage**: All user settings, circuits, notebook entries, and learning progress reside in local browser storage; no remote database or backend authentication is used.
