// src/pages/TeamDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { Users, Plus, Key, Award, CheckCircle, Copy, LogOut, Shield, Layers, HelpCircle } from 'lucide-react';

export const TeamDashboard = () => {
  const { currentUser, currentTeam, createTeam, joinTeam, leaveTeam } = useAuth();
  const { themes, config } = useGlobalConfig();

  const [teamNameInput, setTeamNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!teamNameInput.trim()) return;
    const res = createTeam(teamNameInput.trim());
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!joinCodeInput.trim()) return;
    const res = joinTeam(joinCodeInput.trim());
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const copyCode = () => {
    if (currentTeam?.joinCode) {
      navigator.clipboard.writeText(currentTeam.joinCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getAllocatedThemeTitle = () => {
    if (!currentTeam?.allocatedThemeId) return null;
    const found = themes.find(t => t.themeId === currentTeam.allocatedThemeId);
    return found ? found.title : currentTeam.allocatedThemeId;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-600 text-black font-mono text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
          TEAM_PORTAL
        </div>

        <div className="flex items-center space-x-3 text-red-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
          <Users className="w-4 h-4" />
          <span>SQUADRON & ROSTER MANAGEMENT</span>
        </div>

        <h1 className="font-mono text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          TEAM DASHBOARD
        </h1>
        <p className="text-zinc-400 font-sans text-sm mt-2">
          Manage your hackathon squad, view quiz points, share join codes, and check theme allocation results.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Content: If user has a team vs No team */}
      {currentTeam ? (
        <div className="space-y-6 font-mono">
          {/* Active Team Overview Header Card */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 relative">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-900">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">REGISTERED TEAM NAME</span>
                <h2 className="text-2xl font-extrabold text-white uppercase">{currentTeam.teamName}</h2>
              </div>

              {/* Join Code Copy Box */}
              <div className="bg-black border border-zinc-800 p-3 flex items-center space-x-3">
                <div>
                  <div className="text-[9px] text-zinc-500 uppercase">TEAM JOIN CODE</div>
                  <div className="text-sm font-bold text-red-500 tracking-wider">{currentTeam.joinCode}</div>
                </div>
                <button
                  onClick={copyCode}
                  className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
                  title="Copy Join Code"
                >
                  {copiedCode ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Team Telemetry Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-black border border-zinc-900 p-4">
                <div className="text-xs text-zinc-500 uppercase mb-1">QUIZ SCORE</div>
                <div className="text-2xl font-extrabold text-red-500 flex items-center space-x-2">
                  <Award className="w-6 h-6 text-amber-500" />
                  <span>{currentTeam.quizState?.totalScore || 0} PTS</span>
                </div>
              </div>

              <div className="bg-black border border-zinc-900 p-4">
                <div className="text-xs text-zinc-500 uppercase mb-1">SPEED TIME TIE-BREAKER</div>
                <div className="text-xl font-bold text-white">
                  {((currentTeam.quizState?.totalTimeTakenMs || 0) / 1000).toFixed(1)}s
                </div>
              </div>

              <div className="bg-black border border-zinc-900 p-4">
                <div className="text-xs text-zinc-500 uppercase mb-1">ALLOCATED THEME</div>
                <div className="text-sm font-bold text-emerald-400 truncate">
                  {getAllocatedThemeTitle() || 'PENDING ALLOCATION'}
                </div>
              </div>
            </div>

            {/* Team Roster */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                SQUAD ROSTER ({currentTeam.memberUids.length}/4 MEMBERS)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTeam.memberUids.map((uid, idx) => (
                  <div key={idx} className="bg-black border border-zinc-800 p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-red-950 text-red-400 border border-red-800 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-xs text-white">{uid === currentUser.uid ? `${currentUser.name || currentUser.email} (YOU)` : `Operator ${uid.slice(-6)}`}</span>
                    </div>
                    {uid === currentTeam.leaderUid && (
                      <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                        LEADER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Team Button */}
            <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-end">
              <button
                onClick={leaveTeam}
                className="px-4 py-2 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-800 hover:border-red-800 text-xs transition-colors flex items-center space-x-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LEAVE TEAM</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form Team or Join Team Selection */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {/* Create Team Card */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-red-950 border border-red-800 flex items-center justify-center text-red-500">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase">CREATE NEW TEAM</h2>
              <p className="text-xs font-sans text-zinc-400 leading-relaxed">
                Establish a new hackathon squad as Team Leader. An automatic unique Join Code will be generated for your teammates.
              </p>

              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div>
                  <label className="block text-zinc-500 text-[11px] uppercase mb-1">TEAM NAME</label>
                  <input
                    type="text"
                    required
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    placeholder="e.g. SCADA Protocol Enforcers"
                    className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white text-xs outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                >
                  CREATE TEAM & GENERATE CODE
                </button>
              </form>
            </div>
          </div>

          {/* Join Team Card */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase">JOIN EXISTING TEAM</h2>
              <p className="text-xs font-sans text-zinc-400 leading-relaxed">
                Enter the unique 8-character Join Code provided by your Team Leader to join their squad.
              </p>

              <form onSubmit={handleJoin} className="space-y-4 pt-2">
                <div>
                  <label className="block text-zinc-500 text-[11px] uppercase mb-1">TEAM JOIN CODE</label>
                  <input
                    type="text"
                    required
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="e.g. HACK-3891"
                    className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white text-xs outline-none uppercase tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  JOIN SQUAD
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
