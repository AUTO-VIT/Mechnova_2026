import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { subscribeToCmsContent, DEFAULT_HOMEPAGE_CMS } from '../../services/firestoreService';
import { ArrowRight, ChevronRight, Radio, Orbit, Megaphone } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function HomePage() {
  const { eventData, publicThemes, serverOffsetMs, eventId } = useEvent();
  const { currentUser } = useAuth();
  const currentNow = Date.now() + serverOffsetMs;
  const [cms, setCms] = useState(DEFAULT_HOMEPAGE_CMS);

  useEffect(() => {
    const unsub = subscribeToCmsContent(eventId || 'default-event', 'homepage', (data) => {
      if (data) setCms(prev => ({ ...prev, ...data }));
    });
    return () => unsub();
  }, [eventId]);

  const domains = [
    {
      code: cms.domain1Category || 'DOM-01',
      title: cms.domain1Title || 'Autonomous Kinematics',
      desc: cms.domain1Desc || 'Trajectory generation, SLAM algorithms, path smoothing, and real-time obstacle avoidance in unstructured environments.'
    },
    {
      code: cms.domain2Category || 'DOM-02',
      title: cms.domain2Title || 'Perception & Vision',
      desc: cms.domain2Desc || 'Spatial depth mapping, neural inference at the edge, defect inspection, and low-latency feature tracking.'
    },
    {
      code: cms.domain3Category || 'DOM-03',
      title: cms.domain3Title || 'Industrial PLC & SCADA',
      desc: cms.domain3Desc || 'Deterministic ladder logic, state machine interlocking, bus communication protocols, and safety instrumentation.'
    },
    {
      code: cms.domain4Category || 'DOM-04',
      title: cms.domain4Title || 'Multi-Agent Swarms',
      desc: cms.domain4Desc || 'Decentralized consensus, fleet telemetry coordination, dynamic load balancing, and fault-tolerant mesh routing.'
    }
  ];

  const phases = [
    {
      num: cms.phase1Num || '01',
      badge: cms.phase1Badge || 'PHASE 01',
      title: cms.phase1Title || 'Synthetic Registration',
      desc: cms.phase1Desc || 'Teams register 2-4 members and receive cryptographic identifiers. Passkeys are never stored in plaintext.'
    },
    {
      num: cms.phase2Num || '02',
      badge: cms.phase2Badge || 'PHASE 02',
      title: cms.phase2Title || 'Authoritative Quiz',
      desc: cms.phase2Desc || 'Strict 10s prompt analysis followed by 10s option selection. Deadlines evaluated authoritatively by cloud functions.'
    },
    {
      num: cms.phase3Num || '03',
      badge: cms.phase3Badge || 'PHASE 03',
      title: cms.phase3Title || 'Theme Reveal',
      desc: cms.phase3Desc || 'Four secret competition briefs are unlocked simultaneously via an audited administrative trigger.'
    },
    {
      num: cms.phase4Num || '04',
      badge: cms.phase4Badge || 'PHASE 04',
      title: cms.phase4Title || 'Priority Allocation',
      desc: cms.phase4Desc || 'Teams bid earned quiz points. Ranks and theme allocations are assigned deterministically via priority tuple.'
    }
  ];

  return (
    <div className="w-full space-y-28">
      {/* Live Event Announcements Bulletin (if set) */}
      {cms.heroAnnouncements && (
        <div className="border border-[#855AB4]/30 bg-[#221545]/70 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3.5 shadow-[0_0_30px_rgba(104,56,141,0.2)]">
          <div className="h-8 w-8 rounded-full bg-[#68388D] flex items-center justify-center text-[#B26FCB] flex-shrink-0">
            <Megaphone className="h-4 w-4 animate-pulse" />
          </div>
          <div className="flex-1 font-mono text-xs text-zinc-200">
            <span className="text-[#B26FCB] font-bold uppercase tracking-wider mr-2">BULLETIN:</span>
            {cms.heroAnnouncements}
          </div>
        </div>
      )}

      {/* Widescreen Hero Section (Exact Match to Target Design) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center pt-2 md:pt-6">
        {/* Left Wing (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#855AB4]/30 bg-[#221545]/60 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#B26FCB] shadow-[0_0_10px_rgba(178,111,203,1)] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#B26FCB] font-bold">
              {cms.heroBadge || "MECHNOVA 2026 // ROBOTICS & AUTONOMY"}
            </span>
          </div>

          {/* 3-Line Headline */}
          <h1 className="font-sans text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight">
            Autonomous <br />
            Systems <span className="text-[#B26FCB] font-light">&amp;</span> <br />
            Intelligent Control
          </h1>

          <p className="text-xs sm:text-sm xl:text-base text-zinc-300 font-sans font-light leading-relaxed max-w-2xl">
            {cms.heroSubtitle || "The next-generation mission control and evaluation platform for engineering teams. Features timed two-phase quiz verification, sealed theme reveals, and deterministic priority bidding."}
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-full sm:w-[240px] gap-2.5 bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(178,111,203,0.4)] active:scale-95 border border-[#B26FCB]/40"
            >
              <span>REGISTRATION PORTAL</span>
            </Link>
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center w-full sm:w-[240px] gap-2 border border-[#855AB4]/40 bg-[#221545]/40 text-[#B26FCB] font-mono text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full hover:border-[#B26FCB] hover:bg-[#221545]/80 transition-all duration-200 active:scale-95"
            >
              <span>QUIZ PORTAL</span>
            </Link>
            <Link
              to="/bidding"
              className="inline-flex items-center justify-center w-full sm:w-[240px] gap-2 border border-[#855AB4]/40 bg-[#221545]/40 text-[#B26FCB] font-mono text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full hover:border-[#B26FCB] hover:bg-[#221545]/80 transition-all duration-200 active:scale-95"
            >
              <span>BIDDING PORTAL</span>
            </Link>
          </div>

          {/* Quick Metrics Ticker */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#855AB4]/20 max-w-xl">
            <div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-0.5">CHALLENGES</span>
              <span className="font-display text-xl font-bold text-white">4 Domains</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-0.5">QUIZ ENGINE</span>
              <span className="font-display text-xl font-bold text-white">10s + 10s</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-0.5">AUTHORITY</span>
              <span className="font-display text-xl font-bold text-[#B26FCB]">Trusted</span>
            </div>
          </div>
        </div>

        {/* Right Wing (5 Cols) - Live Telemetry HUD Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-[#855AB4]/30 bg-[#221545]/70 backdrop-blur-2xl p-8 xl:p-10 space-y-8 shadow-[0_0_50px_rgba(104,56,141,0.25)] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#B26FCB]/15 blur-[100px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#68388D]/20 blur-[80px] rounded-full pointer-events-none -z-10" />

            {/* HUD Header */}
            <div className="flex items-center justify-between border-b border-[#855AB4]/20 pb-5">
              <div className="flex items-center gap-2.5 font-mono text-xs text-white font-bold tracking-widest uppercase">
                <Radio className="h-3.5 w-3.5 text-[#B26FCB] animate-pulse" />
                <span>MISSION RADAR HUD</span>
              </div>
              <span className="font-mono text-[10px] text-[#B26FCB]/70 uppercase font-bold">LIVE FEED</span>
            </div>

            {/* Real-time Status Stream */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-[#855AB4]/15">
                <span className="font-mono text-xs text-zinc-300">Team Registration</span>
                <span className={`font-mono text-xs font-semibold uppercase ${
                  eventData?.registrationOpen !== false ? "text-emerald-400" : "text-red-400"
                }`}>
                  {eventData?.registrationOpen !== false ? "ACTIVE & OPEN" : "CLOSED"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#855AB4]/15">
                <span className="font-mono text-xs text-zinc-300">Timed Quiz Channel</span>
                <span className={`font-mono text-xs uppercase font-semibold ${
                  eventData?.quizOpen ? "text-[#B26FCB]" : "text-zinc-500"
                }`}>
                  {eventData?.quizOpen ? "ONLINE & RUNNING" : "SEALED / STANDBY"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#855AB4]/15">
                <span className="font-mono text-xs text-zinc-300">Theme Bidding Channel</span>
                <span className={`font-mono text-xs uppercase font-semibold ${
                  eventData?.biddingOpen ? "text-cyan-400" : "text-zinc-500"
                }`}>
                  {eventData?.biddingOpen ? "OPEN FOR BIDS" : "LOCKED"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-mono text-xs text-zinc-300">Revealed Themes</span>
                <span className="font-mono text-xs text-white font-bold">
                  {publicThemes.length} / 4 Published
                </span>
              </div>
            </div>

            {/* Telemetry Footer Callout */}
            <div className="pt-2">
              <div className="rounded-2xl border border-[#855AB4]/25 bg-[#110515]/60 p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase block">ORBITAL NTP TIMESTAMP</span>
                  <span className="font-mono text-xs text-[#B26FCB] font-bold">{formatTimestamp(currentNow)}</span>
                </div>
                <div className="h-8 w-8 rounded-full border border-[#855AB4]/40 flex items-center justify-center text-[#B26FCB] bg-[#221545]/80">
                  <Orbit className="h-4 w-4 animate-spin" style={{ animationDuration: '12s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width 4-Column Domain Exploration */}
      <section className="space-y-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#855AB4]/20 pb-4">
          <div>
            <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-[0.25em] block mb-1 font-bold">
              CHALLENGE DOMAINS
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
              Engineering Disciplines
            </h2>
          </div>
          <p className="text-zinc-400 text-xs font-light max-w-md font-sans">
            Competitors tackle core cyber-physical challenges across robotics, embedded control, computer vision, and autonomous telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {domains.map((d, idx) => (
            <div
              key={idx}
              className="border border-[#855AB4]/25 rounded-2xl p-7 bg-[#221545]/40 hover:border-[#B26FCB]/60 hover:bg-[#221545]/70 transition-all duration-300 space-y-4 group backdrop-blur-sm shadow-sm flex flex-col justify-between"
            >
              <span className="font-mono text-xs text-[#B26FCB] font-bold tracking-widest block uppercase">
                {d.code}
              </span>
              <h3 className="font-display text-xl font-bold text-white group-hover:text-[#B26FCB] transition-colors">
                {d.title}
              </h3>
              <p className="text-zinc-300 text-xs font-light leading-relaxed">
                {d.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-Width 4-Stage Operational Sequence */}
      <section className="space-y-8 pt-4">
        <div className="flex items-center justify-between border-b border-[#855AB4]/20 pb-4">
          <div>
            <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-[0.25em] block mb-1 font-bold">
              SYSTEM LIFECYCLE
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
              Platform Workflow
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest hidden sm:inline font-bold">
            4 PHASES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {phases.map((s, idx) => (
            <div key={idx} className="space-y-3 pt-6 border-t border-[#855AB4]/25 group hover:border-[#B26FCB] transition-colors duration-300">
              <span className="font-mono text-xs text-zinc-400 group-hover:text-[#B26FCB] font-bold block transition-colors">
                PHASE {s.num}
              </span>
              <h3 className="font-display text-xl font-bold text-white">
                {s.title}
              </h3>
              <p className="text-zinc-300 text-xs font-light leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-Width Panoramic CTA Banner */}
      <section className="relative rounded-3xl bg-gradient-to-r from-[#221545]/90 via-[#110515]/90 to-[#000000] p-12 lg:p-16 border border-[#855AB4]/30 overflow-hidden shadow-[0_0_50px_rgba(104,56,141,0.3)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B26FCB]/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#B26FCB]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B26FCB] animate-pulse shadow-[0_0_8px_rgba(178,111,203,1)]"></span>
            <span>REGISTRATION WINDOW ACTIVE</span>
          </div>

          <h2 className="font-display text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to Compete?
          </h2>

          <p className="text-zinc-300 text-base font-light leading-relaxed max-w-xl">
            Register your team today, verify credentials, and prepare for the timed autonomous robotics evaluation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all active:scale-95 shadow-[0_0_30px_rgba(178,111,203,0.4)] border border-[#B26FCB]/40"
            >
              <span>REGISTRATION PORTAL</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/status"
              className="inline-flex items-center gap-2 border border-[#855AB4]/40 bg-[#221545]/50 text-[#B26FCB] font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-[#221545]/80 hover:border-[#B26FCB] transition-all active:scale-95"
            >
              <span>VIEW SYSTEM RADAR</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
