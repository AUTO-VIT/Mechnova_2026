import React from 'react';
import { useEvent } from '../../context/EventContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Radio, CheckCircle, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function EventStatus() {
  const { eventData, serverOffsetMs } = useEvent();
  const currentNow = Date.now() + serverOffsetMs;

  const phases = [
    {
      key: 'registration',
      name: 'TEAM REGISTRATION',
      active: eventData?.registrationOpen !== false,
      completed: eventData?.registrationOpen === false,
      desc: 'Synthetic team credential generation & roster setup.'
    },
    {
      key: 'quiz',
      name: 'AUTHORITATIVE QUIZ PHASE',
      active: eventData?.quizOpen === true,
      completed: eventData?.quizOpen === false && eventData?.themesRevealed,
      desc: '10s read prompt + 10s answer mode per question.'
    },
    {
      key: 'themes',
      name: 'THEME REVEAL PROTOCOL',
      active: eventData?.themesRevealed === true,
      completed: eventData?.themesRevealed === true,
      desc: 'Sanitized public themes copied from locked private vault.'
    },
    {
      key: 'bidding',
      name: 'THEME BIDDING CHANNEL',
      active: eventData?.biddingOpen === true,
      completed: eventData?.allocationFinalized === true,
      desc: 'Points allocation using score snapshot & priority tuple.'
    },
    {
      key: 'allocation',
      name: 'FINAL THEME ALLOCATION',
      active: eventData?.allocationFinalized === true,
      completed: eventData?.allocationFinalized === true,
      desc: 'Deterministic rank assignment finalized.'
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header telemetry banner */}
      <div className="border border-white/10 bg-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            <h1 className="font-mono text-xl font-bold uppercase tracking-wider text-white">
              LIVE SYSTEM STATUS & RADAR TELEMETRY
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Real-time event state monitoring feed synchronized with Firebase Cloud Functions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            status={eventData?.status || "OPERATIONAL"}
            variant="emerald"
          />
          <div className="border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-300">
            TIME: {formatTimestamp(currentNow)}
          </div>
        </div>
      </div>

      {/* Phase Lifecycle Radar */}
      <ControlPanel title="SYSTEM PHASE LIFECYCLE" subtitle="Sequence Monitor">
        <div className="space-y-4 pt-2">
          {phases.map((p, index) => {
            let statusVariant = 'zinc';
            let statusText = 'PENDING';
            if (p.active && !p.completed) {
              statusVariant = 'red';
              statusText = 'IN PROGRESS';
            } else if (p.completed) {
              statusVariant = 'emerald';
              statusText = 'COMPLETED';
            }

            return (
              <div
                key={p.key}
                className={`border p-4 transition-all duration-160 flex flex-wrap items-center justify-between gap-4 ${
                  p.active && !p.completed
                    ? 'border-red-600/60 bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.15)]'
                    : 'border-white/10 bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center font-mono text-sm font-bold border border-white/10 bg-black text-white">
                    0{index + 1}
                  </div>
                  <div>
                    <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                      {p.name}
                    </h4>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={statusText} variant={statusVariant} />
                </div>
              </div>
            );
          })}
        </div>
      </ControlPanel>

      {/* Infrastructure Telemetry Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ControlPanel title="SECURITY ENGINE" subtitle="Zero Pre-Reveal Storage">
          <div className="flex items-center gap-3 text-zinc-300 font-mono text-xs">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span>Private themes isolated in <code className="text-red-400">themesPrivate/</code> with strict deny-by-default rules.</span>
          </div>
        </ControlPanel>

        <ControlPanel title="TIME SYNCHRONIZATION" subtitle="Drift Calibration">
          <div className="flex items-center gap-3 text-zinc-300 font-mono text-xs">
            <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <span>Client clock offset calibrated at <span className="text-amber-400 font-bold">{serverOffsetMs}ms</span> relative to server epoch.</span>
          </div>
        </ControlPanel>

        <ControlPanel title="AUDIT LEDGER" subtitle="Append-only Records">
          <div className="flex items-center gap-3 text-zinc-300 font-mono text-xs">
            <Cpu className="h-5 w-5 text-cyan-400 flex-shrink-0" />
            <span>Every state transition generates immutable records in <code className="text-cyan-400">auditLogs/</code>.</span>
          </div>
        </ControlPanel>
      </div>
    </div>
  );
}
