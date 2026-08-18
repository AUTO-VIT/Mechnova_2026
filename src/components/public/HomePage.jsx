import React from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Cpu, Terminal, ArrowRight, ShieldCheck, Zap, Layers, Award } from 'lucide-react';

export function HomePage() {
  const { eventData, publicThemes } = useEvent();
  const { currentUser } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero SCADA Console Section */}
      <div className="relative overflow-hidden border border-red-600/50 bg-zinc-950 p-8 md:p-12 shadow-[0_0_50px_rgba(220,38,38,0.15)]">
        <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500" />
        <div className="absolute top-3 right-4 font-mono text-[10px] text-zinc-600 tracking-widest uppercase">
          TELEMETRY STREAM // VERIFIED
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="AUTOMATION HACKATHON 2026" variant="red" />
            <StatusBadge status="SERVER AUTHORITATIVE ENGINE" variant="cyan" />
          </div>

          <h1 className="font-mono text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            ROBOTICS & AUTOMATION <br />
            <span className="text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]">
              QUIZ & THEME ALLOCATION
            </span>
          </h1>

          <p className="font-mono text-sm text-zinc-300 leading-relaxed max-w-2xl">
            The mission control engine for high-concurrency robotics hackathons. Features timed two-phase quiz evaluations, server-authoritative scoring, sealed secret theme reveals, and deterministic priority bidding.
          </p>

          {/* Hero Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {!currentUser ? (
              <>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-red-600 px-6 py-3 font-mono text-xs font-extrabold uppercase tracking-widest text-white transition-all duration-160 hover:bg-red-500 active:scale-[0.97] shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  <span>REGISTER TEAM NOW</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-2 border border-zinc-700 bg-zinc-900 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-200 transition-all duration-160 hover:border-white hover:bg-zinc-800 active:scale-[0.97]"
                >
                  <span>TEAM GATE ACCESS</span>
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-red-600 px-6 py-3 font-mono text-xs font-extrabold uppercase tracking-widest text-white transition-all duration-160 hover:bg-red-500 active:scale-[0.97] shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              >
                <span>ENTER TEAM HUB</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              to="/themes"
              className="flex items-center gap-2 border border-white/10 bg-black/60 px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 transition-all hover:text-white hover:border-white/30 active:scale-[0.97]"
            >
              <span>VIEW REVEALED THEMES ({publicThemes.length}/4)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* System Telemetry & Operational Controls Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ControlPanel
          title="REGISTRATION PHASE"
          subtitle="Team Identity Protocol"
          badge={
            <StatusBadge
              status={eventData?.registrationOpen !== false ? "OPEN" : "CLOSED"}
              variant={eventData?.registrationOpen !== false ? "emerald" : "zinc"}
            />
          }
        >
          <p className="font-mono text-xs text-zinc-400 mb-4">
            Synthetic credentials generated once upon registration. Secure passkey sheet print capability provided.
          </p>
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Passkeys zero-stored in database</span>
          </div>
        </ControlPanel>

        <ControlPanel
          title="QUIZ ENGINE"
          subtitle="10s Read + 10s Answer"
          badge={
            <StatusBadge
              status={eventData?.quizOpen ? "ACTIVE" : "STANDBY"}
              variant={eventData?.quizOpen ? "red" : "zinc"}
            />
          }
        >
          <p className="font-mono text-xs text-zinc-400 mb-4">
            Strict 20-second per question lifecycle. Answers evaluated server-side with zero pre-reveal keys on client.
          </p>
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Authoritative deadline calculation</span>
          </div>
        </ControlPanel>

        <ControlPanel
          title="THEME BIDDING"
          subtitle="Priority Tuple Allocation"
          badge={
            <StatusBadge
              status={eventData?.biddingOpen ? "OPEN" : "SEALED"}
              variant={eventData?.biddingOpen ? "cyan" : "zinc"}
            />
          }
        >
          <p className="font-mono text-xs text-zinc-400 mb-4">
            Teams allocate earned quiz points to compete for 4 revealed challenge themes. Ties resolved deterministically.
          </p>
          <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
            <Award className="h-4 w-4 text-cyan-400" />
            <span>Deterministic allocation rank</span>
          </div>
        </ControlPanel>
      </div>

      {/* System Pipeline Architecture Overview */}
      <ControlPanel title="EVENT EXECUTION PIPELINE" subtitle="Stage Breakdown">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          {[
            { step: '01', name: 'SYNTHETIC REGISTRATION', desc: 'Teams obtain 8-digit team codes and passkeys.' },
            { step: '02', name: 'AUTHORITATIVE QUIZ', desc: '10s read mode, 10s answer mode per question.' },
            { step: '03', name: 'THEME REVEAL', desc: '4 challenge briefs published simultaneously.' },
            { step: '04', name: 'PRIORITY BIDDING', desc: 'Points allocated; rank assigned by score & time.' }
          ].map((s) => (
            <div key={s.step} className="border border-white/10 bg-zinc-900/60 p-4 relative group hover:border-red-500/50 transition-colors">
              <div className="font-mono text-2xl font-black text-red-500 mb-1">{s.step}</div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-2">{s.name}</div>
              <div className="font-mono text-[11px] text-zinc-400 leading-snug">{s.desc}</div>
            </div>
          ))}
        </div>
      </ControlPanel>
    </div>
  );
}
