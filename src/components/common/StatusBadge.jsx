import React from 'react';

export function StatusBadge({ status = 'ACTIVE', label, variant = 'red', pulse = true, className = '' }) {
  const colorMap = {
    red: 'border-orange-500/40 bg-orange-500/10 text-orange-400 drop-shadow-[0_0_8px_rgba(234,88,12,0.3)]',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]',
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]',
    cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]',
    zinc: 'border-zinc-700 bg-zinc-900/60 text-zinc-400'
  };

  const dotMap = {
    red: 'bg-orange-500 shadow-[0_0_8px_#f97316]',
    amber: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
    emerald: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
    cyan: 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]',
    zinc: 'bg-zinc-500'
  };

  const displayLabel = label || status;
  const currentVariant = colorMap[variant] ? variant : 'red';

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[10px] uppercase font-bold tracking-widest transition-all duration-150 ${colorMap[currentVariant]} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotMap[currentVariant]} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      <span>{displayLabel}</span>
    </span>
  );
}
