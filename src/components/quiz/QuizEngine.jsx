import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { useQuizSession } from '../../hooks/useQuizSession';
import { useAuthoritativeClock } from '../../hooks/useAuthoritativeClock';
import { OptionGrid } from './OptionGrid';
import { CheckCircle2, AlertTriangle, ArrowRight, Award, Zap, Loader2, Radio, Lock, Clock, Shield } from 'lucide-react';
import { formatPoints, formatTimestamp } from '../../utils/formatters';

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
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const progressPercent = Math.min(100, Math.max(0, (remainingMs / 10000) * 100));
  const isReadOnly = localPhase === 'READ_ONLY';

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
        <Loader2 className="h-8 w-8 animate-spin text-[#B26FCB] mx-auto" />
        <h2 className="font-sans text-xl font-bold text-white">Initializing Engine</h2>
        <p className="text-zinc-400 text-xs font-mono">Synchronizing authoritative time &amp; question stream...</p>
      </div>
    );
  }

  // Quiz Completed View
  if (session.status === 'COMPLETED') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10 text-center">
        <div className="h-20 w-20 rounded-full border border-[#B26FCB]/40 bg-[#221545]/80 flex items-center justify-center mx-auto text-[#B26FCB] shadow-[0_0_30px_rgba(178,111,203,0.3)]">
          <Award className="h-10 w-10" />
        </div>

        <div className="space-y-3">
          <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-widest block font-bold">
            EVALUATION COMPLETE
          </span>
          <h1 className="font-sans text-4xl sm:text-5xl font-bold text-white">
            Quiz Phase Finalized
          </h1>
          <p className="text-zinc-300 text-base font-light max-w-xl mx-auto">
            Your results have been authenticated and recorded in the immutable score ledger.
          </p>
        </div>

        {/* Score Telemetry Grid */}
        <div className="grid grid-cols-3 gap-6 py-10 border-y border-[#855AB4]/20">
          <div>
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest block mb-2">
              TOTAL SCORE
            </span>
            <span className="font-mono text-3xl sm:text-5xl font-bold text-white">
              {formatPoints(teamScore?.totalPoints || 0)} <span className="text-sm text-[#B26FCB] font-normal">PTS</span>
            </span>
          </div>
          <div>
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest block mb-2">
              ANSWERED
            </span>
            <span className="font-mono text-3xl sm:text-5xl font-bold text-zinc-300">
              {teamScore?.answeredCount || 0} <span className="text-sm text-zinc-500 font-normal">/ {session.totalQuestions}</span>
            </span>
          </div>
          <div>
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest block mb-2">
              ACCURACY
            </span>
            <span className="font-mono text-3xl sm:text-5xl font-bold text-[#B26FCB]">
              {teamScore?.correctCount || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white px-8 py-3.5 border border-[#855AB4]/30 rounded-full hover:bg-[#221545]/60 transition-all active:scale-95"
          >
            Return Home
          </button>
          <button
            type="button"
            onClick={() => navigate('/bidding')}
            className="inline-flex items-center gap-2 bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all active:scale-95 shadow-[0_0_30px_rgba(178,111,203,0.4)] border border-[#B26FCB]/40"
          >
            <span>Proceed to Bidding</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10">
      {/* 1080p Widescreen Dual Wing Quiz Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
        {/* Left Telemetry HUD (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-[#855AB4]/30 rounded-3xl p-7 bg-[#221545]/70 backdrop-blur-2xl space-y-6 sticky top-28 shadow-[0_0_40px_rgba(104,56,141,0.2)]">
            <div className="flex items-center justify-between border-b border-[#855AB4]/20 pb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-white font-bold tracking-widest uppercase">
                <Radio className="h-3.5 w-3.5 text-[#B26FCB] animate-pulse" />
                <span>QUIZ TELEMETRY</span>
              </div>
              <span className={`font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                isReadOnly ? 'bg-[#B26FCB]/15 text-[#B26FCB] border-[#B26FCB]/40' : 'bg-[#68388D]/30 text-white border-[#855AB4]/50'
              }`}>
                {isReadOnly ? 'READ MODE' : 'ANSWER MODE'}
              </span>
            </div>

            {/* Countdown Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-400 uppercase">
                  {isReadOnly ? "Read Prompt Window" : "Answer Selection Window"}
                </span>
                <span className="font-mono text-xl font-black text-white tracking-widest">
                  00:{String(remainingSeconds).padStart(2, '0')}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ease-linear rounded-full ${
                    isReadOnly ? 'bg-[#B26FCB] shadow-[0_0_12px_rgba(178,111,203,1)]' : 'bg-[#855AB4] shadow-[0_0_12px_rgba(133,90,180,1)]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Progress & Points */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#855AB4]/20">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">
                  PROGRESS
                </span>
                <span className="font-mono text-2xl font-bold text-white">
                  0{session.questionIndex + 1} <span className="text-zinc-500 font-normal text-sm">/ 0{session.totalQuestions}</span>
                </span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">
                  TOTAL SCORE
                </span>
                <span className="font-mono text-2xl font-bold text-[#B26FCB]">
                  {formatPoints(teamScore?.totalPoints || 0)} <span className="text-xs text-zinc-400 font-normal">PTS</span>
                </span>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="rounded-2xl border border-[#855AB4]/20 bg-[#110515]/50 p-4 font-mono text-xs text-zinc-300 space-y-1">
              <span className="text-[#B26FCB] text-[10px] uppercase tracking-wider block font-bold">KEYBOARD SHORTCUTS</span>
              <div className="flex items-center justify-between text-zinc-300">
                <span>Select Choice:</span>
                <span className="text-white font-bold">1, 2, 3, 4 or A, B, C, D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Arena (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {error && (
            <div className="border border-red-500/30 bg-red-500/10 p-4 rounded-2xl font-mono text-xs text-red-300 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Question Prompt */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#B26FCB] font-bold uppercase tracking-widest">
                QUESTION 0{session.questionIndex + 1}
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {currentQuestion?.category || "Robotics & Autonomous Systems"}
              </span>
            </div>

            <h2 className="font-sans text-2xl sm:text-4xl font-bold text-white leading-snug">
              {currentQuestion?.prompt || "Loading question prompt..."}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="space-y-6 pt-4">
            <OptionGrid
              options={currentQuestion?.options || []}
              selectedOption={selectedOption}
              onSelectOption={handleSelectOption}
              disabled={submitting || isReadOnly}
              isReadOnly={isReadOnly}
              submittedOption={lastSubmissionResult ? selectedOption : null}
              isCorrect={lastSubmissionResult?.isCorrect}
            />

            {/* Action Bar */}
            {!isReadOnly && (
              <div className="flex items-center justify-between pt-4 border-t border-[#855AB4]/20">
                <span className="font-mono text-xs text-zinc-400">
                  {selectedOption !== null ? "Option selected & ready" : "Choose one option above"}
                </span>

                <button
                  type="button"
                  disabled={selectedOption === null || submitting}
                  onClick={handleManualSubmit}
                  className="inline-flex items-center gap-2 bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-9 py-4 rounded-full transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-[0_0_30px_rgba(178,111,203,0.4)] border border-[#B26FCB]/40"
                >
                  <span>{submitting ? "SUBMITTING..." : "CONFIRM SELECTION"}</span>
                  <Zap className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
