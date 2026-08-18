import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { submitBidApi } from '../../services/callableApi';
import { subscribeToTeamBid } from '../../services/firestoreService';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { LockedPanel } from '../common/LockedPanel';
import { Award, CheckCircle, ShieldAlert, ArrowRight, Layers } from 'lucide-react';
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

  // Real-time subscription to team's submitted bid
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
      setError('Specify a valid non-negative bid point amount.');
      return;
    }

    if (bidPoints > totalPoints) {
      setError(`Bid points (${bidPoints}) exceed your earned quiz score balance (${totalPoints} PTS).`);
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
        setSuccessMsg('SYSTEM BID REGISTERED SUCCESSFULLY');
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
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LockedPanel
          title="THEME BIDDING CHANNEL IS SEALED"
          message="Theme bidding is currently CLOSED. Bidding will open after quiz scores and theme reveals are authorized by administrative directive."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="border border-white/10 bg-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan-400" />
            <h1 className="font-mono text-xl font-black uppercase tracking-wider text-white">
              THEME BIDDING & PRIORITY ALLOCATION CONSOLE
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Allocate quiz score points to bid on preferred robotics challenge themes.
          </p>
        </div>

        <StatusBadge status="CHANNEL OPEN" variant="cyan" />
      </div>

      {/* Score Telemetry & Existing Bid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ControlPanel title="QUIZ SCORE BALANCE" subtitle="Total Points Available">
          <div className="font-mono text-4xl font-extrabold text-amber-400 tracking-tight">
            {formatPoints(totalPoints)} <span className="text-sm text-zinc-500 font-normal">PTS</span>
          </div>
        </ControlPanel>

        <ControlPanel title="CURRENT SUBMITTED BID" subtitle="Active Allocation State">
          <div className="font-mono text-xl font-bold text-white">
            {existingBid ? (
              <span className="text-cyan-400">{formatPoints(existingBid.bidPoints)} PTS allocated</span>
            ) : (
              <span className="text-zinc-500 font-normal">NO BID REGISTERED</span>
            )}
          </div>
          {existingBid && (
            <div className="font-mono text-[10px] text-zinc-400 mt-1">
              Submitted: {formatTimestamp(existingBid.submittedAtMs)}
            </div>
          )}
        </ControlPanel>

        <ControlPanel title="PRIORITY TUPLE RULE" subtitle="Tie Break Resolution">
          <div className="font-mono text-[11px] text-zinc-300 space-y-1">
            <div>1. Total Score (Desc)</div>
            <div>2. Bid Points (Desc)</div>
            <div>3. Submission Time (Asc)</div>
            <div>4. Sequence ID (Asc)</div>
          </div>
        </ControlPanel>
      </div>

      {/* Bidding Form */}
      <form onSubmit={handleSubmitBid} className="space-y-6">
        {error && (
          <div className="border border-red-500/50 bg-red-950/60 p-3 font-mono text-xs text-red-300 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="border border-emerald-500/50 bg-emerald-950/60 p-3 font-mono text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Theme Selection Grid */}
        <ControlPanel title="SELECT TARGET CHALLENGE THEME" subtitle="Choose 1 of 4 Revealed Themes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {publicThemes.map((theme, idx) => {
              const isSelected = selectedThemeId === (theme.id || theme.themeId);
              return (
                <label
                  key={theme.id || theme.themeId || idx}
                  className={`border p-5 cursor-pointer font-mono transition-all duration-160 active:scale-[0.97] block ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-white/30 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="themeSelection"
                        value={theme.id || theme.themeId}
                        checked={isSelected}
                        onChange={() => setSelectedThemeId(theme.id || theme.themeId)}
                        className="h-4 w-4 accent-cyan-400"
                      />
                      <span className="font-bold text-sm uppercase text-white">
                        THEME 0{theme.themeNumber || idx + 1}: {theme.publicName}
                      </span>
                    </div>
                    {isSelected && <StatusBadge status="SELECTED" variant="cyan" />}
                  </div>

                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                    {theme.publicDescription}
                  </p>
                </label>
              );
            })}
          </div>
        </ControlPanel>

        {/* Point Allocation Input & Action */}
        <ControlPanel title="ALLOCATE BID SCORE POINTS" subtitle="Max Available: Total Quiz Score">
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block font-mono text-xs uppercase font-bold text-zinc-300 mb-1.5">
                  BID POINTS TO ALLOCATE (0 TO {totalPoints})
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalPoints}
                  value={bidPoints}
                  onChange={(e) => setBidPoints(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full border border-zinc-700 bg-black px-4 py-2.5 font-mono text-lg font-bold text-cyan-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBidPoints(Math.floor(totalPoints / 2))}
                  className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-300 hover:text-white"
                >
                  50% ({Math.floor(totalPoints / 2)} PTS)
                </button>
                <button
                  type="button"
                  onClick={() => setBidPoints(totalPoints)}
                  className="border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-300 hover:text-white"
                >
                  MAX ({totalPoints} PTS)
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedThemeId}
                className="bg-cyan-600 px-8 py-3.5 font-mono text-xs font-extrabold uppercase tracking-widest text-white transition-all hover:bg-cyan-500 active:scale-[0.97] shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center gap-2"
              >
                <span>{loading ? "REGISTERING BID..." : "EXECUTE SYSTEM BID"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </ControlPanel>
      </form>
    </div>
  );
}
