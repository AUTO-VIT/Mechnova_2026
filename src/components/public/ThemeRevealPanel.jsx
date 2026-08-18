import React from 'react';
import { useEvent } from '../../context/EventContext';
import { Layers, Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function ThemeRevealPanel() {
  const { eventData, publicThemes } = useEvent();
  const isRevealed = eventData?.themesRevealed === true || publicThemes.length > 0;

  return (
    <div className="w-full space-y-16">
      {/* Header Across 1080p */}
      <div className="space-y-3 pb-6 border-b border-[#855AB4]/20">
        <div className="inline-flex items-center gap-2 text-[#B26FCB] font-mono text-xs tracking-widest uppercase">
          <Layers className="h-3.5 w-3.5" />
          <span>CHALLENGE DOMAINS</span>
        </div>
        <h1 className="font-sans text-4xl sm:text-6xl font-bold text-white tracking-tight">
          Hackathon Challenge Themes
        </h1>
        <p className="text-zinc-300 font-sans text-base max-w-3xl font-light">
          Problem statements and robotics competition domains. Bids are submitted during the allocation phase using earned quiz score points.
        </p>
      </div>

      {/* Pre-reveal Locked State vs Post-reveal Grid */}
      {!isRevealed ? (
        <div className="py-28 text-center border border-[#855AB4]/30 rounded-3xl bg-[#221545]/40 space-y-6 shadow-[0_0_50px_rgba(104,56,141,0.2)]">
          <div className="h-16 w-16 rounded-full border border-[#855AB4]/40 bg-[#68388D]/30 flex items-center justify-center mx-auto text-[#B26FCB]">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-white">
              Themes are currently sealed
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Themes will be revealed prior to the event. Problem briefs are securely isolated in the encrypted backend vault.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-[#B26FCB] border border-[#855AB4]/40 px-5 py-2 rounded-full bg-[#221545]/60">
            <span className="h-2 w-2 rounded-full bg-[#B26FCB] animate-pulse shadow-[0_0_8px_rgba(178,111,203,1)]"></span>
            <span>AWAITING AUDITED REVEAL</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publicThemes.map((theme, idx) => (
            <div
              key={theme.id || theme.themeId || idx}
              className="border border-[#855AB4]/30 rounded-3xl p-8 lg:p-10 bg-[#221545]/40 space-y-5 hover:border-[#B26FCB] hover:bg-[#221545]/70 transition-all duration-300 shadow-[0_0_30px_rgba(104,56,141,0.15)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#B26FCB] font-bold tracking-widest uppercase">
                  THEME 0{theme.themeNumber || idx + 1}
                </span>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  REVEALED
                </span>
              </div>

              <h2 className="font-sans text-2xl sm:text-3xl font-bold text-white">
                {theme.publicName}
              </h2>

              <p className="text-zinc-300 text-sm font-light leading-relaxed">
                {theme.publicDescription || "Autonomous robotics problem statement and engineering domain specifications."}
              </p>

              {theme.brief && (
                <div className="text-xs text-[#B26FCB] font-light border-l-2 border-[#855AB4] pl-4 py-2 bg-[#110515]/60 rounded-r-xl">
                  {theme.brief}
                </div>
              )}

              <div className="pt-4 border-t border-[#855AB4]/20 flex items-center justify-between font-mono text-xs text-zinc-400">
                <span>ELIGIBILITY</span>
                <span className="text-[#B26FCB] font-medium">{theme.eligibility || "All Registered Teams"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
