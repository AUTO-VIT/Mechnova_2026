import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { useQuizSession } from '../../hooks/useQuizSession';
import { useAuthoritativeClock } from '../../hooks/useAuthoritativeClock';
import { QuizPhaseView } from './QuizPhaseView';
import { OptionGrid } from './OptionGrid';
import { CheckCircle2, AlertTriangle, ArrowRight, Award, Zap, Loader2 } from 'lucide-react';
import { formatPoints } from '../../utils/formatters';

export function QuizEngine() {
  const { uid, teamScore } = useAuth();
  const { eventData, serverOffsetMs } = useEvent();
  const navigate = useNavigate();

  const {
    session,
    currentQuestion,
    loading,
    submitting,
    error,
    startQuiz,
    submitAnswerChoice
  } = useQuizSession(uid);

  const [selectedOption, setSelectedOption] = useState(null);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);
  const [localPhase, setLocalPhase] = useState('READ_ONLY');
  const [localDeadline, setLocalDeadline] = useState(null);

  useEffect(() => {
    if (!session && uid) {
      startQuiz(eventData?.id || 'default-event', eventData?.quizId || 'default-quiz').catch(console.error);
    }
  }, [uid, session, startQuiz, eventData]);

  useEffect(() => {
    if (session) {
      setLocalPhase(session.phase || 'READ_ONLY');
      setLocalDeadline(session.phaseDeadlineMs || (Date.now() + 10000));
    }
  }, [session]);

  const handleDeadlineReached = useCallback(() => {
    if (localPhase === 'READ_ONLY') {
      setLocalPhase('ANSWER_MODE');
      setLocalDeadline(Date.now() + serverOffsetMs + 10000);
      setSelectedOption(null);
    } else if (localPhase === 'ANSWER_MODE') {
      if (session && session.status === 'RUNNING' && !submitting && !lastSubmissionResult) {
        submitAnswerChoice({
          eventId: eventData?.id || 'default-event',
          quizId: eventData?.quizId || 'default-quiz',
          questionIndex: session.questionIndex,
          questionId: currentQuestion?.id,
          selectedOption: selectedOption
        }).then(res => {
          if (res) setLastSubmissionResult(res);
        }).catch(err => console.warn("Auto submit timeout:", err));
      }
    }
  }, [localPhase, session, submitting, lastSubmissionResult, submitAnswerChoice, eventData, currentQuestion, selectedOption, serverOffsetMs]);

  const { remainingMs } = useAuthoritativeClock(localDeadline, serverOffsetMs, handleDeadlineReached);

  const handleSelectOption = (idx) => {
    if (localPhase === 'READ_ONLY' || submitting) return;
    setSelectedOption(idx);
  };

  const handleManualSubmit = async () => {
    if (selectedOption === null || submitting || !session || !currentQuestion) return;
    try {
      const res = await submitAnswerChoice({
        eventId: eventData?.id || 'default-event',
        quizId: eventData?.quizId || 'default-quiz',
        questionIndex: session.questionIndex,
        questionId: currentQuestion.id,
        selectedOption
      });
      if (res) {
        setLastSubmissionResult(res);
        setTimeout(() => {
          setLastSubmissionResult(null);
          setSelectedOption(null);
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !session) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-red-500 mx-auto" />
        <h2 className="font-display text-xl font-bold text-white">Initializing Engine</h2>
        <p className="text-zinc-400 text-xs font-mono">Synchronizing authoritative time &amp; question stream...</p>
      </div>
    );
  }

  // Quiz Completed View
  if (session.status === 'COMPLETED') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 text-center">
        <div className="h-16 w-16 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
          <Award className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest block">
            EVALUATION COMPLETE
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Quiz Phase Finalized
          </h1>
          <p className="text-zinc-400 text-sm font-light">
            Your results have been authenticated and recorded in the immutable score ledger.
          </p>
        </div>

        {/* Score Telemetry Grid */}
        <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/[0.08]">
          <div>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
              TOTAL SCORE
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-white">
              {formatPoints(teamScore?.totalPoints || 0)} <span className="text-xs text-zinc-500 font-normal">PTS</span>
            </span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
              ANSWERED
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-zinc-300">
              {teamScore?.answeredCount || 0} / {session.totalQuestions}
            </span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
              CORRECT
            </span>
            <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">
              {teamScore?.correctCount || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white px-6 py-3 border border-white/10 rounded-full hover:bg-white/[0.04] transition-all active:scale-95"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate('/bidding')}
            className="inline-flex items-center gap-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-7 py-3 rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-md"
          >
            <span>Proceed to Bidding</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 space-y-10">
      {/* Top Telemetry & Clock */}
      <QuizPhaseView
        questionIndex={session.questionIndex}
        totalQuestions={session.totalQuestions}
        phase={localPhase}
        remainingMs={remainingMs}
        score={teamScore?.totalPoints || 0}
        category={currentQuestion?.category || "Robotics & Automation"}
      />

      {error && (
        <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded-xl font-mono text-xs text-red-300 flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Question Prompt */}
      <div className="space-y-3">
        <span className="font-mono text-xs text-red-500 uppercase tracking-widest block">
          QUESTION 0{session.questionIndex + 1}
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-relaxed">
          {currentQuestion?.prompt || "Loading prompt..."}
        </h2>
      </div>

      {/* Options Grid */}
      <div className="space-y-6 pt-2">
        <OptionGrid
          options={currentQuestion?.options || []}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          disabled={submitting || localPhase === 'READ_ONLY'}
          isReadOnly={localPhase === 'READ_ONLY'}
          submittedOption={lastSubmissionResult ? selectedOption : null}
          isCorrect={lastSubmissionResult?.isCorrect}
        />

        {localPhase === 'ANSWER_MODE' && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={selectedOption === null || submitting}
              onClick={handleManualSubmit}
              className="inline-flex items-center gap-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-md"
            >
              <span>{submitting ? "SUBMITTING..." : "CONFIRM SELECTION"}</span>
              <Zap className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
