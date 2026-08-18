// src/pages/BiddingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { useAuth } from '../context/AuthContext';
import { Layers, Award, ArrowUp, ArrowDown, Check, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BiddingDashboard = () => {
  const { themes, updateTeamPreferences, config } = useGlobalConfig();
  const { currentTeam } = useAuth();

  const [preferences, setPreferences] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentTeam && currentTeam.preferences && currentTeam.preferences.length > 0) {
      setPreferences(currentTeam.preferences);
    } else if (themes && themes.length > 0) {
      setPreferences(themes.map(t => t.themeId));
    }
  }, [currentTeam, themes]);

  const moveUp = (index) => {
    if (index === 0) return;
    const newArr = [...preferences];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    setPreferences(newArr);
  };

  const moveDown = (index) => {
    if (index === preferences.length - 1) return;
    const newArr = [...preferences];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    setPreferences(newArr);
  };

  const handleSave = () => {
    if (currentTeam) {
      updateTeamPreferences(currentTeam.teamId, preferences);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const getThemeById = (id) => themes.find(t => t.themeId === id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-mono">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-amber-500 text-black font-mono text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
          BIDDING_PORTAL
        </div>

        <div className="flex items-center space-x-3 text-amber-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
          <Layers className="w-4 h-4" />
          <span>RANKED PREFERENCE SELECTION</span>
        </div>

        <h1 className="font-mono text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          PRIORITY THEME BIDDING
        </h1>
        <p className="text-zinc-400 font-sans text-sm mt-2">
          Rank your top 4 hackathon themes in order of preference. Your earned quiz score determines your team's priority rank during automated allocation.
        </p>
      </div>

      {/* Team Rank & Point Status */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500 uppercase">ACTIVE TEAM</div>
          <div className="text-xl font-extrabold text-white">{currentTeam?.teamName || 'UNASSIGNED OPERATOR'}</div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-black border border-zinc-800 px-4 py-2 text-right">
            <div className="text-[10px] text-zinc-500 uppercase">QUIZ PRIORITY POINTS</div>
            <div className="text-2xl font-extrabold text-red-500 flex items-center space-x-1">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{currentTeam?.quizState?.totalScore || 0} PTS</span>
            </div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-4 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>THEME PREFERENCES SUBMITTED & PERSISTED TO SCADA VAULT!</span>
        </div>
      )}

      {/* Ranked Preference List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          RANKED PREFERENCE MATRIX (1ST CHOICE &rarr; 4TH CHOICE)
        </h2>

        <div className="space-y-3">
          {preferences.map((themeId, idx) => {
            const theme = getThemeById(themeId);
            if (!theme) return null;
            const rankLabel = idx === 0 ? "1ST CHOICE (PRIMARY)" : idx === 1 ? "2ND CHOICE" : idx === 2 ? "3RD CHOICE" : "4TH CHOICE";
            const isFirst = idx === 0;

            return (
              <div
                key={themeId}
                className={`bg-zinc-950 border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isFirst ? 'border-amber-600/70 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 border flex items-center justify-center font-bold text-sm ${
                    isFirst ? 'bg-amber-950 text-amber-400 border-amber-800' : 'bg-black text-zinc-400 border-zinc-800'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{rankLabel}</div>
                    <div className="text-base font-bold text-white uppercase">{theme.title}</div>
                    <div className="text-xs font-sans text-zinc-400 mt-1 line-clamp-1">{theme.description}</div>
                  </div>
                </div>

                {/* Move Up / Move Down Buttons */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-2 bg-black hover:bg-zinc-900 border border-zinc-800 disabled:opacity-30 text-zinc-300 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === preferences.length - 1}
                    className="p-2 bg-black hover:bg-zinc-900 border border-zinc-800 disabled:opacity-30 text-zinc-300 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!currentTeam}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50"
          >
            SUBMIT & LOCK BIDDING PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
};
