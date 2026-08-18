// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobalConfig } from '../context/GlobalConfigContext';
import { Cpu, Shield, User, LogOut, Award, Layers, HelpCircle, Calendar, Home, Zap, Lock } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, currentTeam, logout } = useAuth();
  const { config } = useGlobalConfig();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getStatusColor = (status) => {
    switch (status) {
      case 'quiz_live': return 'bg-red-500 text-red-50 border-red-500 animate-pulse';
      case 'bidding_open': return 'bg-amber-500 text-black border-amber-500';
      case 'allocated': return 'bg-emerald-500 text-black border-emerald-500';
      default: return 'bg-red-600 text-white border-red-800';
    }
  };

  return (
    <header className="bg-black border-b border-zinc-800 sticky top-0 z-50 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      {/* Top SCADA Marquee / Telemetry Strip */}
      <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-1 flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-zinc-300">SCADA_LINK: ACTIVE</span>
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-400">LATENCY: 12ms</span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-red-500">EVENT_PHASE: {config.eventStatus.toUpperCase()}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-zinc-400">BUILD: v2.6.4</span>
          {currentUser && (
            <span className="bg-zinc-900 px-2 py-0.5 border border-zinc-800 text-zinc-300 rounded">
              {currentUser.role.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-zinc-950 border border-red-600/60 flex items-center justify-center group-hover:border-red-500 transition-colors">
            <Cpu className="w-5 h-5 text-red-600 group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <div>
            <div className="font-mono font-extrabold text-xl tracking-wider text-white uppercase flex items-center">
              AUTO<span className="text-red-600">//</span>HACK
              <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-red-950/80 text-red-400 border border-red-800/60 rounded font-normal">2026</span>
            </div>
            <div className="text-[9px] font-mono text-zinc-400 tracking-widest uppercase">Cyber-Physical Automation</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2 text-sm font-mono">
          <Link
            to="/"
            className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
              isActive('/') 
                ? 'bg-red-950/40 text-white border-red-600' 
                : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>HOME</span>
          </Link>

          <Link
            to="/schedule"
            className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
              isActive('/schedule') 
                ? 'bg-red-950/40 text-white border-red-600' 
                : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>TIMELINE</span>
          </Link>

          <Link
            to="/faq"
            className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
              isActive('/faq') 
                ? 'bg-red-950/40 text-white border-red-600' 
                : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </Link>

          {currentUser && (
            <>
              <Link
                to="/team"
                className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
                  isActive('/team') 
                    ? 'bg-red-950/40 text-white border-red-600' 
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>TEAM</span>
              </Link>

              <Link
                to="/quiz"
                className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
                  isActive('/quiz') 
                    ? 'bg-red-950/40 text-white border-red-600' 
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span>QUIZ</span>
              </Link>

              <Link
                to="/themes"
                className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
                  isActive('/themes') 
                    ? 'bg-red-950/40 text-white border-red-600' 
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>THEMES</span>
              </Link>

              <Link
                to="/bidding"
                className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
                  isActive('/bidding') 
                    ? 'bg-red-950/40 text-white border-red-600' 
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-zinc-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>BIDDING</span>
              </Link>
            </>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
                isActive('/admin') 
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                  : 'text-red-400 bg-red-950/30 border-red-900/60 hover:bg-red-900/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN</span>
            </Link>
          )}
        </nav>

        {/* User Stats & Auth Controls */}
        <div className="flex items-center space-x-3">
          {currentTeam && (
            <div className="bg-zinc-950 border border-zinc-800 px-3 py-1 flex items-center space-x-2 text-xs font-mono">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-zinc-400 hidden sm:inline">{currentTeam.teamName}:</span>
              <span className="text-red-500 font-bold">{currentTeam.quizState?.totalScore || 0} PTS</span>
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div className="text-right hidden md:block">
                <div className="text-xs font-mono font-semibold text-white">{currentUser.name || currentUser.email}</div>
                <div className="text-[10px] font-mono text-zinc-500">{currentUser.email}</div>
              </div>
              <button
                onClick={logout}
                title="Disconnect Session"
                className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-950 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(220,38,38,0.3)]"
            >
              SIGN IN
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
