import React from 'react';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { QuizEngine } from '../quiz/QuizEngine';
import { LockedPanel } from '../common/LockedPanel';
import { Link } from 'react-router-dom';

export function QuizPage() {
  const { eventData } = useEvent();
  const { currentUser } = useAuth();

  const isQuizOpen = eventData?.quizOpen === true;

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <LockedPanel
          title="AUTHENTICATION REQUIRED"
          message="You must authenticate at the Team Access Gate before entering the Quiz Engine."
          actionButton={
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(178,111,203,0.3)] border border-[#B26FCB]/40"
            >
              AUTHENTICATE NOW
            </Link>
          }
        />
      </div>
    );
  }

  if (!isQuizOpen) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <LockedPanel
          title="QUIZ CHANNEL IS SEALED"
          message="The Authoritative Quiz phase is currently CLOSED by administrative directive. Please check back when admin opens the quiz channel."
          actionButton={
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3 rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(178,111,203,0.3)] border border-[#B26FCB]/40"
            >
              RETURN TO HOME
            </Link>
          }
        />
      </div>
    );
  }

  return <QuizEngine />;
}
