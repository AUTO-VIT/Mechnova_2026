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
    <div className="w-full space-y-16">
      {/* Top Title Across 1080p */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#855AB4]/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[#B26FCB] font-mono text-xs tracking-widest uppercase">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>REAL-TIME TELEMETRY</span>
          </div>
          <h1 className="font-sans text-4xl sm:text-6xl font-bold text-white tracking-tight">
            System &amp; Event Radar
          </h1>
          <p className="text-zinc-300 font-sans text-base max-w-2xl font-light">
            Live event state synchronization. Monitored through Firebase Cloud Functions and authoritative time servers.
          </p>
        </div>

        <div className="font-mono text-xs text-[#B26FCB] border border-[#855AB4]/40 rounded-full px-4 py-2 bg-[#221545]/60">
          NTP TIME: <span className="text-white font-bold">{formatTimestamp(currentNow)}</span>
        </div>
      </div>

      {/* Phase Timeline - Expansive 1080p Grid */}
      <div className="space-y-6">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#B26FCB]/70 pb-2 border-b border-[#855AB4]/20">
          EVENT PHASES &bull; SEQUENCE MONITOR
        </div>

        <div className="divide-y divide-[#855AB4]/15">
          {phases.map((p, index) => {
            const isCurrent = p.active && !p.completed;
            return (
              <div
                key={p.key}
                className={`py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors duration-200 ${
                  isCurrent ? 'bg-[#221545]/40 -mx-6 px-6 rounded-2xl border border-[#855AB4]/25' : ''
                }`}
              >
                <div className="flex items-start sm:items-center gap-6">
                  <span className="font-mono text-base text-zinc-500 font-bold w-8">
                    0{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-sans text-xl sm:text-2xl font-bold text-white">
                        {p.name}
                      </h2>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase bg-[#68388D]/40 text-[#B26FCB] border border-[#855AB4]/50 px-2.5 py-0.5 rounded-full font-bold">
                          ACTIVE
                        </span>
                      )}
                      {p.completed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                          DONE
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm font-light mt-1">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="font-mono text-xs text-zinc-400 lg:text-right">
                  {isCurrent ? (
                    <span className="text-[#B26FCB] font-bold">IN PROGRESS</span>
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

      {/* Infrastructure Telemetry Stats Across 1080p */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#855AB4]/20">
        <div className="border border-[#855AB4]/30 rounded-2xl p-8 bg-[#221545]/40 space-y-2 shadow-[0_0_25px_rgba(104,56,141,0.15)]">
          <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-widest block">
            AUTHORITY OFFSET
          </span>
          <div className="font-mono text-3xl font-bold text-white">
            {serverOffsetMs} <span className="text-sm font-normal text-zinc-400">ms</span>
          </div>
          <p className="text-xs text-zinc-400 font-light">
            Continuous NTP drift calibration between browser and cloud instance.
          </p>
        </div>

        <div className="border border-[#855AB4]/30 rounded-2xl p-8 bg-[#221545]/40 space-y-2 shadow-[0_0_25px_rgba(104,56,141,0.15)]">
          <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-widest block">
            THEME STORAGE
          </span>
          <div className="font-mono text-3xl font-bold text-white">
            ISOLATED
          </div>
          <p className="text-xs text-zinc-400 font-light">
            Unrevealed themes sealed in admin-only storage with deny-by-default rules.
          </p>
        </div>

        <div className="border border-[#855AB4]/30 rounded-2xl p-8 bg-[#221545]/40 space-y-2 shadow-[0_0_25px_rgba(104,56,141,0.15)]">
          <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-widest block">
            AUDIT TRAIL
          </span>
          <div className="font-mono text-3xl font-bold text-white">
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
