import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUp, Check, CheckCircle2, CircleDashed, Info, Loader2, UsersRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { submitBidApi } from '../../services/callableApi';
import { subscribeToTeamBid } from '../../services/firestoreService';
import { formatPoints } from '../../utils/formatters';
import { LockedPanel } from '../common/LockedPanel';

const getThemeId = (theme) => theme.id || theme.themeId;

export function BiddingPage() {
  const { uid, role, loading: authLoading, teamScore } = useAuth();
  const { eventData, publicThemes } = useEvent();
  const [existingBid, setExistingBid] = useState(null);
  const [preferenceIds, setPreferenceIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isBiddingOpen = eventData?.biddingOpen === true;
  const totalPoints = teamScore?.totalPoints || 0;
  const themeById = useMemo(() => new Map(publicThemes.map((theme) => [getThemeId(theme), theme])), [publicThemes]);
  const rankedThemes = preferenceIds.map((id) => themeById.get(id)).filter(Boolean);
  const primaryThemeId = preferenceIds[0] || '';
  const rankingComplete = publicThemes.length > 0 && preferenceIds.length === publicThemes.length;

  useEffect(() => {
    if (role !== 'TEAM' || !uid || !eventData?.id) return undefined;
    return subscribeToTeamBid(eventData.id, uid, (bid) => {
      if (!bid) return;
      setExistingBid(bid);
      const visibleIds = publicThemes.map(getThemeId).filter(Boolean);
      const storedPreferences = Array.isArray(bid.preferenceIds) ? bid.preferenceIds : [bid.selectedThemeId].filter(Boolean);
      const validPreferences = storedPreferences.filter((id) => visibleIds.includes(id));
      setPreferenceIds([...validPreferences, ...visibleIds.filter((id) => !validPreferences.includes(id))]);
    });
  }, [role, uid, eventData?.id, publicThemes]);

  const addOrRemoveTheme = (themeId) => {
    setError('');
    setPreferenceIds((current) => current.includes(themeId) ? current.filter((id) => id !== themeId) : [...current, themeId]);
  };

  const movePreference = (index, direction) => {
    setPreferenceIds((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const handleSubmitBid = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!rankingComplete || !primaryThemeId) {
      setError('Rank every revealed theme before submitting so the allocation can move through your choices in order.');
      return;
    }
    setLoading(true);
    try {
      const result = await submitBidApi({ eventId: eventData?.id || 'default-event', selectedThemeId: primaryThemeId, preferenceIds });
      if (result?.success) setSuccessMsg('Preferences saved. Your complete quiz score will be used automatically for allocation priority.');
    } catch (submitError) {
      console.error('Bid submission error:', submitError);
      setError(submitError.message || 'Bid submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="mn-empty mx-auto max-w-2xl py-12" role="status">Verifying team access…</div>;
  }

  if (role !== 'TEAM' || !uid) {
    const adminActive = role === 'ADMIN';
    return <div className="mx-auto max-w-2xl py-12"><LockedPanel title={adminActive ? 'A team account is required' : 'Team sign-in required'} message={adminActive ? 'Administrator accounts cannot submit team preferences. Switch to a registered team account first.' : 'Sign in with your team code and passkey before ranking challenge themes.'} actionButton={<Link to="/login" className="mn-button mn-button-primary">{adminActive ? 'Switch to team sign in' : 'Sign in'}</Link>} /></div>;
  }

  if (!isBiddingOpen) {
    return <div className="mx-auto max-w-3xl py-12"><LockedPanel title="Bidding is not open" message="Theme ranking becomes available after the themes are revealed and the administrator opens bidding." actionButton={<Link to="/themes" className="mn-button mn-button-secondary">View themes</Link>} /></div>;
  }

  return (
    <div className="mn-page">
      <header className="mn-page-head">
        <span className="mn-kicker">Theme preferences</span>
        <h1 className="mn-title">Put every theme in your preferred order.</h1>
        <p className="mn-lede">Your complete quiz score sets your priority. If your first choice is full, allocation checks your second choice, then your third, until a seat is available.</p>
      </header>

      <form onSubmit={handleSubmitBid} className="grid grid-cols-1 gap-10 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-16">
        <aside className="space-y-5">
          <div className="mn-panel space-y-6 xl:sticky xl:top-28">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--mn-line)] pb-4">
              <div><span className="mn-label">Submission</span><h2 className="mt-1 text-lg font-semibold">Your ranking</h2></div>
              <span className="mn-status is-live"><span className="mn-live-dot" /> Open</span>
            </div>
            {error && <div role="alert" className="mn-alert mn-alert-error">{error}</div>}
            {successMsg && <div role="status" className="mn-alert mn-alert-success"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{successMsg}</div>}
            <div className="grid grid-cols-2 gap-px border border-[var(--mn-line)] bg-[var(--mn-line)]">
              <div className="bg-[var(--mn-ink-soft)] p-4"><span className="mn-label">Quiz score</span><strong className="mt-3 block font-['Syne'] text-2xl font-semibold">{formatPoints(totalPoints)}</strong></div>
              <div className="bg-[var(--mn-ink-soft)] p-4"><span className="mn-label">Ranked</span><strong className="mt-3 block font-['Syne'] text-2xl font-semibold">{preferenceIds.length}<span className="text-sm text-[var(--mn-faint)]">/{publicThemes.length}</span></strong></div>
            </div>
            <div className="border-l-2 border-[var(--mn-violet)] pl-4"><span className="mn-label">How points work</span><p className="mt-2 text-sm leading-6 text-[var(--mn-muted)]">You do not spend points. Your full score of <strong className="font-semibold text-white">{formatPoints(totalPoints)} points</strong> is used automatically.</p></div>
            <button type="submit" disabled={loading || !rankingComplete} className="mn-button mn-button-accent w-full">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving</> : <>{existingBid ? 'Update preferences' : 'Submit preferences'}<ArrowRight className="h-4 w-4" /></>}</button>
            <div className="flex gap-3 border-t border-[var(--mn-line)] pt-4 text-xs leading-5 text-[var(--mn-faint)]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mn-violet)]" /><p>Score ties are resolved by submission time. You can revise your order while bidding stays open.</p></div>
          </div>
        </aside>

        <div className="min-w-0 space-y-16">
          <section aria-labelledby="ranking-title">
            <div className="mn-section-head">
              <div><span className="mn-kicker">01 / Order</span><h2 id="ranking-title" className="mt-3 font-['Syne'] text-3xl font-semibold tracking-tight">Current preference list</h2></div>
              <span className={`mn-status ${rankingComplete ? 'is-live' : ''}`}>{rankingComplete ? 'Complete' : `${publicThemes.length - preferenceIds.length} remaining`}</span>
            </div>
            {rankedThemes.length === 0 ? (
              <div className="mn-empty"><div><CircleDashed className="mn-empty-icon p-3" /><h3 className="text-lg font-semibold">Start with your strongest choice</h3><p className="mt-2 text-sm text-[var(--mn-muted)]">Select themes below to add them to this list.</p></div></div>
            ) : (
              <div className="mn-rank-list" aria-live="polite">
                {rankedThemes.map((theme, index) => (
                  <div key={getThemeId(theme)} className="mn-rank-row">
                    <span className="mn-rank-index">{String(index + 1).padStart(2, '0')}</span>
                    <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-white">{theme.publicName || theme.name}</h3><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-[var(--mn-faint)]">Theme {theme.themeNumber || index + 1} · {theme.seatCapacity || theme.capacity || '—'} seats</p></div>
                    <div className="mn-rank-actions"><button type="button" onClick={() => movePreference(index, -1)} disabled={index === 0} aria-label={`Move ${theme.publicName || theme.name} up`}><ArrowUp className="h-4 w-4" /></button><button type="button" onClick={() => movePreference(index, 1)} disabled={index === rankedThemes.length - 1} aria-label={`Move ${theme.publicName || theme.name} down`}><ArrowDown className="h-4 w-4" /></button></div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="themes-title">
            <div className="mn-section-head"><div><span className="mn-kicker">02 / Select</span><h2 id="themes-title" className="mt-3 font-['Syne'] text-3xl font-semibold tracking-tight">Available themes</h2></div><p>Select every theme once. Use the controls above to change the order.</p></div>
            {publicThemes.length === 0 ? <div className="mn-empty"><p className="text-sm text-[var(--mn-muted)]">No themes have been revealed yet.</p></div> : (
              <div className="mn-choice-grid">
                {publicThemes.map((theme, index) => {
                  const themeId = getThemeId(theme);
                  const rank = preferenceIds.indexOf(themeId);
                  const selected = rank >= 0;
                  return (
                    <button key={themeId || index} type="button" onClick={() => addOrRemoveTheme(themeId)} aria-pressed={selected} className={`mn-choice ${selected ? 'is-selected' : ''}`} data-tilt>
                      <div className="flex items-center justify-between gap-3"><span className="mn-label text-[var(--mn-violet)]">Theme {String(theme.themeNumber || index + 1).padStart(2, '0')}</span><span className={`mn-status ${selected ? 'is-live' : ''}`}>{selected ? <><Check className="h-3 w-3" /> Rank {rank + 1}</> : 'Add'}</span></div>
                      <h3>{theme.publicName || theme.name}</h3><p>{theme.publicDescription || theme.description || 'Challenge details will appear here.'}</p>
                      <div className="mn-choice-foot"><span className="inline-flex items-center gap-2"><UsersRound className="h-3.5 w-3.5" /> Capacity</span><strong>{theme.seatCapacity || theme.capacity || '—'} teams</strong></div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </form>
    </div>
  );
}
