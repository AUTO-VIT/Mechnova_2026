import React from 'react';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { QuizEngine } from '../quiz/QuizEngine';
import { LockedPanel } from '../common/LockedPanel';
import { Link } from 'react-router-dom';

export function QuizPage() {
  const { eventData } = useEvent();
  const { role, loading } = useAuth();

  const isQuizOpen = eventData?.quizOpen === true;

  if (loading) {
    return <div className="mn-empty mx-auto max-w-2xl py-12" role="status">Verifying team access…</div>;
  }

  if (role !== 'TEAM') {
    const adminActive = role === 'ADMIN';
    return (
      <div className="mx-auto max-w-2xl py-12">
        <LockedPanel
          title={adminActive ? 'A team account is required' : 'Team sign-in required'}
          message={adminActive ? 'Administrator accounts manage the quiz but cannot attempt it. Switch to a registered team using its team code and passkey.' : 'Sign in with your team code and passkey before starting the quiz.'}
          actionButton={
            <Link to="/login" className="mn-button mn-button-primary">{adminActive ? 'Switch to team sign in' : 'Sign in'}</Link>
          }
        />
      </div>
    );
  }

  if (!isQuizOpen) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <LockedPanel
          title="The quiz is not open"
          message="The administrator has not opened the quiz yet. This page will be ready as soon as the quiz begins."
          actionButton={
            <Link to="/" className="mn-button mn-button-secondary">Return home</Link>
          }
        />
      </div>
    );
  }

  return <QuizEngine />;
}
