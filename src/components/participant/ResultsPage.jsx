import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { subscribeToTeamAllocation } from '../../services/firestoreService';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Award, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { formatPoints, formatTimestamp } from '../../utils/formatters';

export function ResultsPage() {
  const { uid, teamData } = useAuth();
  const { eventData, publicThemes } = useEvent();

  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFinalized = eventData?.allocationFinalized === true;

  useEffect(() => {
    if (!uid || !eventData?.id) return;
    setLoading(true);
    const unsub = subscribeToTeamAllocation(eventData.id, uid, (alloc) => {
      setAllocation(alloc);
      setLoading(false);
    });
    return () => unsub();
  }, [uid, eventData?.id]);

  const assignedTheme = publicThemes.find(
    (t) => (t.id || t.themeId) === allocation?.themeId
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border border-white/10 bg-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-400" />
            <h1 className="font-mono text-xl font-black uppercase tracking-wider text-white">
              FINAL THEME ALLOCATION RESULTS
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Server-authoritative priority allocation outcome for team <span className="text-red-400 font-bold">{teamData?.teamName}</span> ({teamData?.teamCode}).
          </p>
        </div>

        <StatusBadge
          status={isFinalized ? "ALLOCATION FINALIZED" : "ALLOCATION PENDING"}
          variant={isFinalized ? "emerald" : "amber"}
        />
      </div>

      {!isFinalized ? (
        <ControlPanel title="ALLOCATION ENGINE RUNNING" subtitle="Awaiting Final Execution">
          <div className="p-8 text-center space-y-4">
            <Clock className="h-12 w-12 text-amber-400 animate-pulse mx-auto" />
            <h3 className="font-mono text-base font-bold text-white uppercase">
              THEME ALLOCATION IS CURRENTLY BEING CALCULATED
            </h3>
            <p className="font-mono text-xs text-zinc-400 max-w-md mx-auto">
              Once bidding closes, administrative execution will finalize the priority tuple sort and assign ranks. Results will update automatically.
            </p>
          </div>
        </ControlPanel>
      ) : (
        <ControlPanel
          title="OFFICIAL ASSIGNED THEME RESULT"
          subtitle="Final Rank Assignment"
          badge={<StatusBadge status={`RANK #${allocation?.rank || 1}`} variant="emerald" />}
          hazardBorder={false}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 bg-emerald-950/40 p-4 border border-emerald-500/40">
              <CheckCircle className="h-8 w-8 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-mono text-sm font-extrabold text-emerald-300 uppercase">
                  CONFIRMED ALLOCATION ASSIGNMENT
                </div>
                <div className="font-mono text-xs text-zinc-300">
                  Finalized at {formatTimestamp(allocation?.finalizedAtMs)}
                </div>
              </div>
            </div>

            {/* Assigned Theme Card */}
            {assignedTheme ? (
              <div className="border border-white/15 bg-black p-6 space-y-4 font-mono">
                <div className="text-xs uppercase text-zinc-500">ASSIGNED CHALLENGE THEME</div>
                <h2 className="text-2xl font-black text-white">
                  THEME 0{assignedTheme.themeNumber}: {assignedTheme.publicName}
                </h2>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {assignedTheme.publicDescription}
                </p>

                {assignedTheme.brief && (
                  <div className="bg-zinc-900/90 p-4 border border-zinc-800 text-xs text-zinc-200">
                    <strong>BRIEF:</strong> {assignedTheme.brief}
                  </div>
                )}
              </div>
            ) : (
              <div className="font-mono text-xs text-zinc-400">
                Theme ID: {allocation?.themeId || "Unassigned"}
              </div>
            )}

            {/* Telemetry metrics breakdown */}
            <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4 font-mono text-center">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">ALLOCATION RANK</div>
                <div className="text-xl font-bold text-emerald-400">#{allocation?.rank || 1}</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">SCORE SNAPSHOT</div>
                <div className="text-xl font-bold text-amber-400">{formatPoints(allocation?.scoreSnapshot || 0)} PTS</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">BID POINTS SPENT</div>
                <div className="text-xl font-bold text-cyan-400">{formatPoints(allocation?.bidPoints || 0)} PTS</div>
              </div>
            </div>
          </div>
        </ControlPanel>
      )}
    </div>
  );
}
