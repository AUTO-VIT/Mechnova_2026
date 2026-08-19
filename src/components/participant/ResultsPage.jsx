import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { subscribeToTeamAllocation } from '../../services/firestoreService';
import { Award, CheckCircle2, Clock, ListOrdered, UsersRound } from 'lucide-react';
import { formatPoints } from '../../utils/formatters';

export function ResultsPage() {
  const { uid, teamData } = useAuth();
  const { eventData, publicThemes } = useEvent();

  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFinalized = eventData?.allocationFinalized === true;
  const resultsRevealed = eventData?.resultsRevealed === true;

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

  const preferenceRank = allocation?.preferenceRank || allocation?.assignedPreferenceRank;

  return (
    <div className="max-w-4xl mx-auto px-2 md:px-6 space-y-12">
      {/* Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-orange-500 font-mono text-xs tracking-widest uppercase">
          <Award className="h-3.5 w-3.5" />
          <span>OUTCOME LEDGER</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-5xl font-bold text-white tracking-tight">
          Allocation Results
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-2xl font-light">
          Your official challenge assignment appears here after the administrator completes seat-based, ranked-preference allocation.
        </p>
      </div>

      {!isFinalized ? (
        <div className="surface-orbit py-20 text-center border border-[#855AB4]/30 rounded-3xl space-y-4">
          <div className="h-12 w-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-amber-400">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="font-sans text-2xl font-bold text-white">
              Allocation in Progress
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-md mx-auto">
              Bids are being checked against each theme’s available seats and each team’s ranked preferences. Your official assignment will appear automatically.
            </p>
          </div>
        </div>
      ) : !resultsRevealed ? (
        <div className="surface-orbit py-20 text-center border border-[#855AB4]/30 rounded-3xl space-y-4">
          <div className="h-12 w-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-amber-400">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="font-sans text-2xl font-bold text-white">Results are being prepared</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-md mx-auto">Allocations are complete. Your official assignment will appear when the administrator reveals results.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Confirmed Theme Hero */}
          <div className="surface-orbit border border-[#855AB4]/30 rounded-3xl p-8 sm:p-10 space-y-6 shadow-[0_0_40px_rgba(104,56,141,0.18)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                OFFICIAL ASSIGNMENT
              </span>
              <span className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                {preferenceRank ? `PREFERENCE #${preferenceRank}` : 'OFFICIAL RESULT'}
              </span>
            </div>

            {assignedTheme ? (
              <div className="space-y-4">
                <span className="font-mono text-xs text-orange-500 uppercase tracking-widest block">
                  THEME 0{assignedTheme.themeNumber}
                </span>
                <h2 className="font-sans text-3xl sm:text-4xl font-bold text-white">
                  {assignedTheme.publicName || assignedTheme.name}
                </h2>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">
                  {assignedTheme.publicDescription || assignedTheme.description}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-white/[0.08] font-mono text-center">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">ASSIGNED PREFERENCE</span>
              <span className="text-2xl font-bold text-emerald-400">{preferenceRank ? `#${preferenceRank}` : '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block mb-1">QUIZ POINTS</span>
              <span className="text-2xl font-bold text-white">{formatPoints(allocation?.scoreSnapshot || 0)} PTS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#855AB4]/25 bg-[#221545]/40 p-4 flex items-start gap-3">
              <ListOrdered className="h-4 w-4 mt-0.5 text-[#B26FCB]" />
              <p className="text-xs leading-relaxed text-zinc-400">The assigned theme is the highest available option from your submitted preference order.</p>
            </div>
            <div className="rounded-2xl border border-[#855AB4]/25 bg-[#221545]/40 p-4 flex items-start gap-3">
              <UsersRound className="h-4 w-4 mt-0.5 text-[#B26FCB]" />
              <p className="text-xs leading-relaxed text-zinc-400">Theme capacity is set by the administrator before the bidding phase starts.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
