import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut, Menu, Shield, UserCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ParticleCanvas = lazy(() => import('./ParticleCanvas'));

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Themes', path: '/themes' },
  { label: 'Quiz', path: '/quiz' },
  { label: 'Bidding', path: '/bidding' },
  { label: 'Results', path: '/results' }
];

export function AutomationShell({ children }) {
  const { currentUser, isAdmin, teamData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shellRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return undefined;
    let frameId = 0;
    let pointerX = window.innerWidth * 0.72;
    let pointerY = window.innerHeight * 0.2;

    const paintPointer = () => {
      shell.style.setProperty('--cursor-x', `${pointerX}px`);
      shell.style.setProperty('--cursor-y', `${pointerY}px`);
      frameId = 0;
    };

    const handlePointerMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!frameId) frameId = window.requestAnimationFrame(paintPointer);

      const tiltTarget = event.target.closest?.('[data-tilt]');
      if (!tiltTarget || window.matchMedia('(pointer: coarse)').matches) return;
      const rect = tiltTarget.getBoundingClientRect();
      const localX = (event.clientX - rect.left) / rect.width - 0.5;
      const localY = (event.clientY - rect.top) / rect.height - 0.5;
      tiltTarget.style.setProperty('--tilt-x', `${localX * 7}deg`);
      tiltTarget.style.setProperty('--tilt-y', `${localY * -7}deg`);
      tiltTarget.style.setProperty('--shine-x', `${(localX + 0.5) * 100}%`);
      tiltTarget.style.setProperty('--shine-y', `${(localY + 0.5) * 100}%`);
    };

    const handlePointerOut = (event) => {
      const tiltTarget = event.target.closest?.('[data-tilt]');
      if (!tiltTarget || tiltTarget.contains(event.relatedTarget)) return;
      tiltTarget.style.setProperty('--tilt-x', '0deg');
      tiltTarget.style.setProperty('--tilt-y', '0deg');
    };

    shell.addEventListener('pointermove', handlePointerMove, { passive: true });
    shell.addEventListener('pointerout', handlePointerOut, { passive: true });
    paintPointer();
    return () => {
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerout', handlePointerOut);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    const observeNewElements = () => {
      document.querySelectorAll('.mn-reveal:not([data-reveal-bound]), .mn-page > *:not([data-reveal-bound])').forEach((element) => {
        element.setAttribute('data-reveal-bound', 'true');
        observer.observe(element);
      });
    };

    const timeoutId = window.setTimeout(observeNewElements, 40);
    const mutationObserver = new MutationObserver(observeNewElements);
    mutationObserver.observe(document.getElementById('main-content') || document.body, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(timeoutId);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div ref={shellRef} className="mn-shell">
      <div className="mn-cosmic-background" aria-hidden="true">
        <span className="mn-aurora mn-aurora-one" />
        <span className="mn-aurora mn-aurora-two" />
        <span className="mn-star-field" />
        <span className="mn-cursor-glow" />
        <span className="mn-scanline" />
      </div>
      {location.pathname === '/' && <Suspense fallback={null}><ParticleCanvas /></Suspense>}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-3 focus:text-black">Skip to content</a>

      <header className={`mn-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="mn-header-inner">
          <Link to="/" className="mn-brand" aria-label="MechNova home">
            <span className="mn-brand-mark" aria-hidden="true">M</span>
            <span>
              <span className="mn-brand-name">MECHNOVA</span>
              <span className="mn-brand-year"> / 2026</span>
            </span>
          </Link>

          <nav className="mn-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`mn-nav-link ${location.pathname === item.path ? 'is-active' : ''}`} aria-current={location.pathname === item.path ? 'page' : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mn-auth">
            {currentUser && (
              <span className="mn-session-chip">
                {isAdmin ? <Shield className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                {isAdmin ? 'Admin' : (teamData?.teamCode || 'Team')}
              </span>
            )}
            {!currentUser && (
              <Link to="/login" className="mn-session-chip">Team sign in</Link>
            )}
            {currentUser && (
              <button type="button" onClick={handleLogout} title="Sign out" aria-label="Sign out" className="mn-icon-button">
                <LogOut className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} className="mn-icon-button mn-menu-toggle">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="mn-mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>{item.label}<ArrowUpRight className="h-4 w-4" /></Link>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content" key={location.pathname} className="mn-main mn-route-enter">{children}</main>

      <footer className="mn-footer">
        <div className="mn-footer-inner">
          <div>
            <div className="mn-footer-brand">MECHNOVA / VIT CHENNAI</div>
            <p>A competition platform for the quiz, challenge preferences, and theme allocation stages of MechNova 2026.</p>
          </div>
          <div className="mn-footer-meta">
            <div>Robotics &amp; Automation Club</div>
            <div className="mn-footer-live"><span className="mn-live-dot" /> Event platform online</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
