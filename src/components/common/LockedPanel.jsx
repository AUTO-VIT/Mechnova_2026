import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

export function LockedPanel({
  title = "CHANNEL LOCKED",
  message = "This phase is currently sealed by administrative directive or timing constraints.",
  actionButton,
  className = ""
}) {
  return (
    <div className={`relative border border-red-600/30 bg-zinc-950 p-8 text-center bg-hazard-stripes ${className}`}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/50 bg-red-950/80 text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
        <Lock className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-mono text-base font-bold uppercase tracking-widest text-red-400">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md font-mono text-xs text-zinc-300 leading-relaxed">
        {message}
      </p>

      {actionButton && (
        <div className="mt-6 flex justify-center">{actionButton}</div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase text-zinc-500">
        <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
        <span>SECURE GATE &bull; ACCESS DENIED</span>
      </div>
    </div>
  );
}
