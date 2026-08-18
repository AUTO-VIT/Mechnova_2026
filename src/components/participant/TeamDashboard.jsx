import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { UserCheck, Zap, Award, Layers, ArrowRight, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { formatPoints } from '../../utils/formatters';

export function TeamDashboard() {
  const { teamData, teamScore } = useAuth();
  const { eventData } = useEvent();

  return (
    <div className="w-full space-y-16">
      {/* Team Header Across 1080p */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#855AB4]/20">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-[#B26FCB] font-mono text-xs tracking-widest uppercase">
            <UserCheck className="h-3.5 w-3.5" />
            <span>AUTHENTICATED MISSION COCKPIT</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
            {teamData?.teamName || "Team Command"}
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            TRANSPONDER CODE: <span className="text-[#B26FCB] font-bold tracking-widest text-sm">{teamData?.teamCode || "N/A"}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          <span className="text-zinc-400">SYSTEM STATE:</span>
          <span className="inline-flex items-center gap-1.5 text-[#B26FCB] font-semibold bg-[#221545]/80 border border-[#855AB4]/40 px-3.5 py-1 rounded-full shadow-[0_0_10px_rgba(178,111,203,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B26FCB] animate-pulse shadow-[0_0_8px_rgba(178,111,203,1)]" />
            CONNECTED
          </span>
        </div>
      </div>

      {/* 4-Column Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border border-[#855AB4]/30 rounded-2xl p-6 bg-[#221545]/50 space-y-1 shadow-[0_0_20px_rgba(104,56,141,0.15)]">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">
            QUIZ SCORE BALANCE
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
            {formatPoints(teamScore?.totalPoints || 0)} <span className="text-xs text-[#B26FCB] font-normal">PTS</span>
          </div>
        </div>

        <div className="border border-[#855AB4]/30 rounded-2xl p-6 bg-[#221545]/50 space-y-1 shadow-[0_0_20px_rgba(104,56,141,0.15)]">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">
            ANSWERED QUESTIONS
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-zinc-200">
            {teamScore?.answeredCount || 0}
          </div>
        </div>

        <div className="border border-[#855AB4]/30 rounded-2xl p-6 bg-[#221545]/50 space-y-1 shadow-[0_0_20px_rgba(104,56,141,0.15)]">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">
            CORRECT ACCURACY
          </span>
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#B26FCB]">
            {teamScore?.correctCount || 0}
          </div>
        </div>

        <div className="border border-[#855AB4]/30 rounded-2xl p-6 bg-[#221545]/50 space-y-1 shadow-[0_0_20px_rgba(104,56,141,0.15)]">
          <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">
            THEME REVEAL STATUS
          </span>
          <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#855AB4]">
            {eventData?.themesRevealed ? "REVEALED" : "SEALED"}
          </div>
        </div>
      </div>

      {/* 3-Column Wide Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Quiz Link */}
        <Link
          to="/quiz"
          className="group border border-[#855AB4]/25 rounded-3xl p-8 bg-[#221545]/40 hover:border-[#B26FCB] hover:bg-[#221545]/70 transition-all duration-300 space-y-6 shadow-[0_0_30px_rgba(104,56,141,0.15)]"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400 group-hover:text-[#B26FCB] font-bold">
              PHASE 01
            </span>
            <span className={`font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
              eventData?.quizOpen ? 'bg-[#68388D]/40 text-[#B26FCB] border border-[#855AB4]/50' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.quizOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#B26FCB] transition-colors">
              Authoritative Quiz Arena
            </h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed mt-2">
              Complete the timed assessment under authoritative server deadlines to earn points for bidding.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1.5 font-mono text-xs text-white group-hover:text-[#B26FCB] font-medium">
            <span>Launch Quiz Arena</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* Bidding Link */}
        <Link
          to="/bidding"
          className="group border border-[#855AB4]/25 rounded-3xl p-8 bg-[#221545]/40 hover:border-[#B26FCB] hover:bg-[#221545]/70 transition-all duration-300 space-y-6 shadow-[0_0_30px_rgba(104,56,141,0.15)]"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400 group-hover:text-[#B26FCB] font-bold">
              PHASE 02
            </span>
            <span className={`font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
              eventData?.biddingOpen ? 'bg-[#68388D]/40 text-[#B26FCB] border border-[#855AB4]/50' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.biddingOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#B26FCB] transition-colors">
              Theme Priority Bidding
            </h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed mt-2">
              Allocate your quiz score points towards your team's preferred challenge theme.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1.5 font-mono text-xs text-white group-hover:text-[#B26FCB] font-medium">
            <span>Enter Bidding Arena</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* Results Link */}
        <Link
          to="/results"
          className="group border border-[#855AB4]/25 rounded-3xl p-8 bg-[#221545]/40 hover:border-[#B26FCB] hover:bg-[#221545]/70 transition-all duration-300 space-y-6 shadow-[0_0_30px_rgba(104,56,141,0.15)]"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400 group-hover:text-[#B26FCB] font-bold">
              PHASE 03
            </span>
            <span className={`font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
              eventData?.allocationFinalized ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.allocationFinalized ? 'FINALIZED' : 'PENDING'}
            </span>
          </div>

          <div>
            <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#B26FCB] transition-colors">
              Allocation Outcome
            </h3>
            <p className="text-zinc-400 text-sm font-light leading-relaxed mt-2">
              Inspect your final theme assignment and competition rank computed via priority tuple.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-1.5 font-mono text-xs text-white group-hover:text-[#B26FCB] font-medium">
            <span>View Final Results</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* Full-Width Personnel Roster */}
      <div className="space-y-6 pt-6 border-t border-[#855AB4]/20">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 block">
            Team Personnel Roster ({(teamData?.members || []).length} Members)
          </span>
          <span className="font-mono text-[11px] text-[#B26FCB]/70">
            TRANSPONDER ID: {teamData?.authUid}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(teamData?.members || []).map((m, idx) => (
            <div key={idx} className="border border-[#855AB4]/30 rounded-2xl p-6 bg-[#221545]/40 space-y-2">
              <span className="font-mono text-[10px] text-zinc-400 uppercase">
                Member 0{idx + 1}
              </span>
              <div className="text-base font-bold text-white">{m.name}</div>
              <div className="text-xs text-zinc-400 font-light">{m.email}</div>
              <div className="pt-2 border-t border-[#855AB4]/20 text-xs text-[#B26FCB] font-mono font-medium">
                {m.role || "Team Member"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
