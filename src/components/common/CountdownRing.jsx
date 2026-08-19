import React from 'react';
import { formatTimeMs } from '../../utils/formatters';

export function CountdownRing({
  remainingMs = 0,
  totalMs = 10000,
  size = 140,
  strokeWidth = 8,
  label = "TIME REMAINING"
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
  const strokeDashoffset = circumference - progress * circumference;

  // Dynamic Color State
  const secondsLeft = remainingMs / 1000;
  let strokeColor = '#10b981'; // emerald
  let textColor = 'text-emerald-400';
  let glowClass = '';

  if (secondsLeft <= 3) {
    strokeColor = '#f97316'; // crimson red
    textColor = 'text-orange-500 animate-pulse';
    glowClass = 'drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]';
  } else if (secondsLeft <= 6) {
    strokeColor = '#f59e0b'; // amber
    textColor = 'text-amber-400';
    glowClass = 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 100ms linear, stroke 200ms ease-out'
            }}
          />
        </svg>

        {/* Center Telemetry Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono text-2xl font-bold tracking-tight ${textColor} ${glowClass}`}>
            {formatTimeMs(remainingMs)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
            {secondsLeft <= 0 ? 'TIME EXPIRED' : label}
          </span>
        </div>
      </div>
    </div>
  );
}
