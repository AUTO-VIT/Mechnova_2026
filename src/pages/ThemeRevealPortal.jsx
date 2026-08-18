// src/pages/ThemeRevealPortal.jsx
import React, { useState, useEffect } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { Lock, Unlock, ShieldAlert, Cpu, Layers, Tag, Users, CheckCircle } from 'lucide-react';

export const ThemeRevealPortal = () => {
  const { config, themes } = useGlobalConfig();
  const isRevealed = config.themesRevealed;

  // Countdown timer for theme reveal vault unlock
  const [countdown, setCountdown] = useState({ hours: 47, minutes: 59, seconds: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-mono">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-600 text-black font-mono text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
          VAULT_MODULE
        </div>

        <div className="flex items-center space-x-3 text-red-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
          <Cpu className="w-4 h-4" />
          <span>SECRET HACKATHON THEME VAULT</span>
        </div>

        <h1 className="font-mono text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          THEME REVEAL PORTAL
        </h1>
        <p className="text-zinc-400 font-sans text-sm mt-2">
          Air-gapped security vault storing secret problem statements and SCADA engineering domain requirements.
        </p>
      </div>

      {!isRevealed ? (
        /* Locked Vault Container */
        <div className="bg-zinc-950 border-2 border-red-900/80 p-8 sm:p-16 text-center space-y-8 relative overflow-hidden glow-red">
          {/* Warning Stripe Frame */}
          <div className="absolute top-0 left-0 right-0 h-2 warning-stripes opacity-90"></div>
          <div className="absolute bottom-0 left-0 right-0 h-2 warning-stripes opacity-90"></div>

          <div className="w-20 h-20 bg-black border-2 border-red-600 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            <Lock className="w-10 h-10" />
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 bg-red-950/80 border border-red-800 px-3 py-1 text-xs text-red-400 font-bold uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>AIR-GAPPED ENCRYPTION LOCKED</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase">
              "Themes will be revealed two days prior to the event."
            </h2>

            <p className="text-zinc-400 font-sans text-sm">
              The 4 official hackathon problem statements are secured under cryptographic lock until the administrator triggers vault unlock or countdown expires.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="bg-black border border-zinc-800 p-6 inline-block">
            <div className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2">VAULT DECRYPT COUNTDOWN</div>
            <div className="flex items-center justify-center space-x-4 text-3xl sm:text-4xl font-extrabold text-white">
              <div>
                <span>{String(countdown.hours).padStart(2, '0')}</span>
                <span className="text-xs text-zinc-500 block font-normal text-center">HOURS</span>
              </div>
              <span className="text-red-600">:</span>
              <div>
                <span>{String(countdown.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-zinc-500 block font-normal text-center">MINUTES</span>
              </div>
              <span className="text-red-600">:</span>
              <div>
                <span className="text-red-500">{String(countdown.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-zinc-500 block font-normal text-center">SECONDS</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Unlocked State: 4 Revealed Theme Cards */
        <div className="space-y-6">
          <div className="bg-emerald-950/60 border border-emerald-800 p-4 text-emerald-300 text-xs font-bold uppercase flex items-center space-x-2">
            <Unlock className="w-4 h-4 text-emerald-400" />
            <span>VAULT UNLOCKED: 4 OFFICIAL HACKATHON THEMES DECRYPTED & PUBLISHED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themes.map((theme, idx) => (
              <div
                key={theme.themeId}
                className="bg-zinc-950 border border-zinc-800 hover:border-red-600/60 p-6 flex flex-col justify-between space-y-4 relative group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 font-bold uppercase">
                      THEME 0{idx + 1}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-zinc-400">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>QUOTA: {theme.assignedTeamCount || 0} / {theme.maxTeamQuota} TEAMS</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white uppercase leading-snug">{theme.title}</h3>

                  <p className="text-zinc-400 text-xs font-sans leading-relaxed">{theme.description}</p>
                </div>

                {/* Tags */}
                <div className="pt-3 border-t border-zinc-900 flex flex-wrap gap-2">
                  {theme.tags?.map((tag, tIdx) => (
                    <span key={tIdx} className="bg-black border border-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-red-500" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
