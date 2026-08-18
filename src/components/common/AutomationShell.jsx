import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvent } from '../../context/EventContext';
import { LogOut, UserCheck, Shield, Radio, Menu, X } from 'lucide-react';
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
    <div className="min-h-screen bg-[#110515] text-zinc-100 font-sans flex flex-col antialiased selection:bg-[#B26FCB] selection:text-black relative w-full overflow-x-hidden">
      {/* 3D Cosmic Wireframe & Stardust Canvas */}
      <ParticleCanvas />

      {/* Floating Header Across 1080p Screen */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#110515]/90 backdrop-blur-2xl border-b border-[#855AB4]/20 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-[1720px] w-full mx-auto px-6 md:px-12 xl:px-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <span className="font-display text-lg md:text-xl font-extrabold tracking-[0.2em] text-white group-hover:text-[#B26FCB] transition-colors duration-300">
              MECHNOVA
            </span>
            <span className="h-2 w-2 rounded-full bg-[#B26FCB] shadow-[0_0_12px_rgba(178,111,203,1)] animate-pulse"></span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-[0.25em] text-[#B26FCB]/70 uppercase">
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
                  className={`text-xs font-mono font-bold tracking-[0.2em] uppercase transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-white font-extrabold'
                      : 'text-zinc-400 hover:text-[#B26FCB]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B26FCB] shadow-[0_0_12px_rgba(178,111,203,1)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Telemetry & Auth */}
          <div className="flex items-center gap-4">
            {/* NTP Clock */}
            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-zinc-300 border border-[#855AB4]/30 rounded-full px-3.5 py-1 bg-[#221545]/40 backdrop-blur-md">
              <Radio className="h-3 w-3 text-[#B26FCB] animate-pulse" />
              <span className="text-zinc-400 uppercase">NTP</span>
              <span className="text-[#B26FCB] font-semibold">{formatTimestamp(currentClockMs)}</span>
            </div>

            {/* Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 border border-[#B26FCB]/40 bg-[#68388D]/30 px-3.5 py-1 rounded-full font-mono text-[11px] font-bold text-[#B26FCB] uppercase tracking-widest shadow-[0_0_15px_rgba(178,111,203,0.2)]">
                    <Shield className="h-3.5 w-3.5 text-[#B26FCB]" />
                    ADMIN
                  </span>
                ) : (
                  <div className="flex items-center gap-2 border border-[#855AB4]/30 bg-[#221545]/60 px-3.5 py-1 rounded-full">
                    <UserCheck className="h-3.5 w-3.5 text-[#B26FCB]" />
                    <span className="font-mono text-xs font-bold text-white tracking-wider">
                      {teamData?.teamCode || "TEAM"}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="h-8 w-8 rounded-full border border-[#855AB4]/30 bg-[#221545]/40 flex items-center justify-center text-zinc-400 hover:text-[#B26FCB] hover:border-[#B26FCB]/50 transition-all duration-150 active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="font-mono text-xs font-bold tracking-[0.15em] uppercase text-white bg-[#68388D] hover:bg-[#855AB4] border border-[#B26FCB]/40 px-5 py-2 rounded-full transition-all duration-200 active:scale-95 shadow-[0_0_20px_rgba(178,111,203,0.3)]"
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
          <div className="lg:hidden bg-[#110515]/95 border-b border-[#855AB4]/30 px-8 py-6 space-y-4 backdrop-blur-2xl">
            {navItems.map((item) => {
              if (item.hideIfAuth && currentUser) return null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block font-mono text-xs tracking-[0.2em] uppercase text-zinc-300 hover:text-[#B26FCB] py-2"
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

      {/* Dynamic Full-Width Footer */}
      <footer className="border-t border-[#855AB4]/20 bg-[#000000]/80 backdrop-blur-md px-6 md:px-12 xl:px-16 py-10 z-10 font-mono text-xs text-zinc-400 w-full">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="font-display text-white font-bold tracking-widest text-sm">
                MECHNOVA // 2026
              </span>
              <span>&bull;</span>
              <span className="text-[#B26FCB]/80 tracking-wider">
                CYBER-PHYSICAL SYSTEMS & AUTONOMOUS ROBOTICS
              </span>
            </div>
            <p className="text-zinc-500 text-[11px] font-sans font-light max-w-xl">
              Authoritative autonomous systems competition platform. Built with server-side deterministic state machines, audited theme reveals, and cryptographic credentials.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2 text-[11px] tracking-wider text-center md:text-right">
            <div className="text-zinc-500">
              © 2026 MECHNOVA // ROBOTICS & AUTOMATION PLATFORM. ALL RIGHTS RESERVED.
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2 text-[#B26FCB]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B26FCB] animate-pulse shadow-[0_0_8px_rgba(178,111,203,0.9)]"></span>
              <span>CORE OPERATIONAL &bull; VIT CHENNAI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
