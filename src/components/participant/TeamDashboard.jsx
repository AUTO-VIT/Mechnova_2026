import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { UserCheck, Zap, Award, Layers, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { formatPoints } from '../../utils/formatters';

export function TeamDashboard() {
  const { teamData, teamScore } = useAuth();
  const { eventData } = useEvent();

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 space-y-16">
      {/* Team Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
            <UserCheck className="h-3.5 w-3.5" />
            <span>AUTHENTICATED TEAM HUB</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {teamData?.teamName || "Team Hub"}
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            CODE: <span className="text-white font-bold tracking-widest">{teamData?.teamCode || "N/A"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-zinc-500">SESSION STATUS:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        </div>
      </div>

      {/* Live Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-1">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
            QUIZ POINTS
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
            {formatPoints(teamScore?.totalPoints || 0)} <span className="text-xs text-zinc-500 font-normal">PTS</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
            ANSWERED QUESTIONS
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-300">
            {teamScore?.answeredCount || 0}
          </div>
        </div>

        <div className="space-y-1">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block">
            CORRECT ACCURACY
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-emerald-400">
            {teamScore?.correctCount || 0}
          </div>
        </div>
      </div>

      {/* Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Quiz Link */}
        <Link
          to="/quiz"
          className="group border border-white/10 rounded-2xl p-6 bg-white/[0.02] hover:border-red-500 hover:bg-white/[0.04] transition-all duration-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-500 group-hover:text-red-400 font-bold">
              01
            </span>
            <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${
              eventData?.quizOpen ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.quizOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-red-400 transition-colors">
              Authoritative Quiz
            </h3>
            <p className="text-zinc-400 text-xs font-light leading-relaxed mt-1">
              Complete the timed assessment under authoritative server time.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1 font-mono text-xs text-white group-hover:text-red-400 font-medium">
            <span>Enter Quiz</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Bidding Link */}
        <Link
          to="/bidding"
          className="group border border-white/10 rounded-2xl p-6 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04] transition-all duration-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-500 group-hover:text-white font-bold">
              02
            </span>
            <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${
              eventData?.biddingOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.biddingOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-white transition-colors">
              Theme Bidding
            </h3>
            <p className="text-zinc-400 text-xs font-light leading-relaxed mt-1">
              Allocate your quiz balance towards your preferred challenge theme.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1 font-mono text-xs text-white group-hover:text-white font-medium">
            <span>Enter Bidding</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Results Link */}
        <Link
          to="/results"
          className="group border border-white/10 rounded-2xl p-6 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04] transition-all duration-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-500 group-hover:text-white font-bold">
              03
            </span>
            <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full ${
              eventData?.allocationFinalized ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.allocationFinalized ? 'FINALIZED' : 'PENDING'}
            </span>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white group-hover:text-white transition-colors">
              Allocation Results
            </h3>
            <p className="text-zinc-400 text-xs font-light leading-relaxed mt-1">
              Inspect your final theme assignment and competition rank.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1 font-mono text-xs text-white group-hover:text-white font-medium">
            <span>View Results</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      {/* Roster Strip */}
      <div className="space-y-4 pt-6 border-t border-white/[0.08]">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block">
          Team Personnel
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(teamData?.members || []).map((m, idx) => (
            <div key={idx} className="space-y-1">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">
                Member 0{idx + 1}
              </span>
              <div className="text-sm font-semibold text-white">{m.name}</div>
              <div className="text-xs text-zinc-400 font-light">{m.email}</div>
              <div className="text-[11px] text-red-400 font-mono">{m.role || "Member"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
