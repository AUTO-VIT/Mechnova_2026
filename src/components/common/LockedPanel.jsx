import React from 'react';
import { Lock, ShieldAlert } from 'lucide-react';

export function LockedPanel({
  title = "CHANNEL LOCKED",
  message = "This phase is currently sealed by administrative directive or timing constraints.",
  actionButton,
  className = ""
}) {
  return (
    <div className={`relative border border-[#855AB4]/40 bg-[#160B2A]/80 backdrop-blur-md p-8 text-center rounded-2xl shadow-[0_0_40px_rgba(104,56,141,0.2)] ${className}`}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#B26FCB]/40 bg-[#221545] text-[#B26FCB] shadow-[0_0_30px_rgba(178,111,203,0.3)]">
        <Lock className="h-7 w-7" />
      </div>

      <h3 className="mt-5 font-mono text-lg font-bold uppercase tracking-widest text-white">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-md font-sans text-sm font-light text-zinc-300 leading-relaxed">
        {message}
      </p>

      {actionButton && (
        <div className="mt-8 flex justify-center">{actionButton}</div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#B26FCB]/70">
        <ShieldAlert className="h-3.5 w-3.5" />
        <span>SECURE GATE &bull; ACCESS RESTRICTED</span>
      </div>
    </div>
  );
}
