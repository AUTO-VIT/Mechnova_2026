import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, Home, Radio, RefreshCw, Save, Sparkles } from 'lucide-react';
import { DEFAULT_HOMEPAGE_CMS, saveCmsPage, subscribeToCmsContent } from '../../services/firestoreService';

const sections = [
  {
    id: 'hero', label: 'Hero', icon: Sparkles,
    description: 'The opening message, actions, benefits, announcement, and two supporting feature cards.',
    fields: [
      ['heroBadge', 'Fallback eyebrow'], ['heroEyebrow', 'Eyebrow'], ['heroTitleLine1', 'Headline line 1'], ['heroTitleLine2', 'Headline line 2'], ['heroTitleAccent', 'Highlighted word'],
      ['heroSubtitle', 'Introduction', true], ['heroPrimaryCtaText', 'Primary button'], ['heroSecondaryCtaText', 'Secondary button'], ['heroBenefit1', 'Benefit 1'], ['heroBenefit2', 'Benefit 2'], ['heroBenefit3', 'Benefit 3'],
      ['heroStatusLabel', 'First feature label'], ['heroStatusValue', 'First feature value'], ['heroMissionLabel', 'Second feature label'], ['heroMissionValue', 'Second feature value'], ['heroCoreText', 'Second feature supporting text'], ['announcementLabel', 'Announcement label'], ['heroAnnouncements', 'Announcement message', true]
    ]
  },
  {
    id: 'status', label: 'Event status', icon: Radio,
    description: 'The real-time event board and the text shown for open and closed phases.',
    fields: [
      ['liveEyebrow', 'Section eyebrow'], ['liveTitle', 'Section title'], ['liveDescription', 'Section description', true], ['liveLinkText', 'Status page link'],
      ['statusRegistrationLabel', 'Registration label'], ['statusRegistrationOpen', 'Registration open'], ['statusRegistrationClosed', 'Registration closed'],
      ['statusQuizLabel', 'Quiz label'], ['statusQuizLive', 'Quiz open'], ['statusQuizStandby', 'Quiz closed'],
      ['statusThemesLabel', 'Themes label'], ['statusThemesSealed', 'Themes hidden'], ['statusThemesSuffix', 'Revealed count suffix'],
      ['statusBiddingLabel', 'Bidding label'], ['statusBiddingOpen', 'Bidding open'], ['statusBiddingClosed', 'Bidding closed']
    ]
  },
  {
    id: 'themes', label: 'Themes', icon: Eye,
    description: 'Headings before and after reveal plus the fallback domain cards. Live theme names are edited in Themes & seats.',
    fields: [
      ['hiddenThemesEyebrow', 'Hidden state eyebrow'], ['hiddenThemesTitle', 'Hidden state title'], ['hiddenThemesDescription', 'Hidden state description', true],
      ['revealedThemesEyebrow', 'Revealed state eyebrow'], ['revealedThemesTitle', 'Revealed state title'], ['revealedThemesDescription', 'Revealed state description', true], ['themeCardLabel', 'Theme card label'], ['themeSeatSuffix', 'Seat suffix'],
      ['domain1Category', 'Domain 1 code'], ['domain1Title', 'Domain 1 title'], ['domain1Desc', 'Domain 1 description', true],
      ['domain2Category', 'Domain 2 code'], ['domain2Title', 'Domain 2 title'], ['domain2Desc', 'Domain 2 description', true],
      ['domain3Category', 'Domain 3 code'], ['domain3Title', 'Domain 3 title'], ['domain3Desc', 'Domain 3 description', true],
      ['domain4Category', 'Domain 4 code'], ['domain4Title', 'Domain 4 title'], ['domain4Desc', 'Domain 4 description', true]
    ]
  },
  {
    id: 'journey', label: 'Process & close', icon: Home,
    description: 'The four event steps, final registration banner, and update timestamp.',
    fields: [
      ['workflowEyebrow', 'Process eyebrow'], ['workflowTitle', 'Process title'], ['workflowDescription', 'Process description', true],
      ['phase1Num', 'Step 1 number'], ['phase1Title', 'Step 1 title'], ['phase1Desc', 'Step 1 description', true],
      ['phase2Num', 'Step 2 number'], ['phase2Title', 'Step 2 title'], ['phase2Desc', 'Step 2 description', true],
      ['phase3Num', 'Step 3 number'], ['phase3Title', 'Step 3 title'], ['phase3Desc', 'Step 3 description', true],
      ['phase4Num', 'Step 4 number'], ['phase4Title', 'Step 4 title'], ['phase4Desc', 'Step 4 description', true],
      ['ctaEyebrow', 'Closing eyebrow'], ['ctaTitle', 'Closing title'], ['ctaDescription', 'Closing description', true], ['ctaButtonText', 'Closing button'], ['timestampLabel', 'Timestamp label']
    ]
  }
];

export function CmsEditor({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [formData, setFormData] = useState(DEFAULT_HOMEPAGE_CMS);
  const [activeSection, setActiveSection] = useState('hero');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => subscribeToCmsContent(eventId, 'homepage', (content) => setFormData({ ...DEFAULT_HOMEPAGE_CMS, ...content })), [eventId]);
  const section = sections.find((item) => item.id === activeSection);
  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await saveCmsPage(eventId, 'homepage', formData);
      setMessage('Homepage content saved. Visitors will receive the updated copy.');
    } catch (error) {
      setMessage(`Could not save homepage content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--mn-line)] pb-6 lg:flex-row lg:items-end">
        <div><span className="mn-kicker">Homepage content</span><h2 className="mt-3 font-['Syne'] text-3xl font-semibold tracking-tight">Edit the public homepage.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mn-muted)]">Every visible block of homepage copy is grouped below. Revealed theme details remain in Themes &amp; seats.</p></div>
        <button type="button" onClick={() => setFormData(DEFAULT_HOMEPAGE_CMS)} className="mn-button mn-button-secondary self-start"><RefreshCw className="h-3.5 w-3.5" />Restore defaults</button>
      </div>
      {message && <div role="status" className={`mn-alert ${message.startsWith('Could not') ? 'mn-alert-error' : 'mn-alert-success'}`}><CheckCircle2 className="h-4 w-4" />{message}</div>}
      <div className="flex flex-wrap border-b border-[var(--mn-line)]">{sections.map((item) => { const Icon = item.icon; const active = item.id === activeSection; return <button key={item.id} type="button" onClick={() => setActiveSection(item.id)} className={`flex min-h-12 items-center gap-2 border-b-2 px-4 text-xs font-medium transition ${active ? 'border-[var(--mn-violet)] text-white' : 'border-transparent text-[var(--mn-muted)] hover:text-white'}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>; })}</div>
      <form onSubmit={save} className="space-y-6">
        <div className="mn-panel rounded-none"><h3 className="font-['Syne'] text-xl font-semibold">{section.label}</h3><p className="mt-1 text-sm leading-6 text-[var(--mn-muted)]">{section.description}</p><div className="mt-7 grid gap-5 md:grid-cols-2">{section.fields.map(([field, label, multiline]) => <label key={field} className={`mn-field ${multiline ? 'md:col-span-2' : ''}`}><span className="mn-label">{label}</span>{multiline ? <textarea rows="3" value={formData[field] || ''} onChange={(event) => updateField(field, event.target.value)} className="mn-textarea" /> : <input type="text" value={formData[field] || ''} onChange={(event) => updateField(field, event.target.value)} className="mn-input" />}</label>)}</div></div>
        <div className="flex justify-end"><button type="submit" disabled={loading} className="mn-button mn-button-accent"><Save className="h-4 w-4" />{loading ? 'Saving…' : 'Save homepage content'}</button></div>
      </form>
    </div>
  );
}
