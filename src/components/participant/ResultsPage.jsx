import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Clock, ListOrdered, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { subscribeToTeamAllocation } from '../../services/firestoreService';
import { formatPoints } from '../../utils/formatters';
import { LockedPanel } from '../common/LockedPanel';

export function ResultsPage() {
  const { uid, role, loading: authLoading, teamData } = useAuth();
  const { eventData, publicThemes } = useEvent();
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allocationLoadFailed, setAllocationLoadFailed] = useState(false);

  const isFinalized = eventData?.allocationFinalized === true;
  const resultsRevealed = eventData?.resultsRevealed === true;

  useEffect(() => {
    if (role !== 'TEAM' || !uid || !eventData?.id) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setAllocationLoadFailed(false);
    const unsubscribe = subscribeToTeamAllocation(eventData.id, uid, (nextAllocation) => {
      setAllocation(nextAllocation);
      setLoading(false);
    }, () => {
      setAllocationLoadFailed(true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [role, uid, eventData?.id]);

  const assignedTheme = publicThemes.find((theme) => (theme.id || theme.themeId) === allocation?.themeId);
  const preferenceRank = allocation?.preferenceRank || allocation?.assignedPreferenceRank;
  const waitingState = !isFinalized
    ? { title: 'Allocation is in progress', copy: 'Teams are being considered by quiz score and ranked preferences. Your assignment will appear here automatically.' }
    : { title: 'Results are ready but hidden', copy: 'Allocation is complete. The administrator will reveal assignments when the event is ready.' };

  if (authLoading) {
    return <div className="mn-empty mx-auto max-w-2xl py-12" role="status">Verifying team access…</div>;
  }

  if (role !== 'TEAM' || !uid) {
    const adminActive = role === 'ADMIN';
    return <div className="mx-auto max-w-2xl py-12"><LockedPanel title={adminActive ? 'A team account is required' : 'Team sign-in required'} message={adminActive ? 'Administrator accounts cannot view a participant assignment. Switch to the registered team account you want to check.' : 'Sign in with your team code and passkey to view your team result.'} actionButton={<Link to="/login" className="mn-button mn-button-primary">{adminActive ? 'Switch to team sign in' : 'Sign in'}</Link>} /></div>;
  }

  if (allocationLoadFailed) return <div className="mn-alert mn-alert-error mx-auto max-w-3xl" role="alert">Could not load your result. Refresh and try again.</div>;

  return (
    <div className="mn-page">
      <header className="mn-page-head">
        <span className="mn-kicker"><Award className="h-3.5 w-3.5" /> Results</span>
        <h1 className="mn-title">Your challenge assignment.</h1>
        <p className="mn-lede">The final result reflects your quiz score, submitted theme order, and the capacity available for each theme.</p>
      </header>

      {loading ? (
        <div className="mn-empty" role="status"><div><Clock className="mn-empty-icon animate-pulse p-3" /><h2 className="text-xl font-semibold">Checking your result</h2></div></div>
      ) : !isFinalized || !resultsRevealed ? (
        <div className="mn-empty">
          <div className="max-w-lg"><Clock className="mn-empty-icon p-3" /><span className="mn-kicker justify-center">Not published</span><h2 className="mt-4 font-['Syne'] text-3xl font-semibold">{waitingState.title}</h2><p className="mt-3 text-sm leading-6 text-[var(--mn-muted)]">{waitingState.copy}</p></div>
        </div>
      ) : (
        <div className="mn-result-layout grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="mn-panel mn-result-hero">
            <div className="mn-celebration" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
            <div className="flex flex-wrap items-center justify-between gap-4"><span className="mn-status is-live"><CheckCircle2 className="h-3 w-3" /> Official assignment</span><span className="mn-label">{preferenceRank ? `Preference ${preferenceRank}` : 'Final result'}</span></div>
            {assignedTheme ? (
              <div className="mt-16 max-w-3xl">
                <span className="mn-kicker">Theme {String(assignedTheme.themeNumber || '').padStart(2, '0')}</span>
                <h2 className="mt-5 font-['Syne'] text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{assignedTheme.publicName || assignedTheme.name}</h2>
                <p className="mt-6 max-w-2xl text-base font-light leading-7 text-[var(--mn-muted)]">{assignedTheme.publicDescription || assignedTheme.description}</p>
                {assignedTheme.brief && <p className="mt-8 border-l-2 border-[var(--mn-violet)] pl-5 text-sm leading-6 text-[#c8cbd0]">{assignedTheme.brief}</p>}
              </div>
            ) : <div className="mt-14"><span className="mn-label">Assignment ID</span><p className="mt-3 font-mono text-lg">{allocation?.themeId || 'Unassigned'}</p></div>}
          </section>

          <aside className="space-y-4">
            <div className="mn-panel" data-tilt><span className="mn-label">Team</span><strong className="mt-4 block font-['Syne'] text-2xl font-semibold">{teamData?.teamName || teamData?.name || 'Your team'}</strong></div>
            <div className="mn-stat-grid is-two"><div className="mn-stat"><label>Assigned choice</label><strong className="text-[var(--mn-green)]">{preferenceRank ? `#${preferenceRank}` : '—'}</strong></div><div className="mn-stat"><label>Quiz score</label><strong>{formatPoints(allocation?.scoreSnapshot || 0)}</strong></div></div>
            <div className="mn-panel-soft space-y-4 p-5 text-xs leading-5 text-[var(--mn-muted)]">
              <p className="flex gap-3"><ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mn-violet)]" />This is the highest available option from your submitted preference order.</p>
              <p className="flex gap-3"><UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mn-violet)]" />Each theme uses the capacity set before bidding began.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
