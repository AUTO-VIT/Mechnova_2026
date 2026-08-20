import React from 'react';
import { Lock, UsersRound } from 'lucide-react';
import { useEvent } from '../../context/EventContext';

export function ThemeRevealPanel() {
  const { eventData, publicThemes } = useEvent();
  const isRevealed = eventData?.themesRevealed === true || publicThemes.length > 0;

  return (
    <div className="mn-page">
      <header className="mn-page-head">
        <div className="mn-kicker">Challenge themes</div>
        <h1 className="mn-title">The problems teams will build around.</h1>
        <p className="mn-lede">Themes stay private until the event team releases them. Once visible, every team ranks the complete list before allocation.</p>
      </header>

      {!isRevealed ? (
        <section className="mn-panel mn-theme-vault py-20 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center border border-[var(--mn-line-strong)] text-[var(--mn-violet)]"><Lock className="h-5 w-5" /></div>
          <h2 className="mt-7 font-['Syne'] text-3xl font-semibold tracking-[-.04em]">Themes have not been released.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-400">The challenge list will appear here when the administrator reveals it. No participant can see the private briefs before then.</p>
          <span className="mn-status mt-7">Waiting for release</span>
        </section>
      ) : (
        <section aria-label="Revealed challenge themes">
          <div className="mn-section-head">
            <div><div className="mn-kicker">Released list</div><h2 className="mn-section-title mt-4">{publicThemes.length} themes available</h2></div>
            <p>Seat limits are set by the event team. Rank every theme in the Bidding page when the bidding window opens.</p>
          </div>
          <div className="mn-theme-grid">
            {publicThemes.map((theme, index) => (
              <article key={theme.id || theme.themeId || index} className="mn-theme-card" data-tilt>
                <div className="flex items-start justify-between gap-4">
                  <span className="mn-theme-card-index">THEME {String(theme.themeNumber || index + 1).padStart(2, '0')}</span>
                  <span className="mn-status is-live">Released</span>
                </div>
                <h3>{theme.publicName || theme.name}</h3>
                <p>{theme.publicDescription || theme.description || 'The full challenge description will be shared by the event team.'}</p>
                {theme.brief && <div className="mt-5 border-l-2 border-[var(--mn-violet)] pl-4 text-xs leading-6 text-zinc-300">{theme.brief}</div>}
                <div className="mn-theme-card-foot"><span>{theme.eligibility || 'All registered teams'}</span><span className="inline-flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" />{theme.seatCapacity || theme.capacity || '—'} seats</span></div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
