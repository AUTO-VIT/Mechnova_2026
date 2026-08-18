import React from 'react';
import { useEvent } from '../../context/EventContext';
import { Layers, Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function ThemeRevealPanel() {
  const { eventData, publicThemes } = useEvent();
  const isRevealed = eventData?.themesRevealed === true || publicThemes.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-16">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Layers className="h-3.5 w-3.5" />
          <span>CHALLENGE DOMAINS</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Hackathon Themes
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-2xl font-light">
          Problem statements and robotics competition domains. Bids are submitted during the allocation phase using earned quiz points.
        </p>
      </div>

      {/* Pre-reveal Locked State vs Post-reveal Grid */}
      {!isRevealed ? (
        <div className="py-20 text-center border-y border-white/[0.08] space-y-6">
          <div className="h-12 w-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-zinc-400">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-display text-xl font-bold text-white">
              Themes are currently sealed
            </h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">
              Themes will be revealed two days prior to the event. Problem briefs are securely isolated in the encrypted backend vault.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 border border-white/10 px-4 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>AWAITING AUDITED REVEAL</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publicThemes.map((theme, idx) => (
            <div
              key={theme.id || theme.themeId || idx}
              className="border-t border-white/10 pt-6 space-y-4 group hover:border-red-500 transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-red-500 font-bold tracking-widest uppercase">
                  THEME 0{theme.themeNumber || idx + 1}
                </span>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                  REVEALED
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                {theme.publicName}
              </h2>

              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                {theme.publicDescription || "Autonomous robotics problem statement and engineering domain specifications."}
              </p>

              {theme.brief && (
                <div className="text-xs text-zinc-300 font-light border-l border-white/20 pl-3 py-1">
                  {theme.brief}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between font-mono text-xs text-zinc-500">
                <span>ELIGIBILITY</span>
                <span className="text-zinc-300 font-medium">{theme.eligibility || "All Active Teams"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
