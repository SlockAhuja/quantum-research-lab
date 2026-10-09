/**
 * Quantum Research Lab (QRL) - Learning Mode & Viva Practice
 * Guided courses, predict-before-run interactive tests, quizzes, and practical viva voce exam preparation.
 */

import React, { useState, useEffect } from 'react';
import { LEARNING_LESSONS } from '../../lib/quantum/lessonsData';
import { LearningLesson, PredictChallenge } from '../../types/quantum';
import { runQuantumSimulation } from '../../lib/quantum/engine';
import { Storage, LearningProgress } from '../../lib/quantum/storage';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  Eye,
  Lightbulb,
} from 'lucide-react';

interface LearnQuantumProps {
  onLoadChallengeCircuit?: (circuit: any) => void;
}

export const LearnQuantum: React.FC<LearnQuantumProps> = ({ onLoadChallengeCircuit }) => {
  const [learningProgress, setLearningProgress] = useState<LearningProgress>(() =>
    Storage.loadLearningProgress()
  );

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    learningProgress.lastActiveLessonId || LEARNING_LESSONS[0].id
  );
  const [activeSectionTab, setActiveSectionTab] = useState<'theory' | 'challenge' | 'quiz' | 'viva'>('theory');

  // Challenge execution state
  const [userChallengeChoice, setUserChallengeChoice] = useState<string | null>(null);
  const [challengeResultRevealed, setChallengeResultRevealed] = useState<boolean>(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [activeHintId, setActiveHintId] = useState<string | null>(null);

  // Viva state (revealed answers)
  const [revealedViva, setRevealedViva] = useState<Record<number, boolean>>({});

  // Sync progress to storage
  useEffect(() => {
    Storage.saveLearningProgress(learningProgress);
  }, [learningProgress]);

  const currentLesson = LEARNING_LESSONS.find((l) => l.id === selectedLessonId) || LEARNING_LESSONS[0];

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setLearningProgress((prev) => ({ ...prev, lastActiveLessonId: lessonId }));
    setUserChallengeChoice(null);
    setChallengeResultRevealed(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setActiveHintId(null);
    setRevealedViva({});
  };

  const handleExecuteChallenge = () => {
    if (!userChallengeChoice) return;
    setChallengeResultRevealed(true);
    if (userChallengeChoice === currentLesson.challenge?.correctLabel) {
      setLearningProgress((prev) => ({
        ...prev,
        completedLessons: { ...prev.completedLessons, [currentLesson.id]: true },
        challengeCompleted: { ...prev.challengeCompleted, [currentLesson.challenge!.id]: true },
      }));
    }
  };

  const handleSelectQuizOption = (qId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const calculateQuizScore = () => {
    let score = 0;
    currentLesson.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) score++;
    });
    return score;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#07090e] text-slate-100 overflow-hidden">
      {/* Left Sidebar: Lesson Curriculum Catalog */}
      <div className="w-full lg:w-72 bg-[#0d121f] border-r border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <GraduationCap className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-200">Quantum Curriculum</h2>
            <div className="text-[11px] text-slate-400 font-mono">Foundations to Algorithms</div>
          </div>
        </div>

        <div className="space-y-2">
          {LEARNING_LESSONS.map((lesson, idx) => {
            const isSelected = lesson.id === selectedLessonId;
            const isDone = learningProgress.completedLessons[lesson.id];

            return (
              <button
                key={lesson.id}
                onClick={() => handleSelectLesson(lesson.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 text-slate-100 shadow-md'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="text-cyan-400 font-semibold">{lesson.category}</span>
                  {isDone ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span>{lesson.estimatedMinutes} min</span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-200 leading-snug">
                  {idx + 1}. {lesson.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Lesson Navigation Header */}
        <div className="px-6 py-4 bg-[#0d121f] border-b border-slate-800 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                {currentLesson.category}
              </span>
              <h1 className="text-lg font-bold text-slate-100 mt-0.5">{currentLesson.title}</h1>
            </div>

            {/* Sub-section tab buttons */}
            <div className="flex bg-[#07090e] p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveSectionTab('theory')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  activeSectionTab === 'theory' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Theory & Math
              </button>
              <button
                onClick={() => setActiveSectionTab('challenge')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  activeSectionTab === 'challenge' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Predict-Before-Run
              </button>
              <button
                onClick={() => setActiveSectionTab('quiz')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  activeSectionTab === 'quiz' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Quiz
              </button>
              <button
                onClick={() => setActiveSectionTab('viva')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  activeSectionTab === 'viva' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Viva Voce
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* TAB 1: THEORY */}
            {activeSectionTab === 'theory' && (
              <div className="space-y-6">
                <div className="bg-[#0d121f] p-4 rounded-lg border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Lesson Abstract
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentLesson.summary}</p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono text-cyan-400">Prerequisites:</span>
                    <span>{currentLesson.mathPrerequisites.join(' · ')}</span>
                  </div>
                </div>

                {/* Section Sections */}
                {currentLesson.contentSections.map((sec, idx) => (
                  <div key={idx} className="bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-slate-800 text-cyan-400 flex items-center justify-center font-mono text-xs">
                        {idx + 1}
                      </span>
                      {sec.title}
                    </h3>

                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                      {sec.bodyMarkdown}
                    </div>

                    <div className="mt-3 p-3 rounded bg-[#07090e] border border-cyan-500/20 text-xs text-cyan-300">
                      <span className="font-semibold text-cyan-400">Core Takeaway: </span>
                      {sec.keyTakeaway}
                    </div>
                  </div>
                ))}

                {/* Next Step Banner */}
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-xs text-slate-300">
                    Ready to test your intuition with interactive simulation?
                  </div>
                  <button
                    onClick={() => setActiveSectionTab('challenge')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded transition-colors"
                  >
                    <span>Proceed to Predict-Before-Run Challenge</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: PREDICT-BEFORE-RUN CHALLENGE */}
            {activeSectionTab === 'challenge' && currentLesson.challenge && (
              <div className="bg-[#0d121f] p-6 rounded-lg border border-slate-800 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Predict-Before-Run Challenge</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{currentLesson.challenge.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {currentLesson.challenge.prompt}
                  </p>
                </div>

                {/* Outcome Choices */}
                <div className="space-y-2">
                  {currentLesson.challenge.possibleOutcomes.map((opt) => {
                    const isSelected = userChallengeChoice === opt.label;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => {
                          if (!challengeResultRevealed) setUserChallengeChoice(opt.label);
                        }}
                        disabled={challengeResultRevealed}
                        className={`w-full text-left p-3.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-200'
                            : 'bg-[#07090e] border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-200">
                            {opt.label}
                          </span>
                          <span>{opt.description}</span>
                        </div>

                        {isSelected && !challengeResultRevealed && (
                          <span className="text-[11px] font-mono text-cyan-400">Selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit button */}
                {!challengeResultRevealed ? (
                  <button
                    onClick={handleExecuteChallenge}
                    disabled={!userChallengeChoice}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Quantum Simulator to Verify Prediction</span>
                  </button>
                ) : (
                  <div className="space-y-4 pt-2">
                    {/* Result Callout */}
                    <div
                      className={`p-4 rounded-lg border text-xs ${
                        userChallengeChoice === currentLesson.challenge.correctLabel
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {userChallengeChoice === currentLesson.challenge.correctLabel ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Prediction Verified Correct! (+50 XP)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Prediction Discrepancy Observed</span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-300 mt-1 leading-relaxed">
                        {currentLesson.challenge.explanation}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setChallengeResultRevealed(false);
                          setUserChallengeChoice(null);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Try Another Hypothesis</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: QUIZ */}
            {activeSectionTab === 'quiz' && (
              <div className="space-y-5">
                {currentLesson.quiz.map((q, qIndex) => {
                  const selectedOpt = quizAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div key={q.id} className="bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-semibold text-slate-200 leading-snug">
                          {qIndex + 1}. {q.question}
                        </h4>

                        <button
                          onClick={() => setActiveHintId(activeHintId === q.id ? null : q.id)}
                          className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 shrink-0 ml-2"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Hint</span>
                        </button>
                      </div>

                      {activeHintId === q.id && (
                        <div className="p-2.5 rounded bg-slate-900 border border-cyan-500/30 text-[11px] text-cyan-300">
                          Hint: {q.hint}
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionChosen = selectedOpt === optIdx;
                          let borderClass = 'border-slate-800 hover:border-slate-700';

                          if (quizSubmitted) {
                            if (optIdx === q.correctIndex) {
                              borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                            } else if (isOptionChosen && !isCorrect) {
                              borderClass = 'border-rose-500 bg-rose-500/10 text-rose-300';
                            }
                          } else if (isOptionChosen) {
                            borderClass = 'border-cyan-500 bg-cyan-500/10 text-cyan-200';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(q.id, optIdx)}
                              className={`w-full text-left p-3 rounded border text-xs transition-colors flex items-center justify-between ${borderClass}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-2 text-xs text-slate-400 p-2.5 rounded bg-[#07090e] border border-slate-800/80">
                          <span className="font-semibold text-slate-300">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Submit Quiz CTA */}
                <div className="flex items-center justify-between p-4 bg-[#0d121f] rounded-lg border border-slate-800">
                  {quizSubmitted ? (
                    <div className="text-xs font-mono">
                      Your Score: <span className="text-cyan-400 font-bold">{calculateQuizScore()} / {currentLesson.quiz.length}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      Answer all questions to test your theoretical mastery.
                    </div>
                  )}

                  {!quizSubmitted ? (
                    <button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < currentLesson.quiz.length}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded transition-colors"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded transition-colors"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: VIVA VOCE EXAM QUESTIONS */}
            {activeSectionTab === 'viva' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#0d121f] rounded-lg border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    University Practical Examination & Viva-Voce Practice
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Standard oral examination questions asked by university professors and research panels, complete with required keywords and model responses.
                  </p>
                </div>

                {currentLesson.vivaQuestions.map((vq, vIdx) => {
                  const isRevealed = revealedViva[vIdx];

                  return (
                    <div key={vIdx} className="bg-[#0d121f] p-5 rounded-lg border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-cyan-400 uppercase mb-1">
                            Difficulty: {vq.difficulty}
                          </div>
                          <h4 className="text-xs font-bold text-slate-100">{vq.question}</h4>
                        </div>

                        <button
                          onClick={() =>
                            setRevealedViva((prev) => ({ ...prev, [vIdx]: !prev[vIdx] }))
                          }
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-300 hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isRevealed ? 'Hide Answer' : 'Reveal Model Answer'}</span>
                        </button>
                      </div>

                      {/* Required Keywords Tag Strip (Unboxed zero-pill text) */}
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-slate-500">Expected Keywords:</span>
                        {vq.expectedKeywords.map((kw, ki) => (
                          <React.Fragment key={ki}>
                            <span className="text-slate-300">{kw}</span>
                            {ki < vq.expectedKeywords.length - 1 && <span className="text-slate-600">·</span>}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Model Answer Drawer */}
                      {isRevealed && (
                        <div className="mt-3 p-3.5 bg-[#07090e] rounded border border-cyan-500/20 text-xs text-slate-300 leading-relaxed font-sans">
                          <div className="font-semibold text-cyan-400 mb-1">Model Scientific Response:</div>
                          {vq.modelAnswer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
