import React from 'react';
import { useEvent } from '../../context/EventContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { LockedPanel } from '../common/LockedPanel';
import { Layers, Eye, ShieldCheck, Award } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function ThemeRevealPanel() {
  const { eventData, publicThemes } = useEvent();
  const isRevealed = eventData?.themesRevealed === true || publicThemes.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border border-white/10 bg-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-red-500" />
            <h1 className="font-mono text-xl font-bold uppercase tracking-wider text-white">
              HACKATHON CHALLENGE THEME REVEAL
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Official robotics problem statements and competition domain specifications.
          </p>
        </div>

        <StatusBadge
          status={isRevealed ? "THEMES REVEALED" : "VAULT LOCKED"}
          variant={isRevealed ? "emerald" : "red"}
        />
      </div>

      {/* Pre-reveal Locked State vs Post-reveal Grid */}
      {!isRevealed ? (
        <LockedPanel
          title="THEME VAULT IS SEALED"
          message="Themes will be revealed two days prior to the event. Problem details are securely locked in the backend themesPrivate node and inaccessible to non-administrative clients."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publicThemes.map((theme, idx) => (
            <ControlPanel
              key={theme.id || theme.themeId || idx}
              title={`THEME 0${theme.themeNumber || idx + 1}: ${theme.publicName}`}
              subtitle={`REVEALED: ${formatTimestamp(theme.revealedAtMs)}`}
              badge={<StatusBadge status="PUBLIC" variant="cyan" />}
            >
              <div className="space-y-4 pt-1">
                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                    CHALLENGE OVERVIEW
                  </h4>
                  <p className="font-mono text-xs text-zinc-200 leading-relaxed">
                    {theme.publicDescription || "Robotics and automation problem statement."}
                  </p>
                </div>

                {theme.brief && (
                  <div>
                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 mb-1">
                      TECHNICAL SCOPE & BRIEF
                    </h4>
                    <p className="font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-900/80 p-3 border border-white/5">
                      {theme.brief}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 font-mono text-[11px]">
                  <span className="text-zinc-500">ELIGIBILITY:</span>
                  <span className="text-emerald-400 font-semibold">{theme.eligibility || "All registered teams"}</span>
                </div>
              </div>
            </ControlPanel>
          ))}
        </div>
      )}
    </div>
  );
}
