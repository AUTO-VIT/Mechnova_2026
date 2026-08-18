import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { submitBidApi } from '../../services/callableApi';
import { subscribeToTeamBid } from '../../services/firestoreService';
import { Award, CheckCircle2, ShieldAlert, ArrowRight, Layers, Lock, Loader2 } from 'lucide-react';
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
      <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="h-12 w-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-zinc-400">
          <Lock className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-white">
            Bidding Channel Locked
          </h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">
            Theme bidding is currently closed. The bidding window opens upon completion of quiz evaluations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-12">
      {/* Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Award className="h-3.5 w-3.5" />
          <span>ALLOCATION CHANNEL</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Theme Priority Bidding
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-2xl font-light">
          Allocate your earned quiz score points towards your preferred challenge theme. Deterministic priority tuples resolve allocations.
        </p>
      </div>

      {/* Score Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-white/[0.08]">
        <div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
            QUIZ BALANCE
          </span>
          <span className="font-mono text-2xl font-bold text-white">
            {formatPoints(totalPoints)} <span className="text-xs text-zinc-500 font-normal">PTS</span>
          </span>
        </div>

        <div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
            ACTIVE BID
          </span>
          <span className="font-mono text-2xl font-bold text-red-400">
            {existingBid ? `${formatPoints(existingBid.bidPoints)} PTS` : "0 PTS"}
          </span>
        </div>

        <div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
            TIE-BREAK PROTOCOL
          </span>
          <span className="font-mono text-xs text-zinc-400 block pt-1">
            Score &rarr; Bid Points &rarr; Time
          </span>
        </div>
      </div>

      {/* Bidding Form */}
      <form onSubmit={handleSubmitBid} className="space-y-10">
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

        {/* Theme Radio Cards */}
        <div className="space-y-4">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block">
            Select Challenge Theme (1 of 4)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicThemes.map((theme, idx) => {
              const isSelected = selectedThemeId === (theme.id || theme.themeId);
              return (
                <label
                  key={theme.id || theme.themeId || idx}
                  className={`border rounded-2xl p-6 cursor-pointer transition-all duration-150 block relative ${
                    isSelected
                      ? 'border-red-500 bg-red-500/10 shadow-[0_0_25px_rgba(220,38,38,0.15)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
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

                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    {theme.publicName}
                  </h3>

                  <p className="text-zinc-400 text-xs font-light leading-relaxed">
                    {theme.publicDescription}
                  </p>
                </label>
              );
            })}
          </div>
        </div>

        {/* Point Input */}
        <div className="space-y-3 pt-2">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block">
            Bid Points (0 to {totalPoints})
          </span>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="number"
              min="0"
              max={totalPoints}
              value={bidPoints}
              onChange={(e) => setBidPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full sm:w-64 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-mono text-lg font-bold text-white focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setBidPoints(Math.floor(totalPoints / 2))}
                className="font-mono text-xs text-zinc-400 hover:text-white px-4 py-3 border border-white/10 rounded-xl hover:bg-white/[0.05]"
              >
                50% ({Math.floor(totalPoints / 2)} PTS)
              </button>
              <button
                type="button"
                onClick={() => setBidPoints(totalPoints)}
                className="font-mono text-xs text-zinc-400 hover:text-white px-4 py-3 border border-white/10 rounded-xl hover:bg-white/[0.05]"
              >
                Max ({totalPoints} PTS)
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-white/[0.08]">
          <button
            type="submit"
            disabled={loading || !selectedThemeId}
            className="w-full sm:w-auto bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-md disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>PROCESSING BID...</span>
              </>
            ) : (
              <>
                <span>CONFIRM THEME BID</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
