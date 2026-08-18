import React from 'react';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownRing } from '../common/CountdownRing';
import { formatPoints } from '../../utils/formatters';

export function QuizPhaseView({
  questionIndex = 0,
  totalQuestions = 10,
  phase = 'READ_ONLY', // 'READ_ONLY' | 'ANSWER_MODE'
  remainingMs = 0,
  score = 0,
  category = "Robotics & Automation"
}) {
  const isReadOnly = phase === 'READ_ONLY';

  return (
    <div className="border border-white/10 bg-zinc-950 p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        {/* Question Counter */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            QUESTION PROGRESS
          </div>
          <div className="font-mono text-xl font-extrabold text-white">
            [ <span className="text-red-500">{String(questionIndex + 1).padStart(2, '0')}</span> / {String(totalQuestions).padStart(2, '0')} ]
          </div>
        </div>

        {/* Phase Status Badge */}
        <div className="flex items-center gap-3">
          <StatusBadge
            status={isReadOnly ? "READ_ONLY PHASE (10S)" : "ANSWER_MODE (10S)"}
            variant={isReadOnly ? "red" : "emerald"}
          />
        </div>

        {/* Score Telemetry */}
        <div className="text-right font-mono">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            CURRENT SCORE
          </div>
          <div className="text-xl font-black text-amber-400">
            {formatPoints(score)} <span className="text-xs font-normal text-zinc-500">PTS</span>
          </div>
        </div>
      </div>

      {/* Center Countdown Ring Timer */}
      <div className="my-4 flex items-center justify-center">
        <CountdownRing
          remainingMs={remainingMs}
          totalMs={10000}
          size={130}
          strokeWidth={7}
          label={isReadOnly ? "READ PROMPT" : "SELECT ANSWER"}
        />
      </div>

      {/* Category Indicator */}
      <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
        <span>DOMAIN: <strong className="text-zinc-200">{category}</strong></span>
        <span>AUTHORITATIVE TIMING ACTIVE</span>
      </div>
    </div>
  );
}
