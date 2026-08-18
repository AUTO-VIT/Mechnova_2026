import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { subscribeToTeamAllocation } from '../../services/firestoreService';
import { Award, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-12">
      {/* Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Award className="h-3.5 w-3.5" />
          <span>OUTCOME LEDGER</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Allocation Results
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-2xl font-light">
          Authoritative allocation outcome computed via priority tuple sorting.
        </p>
      </div>

      {!isFinalized ? (
        <div className="py-20 text-center border-y border-white/[0.08] space-y-4">
          <div className="h-12 w-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-amber-400">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-white">
              Allocation in Progress
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-md mx-auto">
              Bidding is currently being processed by event administration. Final theme allocations and ranks will appear automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Confirmed Theme Hero */}
          <div className="border border-white/10 rounded-2xl p-8 sm:p-10 bg-white/[0.02] space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                OFFICIAL ASSIGNMENT
              </span>
              <span className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                RANK #{allocation?.rank || 1}
              </span>
            </div>

            {assignedTheme ? (
              <div className="space-y-4">
                <span className="font-mono text-xs text-red-500 uppercase tracking-widest block">
                  THEME 0{assignedTheme.themeNumber}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                  {assignedTheme.publicName}
                </h2>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                  {assignedTheme.publicDescription}
                </p>
                {assignedTheme.brief && (
                  <div className="text-xs text-zinc-300 font-light border-l border-white/20 pl-4 py-2 mt-4">
                    {assignedTheme.brief}
                  </div>
                )}
              </div>
            ) : (
              <div className="font-mono text-sm text-zinc-400">
                Theme Assignment ID: {allocation?.themeId || "Unassigned"}
              </div>
            )}
          </div>

          {/* Allocation Breakdown Strip */}
          <div className="grid grid-cols-3 gap-6 py-6 border-y border-white/[0.08] font-mono text-center">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">FINAL RANK</span>
              <span className="text-2xl font-bold text-emerald-400">#{allocation?.rank || 1}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">SCORE SNAPSHOT</span>
              <span className="text-2xl font-bold text-white">{formatPoints(allocation?.scoreSnapshot || 0)} PTS</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">POINTS SPENT</span>
              <span className="text-2xl font-bold text-red-400">{formatPoints(allocation?.bidPoints || 0)} PTS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
