import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Award,
  CheckCircle2,
  CircleDashed,
  GripVertical,
  Info,
  Loader2,
  ShieldAlert,
  UsersRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { submitBidApi } from '../../services/callableApi';
import { subscribeToTeamBid } from '../../services/firestoreService';
import { formatPoints } from '../../utils/formatters';
import { LockedPanel } from '../common/LockedPanel';

const getThemeId = (theme) => theme.id || theme.themeId;

export function BiddingPage() {
  const { uid, teamScore } = useAuth();
  const { eventData, publicThemes } = useEvent();
  const [existingBid, setExistingBid] = useState(null);
  const [preferenceIds, setPreferenceIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isBiddingOpen = eventData?.biddingOpen === true;
  const totalPoints = teamScore?.totalPoints || 0;
  const themeById = useMemo(
    () => new Map(publicThemes.map((theme) => [getThemeId(theme), theme])),
    [publicThemes]
  );
  const rankedThemes = preferenceIds.map((id) => themeById.get(id)).filter(Boolean);
  const primaryThemeId = preferenceIds[0] || '';

  useEffect(() => {
    if (!uid || !eventData?.id) return undefined;
    return subscribeToTeamBid(eventData.id, uid, (bid) => {
      if (!bid) return;
      setExistingBid(bid);

      const visibleIds = publicThemes.map(getThemeId).filter(Boolean);
      const storedPreferences = Array.isArray(bid.preferenceIds)
        ? bid.preferenceIds
        : [bid.selectedThemeId].filter(Boolean);
      const validPreferences = storedPreferences.filter((id) => visibleIds.includes(id));
      setPreferenceIds([...validPreferences, ...visibleIds.filter((id) => !validPreferences.includes(id))]);
    });
  }, [uid, eventData?.id, publicThemes]);

  const addOrRemoveTheme = (themeId) => {
    setError('');
    setPreferenceIds((current) => (
      current.includes(themeId)
        ? current.filter((id) => id !== themeId)
        : [...current, themeId]
    ));
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

    if (preferenceIds.length !== publicThemes.length || !primaryThemeId) {
      setError('Rank every revealed theme before submitting. This ensures you can be considered for your next preference if a theme fills.');
      return;
    }
    setLoading(true);
    try {
      const result = await submitBidApi({
        eventId: eventData?.id || 'default-event',
        selectedThemeId: primaryThemeId,
        preferenceIds
      });
      if (result?.success) {
        setSuccessMsg('Your ranked theme preferences have been submitted. Your full quiz score is automatically used for allocation priority. You can revise your ranking while the bidding window remains open.');
      }
    } catch (submitError) {
      console.error('Bid submission error:', submitError);
      setError(submitError.message || 'Bid submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!uid) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <LockedPanel
          title="AUTHENTICATION REQUIRED"
          message="Sign in with your team credentials before entering the Bidding Arena."
          actionButton={<Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-[#B26FCB]/40 bg-[#68388D] px-8 py-3 font-mono text-xs font-bold tracking-[0.2em] text-white transition hover:bg-[#855AB4]">SIGN IN TO CONTINUE</Link>}
        />
      </div>
    );
  }

  if (!isBiddingOpen) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <LockedPanel
          title="BIDDING CHANNEL LOCKED"
          message="Bidding opens when the administrator has revealed themes and enabled the allocation phase."
          actionButton={<Link to="/themes" className="inline-flex items-center gap-2 rounded-full border border-[#B26FCB]/40 bg-[#68388D] px-8 py-3 font-mono text-xs font-bold tracking-[0.2em] text-white transition hover:bg-[#855AB4]">VIEW THEME STATUS</Link>}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-10">
      <header className="max-w-4xl space-y-4">
        <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#B26FCB]"><Award className="h-4 w-4" /> Allocation arena</div>
        <h1 className="text-balance font-sans text-4xl font-bold tracking-tight text-white sm:text-6xl">Rank the themes your team wants most.</h1>
        <p className="max-w-3xl text-base font-light leading-relaxed text-zinc-300">Your complete quiz score automatically determines priority. Order every revealed theme; if a higher choice fills, the allocation process considers your next preference—never a random theme.</p>
      </header>

      <form onSubmit={handleSubmitBid} className="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-12">
        <aside className="space-y-6 lg:col-span-4">
          <div className="surface-orbit sticky top-28 space-y-6 rounded-3xl border border-[#855AB4]/30 p-6 shadow-[0_0_40px_rgba(104,56,141,0.2)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#855AB4]/20 pb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">Your submission</span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">Open</span>
            </div>

            {error && <div role="alert" className="flex gap-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3.5 font-mono text-xs leading-relaxed text-orange-200"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />{error}</div>}
            {successMsg && <div role="status" className="flex gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 font-mono text-xs leading-relaxed text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{successMsg}</div>}

            <div className="grid grid-cols-2 gap-4 border-b border-[#855AB4]/20 pb-5">
              <div><span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Quiz points</span><span className="font-mono text-2xl font-bold text-white">{formatPoints(totalPoints)} <span className="text-xs font-normal text-[#B26FCB]">PTS</span></span></div>
              <div><span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">Preferences</span><span className="font-mono text-2xl font-bold text-[#B26FCB]">{preferenceIds.length}<span className="text-xs font-normal text-zinc-500">/{publicThemes.length}</span></span></div>
            </div>

            <div className="rounded-2xl border border-[#B26FCB]/30 bg-[#68388D]/15 p-4">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-[#B26FCB]">Allocation priority</span>
              <span className="mt-1 block font-mono text-lg font-bold text-white">Your full quiz score: {formatPoints(totalPoints)} PTS</span>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">There is no point-spending step. Submit your complete preference order when you are ready.</p>
            </div>

            <button type="submit" disabled={loading || publicThemes.length === 0} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#B26FCB]/40 bg-[#68388D] py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_30px_rgba(178,111,203,0.35)] transition hover:bg-[#855AB4] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving preferences…</> : <><span>{existingBid ? 'Update preferences' : 'Submit preferences'}</span><ArrowRight className="h-4 w-4" /></>}
            </button>

            <div className="rounded-2xl border border-[#855AB4]/25 bg-[#110515]/55 p-4 text-[11px] leading-relaxed text-zinc-400">
              <div className="mb-1.5 flex items-center gap-1.5 font-mono font-bold text-[#B26FCB]"><Info className="h-3.5 w-3.5" /> How allocation works</div>
              Teams are reviewed by quiz score, then by submission time for score ties. Your ranked list is checked in order against available seats.
            </div>
          </div>
        </aside>

        <section className="space-y-8 lg:col-span-8">
          <div className="surface-orbit rounded-3xl border border-[#855AB4]/30 p-6 sm:p-8">
            <div className="mb-5 flex flex-col justify-between gap-2 border-b border-[#855AB4]/20 pb-5 sm:flex-row sm:items-end">
              <div><h2 className="font-sans text-2xl font-bold text-white">Your ranking</h2><p className="mt-1 text-sm text-zinc-400">Add every theme, then use the arrows to set first through last preference.</p></div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#B26FCB]">{preferenceIds.length === publicThemes.length ? 'Ranking complete' : `${publicThemes.length - preferenceIds.length} left to rank`}</span>
            </div>
            <div aria-live="polite" className="space-y-3">
              {rankedThemes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#855AB4]/40 px-5 py-10 text-center"><CircleDashed className="mx-auto mb-3 h-6 w-6 text-[#B26FCB]" /><p className="text-sm text-zinc-400">Choose themes below to build your ranking.</p></div>
              ) : rankedThemes.map((theme, index) => (
                <div key={getThemeId(theme)} className="flex items-center gap-3 rounded-2xl border border-[#855AB4]/30 bg-[#110515]/60 p-3 sm:p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B26FCB]/40 bg-[#68388D]/35 font-mono text-sm font-bold text-white">{index + 1}</div>
                  <GripVertical className="hidden h-4 w-4 text-zinc-600 sm:block" />
                  <div className="min-w-0 flex-1"><p className="truncate font-sans text-sm font-bold text-white">{theme.publicName || theme.name}</p><p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Theme {theme.themeNumber || index + 1} · {theme.seatCapacity || theme.capacity || '—'} seats</p></div>
                  <div className="flex gap-1"><button type="button" onClick={() => movePreference(index, -1)} disabled={index === 0} aria-label={`Move ${theme.publicName || theme.name} up`} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button><button type="button" onClick={() => movePreference(index, 1)} disabled={index === rankedThemes.length - 1} aria-label={`Move ${theme.publicName || theme.name} down`} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div><h2 className="font-sans text-2xl font-bold text-white">Revealed themes</h2><p className="mt-1 text-sm text-zinc-400">Select each card once. Seats are configured by the administrator.</p></div>
            {publicThemes.length === 0 ? <div className="rounded-3xl border border-dashed border-[#855AB4]/35 p-10 text-center text-sm text-zinc-400">No themes have been revealed yet.</div> : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {publicThemes.map((theme, index) => {
                  const themeId = getThemeId(theme);
                  const rank = preferenceIds.indexOf(themeId);
                  const selected = rank >= 0;
                  return (
                    <button key={themeId || index} type="button" onClick={() => addOrRemoveTheme(themeId)} aria-pressed={selected} className={`group relative min-h-64 rounded-3xl border p-6 text-left transition sm:p-7 ${selected ? 'border-[#B26FCB] bg-[#68388D]/25 shadow-[0_0_30px_rgba(178,111,203,0.18)]' : 'border-[#855AB4]/25 bg-[#221545]/50 hover:border-[#B26FCB]/55 hover:bg-[#221545]/75'}`}>
                      <div className="mb-5 flex items-center justify-between"><span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#B26FCB]">Theme {String(theme.themeNumber || index + 1).padStart(2, '0')}</span><span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${selected ? 'border-[#B26FCB]/45 bg-[#68388D]/60 text-white' : 'border-[#855AB4]/30 text-zinc-400'}`}>{selected ? `Rank ${rank + 1}` : 'Add to ranking'}</span></div>
                      <h3 className="font-sans text-xl font-bold text-white">{theme.publicName || theme.name}</h3>
                      <p className="mt-3 text-sm font-light leading-relaxed text-zinc-300">{theme.publicDescription || theme.description || 'Challenge brief will be available here.'}</p>
                      <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 border-t border-[#855AB4]/20 pt-4 font-mono text-[11px] text-zinc-400"><UsersRound className="h-3.5 w-3.5 text-[#B26FCB]" />{theme.seatCapacity || theme.capacity || '—'} team seat{Number(theme.seatCapacity || theme.capacity) === 1 ? '' : 's'}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}
