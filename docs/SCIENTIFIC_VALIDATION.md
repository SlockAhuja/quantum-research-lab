# Quantum Research Lab (QRL) — Scientific Validation & Formalisms

**Version:** 2.5.0  
**Status:** Scientifically Validated against Qiskit 2.5+, Qiskit Aer 0.17+, PennyLane 0.45+, NumPy 2.5+  
**Target Register:** $N \le 5$ Ideal Pure-State Simulator ($2^N \le 32$ basis states)

---

## 1. Executive Summary & Scientific Baseline

The Quantum Research Lab (QRL) simulation engine implements an exact statevector evolution for discrete-time quantum circuits on up to 5 qubits. All quantum transformations, matrix tensor products, statevector updates, basis state probabilities, reduced density matrices, and measurement collapse procedures have been cross-validated against independent implementations in **Qiskit** and **PennyLane**.

---

## 2. Mathematical Formalisms

### 2.1 State Representation & Normalization
The state of an $N$-qubit register is represented by a normalized complex statevector $|\psi\rangle \in \mathbb{C}^{2^N}$:
$$|\psi\rangle = \sum_{j=0}^{2^N-1} c_j |j\rangle, \quad c_j \in \mathbb{C}$$
where $|j\rangle = |b_0 b_1 \dots b_{N-1}\rangle$ is the computational basis state indexed in big-endian binary representation.

**Normalization Condition:**
$$\langle \psi | \psi \rangle = \sum_{j=0}^{2^N-1} |c_j|^2 = \sum_{j=0}^{2^N-1} \left( \text{Re}(c_j)^2 + \text{Im}(c_j)^2 \right) = 1.0 \pm 10^{-5}$$

### 2.2 Gate Matrices & Transformations

#### Single-Qubit Unitary Operators
- **Identity ($I$):**
  $$\begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$$
- **Hadamard ($H$):**
  $$\frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$
- **Pauli-X ($X$ / NOT):**
  $$\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$$
- **Pauli-Y ($Y$):**
  $$\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$$
- **Pauli-Z ($Z$):**
  $$\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$
- **Phase Gate ($S$ / $\sqrt{Z}$):**
  $$\begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}$$
- **$T$ Gate ($\sqrt{S}$ / $\pi/8$):**
  $$\begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix} = \begin{pmatrix} 1 & 0 \\ 0 & \frac{1+i}{\sqrt{2}} \end{pmatrix}$$
- **Rotation Operators ($R_X, R_Y, R_Z$):**
  $$R_X(\theta) = \exp\left(-i\frac{\theta}{2}X\right) = \begin{pmatrix} \cos(\theta/2) & -i\sin(\theta/2) \\ -i\sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$
  $$R_Y(\theta) = \exp\left(-i\frac{\theta}{2}Y\right) = \begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$$
  $$R_Z(\theta) = \exp\left(-i\frac{\theta}{2}Z\right) = \begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$$

#### Multi-Qubit Controlled Gates
- **Controlled-NOT ($CX$ / CNOT):** Flips target qubit if control qubit is $|1\rangle$.
- **Controlled-Phase ($CZ$):** Inverts phase if both control and target are $|1\rangle$.
- **SWAP:** Exchanges the states of two qubits.
- **Toffoli ($CCX$):** Controlled-controlled-NOT.
- **Fredkin ($CSWAP$):** Controlled-SWAP.

---

## 3. Convention Alignment Between Frameworks

Different quantum computing frameworks employ differing qubit index conventions and wire orderings:

| Feature | QRL (TypeScript) | PennyLane (`default.qubit`) | Qiskit (`QuantumCircuit`) |
| :--- | :--- | :--- | :--- |
| **Qubit Indexing** | Qubit 0 is top wire | Qubit 0 is top wire | Qubit 0 is bottom / LSB wire |
| **Basis State Ordering** | Big-Endian: $\|q_0 q_1 \dots q_{n-1}\rangle$ | Big-Endian: $\|q_0 q_1 \dots q_{n-1}\rangle$ | Little-Endian: $\|q_{n-1} \dots q_0\rangle$ |
| **Statevector Index $k$** | $(b_0 b_1 \dots b_{n-1})_2$ | $(b_0 b_1 \dots b_{n-1})_2$ | $(b_{n-1} \dots b_0)_2$ |
| **Global Phase** | Canonical matrix multiplication | Canonical unitary action | Canonical unitary action (modulo global $e^{i\phi}$) |

### Wire-Ordering Transformation Formula
To convert a Qiskit statevector $|\psi_{\text{qiskit}}\rangle$ to the QRL / PennyLane convention $|\psi_{\text{QRL}}\rangle$:
$$j = \text{reverse\_bits}(i, N) \implies |\psi_{\text{QRL}}\rangle_j = |\psi_{\text{qiskit}}\rangle_i$$

### Gauge Invariance (Global Phase Comparison)
Two statevectors $|\psi_1\rangle$ and $|\psi_2\rangle$ represent identical physical quantum states if and only if there exists $\phi \in \mathbb{R}$ such that:
$$|\psi_2\rangle = e^{i\phi} |\psi_1\rangle$$
The validation suite evaluates gauge invariance using:
1. Optimal phase alignment factor $\alpha = \frac{\langle \psi_{\text{max}} | \psi_2 \rangle}{|\langle \psi_{\text{max}} | \psi_2 \rangle|}$ computed at the maximal amplitude index.
2. Quantum fidelity: $\mathcal{F}(|\psi_1\rangle, |\psi_2\rangle) = |\langle \psi_1 | \psi_2 \rangle|^2 \ge 1 - 10^{-4}$.

---

## 4. UI & Mathematical Contract

1. **Statevector Length:** For an $N$-qubit circuit, the statevector contains exactly $2^N$ amplitudes.
2. **Complex Display:** Amplitudes are rendered with both real and imaginary components.
3. **Phase Representation:** The relative phase $\theta = \text{atan2}(\text{Im}, \text{Re})$ is undefined when the amplitude magnitude $|c_j| \approx 0$ (probability $< 10^{-4}$). In QRL, these states explicitly display `N/A` rather than a misleading `0.0°`.
4. **Stale State Invalidation:** Circuit modifications immediately increment the circuit version and flag previous results as stale until rerun.
5. **Separation of Concerns:**
   - Theoretical probabilities $P(|j\rangle) = |c_j|^2$ are computed deterministically from the unitary statevector.
   - Empirical counts are generated by finite-shot pseudo-random sampling.

---

## 5. Subsystem Purity & Density Matrix Partial Trace

For an $N$-qubit pure state $\rho = |\psi\rangle\langle\psi|$, the single-qubit reduced density matrix for qubit $k$ is calculated by taking the partial trace over all remaining qubits $\bar{k}$:
$$\rho_k = \text{Tr}_{\bar{k}}(\rho) = \begin{pmatrix} \rho_{00} & \rho_{01} \\ \rho_{10} & \rho_{11} \end{pmatrix}$$

The **purity** $\gamma_k$ is:
$$\gamma_k = \text{Tr}(\rho_k^2) = \rho_{00}^2 + \rho_{11}^2 + 2|\rho_{01}|^2$$

- For an unentangled pure state: $\gamma_k = 1.0$.
- For a maximally entangled Bell state $(|00\rangle + |11\rangle)/\sqrt{2}$: $\rho_0 = \begin{pmatrix} 0.5 & 0 \\ 0 & 0.5 \end{pmatrix} \implies \gamma_0 = 0.5^2 + 0.5^2 = 0.5000$.

---

## 6. Scientific Tolerances

| Metric | Allowable Tolerance | Test Outcome |
| :--- | :--- | :--- |
| **Probability Normalization $\sum P_i$** | $|1.0 - \sum P_i| \le 10^{-4}$ | **PASS** |
| **Statevector Amplitude Tolerance** | $\|c_{\text{QRL}} - c_{\text{Ref}}\|_\infty \le 10^{-4}$ | **PASS** |
| **Quantum State Fidelity $\mathcal{F}$** | $\ge 0.9999$ | **PASS** |
| **Finite-Shot Count Conservation** | $\sum C_i = \text{shots}$ (exact integer) | **PASS** |
| **Single-Qubit Subsystem Purity (Bell)** | $|0.5000 - \gamma_0| \le 10^{-4}$ | **PASS** |
