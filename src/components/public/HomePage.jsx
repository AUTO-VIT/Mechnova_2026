import React from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, ShieldCheck, Zap, Award, Sparkles, Terminal, ChevronRight, Activity, Disc } from 'lucide-react';

export function HomePage() {
  const { eventData, publicThemes } = useEvent();
  const { currentUser } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-24">
      {/* Hero Section - Plain, Sleek, Space & Robotics Frontier */}
      <section className="text-center pt-8 md:pt-16 pb-6 relative flex flex-col items-center">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Technical Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300">
            MECHATHON 2026 // ROBOTICS & AUTONOMY
          </span>
        </div>

        {/* Large Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.08] mb-6">
          Autonomous Systems <br className="hidden sm:inline" />
          <span className="text-zinc-400 font-light">&amp;</span> Intelligent Control.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl font-sans font-light leading-relaxed mb-10">
          The high-concurrency evaluation and theme allocation platform for engineering teams. Timed quiz verification, server-authoritative scoring, and priority bidding.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {!currentUser ? (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-7 py-3.5 rounded-full hover:bg-zinc-200 transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95"
              >
                <span>REGISTER TEAM</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/20 bg-transparent text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-7 py-3.5 rounded-full hover:border-white hover:bg-white/[0.04] transition-all duration-200 active:scale-95"
              >
                <span>TEAM PORTAL</span>
              </Link>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 bg-red-600 text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-red-500 transition-all duration-200 shadow-[0_0_25px_rgba(220,38,38,0.4)] active:scale-95"
            >
              <span>ACCESS TEAM DASHBOARD</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          <Link
            to="/themes"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-mono text-xs tracking-[0.15em] uppercase px-5 py-3.5 transition-colors"
          >
            <span>THEMES ({publicThemes.length}/4)</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Telemetry Numbers & Core Pillars - Plain, Borderless, Minimal */}
      <section className="border-y border-white/[0.08] py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
              <ShieldCheck className="h-4 w-4" />
              <span>SYNTHETIC AUTH</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">One-Time Passkey Identity</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Teams register 2-4 members and receive cryptographic identifiers. Passkeys are never stored plaintext in databases.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs tracking-widest uppercase">
              <Zap className="h-4 w-4" />
              <span>QUIZ ENGINE</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">10s Read + 10s Answer</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Strict 2-phase question lifecycle. Server timestamps govern deadlines with zero pre-reveal keys exposed to clients.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase">
              <Award className="h-4 w-4" />
              <span>THEME BIDDING</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white">Deterministic Priority</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Points earned during the quiz are bid towards 4 challenge themes. Tie-breaks are resolved authoritatively.
            </p>
          </div>
        </div>
      </section>

      {/* 4-Step Execution Pipeline - Open, Clean, High-End */}
      <section className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-red-500 uppercase tracking-[0.25em] mb-2">
              EVENT ARCHITECTURE
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              Operational Sequence
            </h2>
          </div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            PHASE 01 — 04
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Team Registration',
              desc: 'Submit roster, receive team code & secure credential sheet.'
            },
            {
              step: '02',
              title: 'Authoritative Quiz',
              desc: 'Complete timed robotics challenges under strict server time.'
            },
            {
              step: '03',
              title: 'Audited Theme Reveal',
              desc: 'Four challenge briefs unlocked simultaneously prior to event.'
            },
            {
              step: '04',
              title: 'Priority Allocation',
              desc: 'Submit point bids; server computes final deterministic ranks.'
            }
          ].map((item) => (
            <div
              key={item.step}
              className="space-y-3 border-t border-white/10 pt-6 group hover:border-red-500 transition-colors duration-300"
            >
              <span className="font-mono text-xs text-zinc-500 group-hover:text-red-400 font-bold transition-colors">
                {item.step}
              </span>
              <h3 className="font-display text-lg font-bold text-white">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action Banner - Sleek, Borderless */}
      <section className="relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent p-10 md:p-14 text-center border border-white/[0.08] overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display text-2xl md:text-4xl font-bold text-white">
            Ready for the Challenge?
          </h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">
            Register your team today to participate in the autonomous robotics & cyber-physical systems hackathon.
          </p>
          <div className="pt-2">
            <Link
              to={currentUser ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-all active:scale-95"
            >
              <span>{currentUser ? "GO TO DASHBOARD" : "START REGISTRATION"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
