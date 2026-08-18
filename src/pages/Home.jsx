// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useAuth } from '../context/AuthContext';
import { Cpu, Zap, Shield, Layers, Calendar, ArrowRight, Bell, Terminal, Clock, Lock, CheckCircle } from 'lucide-react';

export const Home = () => {
  const { siteContent, config } = useGlobalConfig();
  const { currentUser, currentTeam } = useAuth();
  
  const homeData = siteContent?.home || {
    heroTitle: "AUTOMATION HACKATHON 2026",
    heroSubtitle: "ENGINEER THE NEXT GENERATION OF CYBER-PHYSICAL AUTOMATION & SCADA SYSTEMS",
    announcementBanner: "⚡ REGISTRATION OPEN: Form your team now! 10s+10s Dual-Phase Quiz schedule published."
  };

  // Countdown Clock Logic (Default to 24h event countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Announcement Marquee Bar */}
      {homeData.announcementBanner && (
        <div className="bg-red-950/40 border-y border-red-800/60 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center space-x-3 text-xs font-mono text-red-200">
            <Bell className="w-4 h-4 text-red-500 animate-bounce flex-shrink-0" />
            <span className="font-bold text-red-400 uppercase tracking-widest flex-shrink-0">[SYSTEM ANNOUNCEMENT]</span>
            <div className="overflow-hidden whitespace-nowrap text-zinc-300">
              {homeData.announcementBanner}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12 tech-grid">
        <div className="bg-zinc-950/90 border border-zinc-800 p-8 sm:p-12 relative overflow-hidden glow-red">
          {/* Top Right Corner Telemetry Badge */}
          <div className="absolute top-0 right-0 bg-red-600 text-black font-mono text-xs font-bold px-4 py-1 uppercase tracking-widest">
            PHASE: {config.eventStatus.toUpperCase()}
          </div>

          {/* Tactical Background Watermark */}
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
            <Cpu className="w-96 h-96 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-red-950/60 border border-red-800 px-3 py-1 text-xs font-mono text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
              <span>INDUSTRIAL AUTOMATION HACKATHON</span>
            </div>

            <h1 className="font-mono text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight leading-none">
              {homeData.heroTitle}
            </h1>

            <p className="text-zinc-400 font-sans text-base sm:text-lg leading-relaxed">
              {homeData.heroSubtitle}
            </p>

            {/* Countdown Clock Box */}
            <div className="bg-black border border-zinc-800 p-4 inline-block font-mono">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-red-500" />
                <span>NEXT SYSTEM MILESTONE COUNTDOWN</span>
              </div>
              <div className="flex items-center space-x-4 text-2xl sm:text-3xl font-extrabold text-white">
                <div>
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="text-xs text-zinc-500 block font-normal text-center">HRS</span>
                </div>
                <span className="text-red-600">:</span>
                <div>
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="text-xs text-zinc-500 block font-normal text-center">MIN</span>
                </div>
                <span className="text-red-600">:</span>
                <div>
                  <span className="text-red-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="text-xs text-zinc-500 block font-normal text-center">SEC</span>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4 font-mono text-xs font-bold uppercase tracking-wider">
              {currentUser ? (
                <>
                  <Link
                    to="/quiz"
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                  >
                    <Zap className="w-4 h-4" />
                    <span>ENTER QUIZ ENGINE</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/team"
                    className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 flex items-center space-x-2 transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>TEAM DASHBOARD</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                  <span>REGISTER / SIGN IN TO COMPETITION</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                to="/themes"
                className="px-6 py-3 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 border border-zinc-800 flex items-center space-x-2 transition-colors"
              >
                <Lock className="w-4 h-4 text-red-500" />
                <span>SECRET THEME VAULT</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Stripe Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-2 w-full warning-stripes opacity-80"></div>
      </div>

      {/* Core Architecture Modules Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center space-x-2 font-mono text-sm text-red-500 font-bold uppercase tracking-widest">
          <Terminal className="w-4 h-4" />
          <span>SYSTEM ARCHITECTURE & WORKFLOW</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-zinc-950 border border-zinc-800 hover:border-red-600/60 p-6 relative group transition-all">
            <div className="w-10 h-10 bg-red-950/60 border border-red-800 flex items-center justify-center mb-4 text-red-500 font-mono font-bold">
              01
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase tracking-tight mb-2 flex items-center justify-between">
              <span>10s + 10s DUAL-PHASE QUIZ</span>
              <Zap className="w-4 h-4 text-red-500" />
            </h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed mb-4">
              Phase 1 (0-10s) hides options while options are analyzed. Phase 2 (10-20s) presents 4 options with a live 10-second countdown timer. Correct answers earn 100 points for team rank.
            </p>
            <div className="text-[11px] font-mono text-red-400 flex items-center space-x-1">
              <span>ANTI-CHEAT SYNCHRONIZATION</span>
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-zinc-950 border border-zinc-800 hover:border-amber-600/60 p-6 relative group transition-all">
            <div className="w-10 h-10 bg-amber-950/60 border border-amber-800 flex items-center justify-center mb-4 text-amber-500 font-mono font-bold">
              02
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase tracking-tight mb-2 flex items-center justify-between">
              <span>PRIORITY THEME BIDDING</span>
              <Layers className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed mb-4">
              Use total quiz score to secure bidding priority rank. Drag and submit your top 4 theme preferences (1st, 2nd, 3rd, 4th) before bidding closes.
            </p>
            <div className="text-[11px] font-mono text-amber-400 flex items-center space-x-1">
              <span>RANKED PREFERENCE SELECTION</span>
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-zinc-950 border border-zinc-800 hover:border-emerald-600/60 p-6 relative group transition-all">
            <div className="w-10 h-10 bg-emerald-950/60 border border-emerald-800 flex items-center justify-center mb-4 text-emerald-500 font-mono font-bold">
              03
            </div>
            <h3 className="font-mono text-lg font-bold text-white uppercase tracking-tight mb-2 flex items-center justify-between">
              <span>DETERMINISTIC ALLOCATION</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </h3>
            <p className="text-zinc-400 text-xs font-sans leading-relaxed mb-4">
              Our automated priority allocation algorithm parses the leaderboard (Score + Speed tie-breaker) and assigns team theme choices within strict max team quotas.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
              <span>ZERO BOTTLENECK EXECUTION</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Event Timeline Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2 font-mono text-lg font-bold text-white uppercase tracking-tight">
              <Calendar className="w-5 h-5 text-red-500" />
              <span>EVENT SCHEDULE PREVIEW</span>
            </div>
            <Link to="/schedule" className="font-mono text-xs text-red-400 hover:text-red-300 uppercase tracking-wider flex items-center space-x-1">
              <span>VIEW FULL TIMELINE</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {siteContent?.schedule?.timelineEvents?.slice(0, 3).map((event, idx) => (
              <div key={idx} className="bg-black border border-zinc-900 p-4">
                <div className="font-mono text-xs text-red-500 font-bold mb-1">{event.time}</div>
                <div className="font-mono text-sm font-bold text-white mb-1">{event.title}</div>
                <p className="text-zinc-400 text-xs font-sans">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
