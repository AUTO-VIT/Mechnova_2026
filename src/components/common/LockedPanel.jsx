import React from 'react';
import { Lock } from 'lucide-react';

export function LockedPanel({
  title = "This phase is closed",
  message = "The administrator has not opened this part of the event yet.",
  actionButton,
  className = ""
}) {
  return (
    <section className={`mn-panel mn-locked-panel mx-auto max-w-3xl py-14 text-center ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[var(--mn-line-strong)] bg-black/20 text-[var(--mn-violet)]">
        <Lock className="h-7 w-7" />
      </div>

      <h3 className="mt-6 font-['Syne'] text-2xl font-semibold text-white">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        {message}
      </p>

      {actionButton && (
        <div className="mt-8 flex justify-center">{actionButton}</div>
      )}

    </section>
  );
}
