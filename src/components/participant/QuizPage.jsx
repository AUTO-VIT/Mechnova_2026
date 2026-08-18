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
              className="bg-red-600 px-6 py-2.5 font-mono text-xs font-bold text-white hover:bg-red-500"
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
              className="border border-zinc-700 bg-zinc-900 px-6 py-2.5 font-mono text-xs font-bold text-zinc-300 hover:bg-zinc-800"
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
