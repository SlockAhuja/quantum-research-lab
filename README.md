# Quantum Research Lab (QRL)

> **Explore. Build. Simulate. Discover.**

Quantum Research Lab (QRL) is a scientific quantum computing workstation built with React, TypeScript, Tailwind CSS, and Three.js. It features an interactive quantum circuit studio, exact complex-matrix statevector simulation, interactive 3D Bloch sphere visualization, an archival and verified 23-experiment benchmark suite (featuring historical QRL-001 calibration data), guided educational lessons with viva-voce examination prep, continuous parameter sweep analytics, and experimental lab notebook persistence.

---

## 1. Installation, Testing, and Launch Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run the master regression & verification test suite (25/25 automated tests)
npm test

# 3. Perform TypeScript type-checking
npm run lint

# 4. Launch the local development workstation
npm run dev

# 5. Build for production deployment
npm run build
```

---

## 2. Primary Navigation & Workflows

The user experience is structured for undergraduate students, instructors, and researchers:

### Core Entry Pathways (Dashboard)
1. **Learn Quantum**: Structured interactive curriculum from single-qubit superpositions to multi-qubit entanglement, phase kickback, predict-before-run challenges, multiple-choice quizzes, and oral viva-voce questions.
2. **Build a Circuit**: Multi-wire circuit design canvas (1 to 5 qubits) with 18 unitary and measurement gates, continuous rotation angle controls ($\theta \in [0, 2\pi]$), animated timeline step inspection, and live undo/redo.
3. **Run Experiments**: 23 verified baseline quantum protocols spanning single-qubit transformations, Bell pairs, GHZ multipartite states, Grover search, and Quantum Fourier Transform.
4. **Continue Previous Session**: Live session recovery restoring user circuits, simulation results, dark/light theme, custom precision preferences, notebook journal logs, and learning progress across page refreshes.

### Advanced Research & Workspace Modules
- **Research Benchmarks & Parameter Sweep**: Continuous angle parameter sweep ($\theta \in [0, 2\pi]$) with dual-curve SVG visualization comparing analytical theoretical curves against sampled shot histograms, plus benchmark metric exports.
- **Quantum Algorithms Dossier**: Comprehensive walkthroughs of Grover's search, Deutsch-Jozsa, Bernstein-Vazirani, and 3-Qubit QFT with one-click circuit loading.
- **Quantum Machine Learning (QML)**: Feature encoding comparison (Angle, Amplitude, Basis) and parameterized ansatz optimization with gradient-step landscape tracking.
- **Lab Notebook**: Markdown-enabled experimental journal with timestamps, author tags, metrics summaries, and `.md` export.
- **Settings & Architecture**: Configurable decimal precision (2, 3, 4, 6 places), angle display unit (radians vs degrees), shot defaults, and theme switcher (Deep Navy Dark / Lab Slate Light).

---

## 3. Verified Benchmark Suite & Historical QRL-001 Data

### Archival Historical Record: QRL-001 Single-Qubit Superposition
The workstation preserves calibrated historical benchmark data distinct from theoretical calculations and new browser simulations:
- **Experiment Code**: QRL-001
- **Circuit**: Hadamard ($H$) on initial state $|0\rangle$
- **Configured Shots**: 1,024
- **Historical Observed Outcome 0**: 532 counts (51.95%)
- **Historical Observed Outcome 1**: 492 counts (48.05%)
- **Theoretical Model**: $P(|0\rangle) = 0.5000$ (50.00%), $P(|1\rangle) = 0.5000$ (50.00%)
- **Total Variation Distance**: $D_{\text{TV}} = 0.0195$
- *Classification*: Archival finite-shot empirical observation (shot noise demonstration), never overwritten by new random runs.

### 23 Verified Baseline Experiments Summary
| Code | Protocol Name | Qubits | Depth | Theoretical Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **QRL-001** | Single-Qubit Superposition | 1 | 1 | $P(\|0\rangle) = 0.5, P(\|1\rangle) = 0.5$ |
| **QRL-002** | Pauli-X Bit Flip | 1 | 1 | Deterministic $\|1\rangle$ ($P(\|1\rangle) = 1.0$) |
| **QRL-003** | Pauli-Y Bit & Phase Flip | 1 | 1 | State $i\|1\rangle$ ($P(\|1\rangle) = 1.0$) |
| **QRL-004** | Pauli-Z Phase Flip (H-Z-H) | 1 | 3 | Deterministic $\|1\rangle$ ($P(\|1\rangle) = 1.0$) |
| **QRL-005** | S Gate Quarter-Turn Phase | 1 | 2 | $(\|0\rangle + i\|1\rangle)/\sqrt{2}$, points along $+Y$ |
| **QRL-006** | T Gate Non-Clifford Gate | 1 | 2 | $(\|0\rangle + e^{i\pi/4}\|1\rangle)/\sqrt{2}$ |
| **QRL-007** | Continuous Rotation $R_X(\pi/3)$ | 1 | 1 | $P(\|0\rangle) = 0.75, P(\|1\rangle) = 0.25$ |
| **QRL-008** | Continuous Rotation $R_Y(\pi/2)$ | 1 | 1 | Real equal superposition ($P(\|0\rangle)=0.5, P(\|1\rangle)=0.5$) |
| **QRL-009** | Ramsey Sequence $R_Z(\pi)$ | 1 | 3 | Interferometric phase rotation to $\|1\rangle$ |
| **QRL-010** | Bell State $\|\Phi^+\rangle$ | 2 | 2 | $(\|00\rangle + \|11\rangle)/\sqrt{2}$, Purity = 0.5 |
| **QRL-011** | Bell State $\|\Phi^-\rangle$ | 2 | 3 | $(\|00\rangle - \|11\rangle)/\sqrt{2}$ |
| **QRL-012** | Bell State $\|\Psi^+\rangle$ | 2 | 3 | $(\|01\rangle + \|10\rangle)/\sqrt{2}$ |
| **QRL-013** | Bell State $\|\Psi^-\rangle$ (Singlet) | 2 | 4 | $(\|01\rangle - \|10\rangle)/\sqrt{2}$ |
| **QRL-014** | 3-Qubit GHZ Entanglement | 3 | 3 | $(\|000\rangle + \|111\rangle)/\sqrt{2}$ |
| **QRL-015** | 3-Qubit W State Approximation | 3 | 4 | Robust tripartite entanglement ansatz |
| **QRL-016** | 2-Qubit SWAP Verification | 2 | 3 | Swaps $\|10\rangle \to \|01\rangle$ |
| **QRL-017** | Controlled-Z Gate | 2 | 3 | Symmetric phase inversion on $\|11\rangle$ |
| **QRL-018** | Deutsch's Algorithm | 2 | 4 | 1-query balanced oracle discrimination |
| **QRL-019** | Deutsch-Jozsa Algorithm | 3 | 4 | Constant oracle produces all-zero register |
| **QRL-020** | Bernstein-Vazirani ($s="11"$) | 3 | 5 | Recovers secret string in single query |
| **QRL-021** | Grover 2-Qubit Search | 2 | 6 | 100% amplification of target state $\|11\rangle$ |
| **QRL-022** | 3-Qubit Quantum Fourier Transform | 3 | 7 | Equal probability distribution across 8 basis states |
| **QRL-023** | Variational Quantum Classifier (Ansatz) | 2 | 4 | Parameterized ansatz layer & proxy optimization |

---

## 4. Analytical Quantum Engine Specifications

The local browser simulator executes exact complex-matrix transformations without mock outputs:
- **State Representation**: $2^N$ complex statevector components ($N \le 5$, up to 32 basis amplitudes).
- **Gate Math**: Full unitary matrix operations including single-qubit arbitrary rotations ($R_X, R_Y, R_Z, P$), multi-qubit entanglers ($CX, CZ, SWAP, CCX, CSWAP$).
- **Subsystem Partial Tracing**: Traces out environment qubits to extract $2 \times 2$ reduced density matrix $\rho_k$, subsystem purity $\text{Tr}(\rho_k^2)$, and 3D Bloch coordinates $\vec{r} = (\langle X \rangle, \langle Y \rangle, \langle Z \rangle)$.
- **Measurement Sampling**: Multinomial PRNG sampling across configurable shot budgets (100 to 8,192 shots or 0-shot analytical exact).
- **Statistical Distance Metrics**: Computes exact Total Variation Distance ($D_{\text{TV}}$) and Hellinger distance against theoretical probability models.
- **Stale State Invalidation**: Modifying circuit wires immediately invalidates prior simulation results until re-executed.

---

## 5. Export Pipelines & Code Generation

QRL generates standards-compliant code for major quantum frameworks:
- **OpenQASM 2.0**: Standard format for universal circuit interchange (`qelib1.inc` headers, `qreg`, `creg`, unitary gate applications).
- **Python Qiskit**: Generates complete runnable Python scripts importing `QuantumCircuit`, `transpile`, and `AerSimulator`.
- **Python PennyLane**: Generates `@qml.qnode` decorated circuits targeting the `default.qubit` device.
- **Typed JSON Schema**: Standardized circuit serialization with schema validation on import.
- **CSV & Markdown**: Metadata tables and lab notebook journal exports.

*(Note: Code generation outputs standalone Python scripts for external execution; physical QPU connectivity requires the optional backend integration).*

---

## 6. Known Limitations & Boundaries

1. **Local Register Size**: The browser-based JavaScript simulator is scoped to registers of 1 to 5 qubits ($2^5 = 32$ complex amplitudes), ensuring instantaneous sub-millisecond execution without blocking the UI thread.
2. **Ideal Statevector Evolution**: Simulations execute ideal unitary operations with multinomial shot noise; hardware decoherence noise models ($T_1, T_2$ relaxation) are targeted for future backend extensions.
3. **Provenance Integrity**: All outputs displayed in the frontend workstation originate from the local verified matrix simulator and are labeled accordingly; no simulation is falsely claimed to originate from physical QPUs.
