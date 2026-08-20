import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, ArrowUpRight, ChevronRight, Cpu, Radio, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { DEFAULT_HOMEPAGE_CMS, subscribeToCmsContent } from '../../services/firestoreService';
import { formatTimestamp } from '../../utils/formatters';

export function HomePage() {
  const { eventData, publicThemes, serverOffsetMs, eventId } = useEvent();
  const [cms, setCms] = useState(DEFAULT_HOMEPAGE_CMS);

  useEffect(() => subscribeToCmsContent(eventId || 'default-event', 'homepage', setCms), [eventId]);

  const domains = [
    [cms.domain1Category, cms.domain1Title, cms.domain1Desc],
    [cms.domain2Category, cms.domain2Title, cms.domain2Desc],
    [cms.domain3Category, cms.domain3Title, cms.domain3Desc],
    [cms.domain4Category, cms.domain4Title, cms.domain4Desc]
  ];
  const phases = [
    [cms.phase1Num, cms.phase1Title, cms.phase1Desc],
    [cms.phase2Num, cms.phase2Title, cms.phase2Desc],
    [cms.phase3Num, cms.phase3Title, cms.phase3Desc],
    [cms.phase4Num, cms.phase4Title, cms.phase4Desc]
  ];
  const statuses = [
    [cms.statusRegistrationLabel, eventData?.registrationOpen !== false ? cms.statusRegistrationOpen : cms.statusRegistrationClosed, eventData?.registrationOpen !== false],
    [cms.statusQuizLabel, eventData?.quizOpen ? cms.statusQuizLive : cms.statusQuizStandby, eventData?.quizOpen],
    [cms.statusThemesLabel, eventData?.themesRevealed ? `${publicThemes.length} ${cms.statusThemesSuffix}` : cms.statusThemesSealed, eventData?.themesRevealed],
    [cms.statusBiddingLabel, eventData?.biddingOpen ? cms.statusBiddingOpen : cms.statusBiddingClosed, eventData?.biddingOpen]
  ];
  const hasThemes = publicThemes.length > 0;
  const cards = hasThemes
    ? publicThemes.map((theme, index) => ({
        key: theme.id || theme.themeId || index,
        code: `${cms.themeCardLabel} ${String(theme.themeNumber || index + 1).padStart(2, '0')}`,
        title: theme.publicName || theme.name,
        description: theme.publicDescription || theme.description || '',
        footer: `${theme.seatCapacity || theme.capacity || '—'} ${cms.themeSeatSuffix}`,
        link: true
      }))
    : domains.map(([code, title, description], index) => ({ key: `${code}-${index}`, code, title, description, footer: 'Brief held until reveal', link: false }));

  return (
    <div className="mn-page home-stage">
      <div>
        {cms.heroAnnouncements && (
          <div className="mn-announcement" role="status">
            <span className="mn-announcement-label">{cms.announcementLabel}</span>
            <p>{cms.heroAnnouncements}</p>
            <ArrowUpRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          </div>
        )}

        <section className="mn-hero" aria-labelledby="home-title">
          <div className="mn-hero-copy">
            <div className="mn-kicker">{cms.heroEyebrow || cms.heroBadge}</div>
            <h1 id="home-title" className="mn-display mt-5">
              {cms.heroTitleLine1}<br />{cms.heroTitleLine2} <span className="text-[var(--mn-violet)]">{cms.heroTitleAccent}</span>
            </h1>
            <p className="mn-lede mt-7">{cms.heroSubtitle}</p>
            <div className="mn-hero-actions">
              <Link to="/register" className="mn-button mn-button-primary">{cms.heroPrimaryCtaText}<ArrowRight className="h-4 w-4" /></Link>
              <Link to="/themes" className="mn-button mn-button-secondary">{cms.heroSecondaryCtaText}</Link>
            </div>
            <div className="mn-hero-benefits">
              {[cms.heroBenefit1, cms.heroBenefit2, cms.heroBenefit3].filter(Boolean).map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="mn-hero-board" aria-label="MechNova interactive event overview">
            <div className="mn-orbit-stage" aria-hidden="true">
              <span className="mn-orbit-halo" />
              <span className="mn-orbit-ring" />
              <span className="mn-orbit-ring mn-orbit-ring-two" />
              <span className="mn-orbit-ring mn-orbit-ring-three" />
              <div className="mn-orbit-core"><strong>MN</strong><small>MECHNOVA 26</small></div>
            </div>
            <div className="mn-hero-float mn-hero-float-one">
              <div className="flex items-center gap-2 text-[var(--mn-green)]"><Radio className="h-3.5 w-3.5 animate-pulse" /><span className="mn-hero-card-label">{cms.heroStatusLabel}</span></div>
              <strong>{cms.heroStatusValue}</strong>
              <div className="mn-hero-bars" aria-hidden="true"><span /><span /><span /><span /></div>
            </div>
            <div className="mn-hero-float mn-hero-float-two">
              <div className="flex items-center gap-2 text-[var(--mn-violet)]"><Cpu className="h-3.5 w-3.5" /><span className="mn-hero-card-label">{cms.heroMissionLabel}</span></div>
              <strong>{cms.heroMissionValue}</strong>
            </div>
            <div className="mn-hero-float mn-hero-float-three">
              <div className="flex items-center gap-2 text-[var(--mn-pink)]"><Activity className="h-3.5 w-3.5" /><span className="mn-hero-card-label">Allocation flow</span></div>
              <p>{cms.heroCoreText}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mn-status-board" aria-labelledby="event-status-title">
        <div className="mn-status-intro">
          <div className="mn-kicker">{cms.liveEyebrow}</div>
          <h2 id="event-status-title" className="mt-4 font-['Syne'] text-2xl font-semibold tracking-[-.035em]">{cms.liveTitle}</h2>
          <p className="mn-copy mt-3">{cms.liveDescription}</p>
          <Link to="/status" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--mn-violet)]">{cms.liveLinkText}<ArrowRight className="h-4 w-4" /></Link>
        </div>
        {statuses.map(([label, value, active]) => (
          <div key={label} className={`mn-status-cell ${active ? 'is-active' : ''}`}>
            <i aria-hidden="true" />
            <div><label>{label}</label><strong className="mt-2 block">{value}</strong></div>
          </div>
        ))}
      </section>

      <section aria-labelledby="themes-heading">
        <div className="mn-section-head">
          <div>
            <div className="mn-kicker">{hasThemes ? cms.revealedThemesEyebrow : cms.hiddenThemesEyebrow}</div>
            <h2 id="themes-heading" className="mn-section-title mt-4 whitespace-pre-line">{hasThemes ? cms.revealedThemesTitle : cms.hiddenThemesTitle}</h2>
          </div>
          <p>{hasThemes ? cms.revealedThemesDescription : cms.hiddenThemesDescription}</p>
        </div>
        <div className="mn-theme-grid mn-home-theme-grid">
          {cards.map((card) => {
            const content = <><div className="flex items-center justify-between"><span className="mn-theme-card-index">{card.code}</span><Sparkles className="h-4 w-4 text-[var(--mn-violet)] opacity-60" /></div><h3>{card.title}</h3>{card.description && <p>{card.description}</p>}<div className="mn-theme-card-foot"><span>{card.footer}</span><ArrowUpRight className="h-4 w-4" /></div></>;
            return card.link ? <Link key={card.key} to="/themes" className="mn-theme-card mn-home-theme-card" data-tilt>{content}</Link> : <article key={card.key} className="mn-theme-card mn-home-theme-card" data-tilt>{content}</article>;
          })}
        </div>
      </section>

      <section className="mn-process" aria-labelledby="process-heading">
        <div className="mn-process-copy">
          <div className="mn-kicker">{cms.workflowEyebrow}</div>
          <h2 id="process-heading" className="mn-section-title mt-4 whitespace-pre-line">{cms.workflowTitle}</h2>
          <p className="mn-copy mt-6 max-w-md">{cms.workflowDescription}</p>
        </div>
        <ol className="mn-process-list">
          {phases.map(([number, title, description]) => (
            <li key={number} className="mn-process-item">
              <span>{number}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      <section className="mn-cta" aria-labelledby="cta-heading">
        <div>
          <div className="mn-kicker">{cms.ctaEyebrow}</div>
          <h2 id="cta-heading" className="mn-section-title mt-5">{cms.ctaTitle}</h2>
          <p>{cms.ctaDescription}</p>
          <Link to="/register" className="mn-button">{cms.ctaButtonText}<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <p className="text-center font-mono text-[9px] uppercase tracking-[.12em] text-zinc-600">{cms.timestampLabel} · {formatTimestamp(Date.now() + serverOffsetMs)}</p>
    </div>
  );
}
