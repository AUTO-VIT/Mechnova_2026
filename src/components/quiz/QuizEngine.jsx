import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Award, Loader2, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { useQuizSession } from '../../hooks/useQuizSession';
import { useAuthoritativeClock } from '../../hooks/useAuthoritativeClock';
import { formatPoints } from '../../utils/formatters';
import { OptionGrid } from './OptionGrid';

export function QuizEngine() {
  const { uid, role, teamScore } = useAuth();
  const { eventData, serverOffsetMs } = useEvent();
  const navigate = useNavigate();
  const teamId = role === 'TEAM' ? uid : null;
  const { session, currentQuestion, loading, submitting, error, sessionResolved, startQuiz, submitAnswerChoice } = useQuizSession(teamId);
  const [quizAlreadyDone, setQuizAlreadyDone] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lastSubmissionResult, setLastSubmissionResult] = useState(null);
  const [localPhase, setLocalPhase] = useState('READ_ONLY');
  const [localDeadline, setLocalDeadline] = useState(null);
  const submittedQuestionRef = useRef(null);
  const resumedQuestionRef = useRef(null);

  useEffect(() => {
    if (teamScore?.finalized === true) setQuizAlreadyDone(true);
  }, [teamScore]);

  useEffect(() => {
    if (!session) return;
    setLocalPhase(session.phase || 'READ_ONLY');
    setLocalDeadline(session.phaseDeadlineMs || (Date.now() + 10000));
    setSelectedOption(null);
    setLastSubmissionResult(null);
    submittedQuestionRef.current = null;
  }, [session?.questionIndex, session?.phaseDeadlineMs, session?.status]);

  useEffect(() => {
    if (!sessionResolved || !session || currentQuestion || session.status !== 'RUNNING' || !teamId || loading) return;
    if (resumedQuestionRef.current === session.questionIndex) return;
    resumedQuestionRef.current = session.questionIndex;
    startQuiz(eventData?.id || 'default-event', eventData?.quizId || 'default-quiz').catch((resumeError) => console.error('Quiz resume failed:', resumeError));
  }, [sessionResolved, session, currentQuestion, teamId, loading, startQuiz, eventData?.id, eventData?.quizId]);

  const submitCurrentAnswer = useCallback(async (answerOption) => {
    if (!session || !currentQuestion || session.status !== 'RUNNING') return null;
    const submissionKey = `${session.questionIndex}:${currentQuestion.id}`;
    if (submittedQuestionRef.current === submissionKey) return null;
    submittedQuestionRef.current = submissionKey;

    try {
      const result = await submitAnswerChoice({
        eventId: eventData?.id || 'default-event',
        quizId: eventData?.quizId || 'default-quiz',
        questionIndex: session.questionIndex,
        questionId: currentQuestion.id,
        selectedOption: answerOption ?? null
      });
      if (result) {
        setLastSubmissionResult(result);
        if (result.session) {
          setLocalPhase(result.session.phase || 'READ_ONLY');
          setLocalDeadline(result.session.phaseDeadlineMs || null);
        }
      }
      return result;
    } catch (submissionError) {
      submittedQuestionRef.current = null;
      throw submissionError;
    }
  }, [session, currentQuestion, submitAnswerChoice, eventData?.id, eventData?.quizId]);

  const handleDeadlineReached = useCallback(() => {
    if (localPhase === 'READ_ONLY') {
      setLocalPhase('ANSWER_MODE');
      setLocalDeadline(Date.now() + serverOffsetMs + 10000);
      setSelectedOption(null);
    } else if (localPhase === 'ANSWER_MODE' && session?.status === 'RUNNING') {
      submitCurrentAnswer(selectedOption).catch((submitError) => console.warn('Automatic answer submission failed:', submitError));
    }
  }, [localPhase, session?.status, selectedOption, serverOffsetMs, submitCurrentAnswer]);

  const { remainingMs } = useAuthoritativeClock(localDeadline, serverOffsetMs, handleDeadlineReached);
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const progressPercent = Math.min(100, Math.max(0, (remainingMs / 10000) * 100));
  const isReadOnly = localPhase === 'READ_ONLY';

  const handleSelectOption = (index) => {
    if (!isReadOnly && !submitting) setSelectedOption(index);
  };

  const handleManualSubmit = async () => {
    if (selectedOption === null || submitting || !session || !currentQuestion) return;
    try {
      await submitCurrentAnswer(selectedOption);
    } catch (submitError) {
      console.error(submitError);
    }
  };

  const handleStartQuiz = async () => {
    if (!teamId || loading || session) return;
    try {
      const result = await startQuiz(eventData?.id || 'default-event', eventData?.quizId || 'default-quiz');
      if (result?.alreadyCompleted || result?.completed) setQuizAlreadyDone(true);
    } catch (startError) {
      console.error('Quiz start failed:', startError);
    }
  };

  if (quizAlreadyDone || session?.status === 'COMPLETED') {
    return (
      <div className="mn-page mx-auto max-w-5xl">
        <div className="mn-empty min-h-[380px]">
          <div className="max-w-2xl"><Award className="mn-empty-icon p-3" /><span className="mn-kicker justify-center">Quiz complete</span><h1 className="mt-5 mn-title">Your attempt is recorded.</h1><p className="mx-auto mt-5 max-w-xl text-base font-light leading-7 text-[var(--mn-muted)]">Each team gets one attempt. Your score is ready to be used as the priority for theme allocation.</p></div>
        </div>
        <div className="mn-stat-grid">
          <div className="mn-stat"><label>Total score</label><strong>{formatPoints(teamScore?.totalPoints || 0)}</strong></div>
          <div className="mn-stat"><label>Answered</label><strong>{teamScore?.answeredCount || 0}</strong></div>
          <div className="mn-stat"><label>Correct</label><strong className="text-[var(--mn-violet)]">{teamScore?.correctCount || 0}</strong></div>
        </div>
        <div className="flex flex-wrap justify-center gap-3"><button type="button" onClick={() => navigate('/')} className="mn-button mn-button-secondary">Return home</button><button type="button" onClick={() => navigate('/bidding')} className="mn-button mn-button-accent">Continue to bidding <ArrowRight className="h-4 w-4" /></button></div>
      </div>
    );
  }

  if (!sessionResolved) {
    return <div className="mn-empty mx-auto max-w-2xl" role="status"><div><Loader2 className="mn-empty-icon animate-spin p-3" /><h2 className="text-xl font-semibold">Preparing your quiz</h2><p className="mt-2 text-sm text-[var(--mn-muted)]">Loading the question and synchronizing the timer.</p></div></div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <section className="mn-panel overflow-hidden border-t-[3px] border-t-[var(--mn-violet)] p-7 sm:p-10">
          <div className="grid items-center gap-9 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="mn-kicker">Team-controlled start</span>
              <h1 className="mt-5 font-['Syne'] text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Start only when your whole team is ready.</h1>
              <p className="mt-5 max-w-2xl text-base font-light leading-7 text-[var(--mn-muted)]">Opening this page does not start the timer. The first question begins only after you press Start Quiz. Once started, the attempt keeps running and resumes from the stored deadline if this page is refreshed.</p>
            </div>
            <div className="w-full space-y-4 sm:min-w-64 lg:w-auto">
              <div className="mn-panel-soft grid grid-cols-2 gap-px overflow-hidden p-1"><div className="p-4"><span className="mn-label">Read</span><strong className="mt-2 block text-xl">10 sec</strong></div><div className="border-l border-[var(--mn-line)] p-4"><span className="mn-label">Answer</span><strong className="mt-2 block text-xl">10 sec</strong></div></div>
              <button type="button" onClick={handleStartQuiz} disabled={loading} className="mn-button mn-button-accent w-full">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Starting quiz…</> : <><Play className="h-4 w-4 fill-current" />Start Quiz</>}</button>
            </div>
          </div>
          {error && <div className="mn-alert mn-alert-error mt-6"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="mn-quiz-head flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div><span className="mn-kicker">Live quiz</span><h1 className="mt-3 font-['Syne'] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Question {String(session.questionIndex + 1).padStart(2, '0')}</h1></div>
        <p className="max-w-sm text-sm leading-6 text-[var(--mn-muted)]">Read for ten seconds, then choose and submit one answer during the ten-second answer period.</p>
      </header>

      <div className="mn-quiz-layout">
        <aside className="mn-quiz-sidebar py-6">
          <div className="mn-quiz-phase-row flex items-center justify-between"><span className="mn-label">{isReadOnly ? 'Reading time' : 'Answer time'}</span><span className={`mn-status ${isReadOnly ? 'is-warn' : 'is-live'}`}><span className="mn-live-dot" />{isReadOnly ? 'Read' : 'Answer'}</span></div>
          <div className="mn-timer">00:{String(remainingSeconds).padStart(2, '0')}</div>
          <div className="mn-progress" aria-label={`${remainingSeconds} seconds remaining`}><span style={{ width: `${progressPercent}%` }} /></div>
          <div className="mt-8 grid grid-cols-2 gap-px border border-[var(--mn-line)] bg-[var(--mn-line)]">
            <div className="bg-[var(--mn-ink)] p-4"><span className="mn-label">Progress</span><strong className="mt-3 block text-xl font-semibold">{session.questionIndex + 1} / {session.totalQuestions}</strong></div>
            <div className="bg-[var(--mn-ink)] p-4"><span className="mn-label">Score</span><strong className="mt-3 block text-xl font-semibold text-[var(--mn-violet)]">{formatPoints(teamScore?.totalPoints || 0)}</strong></div>
          </div>
          <p className="mt-6 text-xs leading-5 text-[var(--mn-faint)]">Keyboard: press A–D or 1–4 to select an answer.</p>
        </aside>

        <main className="mn-question-stage min-w-0 space-y-9">
          {error && <div className="mn-alert mn-alert-error"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          <div><div className="flex flex-wrap items-center gap-3"><span className="mn-label text-[var(--mn-violet)]">Question {String(session.questionIndex + 1).padStart(2, '0')}</span><span className="text-xs text-[var(--mn-faint)]">{currentQuestion?.category || 'Robotics & Automation'}</span></div><h2 className="mt-5 max-w-5xl font-['Syne'] text-2xl font-semibold leading-tight tracking-[-.025em] sm:text-4xl">{currentQuestion?.prompt || 'Loading question…'}</h2></div>
          <OptionGrid options={currentQuestion?.options || []} selectedOption={selectedOption} onSelectOption={handleSelectOption} disabled={submitting || isReadOnly} isReadOnly={isReadOnly} submittedOption={lastSubmissionResult ? selectedOption : null} isCorrect={lastSubmissionResult?.isCorrect} />
          {!isReadOnly && <div className="flex flex-col justify-between gap-4 border-t border-[var(--mn-line)] pt-6 sm:flex-row sm:items-center"><span aria-live="polite" className="text-sm text-[var(--mn-muted)]">{submitting ? (selectedOption === null ? 'Time expired. Recording 0 points and loading the next question…' : 'Submitting your answer…') : (selectedOption !== null ? 'Answer selected and ready.' : 'Choose an answer. If time expires, 0 points will be recorded automatically.')}</span><button type="button" disabled={selectedOption === null || submitting} onClick={handleManualSubmit} className="mn-button mn-button-accent">{submitting ? 'Submitting…' : 'Submit answer'}<ArrowRight className="h-4 w-4" /></button></div>}
        </main>
      </div>
    </div>
  );
}
