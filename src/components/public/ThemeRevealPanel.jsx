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
      <div className="space-y-3 pb-6 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Layers className="h-3.5 w-3.5" />
          <span>CHALLENGE DOMAINS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Hackathon Challenge Themes
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-3xl font-light">
          Problem statements and robotics competition domains. Bids are submitted during the allocation phase using earned quiz score points.
        </p>
      </div>

      {/* Pre-reveal Locked State vs Post-reveal Grid */}
      {!isRevealed ? (
        <div className="py-28 text-center border border-white/10 rounded-3xl bg-white/[0.02] space-y-6">
          <div className="h-16 w-16 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center mx-auto text-zinc-400">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Themes are currently sealed
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Themes will be revealed two days prior to the event. Problem briefs are securely isolated in the encrypted backend vault.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 border border-white/10 px-5 py-2 rounded-full">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>AWAITING AUDITED REVEAL</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publicThemes.map((theme, idx) => (
            <div
              key={theme.id || theme.themeId || idx}
              className="border border-white/10 rounded-3xl p-8 lg:p-10 bg-white/[0.02] space-y-5 hover:border-red-500/50 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-red-500 font-bold tracking-widest uppercase">
                  THEME 0{theme.themeNumber || idx + 1}
                </span>
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  REVEALED
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {theme.publicName}
              </h2>

              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                {theme.publicDescription || "Autonomous robotics problem statement and engineering domain specifications."}
              </p>

              {theme.brief && (
                <div className="text-xs text-zinc-300 font-light border-l-2 border-white/20 pl-4 py-2 bg-white/[0.01] rounded-r-xl">
                  {theme.brief}
                </div>
              )}

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-zinc-500">
                <span>ELIGIBILITY</span>
                <span className="text-zinc-300 font-medium">{theme.eligibility || "All Registered Teams"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
