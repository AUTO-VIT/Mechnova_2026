// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { Shield, Zap, Lock, Unlock, Play, Layers, Award, Edit, Trash2, Plus, CheckCircle, RefreshCw, FileText, Settings, Users } from 'lucide-react';

export const AdminPanel = () => {
  const {
    config,
    siteContent,
    questions,
    themes,
    teams,
    setEventStatus,
    toggleThemesRevealed,
    startQuiz,
    updateSiteContent,
    saveQuestion,
    deleteQuestion,
    saveTheme,
    deleteTheme,
    runPriorityAllocation
  } = useGlobalConfig();

  const [activeTab, setActiveTab] = useState('allocation'); // 'allocation' | 'cms' | 'quiz' | 'themes'
  const [allocationResults, setAllocationResults] = useState(null);

  // Form states for CMS
  const [heroTitle, setHeroTitle] = useState(siteContent?.home?.heroTitle || '');
  const [heroSubtitle, setHeroSubtitle] = useState(siteContent?.home?.heroSubtitle || '');
  const [announcement, setAnnouncement] = useState(siteContent?.home?.announcementBanner || '');
  const [cmsSaveMsg, setCmsSaveMsg] = useState(false);

  // Form state for new Question
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrect, setQCorrect] = useState('a');

  // Form state for new Theme
  const [tTitle, setTTitle] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tTags, setTTags] = useState('');
  const [tQuota, setTQuota] = useState(5);

  const handleSaveCMS = (e) => {
    e.preventDefault();
    updateSiteContent('home', {
      heroTitle,
      heroSubtitle,
      announcementBanner: announcement
    });
    setCmsSaveMsg(true);
    setTimeout(() => setCmsSaveMsg(false), 3000);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!qText.trim()) return;
    const newQ = {
      id: `q-${Date.now()}`,
      questionText: qText,
      options: [
        { id: 'a', text: qOptA || 'Option A' },
        { id: 'b', text: qOptB || 'Option B' },
        { id: 'c', text: qOptC || 'Option C' },
        { id: 'd', text: qOptD || 'Option D' }
      ],
      correctAnswerId: qCorrect,
      points: 100,
      order: questions.length + 1
    };
    saveQuestion(newQ);
    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
  };

  const handleAddTheme = (e) => {
    e.preventDefault();
    if (!tTitle.trim()) return;
    const newT = {
      themeId: `t-${Date.now()}`,
      title: tTitle,
      description: tDesc,
      tags: tTags.split(',').map(s => s.trim()).filter(Boolean),
      maxTeamQuota: Number(tQuota) || 5,
      assignedTeamCount: 0,
      isRevealed: config.themesRevealed
    };
    saveTheme(newT);
    setTTitle('');
    setTDesc('');
    setTTags('');
  };

  const handleRunAllocation = () => {
    const res = runPriorityAllocation();
    setAllocationResults(res);
  };

  // Compute sorted teams for Leaderboard
  const sortedTeams = Object.values(teams || {}).sort((a, b) => {
    const scoreA = a.quizState?.totalScore || 0;
    const scoreB = b.quizState?.totalScore || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    const timeA = a.quizState?.totalTimeTakenMs || 9999999;
    const timeB = b.quizState?.totalTimeTakenMs || 9999999;
    return timeA - timeB;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-mono">
      {/* Header */}
      <div className="bg-zinc-950 border border-red-800/80 p-6 sm:p-8 relative overflow-hidden glow-red">
        <div className="absolute top-0 right-0 bg-red-600 text-black font-mono text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
          ADMIN_COMMAND_CENTER
        </div>

        <div className="flex items-center space-x-3 text-red-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
          <Shield className="w-4 h-4" />
          <span>SUPERUSER SCADA CONTROL PANEL</span>
        </div>

        <h1 className="font-mono text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
          SYSTEM ADMIN MATRIX
        </h1>
        <p className="text-zinc-400 font-sans text-sm mt-2">
          Manage event status phases, CMS copy, quiz questions, secret theme reveal state, and priority allocation execution.
        </p>
      </div>

      {/* Global Event Status Controls */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Settings className="w-4 h-4 text-red-500" />
            <span>EVENT STATUS PHASE CONTROL</span>
          </h2>
          <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2.5 py-1">
            CURRENT: {config.eventStatus.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => setEventStatus('registration')}
            className={`py-2.5 px-3 border transition-colors uppercase ${
              config.eventStatus === 'registration' 
                ? 'bg-red-600 text-white font-bold border-red-500' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            1. REGISTRATION
          </button>

          <button
            onClick={startQuiz}
            className={`py-2.5 px-3 border transition-colors uppercase flex items-center justify-center space-x-1 ${
              config.eventStatus === 'quiz_live' 
                ? 'bg-red-600 text-white font-bold border-red-500 animate-pulse' 
                : 'bg-black text-amber-400 border-zinc-800 hover:bg-amber-950/40'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>2. START SPEED QUIZ</span>
          </button>

          <button
            onClick={() => setEventStatus('bidding_open')}
            className={`py-2.5 px-3 border transition-colors uppercase ${
              config.eventStatus === 'bidding_open' 
                ? 'bg-amber-500 text-black font-bold border-amber-400' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            3. OPEN BIDDING
          </button>

          <button
            onClick={() => setEventStatus('allocated')}
            className={`py-2.5 px-3 border transition-colors uppercase ${
              config.eventStatus === 'allocated' 
                ? 'bg-emerald-500 text-black font-bold border-emerald-400' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            4. ALLOCATED
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex border-b border-zinc-800 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('allocation')}
          className={`px-4 py-3 border-b-2 font-bold transition-colors whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'allocation' ? 'border-red-600 text-white bg-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>LEADERBOARD & ALLOCATION</span>
        </button>

        <button
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-3 border-b-2 font-bold transition-colors whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'cms' ? 'border-red-600 text-white bg-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <FileText className="w-4 h-4 text-red-500" />
          <span>CMS CONTENT EDITOR</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-3 border-b-2 font-bold transition-colors whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'quiz' ? 'border-red-600 text-white bg-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Zap className="w-4 h-4 text-red-500" />
          <span>QUIZ MANAGER ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('themes')}
          className={`px-4 py-3 border-b-2 font-bold transition-colors whitespace-nowrap flex items-center space-x-2 ${
            activeTab === 'themes' ? 'border-red-600 text-white bg-zinc-950' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Layers className="w-4 h-4 text-red-500" />
          <span>THEME MANAGER ({themes.length})</span>
        </button>
      </div>

      {/* Tab 1: Leaderboard & Priority Allocation Runner */}
      {activeTab === 'allocation' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white uppercase">DETERMINISTIC PRIORITY ALLOCATION ENGINE</h2>
              <p className="text-xs font-sans text-zinc-400">
                Calculates leaderboard priority (Score + Speed tie-breaker) and assigns team theme choices within quota limits.
              </p>
            </div>

            <button
              onClick={handleRunAllocation}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>EXECUTE PRIORITY ALLOCATION</span>
            </button>
          </div>

          {allocationResults && (
            <div className="bg-emerald-950/80 border border-emerald-800 p-4 text-xs space-y-2">
              <div className="text-emerald-300 font-bold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>SUCCESSFULLY ALLOCATED THEMES TO {allocationResults.teamsAllocatedCount} TEAMS!</span>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              LIVE TEAM LEADERBOARD & THEME ASSIGNMENTS ({sortedTeams.length} TEAMS)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
                    <th className="py-2 px-3">RANK</th>
                    <th className="py-2 px-3">TEAM NAME</th>
                    <th className="py-2 px-3">QUIZ SCORE</th>
                    <th className="py-2 px-3">SPEED TIME</th>
                    <th className="py-2 px-3">ALLOCATED THEME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {sortedTeams.map((team, idx) => {
                    const theme = themes.find(t => t.themeId === team.allocatedThemeId);
                    return (
                      <tr key={team.teamId} className="hover:bg-black/50">
                        <td className="py-3 px-3 font-bold text-red-500">#{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-white">{team.teamName}</td>
                        <td className="py-3 px-3 text-amber-400 font-bold">{team.quizState?.totalScore || 0} PTS</td>
                        <td className="py-3 px-3 text-zinc-300">{((team.quizState?.totalTimeTakenMs || 0) / 1000).toFixed(1)}s</td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          {theme ? theme.title : (team.allocatedThemeId || 'UNALLOCATED')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CMS Content Editor */}
      {activeTab === 'cms' && (
        <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-6">
          <h2 className="text-lg font-bold text-white uppercase">LIVE CMS CONTENT EDITOR</h2>

          {cmsSaveMsg && (
            <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 text-xs flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>CMS CONTENT SAVED LIVE TO HOMEPAGE & PORTAL!</span>
            </div>
          )}

          <form onSubmit={handleSaveCMS} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">HOMEPAGE HERO TITLE</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">HOMEPAGE HERO SUBTITLE</label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">ANNOUNCEMENT MARQUEE BANNER</label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(220,38,38,0.3)]"
            >
              SAVE CMS CHANGES
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Quiz Manager */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white uppercase">ADD NEW QUIZ QUESTION</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">QUESTION TEXT</label>
                <input
                  type="text"
                  required
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="e.g. What is the standard baud rate for RS-485 serial communication?"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Option A"
                  value={qOptA}
                  onChange={(e) => setQOptA(e.target.value)}
                  className="bg-black border border-zinc-800 px-3 py-2 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Option B"
                  value={qOptB}
                  onChange={(e) => setQOptB(e.target.value)}
                  className="bg-black border border-zinc-800 px-3 py-2 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Option C"
                  value={qOptC}
                  onChange={(e) => setQOptC(e.target.value)}
                  className="bg-black border border-zinc-800 px-3 py-2 text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Option D"
                  value={qOptD}
                  onChange={(e) => setQOptD(e.target.value)}
                  className="bg-black border border-zinc-800 px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">CORRECT OPTION</label>
                <select
                  value={qCorrect}
                  onChange={(e) => setQCorrect(e.target.value)}
                  className="bg-black border border-zinc-800 px-3 py-2 text-white outline-none"
                >
                  <option value="a">Option A</option>
                  <option value="b">Option B</option>
                  <option value="c">Option C</option>
                  <option value="d">Option D</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider transition-colors"
              >
                ADD QUESTION TO ENGINE
              </button>
            </form>
          </div>

          {/* List of existing questions */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">EXISTING QUIZ QUESTIONS</h3>
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-black border border-zinc-900 p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-xs">Q{idx + 1}: {q.questionText}</div>
                  <div className="text-[11px] text-red-400 mt-1">Correct Answer: {q.correctAnswerId?.toUpperCase()}</div>
                </div>
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 text-zinc-500 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Secret Theme Manager */}
      {activeTab === 'themes' && (
        <div className="space-y-6">
          {/* Secret Theme Reveal Toggle Box */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase">SECRET THEME VAULT STATUS</h3>
              <p className="text-xs font-sans text-zinc-400">
                {config.themesRevealed ? 'Vault is UNLOCKED and public.' : 'Vault is LOCKED. Themes hidden from participants.'}
              </p>
            </div>

            <button
              onClick={() => toggleThemesRevealed()}
              className={`px-6 py-3 font-bold text-xs uppercase flex items-center space-x-2 transition-colors ${
                config.themesRevealed 
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                  : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
              }`}
            >
              {config.themesRevealed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{config.themesRevealed ? 'VAULT UNLOCKED (REVEALED)' : 'UNLOCK THEME VAULT'}</span>
            </button>
          </div>

          {/* Add Theme Form */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white uppercase">ADD SECRET THEME</h2>
            <form onSubmit={handleAddTheme} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">THEME TITLE</label>
                <input
                  type="text"
                  required
                  value={tTitle}
                  onChange={(e) => setTTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={tDesc}
                  onChange={(e) => setTDesc(e.target.value)}
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2 text-white outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">TAGS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    placeholder="SCADA, PLC, IoT"
                    value={tTags}
                    onChange={(e) => setTTags(e.target.value)}
                    className="w-full bg-black border border-zinc-800 px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">MAX TEAM QUOTA</label>
                  <input
                    type="number"
                    value={tQuota}
                    onChange={(e) => setTQuota(e.target.value)}
                    className="w-full bg-black border border-zinc-800 px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider transition-colors"
              >
                ADD THEME TO VAULT
              </button>
            </form>
          </div>

          {/* Theme List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <div key={theme.themeId} className="bg-zinc-950 border border-zinc-800 p-4 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <div className="text-white font-bold text-sm uppercase">{theme.title}</div>
                  <button onClick={() => deleteTheme(theme.themeId)} className="text-zinc-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-zinc-400 text-xs font-sans">{theme.description}</p>
                <div className="text-[11px] text-red-400">Quota: {theme.maxTeamQuota} teams max</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
