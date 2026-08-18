import React, { useState, useEffect } from 'react';
import { subscribeToAllBids, subscribeToAllAllocations } from '../../services/firestoreService';
import { finalizeAllocationApi } from '../../services/callableApi';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Award, CheckCircle, Clock } from 'lucide-react';
import { formatPoints, formatTimestamp } from '../../utils/formatters';

export function AllocationConsole({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [bids, setBids] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const isFinalized = eventData?.allocationFinalized === true;

  useEffect(() => {
    const unsubBids = subscribeToAllBids(eventId, (b) => setBids(b || []));
    const unsubAllocs = subscribeToAllAllocations(eventId, (a) => setAllocations(a || []));
    return () => {
      unsubBids();
      unsubAllocs();
    };
  }, [eventId]);

  // Sort bids preview using Priority Tuple: (scoreSnapshot desc, bidPoints desc, submittedAtMs asc, tieBreakValue asc)
  const sortedBids = [...bids].sort((a, b) => {
    if ((b.scoreSnapshot || 0) !== (a.scoreSnapshot || 0)) return (b.scoreSnapshot || 0) - (a.scoreSnapshot || 0);
    if ((b.bidPoints || 0) !== (a.bidPoints || 0)) return (b.bidPoints || 0) - (a.bidPoints || 0);
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

  return (
    <ControlPanel
      title="PRIORITY BIDDING & ALLOCATION ENGINE"
      subtitle="Priority Tuple Sorting Console"
      badge={
        <StatusBadge
          status={isFinalized ? "FINALIZED" : "PENDING EXECUTION"}
          variant={isFinalized ? "emerald" : "amber"}
        />
      }
      action={
        <button
          type="button"
          disabled={isFinalized || bids.length === 0}
          onClick={() => setConfirmOpen(true)}
          className="bg-red-600 px-5 py-2 font-mono text-xs font-bold uppercase text-white hover:bg-red-500 active:scale-[0.97] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          {isFinalized ? "ALLOCATION FINALIZED" : "FINALIZE ALLOCATION"}
        </button>
      }
    >
      <div className="space-y-6 pt-2 font-mono">
        {msg && (
          <div className="border border-emerald-500/50 bg-emerald-950/60 p-3 text-xs text-emerald-300">
            {msg}
          </div>
        )}

        {/* Priority Tuple Explanation */}
        <div className="border border-zinc-800 bg-zinc-900/60 p-4 text-xs text-zinc-300 space-y-1">
          <div className="font-bold text-white uppercase text-[11px] mb-1">
            PRIORITY TUPLE EVALUATION FORMULA:
          </div>
          <div>&bull; Priority 1: <code className="text-amber-400">scoreSnapshot DESC</code> (Quiz Performance)</div>
          <div>&bull; Priority 2: <code className="text-cyan-400">bidPoints DESC</code> (Point Allocation)</div>
          <div>&bull; Priority 3: <code className="text-red-400">submittedAtMs ASC</code> (Submission Speed)</div>
          <div>&bull; Priority 4: <code className="text-emerald-400">tieBreakValue ASC</code> (Sequence ID)</div>
        </div>

        {/* Bids Table */}
        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Rank / Order</th>
                <th className="p-3">Team ID</th>
                <th className="p-3">Selected Theme</th>
                <th className="p-3">Score Snapshot</th>
                <th className="p-3">Bid Points</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-black">
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
                    <td className="p-3 text-amber-400 font-bold">{formatPoints(bid.scoreSnapshot)} PTS</td>
                    <td className="p-3 text-cyan-300 font-bold">{formatPoints(bid.bidPoints)} PTS</td>
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
          message="This action will sort all bids according to the priority tuple, assign final theme ranks, write immutable records to allocations/, and close the bidding phase. Confirm execution?"
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
