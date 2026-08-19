import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Check, ChevronRight, CircleDot, Cpu, Eye, Gauge, Megaphone, Orbit, Radio, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { DEFAULT_HOMEPAGE_CMS, subscribeToCmsContent } from '../../services/firestoreService';
import { formatTimestamp } from '../../utils/formatters';

const domainIcons = [Cpu, BrainCircuit, Gauge, Orbit];

export function HomePage() {
  const { eventData, publicThemes, serverOffsetMs, eventId } = useEvent();
  const [cms, setCms] = useState(DEFAULT_HOMEPAGE_CMS);
  const currentNow = Date.now() + serverOffsetMs;

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
  const statusRows = [
    [cms.statusRegistrationLabel, eventData?.registrationOpen !== false ? cms.statusRegistrationOpen : cms.statusRegistrationClosed, eventData?.registrationOpen !== false],
    [cms.statusQuizLabel, eventData?.quizOpen ? cms.statusQuizLive : cms.statusQuizStandby, eventData?.quizOpen],
    [cms.statusThemesLabel, eventData?.themesRevealed ? `${publicThemes.length} ${cms.statusThemesSuffix}` : cms.statusThemesSealed, eventData?.themesRevealed],
    [cms.statusBiddingLabel, eventData?.biddingOpen ? cms.statusBiddingOpen : cms.statusBiddingClosed, eventData?.biddingOpen]
  ];
  const hasRevealedThemes = publicThemes.length > 0;

  return (
    <div className="home-stage space-y-24 pb-8 sm:space-y-32">
      {cms.heroAnnouncements && <div className="home-bulletin animate-rise flex items-center gap-3 rounded-2xl border px-4 py-3.5 sm:px-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#e4b8f4]"><Megaphone className="h-4 w-4" /></span><p className="font-mono text-xs leading-relaxed text-zinc-200"><span className="mr-2 font-bold uppercase tracking-widest text-[#e4b8f4]">{cms.announcementLabel}</span>{cms.heroAnnouncements}</p></div>}

      <section className="relative grid min-h-[650px] items-center gap-12 lg:grid-cols-[1.04fr_.96fr] lg:gap-8">
        <div className="relative z-10 max-w-3xl animate-rise">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9a7ed]/25 bg-white/[0.06] px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#e8c5f6] backdrop-blur-xl"><span className="h-1.5 w-1.5 rounded-full bg-[#e4b8f4] shadow-[0_0_14px_#e4b8f4]" />{cms.heroBadge}</div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-[#aa7ccf]">{cms.heroEyebrow}</p>
          <h1 className="text-balance font-sans text-[3.25rem] font-semibold leading-[0.95] tracking-[-0.055em] text-white sm:text-7xl lg:text-[5.6rem] xl:text-[6.7rem]">{cms.heroTitleLine1}<br />{cms.heroTitleLine2} <span className="text-gradient-orbit">{cms.heroTitleAccent}</span></h1>
          <p className="mt-7 max-w-xl text-base font-light leading-8 text-zinc-300 sm:text-lg">{cms.heroSubtitle}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"><Link to="/register" className="button-orbit group">{cms.heroPrimaryCtaText} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link><Link to="/themes" className="button-ghost-orbit">{cms.heroSecondaryCtaText} <ChevronRight className="h-4 w-4" /></Link></div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4 text-xs text-zinc-400">{[cms.heroBenefit1, cms.heroBenefit2, cms.heroBenefit3].map((item) => <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#d9a7ed]" />{item}</span>)}</div>
        </div>
        <div className="relative mx-auto flex w-full max-w-xl items-center justify-center lg:min-h-[590px]"><div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" /><div className="hero-orbit hero-orbit-three" /><div className="hero-core animate-float"><div className="hero-core-inner"><Sparkles className="h-10 w-10 text-[#f3dcfd]" /><span>{cms.heroCoreText}</span></div></div><div className="hero-float-card hero-float-top animate-float-delay"><Radio className="h-4 w-4 text-[#e4b8f4]" /><div><span>{cms.heroStatusLabel}</span><strong>{cms.heroStatusValue}</strong></div></div><div className="hero-float-card hero-float-bottom animate-float"><Trophy className="h-4 w-4 text-[#e4b8f4]" /><div><span>{cms.heroMissionLabel}</span><strong>{cms.heroMissionValue}</strong></div></div></div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[#160a22]/75 p-5 shadow-[0_25px_80px_rgba(0,0,0,.25)] backdrop-blur-xl sm:p-7 lg:p-8"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9a7ed]/70 to-transparent" /><div className="grid gap-7 lg:grid-cols-[.82fr_1.18fr] lg:items-center"><div className="border-b border-white/[0.09] pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9a7ed]">{cms.liveEyebrow}</p><h2 className="mt-3 text-balance font-sans text-3xl font-semibold tracking-tight text-white">{cms.liveTitle}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">{cms.liveDescription}</p><Link to="/status" className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#e8c5f6] hover:text-white">{cms.liveLinkText} <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{statusRows.map(([label, value, active]) => <div key={label} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><CircleDot className={`h-3 w-3 ${active ? 'text-emerald-300' : 'text-zinc-600'}`} />{label}</span><strong className={`mt-3 block text-sm ${active ? 'text-white' : 'text-zinc-400'}`}>{value}</strong></div>)}</div></div></section>

      <section><div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9a7ed]">{hasRevealedThemes ? cms.revealedThemesEyebrow : cms.hiddenThemesEyebrow}</p><h2 className="mt-3 text-balance whitespace-pre-line font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">{hasRevealedThemes ? cms.revealedThemesTitle : cms.hiddenThemesTitle}</h2></div><p className="max-w-xs text-sm leading-6 text-zinc-400">{hasRevealedThemes ? cms.revealedThemesDescription : cms.hiddenThemesDescription}</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{hasRevealedThemes ? publicThemes.map((theme, index) => { const Icon = domainIcons[index % domainIcons.length]; const seats = theme.seatCapacity || theme.capacity || '—'; return <Link key={theme.id || theme.themeId || index} to="/themes" className="domain-card group"><div className="flex items-center justify-between"><span>{cms.themeCardLabel} {String(theme.themeNumber || index + 1).padStart(2, '0')}</span><Icon className="h-5 w-5 text-[#c895dc] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" /></div><h3>{theme.publicName || theme.name}</h3><p>{theme.publicDescription || theme.description || ''}</p><div className="absolute bottom-5 right-5 font-mono text-[10px] uppercase tracking-wider text-[#d9a7ed]">{seats} {cms.themeSeatSuffix}</div><div className="domain-card-arrow"><ArrowRight className="h-4 w-4" /></div></Link>; }) : domains.map(([code, title, description], index) => { const Icon = domainIcons[index]; return <article key={code} className="domain-card group"><div className="flex items-center justify-between"><span>{code}</span><Icon className="h-5 w-5 text-[#c895dc] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" /></div><h3>{title}</h3><p>{description}</p><div className="domain-card-arrow"><ArrowRight className="h-4 w-4" /></div></article>; })}</div></section>

      <section className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div className="lg:sticky lg:top-32"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9a7ed]">{cms.workflowEyebrow}</p><h2 className="mt-3 text-balance whitespace-pre-line font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl">{cms.workflowTitle}</h2><p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">{cms.workflowDescription}</p></div><ol className="space-y-3">{phases.map(([number, title, description]) => <li key={number} className="phase-row"><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><ChevronRight className="ml-auto h-5 w-5 text-[#b57ed2]" /></li>)}</ol></section>

      <section className="cta-orbit relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16"><div className="relative z-10 max-w-2xl"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f0cdfd]">{cms.ctaEyebrow}</p><h2 className="mt-4 text-balance font-sans text-4xl font-semibold tracking-[-.035em] text-white sm:text-6xl">{cms.ctaTitle}</h2><p className="mt-5 max-w-xl text-base leading-7 text-purple-100/75">{cms.ctaDescription}</p><Link to="/register" className="button-light-orbit mt-8">{cms.ctaButtonText} <ArrowRight className="h-4 w-4" /></Link></div><ShieldCheck className="absolute -bottom-14 -right-8 h-72 w-72 rotate-[-15deg] text-white/[0.08] sm:-right-2" /></section>
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">{cms.timestampLabel} · {formatTimestamp(currentNow)}</p>
    </div>
  );
}
