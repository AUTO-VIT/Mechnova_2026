import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { StatusBadge } from './StatusBadge';
import { Cpu, Terminal, Shield, LogOut, Radio, UserCheck } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';

export function AutomationShell({ children }) {
  const { currentUser, role, isAdmin, teamData, logout } = useAuth();
  const { eventData, serverOffsetMs } = useEvent();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentClockMs, setCurrentClockMs] = useState(Date.now() + serverOffsetMs);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentClockMs(Date.now() + serverOffsetMs);
    }, 1000);
    return () => clearInterval(timer);
  }, [serverOffsetMs]);

  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'STATUS', path: '/status' },
    { label: 'THEMES', path: '/themes' },
    { label: 'REGISTRATION', path: '/register', hideIfAuth: true }
  ];

  if (currentUser && !isAdmin) {
    navItems.push(
      { label: 'TEAM HUB', path: '/dashboard' },
      { label: 'QUIZ', path: '/quiz' },
      { label: 'BIDDING', path: '/bidding' },
      { label: 'RESULTS', path: '/results' }
    );
  }

  if (isAdmin) {
    navItems.push({ label: 'ADMIN CONSOLE', path: '/admin' });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white font-sans flex flex-col antialiased bg-tech-grid">
      {/* Top SCADA Telemetry Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center border border-red-600/60 bg-red-950/60 text-red-500 shadow-[0_0_12px_rgba(220,38,38,0.4)] transition-transform duration-160 group-hover:scale-105">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-sm font-black tracking-widest text-white flex items-center gap-2">
                MECHATHON <span className="text-red-500 font-extrabold">//</span> SCADA
              </div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                AUTOMATION HACKATHON PLATFORM
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.hideIfAuth && currentUser) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 font-mono text-xs uppercase font-bold tracking-wider transition-all duration-160 active:scale-[0.97] ${
                    isActive
                      ? 'border-b-2 border-red-500 text-red-400 bg-red-950/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Telemetry Controls & User Badge */}
          <div className="flex items-center gap-3">
            {/* Real-time Server Epoch Clock */}
            <div className="hidden sm:flex flex-col items-end border-r border-zinc-800 pr-3 font-mono text-[10px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                SERVER TIME
              </span>
              <span className="text-zinc-200 font-bold tracking-wider">
                {formatTimestamp(currentClockMs)}
              </span>
            </div>

            {/* Auth / Identity State */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <StatusBadge status="ADMIN" variant="red" />
                ) : (
                  <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-2.5 py-1">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-white">
                      {teamData?.teamCode || "TEAM"}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all hover:border-red-500 hover:text-red-400 active:scale-[0.97]"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="border border-red-600 bg-red-950/40 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-red-300 transition-all hover:bg-red-600 hover:text-white active:scale-[0.97]"
              >
                TEAM GATE
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer System Telemetry Rail */}
      <footer className="border-t border-white/10 bg-zinc-950 px-4 py-3 font-mono text-[10px] text-zinc-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Terminal className="h-3.5 w-3.5 text-red-500" />
              SYSTEM VERSION: 2026.4.0
            </span>
            <span>&bull;</span>
            <span>SERVER AUTHORITY: AUTHORITATIVE</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold">STATUS: OPERATIONAL</span>
            <span>&bull;</span>
            <span>CONFIDENTIAL ROBOTICS CONTROL SYSTEM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
