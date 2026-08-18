import React from 'react';
import { useEvent } from '../../context/EventContext';
import { Radio, CheckCircle2, Clock, ShieldAlert, Cpu, CircleDot } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function EventStatus() {
  const { eventData, serverOffsetMs } = useEvent();
  const currentNow = Date.now() + serverOffsetMs;

  const phases = [
    {
      key: 'registration',
      name: 'Team Registration',
      active: eventData?.registrationOpen !== false,
      completed: eventData?.registrationOpen === false,
      desc: 'Synthetic credential distribution and roster verification.'
    },
    {
      key: 'quiz',
      name: 'Authoritative Quiz Evaluation',
      active: eventData?.quizOpen === true,
      completed: eventData?.quizOpen === false && eventData?.themesRevealed,
      desc: '10s read prompt + 10s answer mode per question.'
    },
    {
      key: 'themes',
      name: 'Audited Theme Reveal',
      active: eventData?.themesRevealed === true,
      completed: eventData?.themesRevealed === true,
      desc: 'Four challenge briefs unlocked simultaneously to all participants.'
    },
    {
      key: 'bidding',
      name: 'Theme Priority Bidding',
      active: eventData?.biddingOpen === true,
      completed: eventData?.allocationFinalized === true,
      desc: 'Quiz points allocation via deterministic priority tuple.'
    },
    {
      key: 'allocation',
      name: 'Final Allocation Lock',
      active: eventData?.allocationFinalized === true,
      completed: eventData?.allocationFinalized === true,
      desc: 'Deterministic rank assignment finalized and published.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-16">
      {/* Top Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>REAL-TIME TELEMETRY</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          System &amp; Event Radar
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-2xl font-light">
          Live event state synchronization. Monitored through Firebase Cloud Functions and authoritative time servers.
        </p>
      </div>

      {/* Phase Timeline - Plain, Elegant, Minimalist */}
      <div className="space-y-6">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 pb-2 border-b border-white/[0.08]">
          EVENT PHASES
        </div>

        <div className="divide-y divide-white/[0.06]">
          {phases.map((p, index) => {
            const isCurrent = p.active && !p.completed;
            return (
              <div
                key={p.key}
                className={`py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200 ${
                  isCurrent ? 'bg-white/[0.02] -mx-4 px-4 rounded-lg' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <span className="font-mono text-sm text-zinc-500 w-6">
                    0{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-white">
                        {p.name}
                      </h2>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                      {p.completed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          DONE
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs font-light mt-1">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="font-mono text-xs text-zinc-500 sm:text-right">
                  {isCurrent ? (
                    <span className="text-red-400 font-bold">IN PROGRESS</span>
                  ) : p.completed ? (
                    <span className="text-zinc-400">COMPLETED</span>
                  ) : (
                    <span className="text-zinc-600">SCHEDULED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Infrastructure Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/[0.08]">
        <div className="space-y-2">
          <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest block">
            AUTHORITY OFFSET
          </span>
          <div className="font-mono text-2xl font-bold text-white">
            {serverOffsetMs} <span className="text-sm font-normal text-zinc-400">ms</span>
          </div>
          <p className="text-xs text-zinc-400 font-light">
            Continuous NTP drift calibration between browser and cloud instance.
          </p>
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest block">
            THEME STORAGE
          </span>
          <div className="font-mono text-2xl font-bold text-white">
            ISOLATED
          </div>
          <p className="text-xs text-zinc-400 font-light">
            Unrevealed themes sealed in admin-only storage with deny-by-default rules.
          </p>
        </div>

        <div className="space-y-2">
          <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest block">
            AUDIT TRAIL
          </span>
          <div className="font-mono text-2xl font-bold text-white">
            ENABLED
          </div>
          <p className="text-xs text-zinc-400 font-light">
            All administrative and state transitions recorded in immutable ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
