import React, { useState, useEffect } from 'react';
import { subscribeToAllBids, subscribeToAllAllocations } from '../../services/firestoreService';
import { finalizeAllocationApi, setResultsRevealApi } from '../../services/callableApi';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ListOrdered, UsersRound } from 'lucide-react';
import { formatPoints, formatTimestamp } from '../../utils/formatters';

export function AllocationConsole({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [bids, setBids] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const isFinalized = eventData?.allocationFinalized === true;
  const resultsRevealed = eventData?.resultsRevealed === true;

  useEffect(() => {
    const unsubBids = subscribeToAllBids(eventId, (b) => setBids(b || []));
    const unsubAllocs = subscribeToAllAllocations(eventId, (a) => setAllocations(a || []));
    return () => {
      unsubBids();
      unsubAllocs();
    };
  }, [eventId]);

  // Temporary display ordering. The backend allocation pass will apply capacity and ranked preferences.
  const sortedBids = [...bids].sort((a, b) => {
    if ((b.scoreSnapshot || 0) !== (a.scoreSnapshot || 0)) return (b.scoreSnapshot || 0) - (a.scoreSnapshot || 0);
    if ((a.submittedAtMs || 0) !== (b.submittedAtMs || 0)) return (a.submittedAtMs || 0) - (b.submittedAtMs || 0);
    return (a.tieBreakValue || 0) - (b.tieBreakValue || 0);
  });

  const handleExecuteFinalize = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await finalizeAllocationApi({ eventId });
      if (res && res.success) {
        setMsg(`Finalized theme allocations for ${res.totalAllocations} team bids.`);
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Allocation finalization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResultsReveal = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await setResultsRevealApi({ eventId, revealed: !resultsRevealed });
      if (res?.success) {
        setMsg(res.resultsRevealed ? 'Results are now visible to all teams.' : 'Results are hidden from teams.');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Unable to update result visibility.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ControlPanel
      title="RANKED PREFERENCE & SEAT ALLOCATION"
      subtitle="Bids, Theme Seats, and Allocation Review"
      badge={
        <StatusBadge
          status={isFinalized ? "FINALIZED" : "PENDING EXECUTION"}
          variant={isFinalized ? "emerald" : "amber"}
        />
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isFinalized || bids.length === 0 || loading}
            onClick={() => setConfirmOpen(true)}
            className="bg-orange-600 px-5 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-orange-500 active:scale-[0.97] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,88,12,0.4)]"
          >
            {isFinalized ? "ALLOCATION FINALIZED" : "FINALIZE ALLOCATION"}
          </button>
          <button
            type="button"
            disabled={!isFinalized || loading}
            onClick={handleResultsReveal}
            className="bg-emerald-600 px-5 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-emerald-500 active:scale-[0.97] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.28)]"
          >
            {resultsRevealed ? "HIDE RESULTS" : "REVEAL RESULTS"}
          </button>
        </div>
      }
    >
      <div className="space-y-6 pt-2 font-mono">
        {msg && (
          <div className="border border-emerald-500/50 bg-emerald-950/60 p-3 text-xs text-emerald-300">
            {msg}
          </div>
        )}

        {/* Allocation explanation */}
        <div className="border border-[#855AB4]/30 bg-[#221545]/40 rounded-2xl p-5 text-xs text-zinc-300 space-y-2">
          <div className="font-bold text-white uppercase text-[11px] mb-2 flex items-center gap-2">
            <ListOrdered className="h-4 w-4 text-[#B26FCB]" /> RANKED PREFERENCE ALLOCATION
          </div>
          <div className="flex gap-2"><UsersRound className="h-3.5 w-3.5 shrink-0 text-[#B26FCB]" />Each theme has an administrator-configured seat limit.</div>
          <div>&bull; Teams are considered using their first preference, then their next ranked preference when an earlier choice is full.</div>
          <div>&bull; Priority is each team’s complete quiz score; tied scores are ordered by earlier submission time.</div>
          <div>&bull; No team is assigned a random theme; allocations must come from that team’s submitted ranking.</div>
        </div>

        {/* Bids Table */}
        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Review Order</th>
                <th className="p-3">Team ID</th>
                <th className="p-3">First Preference</th>
                <th className="p-3">Preference List</th>
                <th className="p-3">Quiz Score</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-[#0a030d]">
              {sortedBids.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-zinc-500">
                    No team bids submitted yet.
                  </td>
                </tr>
              ) : (
                sortedBids.map((bid, idx) => (
                  <tr key={bid.teamId} className="hover:bg-zinc-900/50">
                    <td className="p-3 font-bold text-emerald-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-white">{bid.teamId}</td>
                    <td className="p-3 text-cyan-400">{bid.selectedThemeId}</td>
                    <td className="p-3 text-zinc-300 max-w-56 truncate">{Array.isArray(bid.preferenceIds) ? bid.preferenceIds.join(' → ') : 'Legacy bid: first preference only'}</td>
                    <td className="p-3 text-cyan-300 font-bold">{formatPoints(bid.scoreSnapshot)} PTS</td>
                    <td className="p-3 text-zinc-400">{formatTimestamp(bid.submittedAtMs)}</td>
                    <td className="p-3">
                      <StatusBadge status={isFinalized ? "ALLOCATED" : "SUBMITTED"} variant={isFinalized ? "emerald" : "cyan"} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FINALIZE ALLOCATION CONFIRM DIALOG */}
        <ConfirmDialog
          isOpen={confirmOpen}
          title="EXECUTE FINAL THEME ALLOCATION"
        message="This action will run the approved seat-based ranked-preference allocation, write immutable assignment records, and close the bidding phase. Confirm execution?"
          confirmLabel="AUTHORIZE ALLOCATION"
          requireInputMatch="FINALIZE"
          onConfirm={handleExecuteFinalize}
          onClose={() => setConfirmOpen(false)}
          loading={loading}
        />
      </div>
    </ControlPanel>
  );
}
