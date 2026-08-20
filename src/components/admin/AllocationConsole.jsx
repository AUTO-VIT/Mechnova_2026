import React, { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, ListOrdered, UsersRound } from 'lucide-react';
import { finalizeAllocationApi, setResultsRevealApi } from '../../services/callableApi';
import { subscribeToAllAllocations, subscribeToAllBids } from '../../services/firestoreService';
import { formatPoints, formatTimestamp } from '../../utils/formatters';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ControlPanel } from '../common/ControlPanel';
import { DataLoadingPanel } from '../common/DataLoadingPanel';
import { StatusBadge } from '../common/StatusBadge';

export function AllocationConsole({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [bids, setBids] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [bidsResolved, setBidsResolved] = useState(false);
  const [allocationsResolved, setAllocationsResolved] = useState(false);
  const [dataLoadFailed, setDataLoadFailed] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const isFinalized = eventData?.allocationFinalized === true;
  const resultsRevealed = eventData?.resultsRevealed === true;

  useEffect(() => {
    setBids([]);
    setAllocations([]);
    setBidsResolved(false);
    setAllocationsResolved(false);
    setDataLoadFailed(false);
    const unsubscribeBids = subscribeToAllBids(eventId, (nextBids) => {
      setBids(nextBids || []);
      setBidsResolved(true);
    }, () => {
      setDataLoadFailed(true);
      setBidsResolved(true);
    });
    const unsubscribeAllocations = subscribeToAllAllocations(eventId, (nextAllocations) => {
      setAllocations(nextAllocations || []);
      setAllocationsResolved(true);
    }, () => {
      setDataLoadFailed(true);
      setAllocationsResolved(true);
    });
    return () => { unsubscribeBids(); unsubscribeAllocations(); };
  }, [eventId]);

  const dataResolved = bidsResolved && allocationsResolved;

  const sortedBids = useMemo(() => [...bids].sort((a, b) => {
    if ((b.scoreSnapshot || 0) !== (a.scoreSnapshot || 0)) return (b.scoreSnapshot || 0) - (a.scoreSnapshot || 0);
    if ((a.submittedAtMs || 0) !== (b.submittedAtMs || 0)) return (a.submittedAtMs || 0) - (b.submittedAtMs || 0);
    return (a.tieBreakValue || 0) - (b.tieBreakValue || 0);
  }), [bids]);

  const handleExecuteFinalize = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await finalizeAllocationApi({ eventId });
      if (result?.success) {
        setMessage(`Theme assignments finalized for ${result.totalAllocations} teams.`);
        setConfirmOpen(false);
      }
    } catch (error) {
      console.error(error);
      window.alert(error.message || 'Allocation finalization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResultsReveal = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await setResultsRevealApi({ eventId, revealed: !resultsRevealed });
      if (result?.success) setMessage(result.resultsRevealed ? 'Results are now visible to teams.' : 'Results are now hidden from teams.');
    } catch (error) {
      console.error(error);
      window.alert(error.message || 'Unable to update result visibility.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ControlPanel
      title="Theme allocation"
      subtitle="Review preference submissions, finalize assignments, and control result visibility."
      badge={<StatusBadge status={isFinalized ? 'Finalized' : 'Awaiting finalization'} variant={isFinalized ? 'emerald' : 'amber'} />}
      action={dataResolved && !dataLoadFailed ? <div className="flex flex-wrap gap-2"><button type="button" disabled={isFinalized || bids.length === 0 || loading} onClick={() => setConfirmOpen(true)} className="mn-button mn-button-danger min-h-10">{isFinalized ? 'Allocation finalized' : 'Finalize allocation'}</button><button type="button" disabled={!isFinalized || loading} onClick={handleResultsReveal} className="mn-button mn-button-secondary min-h-10">{resultsRevealed ? <><EyeOff className="h-4 w-4" />Hide results</> : <><Eye className="h-4 w-4" />Reveal results</>}</button></div> : null}
    >
      {!dataResolved ? <DataLoadingPanel label="Loading current bids and allocations…" /> : dataLoadFailed ? <div className="mn-alert mn-alert-error" role="alert">Could not load bids and allocations. Refresh and try again.</div> : <div className="space-y-7">
        {message && <div role="status" className="mn-alert mn-alert-success">{message}</div>}
        <div className="mn-stat-grid">
          <div className="mn-stat"><label>Submitted rankings</label><strong>{bids.length}</strong></div>
          <div className="mn-stat"><label>Assignments</label><strong>{allocations.length}</strong></div>
          <div className="mn-stat"><label>Results</label><strong className={resultsRevealed ? 'text-[var(--mn-green)]' : ''}>{resultsRevealed ? 'Live' : 'Hidden'}</strong></div>
        </div>

        <div className="mn-panel-soft grid gap-3 p-5 text-xs leading-5 text-[var(--mn-muted)] md:grid-cols-3">
          <p className="flex gap-2"><UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mn-violet)]" />Each theme uses its administrator-set capacity.</p>
          <p className="flex gap-2"><ListOrdered className="mt-0.5 h-4 w-4 shrink-0 text-[var(--mn-violet)]" />Each team is checked against its preferences in order.</p>
          <p>Priority uses the team’s full quiz score. Submission time resolves equal scores.</p>
        </div>

        <div className="mn-table-wrap">
          <table className="mn-table">
            <thead><tr><th>Order</th><th>Team</th><th>First choice</th><th>Preference order</th><th>Quiz score</th><th>Submitted</th><th>Status</th></tr></thead>
            <tbody>
              {sortedBids.length === 0 ? <tr><td colSpan="7" className="py-10 text-center text-[var(--mn-faint)]">No preference submissions yet.</td></tr> : sortedBids.map((bid, index) => (
                <tr key={bid.teamId}><td className="font-semibold text-[var(--mn-green)]">#{index + 1}</td><td className="font-medium text-white">{bid.teamId}</td><td className="text-[var(--mn-violet)]">{bid.selectedThemeId}</td><td className="max-w-64 truncate text-[var(--mn-muted)]">{Array.isArray(bid.preferenceIds) ? bid.preferenceIds.join(' → ') : 'First preference only'}</td><td className="font-semibold">{formatPoints(bid.scoreSnapshot)} pts</td><td className="text-[var(--mn-muted)]">{formatTimestamp(bid.submittedAtMs)}</td><td><StatusBadge status={isFinalized ? 'Allocated' : 'Submitted'} variant={isFinalized ? 'emerald' : 'cyan'} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmDialog isOpen={confirmOpen} title="Finalize theme allocation?" message="This runs the seat-based allocation using each team’s quiz score and ranked preferences, writes the assignments, and closes bidding." confirmLabel="Finalize allocation" requireInputMatch="FINALIZE" onConfirm={handleExecuteFinalize} onClose={() => setConfirmOpen(false)} loading={loading} />
      </div>}
    </ControlPanel>
  );
}
