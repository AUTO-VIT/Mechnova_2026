import React from 'react';
import { useEvent } from '../../context/EventContext';
import { formatTimestamp } from '../../utils/formatters';

export function EventStatus() {
  const { eventData, serverOffsetMs } = useEvent();
  const phases = [
    ['01', 'Team registration', eventData?.registrationOpen !== false, eventData?.registrationOpen === false, 'Teams submit their roster and receive portal credentials.'],
    ['02', 'Quiz', eventData?.quizOpen === true, eventData?.quizOpen === false && eventData?.themesRevealed, 'Teams complete the timed quiz and earn their allocation score.'],
    ['03', 'Theme release', eventData?.themesRevealed === true, eventData?.themesRevealed === true, 'Challenge briefs and seat limits become visible to participants.'],
    ['04', 'Preference submission', eventData?.biddingOpen === true, eventData?.allocationFinalized === true, 'Teams rank every released theme in preference order.'],
    ['05', 'Allocation results', eventData?.resultsRevealed === true, eventData?.resultsRevealed === true, 'Final assignments are published after seat allocation is complete.']
  ];

  return (
    <div className="mn-page">
      <header className="mn-page-head">
        <div className="mn-kicker">Live event status</div>
        <h1 className="mn-title">Know what is open, closed, and coming next.</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="mn-status is-live"><span className="mn-live-dot" />Live updates</span>
          <span className="font-mono text-[9px] uppercase tracking-[.1em] text-zinc-500">Updated {formatTimestamp(Date.now() + serverOffsetMs)}</span>
        </div>
      </header>

      <section aria-label="Event phases" className="mn-phase-track">
        {phases.map(([number, name, active, complete, description]) => {
          const state = complete ? 'Complete' : active ? 'Open now' : 'Not open';
          return (
            <article key={number} className={`mn-phase-card ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''}`}>
              <span className="mn-phase-number">{number}</span>
              <div><h2 className="font-['Syne'] text-2xl font-semibold tracking-[-.03em]">{name}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p></div>
              <span className={`mn-status ${active ? 'is-live' : ''}`}>{state}</span>
            </article>
          );
        })}
      </section>

      <section className="mn-grid mn-grid-3" aria-label="Platform notes">
        <div className="mn-panel"><span className="mn-label">Time sync</span><strong className="mt-4 block font-['Syne'] text-3xl font-semibold">{serverOffsetMs} ms</strong><p className="mn-copy mt-2">Current browser-to-event clock offset.</p></div>
        <div className="mn-panel"><span className="mn-label">Private themes</span><strong className="mt-4 block font-['Syne'] text-3xl font-semibold">Protected</strong><p className="mn-copy mt-2">Unreleased theme documents remain admin-only.</p></div>
        <div className="mn-panel"><span className="mn-label">Updates</span><strong className="mt-4 block font-['Syne'] text-3xl font-semibold">Automatic</strong><p className="mn-copy mt-2">This page refreshes as event controls change.</p></div>
      </section>
    </div>
  );
}
