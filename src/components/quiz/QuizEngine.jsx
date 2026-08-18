import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { useQuizSession } from '../../hooks/useQuizSession';
import { useAuthoritativeClock } from '../../hooks/useAuthoritativeClock';
import { QuizPhaseView } from './QuizPhaseView';
import { OptionGrid } from './OptionGrid';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { LockedPanel } from '../common/LockedPanel';
import { CheckCircle, AlertTriangle, ArrowRight, Award, Zap } from 'lucide-react';
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
    setError,
    startQuiz,
    submitAnswerChoice
  } = useQuizSession(uid);

  const [selectedOption, setSelectedOption] = useState(null);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);
  const [localPhase, setLocalPhase] = useState('READ_ONLY'); // 'READ_ONLY' | 'ANSWER_MODE'
  const [localDeadline, setLocalDeadline] = useState(null);

  // Initialize / Resume Quiz Session
  useEffect(() => {
    if (!session && uid) {
      startQuiz(eventData?.id || 'default-event', eventData?.quizId || 'default-quiz').catch(console.error);
    }
  }, [uid, session, startQuiz, eventData]);

  // Sync session state to local phase state
  useEffect(() => {
    if (session) {
      setLocalPhase(session.phase || 'READ_ONLY');
      setLocalDeadline(session.phaseDeadlineMs || (Date.now() + 10000));
    }
  }, [session]);

  // Handle phase deadline expiration via trusted clock hook
  const handleDeadlineReached = useCallback(() => {
    if (localPhase === 'READ_ONLY') {
      // 10s READ_ONLY phase ended -> transition to 10s ANSWER_MODE
      setLocalPhase('ANSWER_MODE');
      setLocalDeadline(Date.now() + serverOffsetMs + 10000);
      setSelectedOption(null);
    } else if (localPhase === 'ANSWER_MODE') {
      // 10s ANSWER_MODE phase expired -> Auto timeout submit if not submitted
      if (session && session.status === 'RUNNING' && !submitting && !lastSubmissionResult) {
        submitAnswerChoice({
          eventId: eventData?.id || 'default-event',
          quizId: eventData?.quizId || 'default-quiz',
          questionIndex: session.questionIndex,
          questionId: currentQuestion?.id,
          selectedOption: selectedOption
        }).then(res => {
          if (res) setLastSubmissionResult(res);
        }).catch(err => console.warn("Auto submit timeout error:", err));
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
        // Clear result after 1.5s for smooth next question transition
        setTimeout(() => {
          setLastSubmissionResult(null);
          setSelectedOption(null);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !session) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center font-mono">
        <div className="inline-block h-8 w-8 animate-spin border-2 border-red-500 border-t-transparent mb-4" />
        <div className="text-sm font-bold text-white">INITIALIZING AUTHORITATIVE QUIZ ENGINE...</div>
        <div className="text-xs text-zinc-500 mt-1">Calibrating server timestamps & loading question stream</div>
      </div>
    );
  }

  // Quiz Completed View
  if (session.status === 'COMPLETED') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ControlPanel
          title="QUIZ SESSION COMPLETED"
          subtitle="Evaluation Finalized"
          badge={<StatusBadge status="COMPLETED" variant="emerald" />}
          hazardBorder={false}
        >
          <div className="p-6 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-950/80 text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Award className="h-9 w-9" />
            </div>

            <div>
              <h2 className="font-mono text-2xl font-black text-white">
                ALL QUESTIONS COMPLETED
              </h2>
              <p className="font-mono text-xs text-zinc-400 mt-1">
                Your answers have been evaluated on trusted Cloud Functions and written to the immutable score record.
              </p>
            </div>

            <div className="border border-white/10 bg-black p-6 grid grid-cols-3 gap-4 font-mono">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">FINAL SCORE</div>
                <div className="text-2xl font-black text-red-500">{formatPoints(teamScore?.totalPoints || 0)} PTS</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">ANSWERED</div>
                <div className="text-2xl font-black text-amber-400">{teamScore?.answeredCount || 0} / {session.totalQuestions}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">ACCURACY</div>
                <div className="text-2xl font-black text-emerald-400">{teamScore?.correctCount || 0} CORRECT</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="border border-zinc-700 bg-zinc-900 px-6 py-3 font-mono text-xs font-bold uppercase text-zinc-200 hover:bg-zinc-800 active:scale-[0.97]"
              >
                RETURN TO TEAM HUB
              </button>
              <button
                type="button"
                onClick={() => navigate('/bidding')}
                className="bg-red-600 px-6 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-red-500 active:scale-[0.97] flex items-center gap-2"
              >
                <span>PROCEED TO THEME BIDDING</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </ControlPanel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Top HUD Viewport */}
      <QuizPhaseView
        questionIndex={session.questionIndex}
        totalQuestions={session.totalQuestions}
        phase={localPhase}
        remainingMs={remainingMs}
        score={teamScore?.totalPoints || 0}
        category={currentQuestion?.category || "Robotics & Automation"}
      />

      {error && (
        <div className="border border-red-500/50 bg-red-950/60 p-3 font-mono text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Question Prompt Card */}
      <ControlPanel
        title={`QUESTION 0${session.questionIndex + 1}`}
        subtitle="Prompt Description"
        badge={
          <StatusBadge
            status={localPhase === 'READ_ONLY' ? "10S READ MODE" : "10S ANSWER MODE"}
            variant={localPhase === 'READ_ONLY' ? "red" : "emerald"}
          />
        }
      >
        <div className="py-2">
          <p className="font-mono text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQuestion?.prompt || "Loading prompt definition..."}
          </p>
        </div>
      </ControlPanel>

      {/* 4 Option Selection Grid */}
      <ControlPanel title="MULTIPLE CHOICE OPTIONS" subtitle="Select One Answer (Key 1-4 or A-D)">
        <OptionGrid
          options={currentQuestion?.options || []}
          selectedOption={selectedOption}
          onSelectOption={handleSelectOption}
          disabled={submitting || localPhase === 'READ_ONLY'}
          isReadOnly={localPhase === 'READ_ONLY'}
          submittedOption={lastSubmissionResult ? selectedOption : null}
          isCorrect={lastSubmissionResult?.isCorrect}
        />

        {/* Submit Action Button */}
        {localPhase === 'ANSWER_MODE' && (
          <div className="mt-6 border-t border-zinc-800 pt-4 flex justify-end">
            <button
              type="button"
              disabled={selectedOption === null || submitting}
              onClick={handleManualSubmit}
              className="bg-red-600 px-8 py-3 font-mono text-xs font-extrabold uppercase tracking-widest text-white transition-all hover:bg-red-500 active:scale-[0.97] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2"
            >
              <span>{submitting ? "SUBMITTING..." : "CONFIRM ANSWER"}</span>
              <Zap className="h-4 w-4" />
            </button>
          </div>
        )}
      </ControlPanel>
    </div>
  );
}
