import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { UserCheck, Zap, Award, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPoints } from '../../utils/formatters';

export function TeamDashboard() {
  const { teamData, teamScore } = useAuth();
  const { eventData } = useEvent();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Team Header Summary Banner */}
      <div className="border border-white/10 bg-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-400" />
            <h1 className="font-mono text-xl font-black uppercase tracking-wider text-white">
              TEAM MISSION CONTROL // {teamData?.teamName || "TEAM HUB"}
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            CODE: <span className="text-red-400 font-bold">{teamData?.teamCode || "N/A"}</span> &bull; {teamData?.syntheticEmail}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status="AUTHENTICATED" variant="emerald" />
        </div>
      </div>

      {/* Live Performance & Score Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <ControlPanel title="TOTAL POINTS BALANCE" subtitle="Quiz Score Snapshot">
          <div className="font-mono text-4xl font-extrabold text-red-500 tracking-tight drop-shadow-[0_0_12px_rgba(220,38,38,0.5)]">
            {formatPoints(teamScore?.totalPoints || 0)} <span className="text-sm text-zinc-500 font-normal">PTS</span>
          </div>
        </ControlPanel>

        <ControlPanel title="QUESTIONS ANSWERED" subtitle="Completion Count">
          <div className="font-mono text-4xl font-extrabold text-amber-400 tracking-tight">
            {teamScore?.answeredCount || 0} <span className="text-sm text-zinc-500 font-normal">COMPLETED</span>
          </div>
        </ControlPanel>

        <ControlPanel title="ACCURACY" subtitle="Correct Submissions">
          <div className="font-mono text-4xl font-extrabold text-emerald-400 tracking-tight">
            {teamScore?.correctCount || 0} <span className="text-sm text-zinc-500 font-normal">CORRECT</span>
          </div>
        </ControlPanel>
      </div>

      {/* Interactive Phase Launcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quiz Phase Card */}
        <ControlPanel
          title="01. AUTHORITATIVE QUIZ"
          subtitle="10s Read + 10s Answer"
          badge={
            <StatusBadge
              status={eventData?.quizOpen ? "QUIZ OPEN" : "QUIZ SEALED"}
              variant={eventData?.quizOpen ? "red" : "zinc"}
            />
          }
        >
          <p className="font-mono text-xs text-zinc-300 mb-6">
            Execute the timed robotics and automation assessment to earn score points for theme bidding.
          </p>

          <Link
            to="/quiz"
            className="w-full flex items-center justify-between border border-red-600 bg-red-950/40 px-4 py-3 font-mono text-xs font-extrabold uppercase text-red-300 transition-all hover:bg-red-600 hover:text-white active:scale-[0.97]"
          >
            <span>LAUNCH QUIZ ENGINE</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ControlPanel>

        {/* Theme Bidding Phase Card */}
        <ControlPanel
          title="02. THEME BIDDING"
          subtitle="Priority Point Allocation"
          badge={
            <StatusBadge
              status={eventData?.biddingOpen ? "BIDDING OPEN" : "BIDDING CLOSED"}
              variant={eventData?.biddingOpen ? "cyan" : "zinc"}
            />
          }
        >
          <p className="font-mono text-xs text-zinc-300 mb-6">
            Spend earned quiz score points to bid on your team's preferred challenge theme.
          </p>

          <Link
            to="/bidding"
            className="w-full flex items-center justify-between border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-xs font-bold uppercase text-zinc-200 transition-all hover:border-white hover:bg-zinc-800 active:scale-[0.97]"
          >
            <span>ENTER BIDDING CONSOLE</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ControlPanel>

        {/* Results & Final Allocation Card */}
        <ControlPanel
          title="03. FINAL RESULTS"
          subtitle="Rank & Assigned Theme"
          badge={
            <StatusBadge
              status={eventData?.allocationFinalized ? "FINALIZED" : "PENDING"}
              variant={eventData?.allocationFinalized ? "emerald" : "zinc"}
            />
          }
        >
          <p className="font-mono text-xs text-zinc-300 mb-6">
            Inspect finalized theme allocation rank computed via server priority tuple.
          </p>

          <Link
            to="/results"
            className="w-full flex items-center justify-between border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-xs font-bold uppercase text-zinc-200 transition-all hover:border-white hover:bg-zinc-800 active:scale-[0.97]"
          >
            <span>VIEW ALLOCATION RESULTS</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </ControlPanel>
      </div>

      {/* Team Roster Inspection */}
      <ControlPanel title="TEAM ROSTER MEMBERS" subtitle="Registered Personnel">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {(teamData?.members || []).map((m, idx) => (
            <div key={idx} className="border border-zinc-800 bg-zinc-900/60 p-4 font-mono">
              <div className="text-[10px] text-zinc-500 uppercase">MEMBER 0{idx + 1}</div>
              <div className="text-sm font-bold text-white mt-1">{m.name}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{m.email}</div>
              <div className="mt-2 text-[10px] text-red-400 font-semibold border-t border-zinc-800 pt-1">
                {m.role || "Team Member"}
              </div>
            </div>
          ))}
        </div>
      </ControlPanel>
    </div>
  );
}
