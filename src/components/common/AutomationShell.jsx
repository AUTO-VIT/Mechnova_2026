import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { Cpu, Terminal, LogOut, Radio, UserCheck, Shield, Menu, X, Sparkles } from 'lucide-react';
import { formatTimestamp } from '../../utils/formatters';
import ParticleCanvas from './ParticleCanvas';

export function AutomationShell({ children }) {
  const { currentUser, isAdmin, teamData, logout } = useAuth();
  const { serverOffsetMs } = useEvent();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentClockMs, setCurrentClockMs] = useState(Date.now() + serverOffsetMs);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentClockMs(Date.now() + serverOffsetMs);
    }, 1000);
    return () => clearInterval(timer);
  }, [serverOffsetMs]);

  const navItems = [
    { label: 'MISSION', path: '/' },
    { label: 'RADAR STATUS', path: '/status' },
    { label: 'THEME VAULT', path: '/themes' },
    { label: 'REGISTER ROSTER', path: '/register', hideIfAuth: true }
  ];

  if (currentUser && !isAdmin) {
    navItems.push(
      { label: 'TEAM COCKPIT', path: '/dashboard' },
      { label: 'QUIZ ARENA', path: '/quiz' },
      { label: 'THEME BIDDING', path: '/bidding' },
      { label: 'ALLOCATION', path: '/results' }
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
    <div className="min-h-screen bg-[#020205] text-zinc-100 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white relative w-full overflow-x-hidden">
      {/* 3D Galaxy Wireframe & Stardust Particle Canvas */}
      <ParticleCanvas />

      {/* Floating Space Header Across 1080p Screen */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#020205]/85 backdrop-blur-2xl border-b border-sky-500/10 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1720px] w-full mx-auto px-6 md:px-12 xl:px-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <span className="font-display text-xl md:text-2xl font-extrabold tracking-[0.2em] text-white group-hover:text-sky-400 transition-colors duration-300">
              MECHATHON
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)] animate-pulse"></span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.25em] text-zinc-400 uppercase">
              DEEP SPACE &bull; AUTONOMOUS SYSTEMS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navItems.map((item) => {
              if (item.hideIfAuth && currentUser) return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs font-mono font-medium tracking-[0.2em] uppercase transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-zinc-400 hover:text-sky-300'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,1)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Telemetry & Auth */}
          <div className="flex items-center gap-4">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-zinc-400 border border-sky-500/20 rounded-full px-3.5 py-1 bg-sky-500/[0.03]">
              <Radio className="h-3 w-3 text-sky-400 animate-pulse" />
              <span className="text-zinc-500 uppercase">NTP</span>
              <span className="text-sky-200 font-semibold">{formatTimestamp(currentClockMs)}</span>
            </div>

            {/* Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 rounded-full font-mono text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    ADMIN
                  </span>
                ) : (
                  <div className="flex items-center gap-2 border border-sky-500/20 bg-sky-500/[0.04] px-3.5 py-1 rounded-full">
                    <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      {teamData?.teamCode || "TEAM"}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center text-zinc-400 hover:text-sky-400 hover:border-sky-500/40 transition-all duration-150 active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="font-mono text-xs font-bold tracking-[0.15em] uppercase text-white bg-blue-600/20 hover:bg-blue-600 border border-blue-500/40 hover:border-blue-500 px-5 py-2 rounded-full transition-all duration-200 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
              >
                TEAM PORTAL
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-zinc-400 hover:text-white p-1"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#020205]/95 border-b border-sky-500/20 px-8 py-6 space-y-4 backdrop-blur-2xl">
            {navItems.map((item) => {
              if (item.hideIfAuth && currentUser) return null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-mono text-xs tracking-[0.2em] uppercase text-zinc-300 hover:text-sky-300 py-2"
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Full-Width Widescreen Viewport */}
      <main className="flex-1 z-10 pt-28 md:pt-32 pb-20 max-w-[1720px] w-full mx-auto px-6 md:px-12 xl:px-16">
        {children}
      </main>

      {/* Full-Width Space Footer */}
      <footer className="border-t border-sky-500/10 bg-[#020205]/70 backdrop-blur-md px-6 md:px-12 xl:px-16 py-8 z-10 font-mono text-xs text-zinc-500 w-full">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-white font-bold tracking-widest text-sm">MECHATHON 2026</span>
            <span>&bull;</span>
            <span className="text-zinc-400 tracking-wider">CYBER-PHYSICAL SYSTEMS &amp; SPACE ROBOTICS</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] tracking-wider">
            <span className="text-sky-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
              GALAXY ORBITAL READY
            </span>
            <span>&bull;</span>
            <span>VIT CHENNAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
