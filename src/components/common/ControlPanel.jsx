import React from 'react';

export function ControlPanel({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  headerClassName = '',
  hazardBorder = false
}) {
  return (
    <div
      className={`relative border bg-zinc-950/90 p-5 shadow-2xl backdrop-blur-md transition-all duration-200 ${
        hazardBorder
          ? 'border-orange-600/60 shadow-[0_0_20px_rgba(234,88,12,0.2)]'
          : 'border-white/10 hover:border-white/20'
      } ${className}`}
    >
      {/* Top SCADA Border Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-600 via-zinc-700 to-transparent" />

      {/* Panel Header */}
      {(title || badge || action) && (
        <div className={`mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            <div className="h-3 w-1 bg-orange-600" />
            <div>
              {title && (
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="font-mono text-[11px] text-zinc-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="relative z-10">{children}</div>

      {/* Subtle Corner Telemetry Markers */}
      <div className="pointer-events-none absolute bottom-1 right-2 font-mono text-[9px] text-zinc-600 selection:bg-none">
        SCADA // MOD_2026
      </div>
    </div>
  );
}
