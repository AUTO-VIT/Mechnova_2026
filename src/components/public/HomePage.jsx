import React from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldCheck, Zap, Award, ChevronRight, Activity, Disc, Terminal, Radio, Cpu, Lock, CheckCircle2, Sparkles, Orbit } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function HomePage() {
  const { eventData, publicThemes, serverOffsetMs } = useEvent();
  const { currentUser } = useAuth();
  const currentNow = Date.now() + serverOffsetMs;

  return (
    <div className="w-full space-y-28">
      {/* Widescreen Deep Space Hero Section (Dual Wing Across 1080p Viewport) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center pt-4 md:pt-10">
        {/* Left Wing (7 Cols) - Large Bold Typography & Direct CTAs */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sky-500/25 bg-sky-500/[0.05] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-sky-200">
              MECHATHON 2026 // SPACE ROBOTICS &amp; AUTONOMY
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-extrabold text-white tracking-tight leading-[1.04]">
            Autonomous <br className="hidden sm:inline" />
            Systems <span className="text-sky-400 font-light">&amp;</span> <br className="hidden sm:inline" />
            Deep Space Control
          </h1>

          <p className="text-base sm:text-lg xl:text-xl text-zinc-300 font-sans font-light leading-relaxed max-w-2xl">
            The next-generation mission control and evaluation platform for aerospace &amp; robotics engineers. Features timed two-phase quiz verification, sealed theme reveals, and deterministic priority bidding.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {!currentUser ? (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all duration-200 shadow-[0_0_35px_rgba(59,130,246,0.45)] active:scale-95 border border-blue-400/30"
                >
                  <span>REGISTER TEAM</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border border-sky-500/30 bg-sky-500/[0.03] text-sky-200 font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:border-sky-400 hover:bg-sky-500/[0.08] transition-all duration-200 active:scale-95"
                >
                  <span>TEAM GATEWAY</span>
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-9 py-4 rounded-full transition-all duration-200 shadow-[0_0_35px_rgba(59,130,246,0.5)] active:scale-95 border border-blue-400/30"
              >
                <span>ACCESS TEAM COCKPIT</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <Link
              to="/themes"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-sky-300 font-mono text-xs tracking-[0.15em] uppercase px-5 py-4 transition-colors"
            >
              <span>THEMES ({publicThemes.length}/4)</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-sky-500/10 max-w-xl">
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">CHALLENGES</span>
              <span className="font-display text-xl font-bold text-white">4 Domains</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">QUIZ ENGINE</span>
              <span className="font-display text-xl font-bold text-white">10s + 10s</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">AUTHORITY</span>
              <span className="font-display text-xl font-bold text-sky-400">Trusted</span>
            </div>
          </div>
        </div>

        {/* Right Wing (5 Cols) - Live Galaxy Space Telemetry HUD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-sky-500/20 bg-[#06060e]/80 backdrop-blur-2xl p-8 xl:p-10 space-y-8 shadow-[0_0_50px_rgba(59,130,246,0.1)] relative overflow-hidden">
            {/* Ambient Background Nebula Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-sky-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />

            {/* HUD Header */}
            <div className="flex items-center justify-between border-b border-sky-500/10 pb-5">
              <div className="flex items-center gap-2.5 font-mono text-xs text-sky-200 font-bold tracking-widest uppercase">
                <Radio className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                <span>MISSION RADAR HUD</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">ORBITAL FEED</span>
            </div>

            {/* Real-time Status Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="font-mono text-xs text-zinc-400">Team Registration</span>
                <span className="font-mono text-xs text-emerald-400 font-semibold uppercase">
                  {eventData?.registrationOpen !== false ? "Active & Open" : "Closed"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="font-mono text-xs text-zinc-400">Timed Quiz Channel</span>
                <span className={`font-mono text-xs uppercase font-semibold ${
                  eventData?.quizOpen ? "text-sky-400" : "text-zinc-500"
                }`}>
                  {eventData?.quizOpen ? "Online & Running" : "Standby"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <span className="font-mono text-xs text-zinc-400">Theme Bidding Channel</span>
                <span className={`font-mono text-xs uppercase font-semibold ${
                  eventData?.biddingOpen ? "text-cyan-400" : "text-zinc-500"
                }`}>
                  {eventData?.biddingOpen ? "Open for Bids" : "Locked"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-mono text-xs text-zinc-400">Revealed Themes</span>
                <span className="font-mono text-xs text-white font-bold">
                  {publicThemes.length} / 4 Published
                </span>
              </div>
            </div>

            {/* Telemetry Footer Callout */}
            <div className="pt-2">
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/[0.03] p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">ORBITAL NTP TIMESTAMP</span>
                  <span className="font-mono text-xs text-sky-200 font-bold">{formatTimestamp(currentNow)}</span>
                </div>
                <div className="h-8 w-8 rounded-full border border-sky-500/20 flex items-center justify-center text-sky-300 bg-sky-500/[0.05]">
                  <Orbit className="h-4 w-4 animate-spin" style={{ animationDuration: '12s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width 4-Column Domain Exploration */}
      <section className="space-y-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sky-500/10 pb-4">
          <div>
            <span className="font-mono text-xs text-sky-400 uppercase tracking-[0.25em] block mb-1">
              CHALLENGE DOMAINS
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
              Engineering Disciplines
            </h2>
          </div>
          <p className="text-zinc-400 text-xs font-light max-w-md font-sans">
            Competitors tackle core cyber-physical challenges across space kinematics, perception, autonomous navigation, and satellite swarms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              code: 'DOM-01',
              title: 'Autonomous Kinematics',
              desc: 'Orbital trajectory generation, SLAM algorithms, planetary path smoothing, and real-time obstacle avoidance.'
            },
            {
              code: 'DOM-02',
              title: 'Perception & Vision',
              desc: 'Spatial depth mapping, neural inference at the edge, lunar surface defect inspection, and low-latency feature tracking.'
            },
            {
              code: 'DOM-03',
              title: 'Industrial PLC & SCADA',
              desc: 'Deterministic ladder logic, state machine interlocking, bus communication protocols, and safety instrumentation.'
            },
            {
              code: 'DOM-04',
              title: 'Satellite Swarm Telemetry',
              desc: 'Decentralized consensus, constellation fleet coordination, dynamic load balancing, and fault-tolerant mesh routing.'
            }
          ].map((d) => (
            <div
              key={d.code}
              className="border border-sky-500/15 rounded-2xl p-7 bg-[#06060e]/50 hover:border-sky-400/40 hover:bg-sky-500/[0.04] transition-all duration-300 space-y-4 group backdrop-blur-sm shadow-sm"
            >
              <span className="font-mono text-xs text-sky-400 font-bold tracking-widest block">
                {d.code}
              </span>
              <h3 className="font-display text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                {d.title}
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                {d.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-Width 4-Stage Operational Sequence */}
      <section className="space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-sky-500/10 pb-4">
          <div>
            <span className="font-mono text-xs text-sky-400 uppercase tracking-[0.25em] block mb-1">
              SYSTEM LIFECYCLE
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
              Platform Workflow
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest hidden sm:inline">
            4 PHASES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              num: '01',
              title: 'Synthetic Registration',
              desc: 'Teams register 2-4 members and receive cryptographic identifiers. Passkeys are never stored in plaintext.'
            },
            {
              num: '02',
              title: 'Authoritative Quiz',
              desc: 'Strict 10s prompt analysis followed by 10s option selection. Deadlines evaluated authoritatively by cloud functions.'
            },
            {
              num: '03',
              title: 'Theme Reveal',
              desc: 'Four secret competition briefs are unlocked simultaneously via an audited administrative trigger.'
            },
            {
              num: '04',
              title: 'Priority Allocation',
              desc: 'Teams bid earned quiz points. Ranks and theme allocations are assigned deterministically via priority tuple.'
            }
          ].map((s) => (
            <div key={s.num} className="space-y-3 pt-6 border-t border-sky-500/15 group hover:border-sky-400 transition-colors duration-300">
              <span className="font-mono text-xs text-zinc-500 group-hover:text-sky-400 font-bold block transition-colors">
                PHASE {s.num}
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                {s.title}
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-Width Panoramic Galaxy CTA Banner */}
      <section className="relative rounded-3xl bg-gradient-to-r from-blue-950/40 via-sky-950/20 to-transparent p-12 lg:p-16 border border-sky-500/20 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.9)]"></span>
            <span>REGISTRATION WINDOW ACTIVE</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready for Launch?
          </h2>

          <p className="text-zinc-300 text-base font-light leading-relaxed max-w-xl">
            Register your team today, verify credentials, and prepare for the timed autonomous robotics evaluation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to={currentUser ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-blue-400/30"
            >
              <span>{currentUser ? "TEAM COCKPIT" : "REGISTER TEAM NOW"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/status"
              className="inline-flex items-center gap-2 border border-sky-500/30 bg-sky-500/[0.04] text-sky-200 font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-sky-500/[0.08] hover:border-sky-400 transition-all active:scale-95"
            >
              <span>VIEW SYSTEM RADAR</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
