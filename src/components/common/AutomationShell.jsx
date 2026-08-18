import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { Cpu, Terminal, LogOut, Radio, UserCheck, Shield, Menu, X } from 'lucide-react';
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
    { label: 'ABOUT', path: '/' },
    { label: 'RADAR STATUS', path: '/status' },
    { label: 'CHALLENGE THEMES', path: '/themes' },
    { label: 'REGISTER TEAM', path: '/register', hideIfAuth: true }
  ];

  if (currentUser && !isAdmin) {
    navItems.push(
      { label: 'TEAM HUB', path: '/dashboard' },
      { label: 'QUIZ ENGINE', path: '/quiz' },
      { label: 'THEME BIDDING', path: '/bidding' },
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
    <div className="min-h-screen bg-void text-zinc-100 font-sans flex flex-col antialiased selection:bg-red-600 selection:text-white relative w-full overflow-x-hidden">
      {/* Interactive Frontier Space & Robotics Particle Canvas */}
      <ParticleCanvas />

      {/* Floating Modern Header Across 1080p Screen */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/85 backdrop-blur-2xl border-b border-white/[0.08] py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1720px] w-full mx-auto px-6 md:px-12 xl:px-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <span className="font-display text-xl md:text-2xl font-extrabold tracking-[0.2em] text-white group-hover:text-red-500 transition-colors duration-300">
              MECHATHON
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">
              AUTONOMOUS SYSTEMS // 2026
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
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Status & Auth */}
          <div className="flex items-center gap-4">
            {/* Clock */}
            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-zinc-400 border border-white/10 rounded-full px-3.5 py-1 bg-white/[0.02]">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span className="text-zinc-500 uppercase">NTP</span>
              <span className="text-zinc-300 font-semibold">{formatTimestamp(currentClockMs)}</span>
            </div>

            {/* Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 border border-red-500/30 bg-red-500/10 px-3.5 py-1 rounded-full font-mono text-[11px] font-bold text-red-400 uppercase tracking-widest">
                    <Shield className="h-3.5 w-3.5 text-red-400" />
                    ADMIN
                  </span>
                ) : (
                  <div className="flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-1 rounded-full">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      {teamData?.teamCode || "TEAM"}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-all duration-150 active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="font-mono text-xs font-bold tracking-[0.15em] uppercase text-white bg-white/10 hover:bg-red-600 border border-white/10 hover:border-red-600 px-5 py-2 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
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
          <div className="lg:hidden bg-black/95 border-b border-white/10 px-8 py-6 space-y-4">
            {navItems.map((item) => {
              if (item.hideIfAuth && currentUser) return null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-mono text-xs tracking-[0.2em] uppercase text-zinc-300 hover:text-white py-2"
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

      {/* Full-Width Footer */}
      <footer className="border-t border-white/[0.06] bg-black/60 backdrop-blur-md px-6 md:px-12 xl:px-16 py-8 z-10 font-mono text-xs text-zinc-500 w-full">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-white font-bold tracking-widest text-sm">MECHATHON 2026</span>
            <span>&bull;</span>
            <span className="text-zinc-400 tracking-wider">CYBER-PHYSICAL SYSTEMS &amp; INDUSTRIAL ROBOTICS</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] tracking-wider">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              CORE OPERATIONAL
            </span>
            <span>&bull;</span>
            <span>VIT CHENNAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
