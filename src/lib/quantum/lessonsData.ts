/**
 * Quantum Research Lab (QRL) - Interactive Learning Modules & Viva Guide
 * Comprehensive curriculum for beginners, students, and researchers.
 * Includes interactive predict-before-run challenges, quizzes, and viva voce practice.
 */

import { LearningLesson } from '../../types/quantum';

export const LEARNING_LESSONS: LearningLesson[] = [
  {
    id: 'lesson-1',
    title: 'From Classical Bits to Quantum Qubits',
    category: 'Foundations',
    estimatedMinutes: 12,
    summary: 'Discover how linear superpositions of |0⟩ and |1⟩ transcend binary boolean logic.',
    mathPrerequisites: ['Complex numbers', 'Vector spaces', 'Probability basics'],
    contentSections: [
      {
        title: 'The Superposition Principle',
        bodyMarkdown: `In classical computing, a bit exists strictly in state 0 or 1. A quantum bit (qubit) is a two-level quantum system represented as a normalized statevector in a 2-dimensional complex Hilbert space $\\mathbb{C}^2$:

$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$

where $\\alpha, \\beta \\in \\mathbb{C}$ are complex probability amplitudes satisfying the normalization constraint:

$$|\\alpha|^2 + |\\beta|^2 = 1$$

According to the Born rule, measuring the qubit in the computational basis $\{|0\\rangle, |1\\rangle\}$ yields outcome 0 with probability $P(0) = |\\alpha|^2$ and outcome 1 with probability $P(1) = |\\beta|^2$.`,
        keyTakeaway: 'Amplitudes can interfere constructively or destructively; probabilities are the squared moduli of amplitudes.',
      },
      {
        title: 'The Bloch Sphere Geometric Representation',
        bodyMarkdown: `Because global phase is physically unobservable ($e^{i\\gamma}|\\psi\\rangle \\equiv |\\psi\\rangle$), any pure single-qubit state can be uniquely parameterized by two real angles on the unit sphere $S^2$:

$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$

where $\\theta \\in [0, \\pi]$ is the polar (colatitude) angle and $\\phi \\in [0, 2\\pi)$ is the azimuthal angle. The state maps to Cartesian coordinates $(x, y, z) = (\\sin\\theta\\cos\\phi, \\sin\\theta\\sin\\phi, \\cos\\theta)$.`,
        keyTakeaway: 'The North pole represents |0⟩, the South pole represents |1⟩, and the equator represents equal superpositions with varying relative phases.',
      },
    ],
    challenge: {
      id: 'chal-1',
      title: 'Predict: Applying Hadamard to |0⟩',
      prompt: 'If a qubit starts in state |0⟩ and you pass it through a Hadamard (H) gate, what are the measurement probabilities in the computational basis?',
      circuit: {
        id: 'chal-circ-1',
        name: 'Hadamard on |0⟩',
        description: 'Single H gate',
        numQubits: 1,
        timeSteps: 2,
        gates: [{ id: 'g1', type: 'H', step: 0, targetQubit: 0 }],
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
      targetQubit: 0,
      possibleOutcomes: [
        { label: 'A', description: 'Deterministic 100% |0⟩' },
        { label: 'B', description: 'Equal 50% |0⟩ and 50% |1⟩' },
        { label: 'C', description: 'Deterministic 100% |1⟩' },
        { label: 'D', description: '75% |0⟩ and 25% |1⟩' },
      ],
      correctLabel: 'B',
      explanation: 'The Hadamard gate maps |0⟩ into |+⟩ = (|0⟩ + |1⟩)/√2. The squared magnitudes are |1/√2|² = 1/2 = 50% for both |0⟩ and |1⟩.',
    },
    quiz: [
      {
        id: 'q1-1',
        question: 'What is the sum of the squared moduli of statevector amplitudes |α|² + |β|² for any valid pure qubit?',
        options: ['0', '0.5', '1.0', 'Depends on the gate applied'],
        correctIndex: 2,
        hint: 'Quantum mechanics requires conservation of total probability.',
        explanation: 'Normalization enforces that the total probability of all mutually exclusive measurement outcomes must sum to exactly 1.',
      },
      {
        id: 'q1-2',
        question: 'Which state corresponds to the coordinates (1, 0, 0) on the Bloch sphere equator?',
        options: ['|0⟩', '|1⟩', '|+⟩ = (|0⟩ + |1⟩)/√2', '|-⟩ = (|0⟩ - |1⟩)/√2'],
        correctIndex: 2,
        hint: 'On the X-axis, θ = π/2 and φ = 0.',
        explanation: 'At θ = π/2, cos(π/4)|0⟩ + sin(π/4)|1⟩ = (|0⟩ + |1⟩)/√2 = |+⟩, pointing along the positive X-axis.',
      },
    ],
    vivaQuestions: [
      {
        question: 'Why can a single qubit not be cloned arbitrarily? State the theorem and its mathematical proof sketch.',
        expectedKeywords: ['No-cloning theorem', 'Unitary linearity', 'Inner product conservation', 'Wootters and Zurek'],
        modelAnswer: 'The No-Cloning Theorem states that an unknown quantum state cannot be copied by any unitary operator. Suppose U(|ψ⟩|0⟩) = |ψ⟩|ψ⟩ and U(|φ⟩|0⟩) = |φ⟩|φ⟩. Because U is unitary, ⟨ψ|φ⟩ = ⟨ψ|0|U†U|φ|0⟩ = (⟨ψ|φ⟩)². This equality only holds if ⟨ψ|φ⟩ = 0 or 1, meaning cloning is only possible for orthogonal states, never general unknown superpositions.',
        difficulty: 'Core',
      },
      {
        question: 'Explain the physical significance of the global phase versus relative phase.',
        expectedKeywords: ['Global phase', 'Relative phase', 'Interference', 'Observable', 'Bloch equator'],
        modelAnswer: 'A global phase factor e^(iγ)|ψ⟩ produces identical expectation values for every observable: ⟨ψ|e^(-iγ) A e^(iγ)|ψ⟩ = ⟨ψ|A|ψ⟩, and thus is physically undetectable. In contrast, a relative phase in (|0⟩ + e^(iφ)|1⟩)/√2 affects interference patterns when rotated into another basis (such as via Hadamard gate), shifting measurable outcome probabilities.',
        difficulty: 'Core',
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Unitary Quantum Gates & Reversibility',
    category: 'Gates & Operators',
    estimatedMinutes: 15,
    summary: 'Master single-qubit rotations, Pauli matrices, non-Clifford gates, and reversible computation.',
    mathPrerequisites: ['Matrix multiplication', 'Conjugate transpose', 'Unitary operators'],
    contentSections: [
      {
        title: 'Unitary Matrix Conditions',
        bodyMarkdown: `Every valid closed-system quantum operation is represented by a unitary operator $U$ satisfying:

$$U^{\\dagger} U = U U^{\\dagger} = I$$

where $U^{\\dagger} = (U^*)^T$ is the conjugate transpose (adjoint). Unitary evolution preserves vector norms, ensuring that $\\sum |c_i|^2 = 1$ is invariant under all quantum logic operations. This implies all quantum gates are strictly reversible without information loss.`,
        keyTakeaway: 'Quantum logic is dissipationless and reversible: the inverse gate is simply its Hermitian adjoint U†.',
      },
      {
        title: 'Pauli Operators and Rotations',
        bodyMarkdown: `The three Pauli matrices $\{X, Y, Z\}$ generate continuous rotations about the Cartesian axes:

$$R_n(\\theta) = \\exp\\left(-i \\frac{\\theta}{2} \\vec{n}\\cdot\\vec{\\sigma}\\right) = \\cos\\left(\\frac{\\theta}{2}\\right) I - i \\sin\\left(\\frac{\\theta}{2}\\right) (n_x X + n_y Y + n_z Z)$$

Any single-qubit unitary can be decomposed into Euler angle rotations: $U = e^{i\\alpha} R_z(\\beta) R_y(\\gamma) R_z(\\delta)$.`,
        keyTakeaway: 'The Pauli matrices form an orthogonal basis for the Lie algebra su(2), generating all continuous single-qubit rotations.',
      },
    ],
    challenge: {
      id: 'chal-2',
      title: 'Predict: Applying X then Z to |0⟩',
      prompt: 'If you start with |0⟩, apply an X gate, then apply a Z gate, what state do you get?',
      circuit: {
        id: 'chal-circ-2',
        name: 'X then Z gate',
        description: 'X followed by Z',
        numQubits: 1,
        timeSteps: 3,
        gates: [
          { id: 'g1', type: 'X', step: 0, targetQubit: 0 },
          { id: 'g2', type: 'Z', step: 1, targetQubit: 0 },
        ],
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
      targetQubit: 0,
      possibleOutcomes: [
        { label: 'A', description: '|0⟩' },
        { label: 'B', description: '-|1⟩' },
        { label: 'C', description: '|1⟩' },
        { label: 'D', description: 'i|0⟩' },
      ],
      correctLabel: 'B',
      explanation: 'X|0⟩ = |1⟩. Then applying Z to |1⟩ yields Z|1⟩ = -|1⟩. Notice that ZX = -XZ = -iY.',
    },
    quiz: [
      {
        id: 'q2-1',
        question: 'Which single-qubit gate satisfies U² = Z?',
        options: ['H (Hadamard)', 'S (Phase gate)', 'T (π/8 gate)', 'X (NOT gate)'],
        correctIndex: 1,
        hint: 'diag(1, i)² = diag(1, -1).',
        explanation: 'The S gate is diag(1, i). Squaring it yields diag(1², i²) = diag(1, -1) = Z. Therefore S = √Z.',
      },
      {
        id: 'q2-2',
        question: 'Why is the T gate essential for a universal fault-tolerant quantum gate set like Clifford + T?',
        options: [
          'It is the only two-qubit entangling gate',
          'It is a non-Clifford gate that breaks the classical simulability of Clifford circuits',
          'It implements error detection natively',
          'It has zero decoherence',
        ],
        correctIndex: 1,
        hint: 'Recall the Gottesman-Knill theorem.',
        explanation: 'According to the Gottesman-Knill theorem, circuits containing only Clifford gates (H, S, CNOT) can be simulated in polynomial time on a classical computer. Adding the non-Clifford T gate enables universal quantum computation.',
      },
    ],
    vivaQuestions: [
      {
        question: 'Show that the eigenvalues of any unitary matrix must have unit modulus |λ| = 1.',
        expectedKeywords: ['Eigenvalue', 'Unitary', 'Adjoint', 'Modulus 1', 'Norm preservation'],
        modelAnswer: 'Let U|v⟩ = λ|v⟩ with normalized eigenvector |v⟩ ≠ 0. Taking the inner product: ⟨v|U†U|v⟩ = ⟨v|I|v⟩ = ⟨v|v⟩. On the other hand, ⟨v|U†U|v⟩ = (λ⟨v|) (λ|v⟩) = |λ|² ⟨v|v⟩. Equating both sides gives |λ|² ⟨v|v⟩ = ⟨v|v⟩, which implies |λ|² = 1, hence |λ| = 1.',
        difficulty: 'Advanced',
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Quantum Entanglement & Bell Inequalities',
    category: 'Entanglement',
    estimatedMinutes: 18,
    summary: 'Explore non-separable quantum states, EPR paradox, reduced density matrices, and partial tracing.',
    mathPrerequisites: ['Tensor products', 'Density matrices', 'Trace and partial trace'],
    contentSections: [
      {
        title: 'Definition of Entanglement',
        bodyMarkdown: `A multi-qubit state $|\\psi\\rangle \\in \\mathcal{H}_A \\otimes \\mathcal{H}_B$ is said to be entangled (non-separable) if it cannot be written as a single tensor product of individual subsystem states:

$$|\\psi\\rangle \\neq |\\phi_A\\rangle \\otimes |\\phi_B\\rangle$$

For example, the Bell state $|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$ cannot be factored into $(a|0\\rangle + b|1\\rangle)(c|0\\rangle + d|1\\rangle)$ because that would require $ad = 0$ and $bc = 0$, contradicting $ac = 1/\\sqrt{2}$ and $bd = 1/\\sqrt{2}$.`,
        keyTakeaway: 'Measurement of one entangled subsystem instantaneously updates the probabilistic state of the other, regardless of spatial separation.',
      },
      {
        title: 'Partial Trace & Purity of Subsystems',
        bodyMarkdown: `When a composite system is in an entangled pure state $\\rho_{AB} = |\\psi\\rangle\\langle\\psi|$, the reduced state of subsystem $A$ is obtained via partial trace:

$$\\rho_A = \\text{Tr}_B(\\rho_{AB}) = \\sum_k \\langle k_B| \\rho_{AB} |k_B\\rangle$$

For a maximally entangled pair like $|\\Phi^+\\rangle$, $\\rho_A = \\frac{1}{2} I = \\begin{pmatrix} 0.5 & 0 \\\\ 0 & 0.5 \\end{pmatrix}$. Its purity is $\\text{Tr}(\\rho_A^2) = 0.5 < 1$, which means the subsystem is completely mixed! On the Bloch sphere, its Bloch vector shrinks to length $r = 0$, lying dead center at $(0, 0, 0)$.`,
        keyTakeaway: 'Maximum global entanglement corresponds to maximum local ignorance (complete entropy) in each constituent subsystem.',
      },
    ],
    challenge: {
      id: 'chal-3',
      title: 'Predict: Bell State |Φ+⟩ Z-Basis Outcomes',
      prompt: 'If you prepare (|00⟩ + |11⟩)/√2 and measure both qubits in the computational basis, what outcomes will you see?',
      circuit: {
        id: 'chal-circ-3',
        name: 'Bell state |Phi+>',
        description: 'H on q0, CNOT(0, 1)',
        numQubits: 2,
        timeSteps: 3,
        gates: [
          { id: 'g1', type: 'H', step: 0, targetQubit: 0 },
          { id: 'g2', type: 'CX', step: 1, targetQubit: 1, controlQubits: [0] },
        ],
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
      targetQubit: 0,
      possibleOutcomes: [
        { label: 'A', description: 'Equal 25% distribution across all four states |00⟩, |01⟩, |10⟩, |11⟩' },
        { label: 'B', description: '50% |00⟩ and 50% |11⟩, with zero probability for |01⟩ and |10⟩' },
        { label: 'C', description: '50% |01⟩ and 50% |10⟩' },
        { label: 'D', description: 'Deterministic 100% |00⟩' },
      ],
      correctLabel: 'B',
      explanation: 'The state amplitudes are c00 = 1/√2, c11 = 1/√2, and c01 = c10 = 0. Hence only |00⟩ and |11⟩ occur with 50% probability each.',
    },
    quiz: [
      {
        id: 'q3-1',
        question: 'What is the purity Tr(ρ²) of a single qubit traced out from a maximally entangled Bell pair?',
        options: ['1.0', '0.75', '0.5', '0.0'],
        correctIndex: 2,
        hint: 'The density matrix is ρ = I/2 = diag(0.5, 0.5).',
        explanation: 'Tr((I/2)²) = Tr(diag(0.25, 0.25)) = 0.25 + 0.25 = 0.5. A purity of 0.5 represents a maximally mixed single-qubit state.',
      },
    ],
    vivaQuestions: [
      {
        question: 'State Bell’s Theorem and explain how the CHSH inequality refutes local hidden variable theories.',
        expectedKeywords: ['CHSH inequality', 'Local realism', 'Tsirelson bound', '2*sqrt(2)', 'Classical bound 2'],
        modelAnswer: 'Bell’s theorem proves that no physical theory of local hidden variables can reproduce all quantum mechanical correlations. In the CHSH formulation, classical local realism bounds the correlation parameter |S| ≤ 2. In quantum mechanics, measuring entangled Bell pairs along appropriately rotated polarizers yields |S| = 2√2 ≈ 2.828 (Tsirelson’s bound), decisively violating the classical limit.',
        difficulty: 'Mastery',
      },
    ],
  },
  {
    id: 'lesson-4',
    title: 'Quantum Interference & Quantum Algorithms',
    category: 'Algorithms',
    estimatedMinutes: 20,
    summary: 'Harness constructive and destructive phase interference in Grover search and the Quantum Fourier Transform.',
    mathPrerequisites: ['Phase kickback', 'Orthogonal bases', 'Roots of unity'],
    contentSections: [
      {
        title: 'Constructive vs Destructive Interference',
        bodyMarkdown: `Quantum algorithms do not compute all possibilities in parallel to read them out simultaneously. Instead, they exploit quantum interference: amplitudes along undesired computational paths interfere destructively and cancel out ($c_i + (-c_i) = 0$), while amplitudes along the desired solution paths interfere constructively, concentrating probability mass into the correct measurement outcome.`,
        keyTakeaway: 'The art of quantum algorithm design is engineering phase cancelation for all incorrect answers while boosting the correct answer.',
      },
      {
        title: 'Phase Kickback Mechanism',
        bodyMarkdown: `When an oracle unitary $U_f |x\\rangle|y\\rangle = |x\\rangle|y \\oplus f(x)\\rangle$ is applied with the target qubit prepared in the $|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$ state:

$$U_f |x\\rangle |-\\rangle = (-1)^{f(x)} |x\\rangle |-\\rangle$$

Notice that the function value $f(x)$ is transferred directly into a phase factor on the control register $|x\\rangle$, leaving the target register unchanged! This phenomenon is known as Phase Kickback.`,
        keyTakeaway: 'Phase kickback encodes evaluation outputs directly into relative phases across input superpositions.',
      },
    ],
    challenge: {
      id: 'chal-4',
      title: "Predict: Grover's 2-Qubit Search",
      prompt: 'In a 2-qubit database of 4 items (|00⟩, |01⟩, |10⟩, |11⟩), how many Grover iterations are required to find the marked state |11⟩ with 100% theoretical probability?',
      circuit: {
        id: 'chal-circ-4',
        name: 'Grover 2-qubit',
        description: '1 iteration',
        numQubits: 2,
        timeSteps: 6,
        gates: [
          { id: 'g1', type: 'H', step: 0, targetQubit: 0 },
          { id: 'g2', type: 'H', step: 0, targetQubit: 1 },
          { id: 'g3', type: 'CZ', step: 1, targetQubit: 1, controlQubits: [0] },
          { id: 'g4', type: 'H', step: 2, targetQubit: 0 },
          { id: 'g5', type: 'H', step: 2, targetQubit: 1 },
        ],
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      },
      targetQubit: 0,
      possibleOutcomes: [
        { label: 'A', description: 'Exactly 1 iteration' },
        { label: 'B', description: '2 iterations' },
        { label: 'C', description: '4 iterations' },
        { label: 'D', description: 'N/2 = 2 iterations' },
      ],
      correctLabel: 'A',
      explanation: 'For N = 4 (2 qubits), the rotation angle per Grover step is θ = arcsin(1/√4) = π/6. Exactly 1 iteration rotates the statevector from the initial superposition by 2θ = π/3 to π/2, hitting the marked state with exactly 100% probability.',
    },
    quiz: [
      {
        id: 'q4-1',
        question: 'What is the asymptotic query complexity of Grover search on an unsorted database of N items?',
        options: ['O(1)', 'O(log N)', 'O(√N)', 'O(N)'],
        correctIndex: 2,
        hint: 'Classical search requires O(N) queries.',
        explanation: 'Grover’s algorithm provides a quadratic speedup, solving unsorted search in O(√N) queries compared to classical O(N).',
      },
    ],
    vivaQuestions: [
      {
        question: 'Describe the Quantum Fourier Transform (QFT). What is its circuit depth and gate count for n qubits compared to the classical FFT?',
        expectedKeywords: ['Discrete Fourier Transform', 'O(n²)', 'O(N log N) where N = 2^n', 'Exponential speedup'],
        modelAnswer: 'The QFT transforms computational basis states |j⟩ into the Fourier basis (1/√2ⁿ) ∑ exp(2πi j k / 2ⁿ) |k⟩. For an n-qubit register (representing N = 2ⁿ amplitudes), the QFT circuit uses only n(n+1)/2 = O(n²) elementary gates (Hadamards and controlled phase rotations). In contrast, the classical Fast Fourier Transform (FFT) requires O(N log N) = O(n 2ⁿ) operations, demonstrating an exponential reduction in gate count.',
        difficulty: 'Mastery',
      },
    ],
  },
];
