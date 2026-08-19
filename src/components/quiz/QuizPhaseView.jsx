import React from 'react';
import { formatPoints } from '../../utils/formatters';

export function QuizPhaseView({
  questionIndex = 0,
  totalQuestions = 10,
  phase = 'READ_ONLY',
  remainingMs = 0,
  score = 0,
  category = "Robotics & Automation"
}) {
  const isReadOnly = phase === 'READ_ONLY';
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const progressPercent = Math.min(100, Math.max(0, (remainingMs / 10000) * 100));

  return (
    <div className="border-b border-white/[0.08] pb-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Question Counter */}
        <div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">
            PROGRESS
          </span>
          <span className="font-mono text-xl font-bold text-white">
            0{questionIndex + 1} <span className="text-zinc-600 font-normal">/ 0{totalQuestions}</span>
          </span>
        </div>

        {/* Phase Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03]">
          <span className={`h-2 w-2 rounded-full ${isReadOnly ? 'bg-orange-500 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white">
            {isReadOnly ? 'READ ONLY (10S)' : 'ANSWER MODE (10S)'}
          </span>
        </div>

        {/* Score */}
        <div className="text-right">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-0.5">
            CURRENT POINTS
          </span>
          <span className="font-mono text-xl font-bold text-orange-400">
            {formatPoints(score)} <span className="text-xs text-zinc-500 font-normal">PTS</span>
          </span>
        </div>
      </div>

      {/* Clean Linear Progress Countdown Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
          <span>{isReadOnly ? "Question analysis..." : "Answer channel active..."}</span>
          <span className="font-bold text-white tracking-widest">
            00:{String(remainingSeconds).padStart(2, '0')}
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              isReadOnly ? 'bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.8)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
