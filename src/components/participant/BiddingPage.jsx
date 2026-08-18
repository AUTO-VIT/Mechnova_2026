import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { submitBidApi } from '../../services/callableApi';
import { subscribeToTeamBid } from '../../services/firestoreService';
import { Award, CheckCircle2, ShieldAlert, ArrowRight, Layers, Lock, Loader2, Info } from 'lucide-react';
import { formatPoints, formatTimestamp } from '../../utils/formatters';

export function BiddingPage() {
  const { uid, teamScore } = useAuth();
  const { eventData, publicThemes } = useEvent();

  const [existingBid, setExistingBid] = useState(null);
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [bidPoints, setBidPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isBiddingOpen = eventData?.biddingOpen === true;
  const totalPoints = teamScore?.totalPoints || 0;

  useEffect(() => {
    if (!uid || !eventData?.id) return;
    const unsub = subscribeToTeamBid(eventData.id, uid, (bid) => {
      if (bid) {
        setExistingBid(bid);
        setSelectedThemeId(bid.selectedThemeId || '');
        setBidPoints(bid.bidPoints || 0);
      }
    });
    return () => unsub();
  }, [uid, eventData?.id]);

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedThemeId) {
      setError('Select one of the revealed challenge themes.');
      return;
    }

    if (typeof bidPoints !== 'number' || bidPoints < 0) {
      setError('Specify a valid non-negative point allocation.');
      return;
    }

    if (bidPoints > totalPoints) {
      setError(`Bid points (${bidPoints}) exceed your available quiz balance (${totalPoints} PTS).`);
      return;
    }

    setLoading(true);
    try {
      const res = await submitBidApi({
        eventId: eventData?.id || 'default-event',
        selectedThemeId,
        bidPoints
      });

      if (res && res.success) {
        setSuccessMsg('Bid successfully registered with authority.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error("Bid submission error:", err);
      setError(err.message || 'Bid submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isBiddingOpen) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
        <div className="h-14 w-14 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-zinc-400">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-3xl font-extrabold text-white">
            Bidding Channel Locked
          </h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-md mx-auto">
            Theme bidding is currently closed. The bidding window opens upon completion of quiz evaluations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Award className="h-3.5 w-3.5" />
          <span>ALLOCATION ARENA</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Theme Priority Bidding
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-3xl font-light">
          Allocate your earned quiz score points towards your preferred challenge theme. Deterministic priority tuples resolve allocations authoritatively.
        </p>
      </div>

      {/* 1080p Widescreen Dual Wing Bidding Layout */}
      <form onSubmit={handleSubmitBid} className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
        {/* Left Bidding Controls Wing (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-white/10 rounded-3xl p-7 bg-white/[0.02] backdrop-blur-xl space-y-6 sticky top-28">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <span className="font-mono text-xs text-white font-bold tracking-widest uppercase">
                BID CONFIGURATION
              </span>
              <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                CHANNEL OPEN
              </span>
            </div>

            {error && (
              <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded-xl font-mono text-xs text-red-300 flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="border border-emerald-500/30 bg-emerald-500/10 p-3.5 rounded-xl font-mono text-xs text-emerald-300 flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Balances */}
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-white/[0.08]">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">
                  QUIZ BALANCE
                </span>
                <span className="font-mono text-2xl font-bold text-white">
                  {formatPoints(totalPoints)} <span className="text-xs text-zinc-500 font-normal">PTS</span>
                </span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">
                  ACTIVE BID
                </span>
                <span className="font-mono text-2xl font-bold text-red-400">
                  {existingBid ? `${formatPoints(existingBid.bidPoints)} PTS` : "0 PTS"}
                </span>
              </div>
            </div>

            {/* Point Allocation Input */}
            <div className="space-y-3">
              <label className="block font-mono text-xs text-zinc-400 uppercase">
                Points to Allocate (0 to {totalPoints})
              </label>

              <input
                type="number"
                min="0"
                max={totalPoints}
                value={bidPoints}
                onChange={(e) => setBidPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-mono text-lg font-bold text-white focus:outline-none focus:border-red-500"
              />

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBidPoints(Math.floor(totalPoints * 0.25))}
                  className="font-mono text-xs text-zinc-400 hover:text-white py-2 border border-white/10 rounded-lg hover:bg-white/[0.04]"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => setBidPoints(Math.floor(totalPoints * 0.50))}
                  className="font-mono text-xs text-zinc-400 hover:text-white py-2 border border-white/10 rounded-lg hover:bg-white/[0.04]"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => setBidPoints(totalPoints)}
                  className="font-mono text-xs text-zinc-400 hover:text-white py-2 border border-white/10 rounded-lg hover:bg-white/[0.04]"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={loading || !selectedThemeId}
              className="w-full bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-md disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM THEME BID</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Rules Info */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 font-mono text-[11px] text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-300 font-bold">
                <Info className="h-3.5 w-3.5" />
                <span>Priority Tuple Hierarchy:</span>
              </div>
              <p className="text-zinc-500 text-[10px] leading-relaxed">
                1. Quiz Performance (Desc) &bull; 2. Bid Points (Desc) &bull; 3. Submission Time (Asc)
              </p>
            </div>
          </div>
        </div>

        {/* Right Themes Selection Wing (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block">
            Select 1 of 4 Revealed Themes
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {publicThemes.map((theme, idx) => {
              const isSelected = selectedThemeId === (theme.id || theme.themeId);
              return (
                <label
                  key={theme.id || theme.themeId || idx}
                  className={`border rounded-3xl p-8 cursor-pointer transition-all duration-200 block relative space-y-4 ${
                    isSelected
                      ? 'border-red-500 bg-red-500/10 shadow-[0_0_35px_rgba(220,38,38,0.2)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                      THEME 0{theme.themeNumber || idx + 1}
                    </span>
                    <input
                      type="radio"
                      name="themeSelection"
                      value={theme.id || theme.themeId}
                      checked={isSelected}
                      onChange={() => setSelectedThemeId(theme.id || theme.themeId)}
                      className="h-4 w-4 accent-red-600"
                    />
                  </div>

                  <h3 className="font-display text-2xl font-bold text-white">
                    {theme.publicName}
                  </h3>

                  <p className="text-zinc-400 text-sm font-light leading-relaxed">
                    {theme.publicDescription}
                  </p>

                  {theme.brief && (
                    <div className="text-xs text-zinc-300 font-light border-l border-white/20 pl-3 py-1">
                      {theme.brief}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-500">
                    <span>ELIGIBILITY</span>
                    <span className="text-zinc-300 font-medium">{theme.eligibility || "All Teams"}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
