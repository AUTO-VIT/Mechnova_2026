import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, Home, Radio, RefreshCw, Save, Sparkles } from 'lucide-react';
import { DEFAULT_HOMEPAGE_CMS, saveCmsPage, subscribeToCmsContent } from '../../services/firestoreService';

const sections = [
  {
    id: 'hero', label: 'Hero', icon: Sparkles,
    description: 'Everything in the opening hero: headline, buttons, badges, and orbit callouts.',
    fields: [
      ['heroBadge', 'Top badge'], ['heroEyebrow', 'Eyebrow'], ['heroTitleLine1', 'Headline line 1'], ['heroTitleLine2', 'Headline line 2'], ['heroTitleAccent', 'Headline accent word'],
      ['heroSubtitle', 'Hero description', true], ['heroPrimaryCtaText', 'Primary button'], ['heroSecondaryCtaText', 'Secondary button'], ['heroBenefit1', 'Benefit 1'], ['heroBenefit2', 'Benefit 2'], ['heroBenefit3', 'Benefit 3'],
      ['heroCoreText', 'Orbit centre text'], ['heroStatusLabel', 'Orbit status label'], ['heroStatusValue', 'Orbit status value'], ['heroMissionLabel', 'Orbit mission label'], ['heroMissionValue', 'Orbit mission value'], ['announcementLabel', 'Announcement label'], ['heroAnnouncements', 'Announcement message', true]
    ]
  },
  {
    id: 'live', label: 'Live panel', icon: Radio,
    description: 'The live event signal panel and all of its status labels.',
    fields: [
      ['liveEyebrow', 'Panel eyebrow'], ['liveTitle', 'Panel title'], ['liveDescription', 'Panel description', true], ['liveLinkText', 'Panel link'],
      ['statusRegistrationLabel', 'Registration label'], ['statusRegistrationOpen', 'Registration open value'], ['statusRegistrationClosed', 'Registration closed value'],
      ['statusQuizLabel', 'Quiz label'], ['statusQuizLive', 'Quiz live value'], ['statusQuizStandby', 'Quiz standby value'],
      ['statusThemesLabel', 'Theme reveal label'], ['statusThemesSealed', 'Theme sealed value'], ['statusThemesSuffix', 'Theme count suffix'],
      ['statusBiddingLabel', 'Bidding label'], ['statusBiddingOpen', 'Bidding open value'], ['statusBiddingClosed', 'Bidding closed value']
    ]
  },
  {
    id: 'themes', label: 'Themes area', icon: Eye,
    description: 'Headings shown before/after reveal and the four fallback domain cards. Actual revealed-theme names are edited in Theme Control.',
    fields: [
      ['hiddenThemesEyebrow', 'Hidden themes eyebrow'], ['hiddenThemesTitle', 'Hidden themes title'], ['hiddenThemesDescription', 'Hidden themes description', true],
      ['revealedThemesEyebrow', 'Revealed themes eyebrow'], ['revealedThemesTitle', 'Revealed themes title'], ['revealedThemesDescription', 'Revealed themes description', true], ['themeCardLabel', 'Theme card label'], ['themeSeatSuffix', 'Theme seat suffix'],
      ['domain1Category', 'Domain 1 code'], ['domain1Title', 'Domain 1 title'], ['domain1Desc', 'Domain 1 description', true],
      ['domain2Category', 'Domain 2 code'], ['domain2Title', 'Domain 2 title'], ['domain2Desc', 'Domain 2 description', true],
      ['domain3Category', 'Domain 3 code'], ['domain3Title', 'Domain 3 title'], ['domain3Desc', 'Domain 3 description', true],
      ['domain4Category', 'Domain 4 code'], ['domain4Title', 'Domain 4 title'], ['domain4Desc', 'Domain 4 description', true]
    ]
  },
  {
    id: 'journey', label: 'Journey & CTA', icon: Home,
    description: 'The workflow steps, final banner, and timestamp label.',
    fields: [
      ['workflowEyebrow', 'Workflow eyebrow'], ['workflowTitle', 'Workflow title'], ['workflowDescription', 'Workflow description', true],
      ['phase1Num', 'Step 1 number'], ['phase1Title', 'Step 1 title'], ['phase1Desc', 'Step 1 description', true],
      ['phase2Num', 'Step 2 number'], ['phase2Title', 'Step 2 title'], ['phase2Desc', 'Step 2 description', true],
      ['phase3Num', 'Step 3 number'], ['phase3Title', 'Step 3 title'], ['phase3Desc', 'Step 3 description', true],
      ['phase4Num', 'Step 4 number'], ['phase4Title', 'Step 4 title'], ['phase4Desc', 'Step 4 description', true],
      ['ctaEyebrow', 'Closing banner eyebrow'], ['ctaTitle', 'Closing banner title'], ['ctaDescription', 'Closing banner description', true], ['ctaButtonText', 'Closing banner button'], ['timestampLabel', 'Timestamp label']
    ]
  }
];

export function CmsEditor({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [formData, setFormData] = useState(DEFAULT_HOMEPAGE_CMS);
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    return subscribeToCmsContent(eventId, 'homepage', (content) => {
      setFormData({ ...DEFAULT_HOMEPAGE_CMS, ...content });
    });
  }, [eventId]);

  const section = sections.find((item) => item.id === activeSection);
  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await saveCmsPage(eventId, 'homepage', formData);
      setMessage('Homepage copy published to Firestore. Every visitor now receives the same content.');
    } catch (error) {
      setMessage(`Could not publish CMS content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-[#855AB4]/20 pb-5 lg:flex-row lg:items-end">
        <div><span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#B26FCB]">Homepage CMS</span><h2 className="mt-2 font-sans text-2xl font-semibold text-white">Edit every word on the homepage.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">This editor maps directly to the redesigned homepage. Revealed theme names and briefs are managed separately in Theme Control.</p></div>
        <button type="button" onClick={() => setFormData(DEFAULT_HOMEPAGE_CMS)} className="inline-flex items-center gap-2 self-start rounded-full border border-[#855AB4]/30 bg-[#221545]/50 px-4 py-2 font-mono text-xs text-zinc-300 transition hover:border-[#B26FCB] hover:text-white"><RefreshCw className="h-3.5 w-3.5" /> Restore defaults</button>
      </div>

      {message && <div role="status" className={`flex items-center gap-2 rounded-2xl border p-4 font-mono text-xs ${message.startsWith('Could not') ? 'border-orange-500/40 bg-orange-500/10 text-orange-200' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'}`}><CheckCircle2 className="h-4 w-4" />{message}</div>}

      <div className="flex flex-wrap gap-2 border-b border-[#855AB4]/20 pb-4">
        {sections.map((item) => { const Icon = item.icon; const active = item.id === activeSection; return <button key={item.id} type="button" onClick={() => setActiveSection(item.id)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition ${active ? 'border border-[#B26FCB]/50 bg-[#68388D] text-white shadow-[0_0_18px_rgba(178,111,203,.3)]' : 'text-zinc-400 hover:bg-[#221545]/60 hover:text-white'}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>; })}
      </div>

      <form onSubmit={save} className="space-y-6">
        <div className="rounded-3xl border border-[#855AB4]/30 bg-[#221545]/45 p-5 sm:p-7">
          <h3 className="font-sans text-xl font-semibold text-white">{section.label}</h3><p className="mt-1 text-sm leading-6 text-zinc-400">{section.description}</p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.fields.map(([field, label, multiline]) => <label key={field} className={`block space-y-1.5 ${multiline ? 'md:col-span-2' : ''}`}><span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>{multiline ? <textarea rows="3" value={formData[field] || ''} onChange={(event) => updateField(field, event.target.value)} className="w-full resize-y rounded-xl border border-[#855AB4]/35 bg-[#110515]/80 p-3 text-sm text-white outline-none transition focus:border-[#B26FCB]" /> : <input type="text" value={formData[field] || ''} onChange={(event) => updateField(field, event.target.value)} className="w-full rounded-xl border border-[#855AB4]/35 bg-[#110515]/80 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#B26FCB]" />}</label>)}
          </div>
        </div>
        <div className="flex justify-end"><button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#e8c5f6]/45 bg-[#68388D] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[.15em] text-white shadow-[0_0_25px_rgba(178,111,203,.3)] transition hover:bg-[#855AB4] disabled:cursor-not-allowed disabled:bg-zinc-800"><Save className="h-4 w-4" />{loading ? 'Publishing…' : 'Publish homepage copy'}</button></div>
      </form>
    </div>
  );
}
