import React, { useState, useEffect } from 'react';
import { subscribeToCmsContent, saveCmsPage, DEFAULT_HOMEPAGE_CMS } from '../../services/firestoreService';
import { CheckCircle2, Save, Sparkles, Sliders, Layout, Compass, Shield, Terminal, RefreshCw } from 'lucide-react';

export function CmsEditor({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [formData, setFormData] = useState(DEFAULT_HOMEPAGE_CMS);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [activeSection, setActiveSection] = useState('navbar');

  useEffect(() => {
    const unsub = subscribeToCmsContent(eventId, 'homepage', (content) => {
      if (content) {
        setFormData(prev => ({ ...prev, ...content }));
      }
    });
    return () => unsub();
  }, [eventId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset all homepage & navbar CMS content to default values?")) {
      setFormData(DEFAULT_HOMEPAGE_CMS);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await saveCmsPage(eventId, 'homepage', formData);
      setMsg('All CMS changes published and synchronized across the entire site.');
      setTimeout(() => setMsg(''), 3500);
    } catch (err) {
      console.error(err);
      setMsg(`Error publishing CMS: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'navbar', label: '1. Navbar & Header', icon: Layout },
    { id: 'hero', label: '2. Hero & Announcement', icon: Sparkles },
    { id: 'radar', label: '3. Mission Radar Stats', icon: Compass },
    { id: 'domains', label: '4. Challenge Domains (4)', icon: Sliders },
    { id: 'timeline', label: '5. Phase Sequence (4)', icon: Shield },
    { id: 'footer', label: '6. Footer & Meta', icon: Terminal }
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#855AB4]/20">
        <div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Full Site CMS Content Editor
          </h2>
          <p className="text-zinc-400 text-xs font-light mt-0.5">
            Modify any text, badges, titles, navigation items, stats, domains, and timeline phases in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="font-mono text-xs text-zinc-400 hover:text-white border border-[#855AB4]/30 bg-[#221545]/40 hover:bg-[#221545]/80 px-4 py-2 rounded-full transition-all active:scale-95 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>RESET TO DEFAULTS</span>
        </button>
      </div>

      {msg && (
        <div className="border border-emerald-500/40 bg-emerald-500/15 p-4 rounded-2xl font-mono text-xs text-emerald-300 flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{msg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#855AB4]/20 pb-4">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'bg-[#68388D] text-white font-bold border border-[#B26FCB]/50 shadow-[0_0_15px_rgba(178,111,203,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-[#221545]/50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: NAVBAR */}
        {activeSection === 'navbar' && (
          <div className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/50 backdrop-blur-xl space-y-6">
            <h3 className="font-display text-lg font-bold text-white border-b border-[#855AB4]/20 pb-3">
              Navbar &amp; Top Brand Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Brand Title (Left Logo Text)
                </label>
                <input
                  type="text"
                  value={formData.brandTitle || ''}
                  onChange={(e) => handleChange('brandTitle', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Brand Subtitle / Tag
                </label>
                <input
                  type="text"
                  value={formData.brandSubtitle || ''}
                  onChange={(e) => handleChange('brandSubtitle', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Navbar Status Badge Text
                </label>
                <input
                  type="text"
                  value={formData.navStatusBadge || ''}
                  onChange={(e) => handleChange('navStatusBadge', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Navbar CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.navCtaText || ''}
                  onChange={(e) => handleChange('navCtaText', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Nav Link 1 Label
                </label>
                <input
                  type="text"
                  value={formData.navLink1Text || ''}
                  onChange={(e) => handleChange('navLink1Text', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Nav Link 2 Label
                </label>
                <input
                  type="text"
                  value={formData.navLink2Text || ''}
                  onChange={(e) => handleChange('navLink2Text', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Nav Link 3 Label
                </label>
                <input
                  type="text"
                  value={formData.navLink3Text || ''}
                  onChange={(e) => handleChange('navLink3Text', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: HERO & ANNOUNCEMENT */}
        {activeSection === 'hero' && (
          <div className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/50 backdrop-blur-xl space-y-6">
            <h3 className="font-display text-lg font-bold text-white border-b border-[#855AB4]/20 pb-3">
              Hero Section &amp; Announcements
            </h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Hero Badge / Pre-title
                </label>
                <input
                  type="text"
                  value={formData.heroBadge || ''}
                  onChange={(e) => handleChange('heroBadge', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                    Hero Main Headline (Line 1)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitleLine1 || ''}
                    onChange={(e) => handleChange('heroTitleLine1', e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                    Hero Main Headline (Line 2 / Accent)
                  </label>
                  <input
                    type="text"
                    value={formData.heroTitleLine2 || ''}
                    onChange={(e) => handleChange('heroTitleLine2', e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Hero Subtitle Paragraph
                </label>
                <textarea
                  rows="3"
                  value={formData.heroSubtitle || ''}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl p-3 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Live Event Announcements Banner
                </label>
                <textarea
                  rows="2"
                  value={formData.heroAnnouncements || ''}
                  onChange={(e) => handleChange('heroAnnouncements', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl p-3 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroPrimaryCtaText || ''}
                    onChange={(e) => handleChange('heroPrimaryCtaText', e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                    Secondary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.heroSecondaryCtaText || ''}
                    onChange={(e) => handleChange('heroSecondaryCtaText', e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: MISSION RADAR STATS */}
        {activeSection === 'radar' && (
          <div className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/50 backdrop-blur-xl space-y-6">
            <h3 className="font-display text-lg font-bold text-white border-b border-[#855AB4]/20 pb-3">
              Mission Radar HUD Metrics (4 Stats)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-[#855AB4]/30 rounded-2xl bg-[#110515]/60 space-y-3">
                <div className="font-mono text-xs text-[#B26FCB] uppercase font-bold">Metric 01</div>
                <input
                  type="text"
                  placeholder="Value (e.g. 48H)"
                  value={formData.stat1Value || ''}
                  onChange={(e) => handleChange('stat1Value', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-lg text-white font-bold focus:outline-none focus:border-[#B26FCB]"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. MISSION RUNTIME)"
                  value={formData.stat1Label || ''}
                  onChange={(e) => handleChange('stat1Label', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-zinc-300 focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="p-4 border border-[#855AB4]/30 rounded-2xl bg-[#110515]/60 space-y-3">
                <div className="font-mono text-xs text-[#B26FCB] uppercase font-bold">Metric 02</div>
                <input
                  type="text"
                  placeholder="Value (e.g. 04)"
                  value={formData.stat2Value || ''}
                  onChange={(e) => handleChange('stat2Value', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-lg text-white font-bold focus:outline-none focus:border-[#B26FCB]"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. CHALLENGE DOMAINS)"
                  value={formData.stat2Label || ''}
                  onChange={(e) => handleChange('stat2Label', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-zinc-300 focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="p-4 border border-[#855AB4]/30 rounded-2xl bg-[#110515]/60 space-y-3">
                <div className="font-mono text-xs text-[#B26FCB] uppercase font-bold">Metric 03</div>
                <input
                  type="text"
                  placeholder="Value (e.g. 100%)"
                  value={formData.stat3Value || ''}
                  onChange={(e) => handleChange('stat3Value', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-lg text-white font-bold focus:outline-none focus:border-[#B26FCB]"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. SERVER DETERMINISTIC)"
                  value={formData.stat3Label || ''}
                  onChange={(e) => handleChange('stat3Label', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-zinc-300 focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="p-4 border border-[#855AB4]/30 rounded-2xl bg-[#110515]/60 space-y-3">
                <div className="font-mono text-xs text-[#B26FCB] uppercase font-bold">Metric 04</div>
                <input
                  type="text"
                  placeholder="Value (e.g. NTP)"
                  value={formData.stat4Value || ''}
                  onChange={(e) => handleChange('stat4Value', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-lg text-white font-bold focus:outline-none focus:border-[#B26FCB]"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. TIME SYNCHRONIZED)"
                  value={formData.stat4Label || ''}
                  onChange={(e) => handleChange('stat4Label', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-zinc-300 focus:outline-none focus:border-[#B26FCB]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: CHALLENGE DOMAINS */}
        {activeSection === 'domains' && (
          <div className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/50 backdrop-blur-xl space-y-6">
            <h3 className="font-display text-lg font-bold text-white border-b border-[#855AB4]/20 pb-3">
              Challenge Domains Matrix (4 Cards)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="p-5 border border-[#855AB4]/30 rounded-2xl bg-[#110515]/60 space-y-3">
                  <div className="font-mono text-xs text-[#B26FCB] uppercase font-bold flex justify-between">
                    <span>Domain 0{num}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Category Tag (e.g. KINEMATICS // SLAM)"
                    value={formData[`domain${num}Category`] || ''}
                    onChange={(e) => handleChange(`domain${num}Category`, e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-zinc-400 focus:outline-none focus:border-[#B26FCB]"
                  />
                  <input
                    type="text"
                    placeholder="Domain Title"
                    value={formData[`domain${num}Title`] || ''}
                    onChange={(e) => handleChange(`domain${num}Title`, e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-display text-sm text-white font-bold focus:outline-none focus:border-[#B26FCB]"
                  />
                  <textarea
                    rows="2"
                    placeholder="Domain Description"
                    value={formData[`domain${num}Desc`] || ''}
                    onChange={(e) => handleChange(`domain${num}Desc`, e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl p-2.5 font-sans text-xs text-zinc-300 focus:outline-none focus:border-[#B26FCB]"
                  />
                  <input
                    type="text"
                    placeholder="Metric / Stat Badge"
                    value={formData[`domain${num}Stat`] || ''}
                    onChange={(e) => handleChange(`domain${num}Stat`, e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-[#B26FCB] font-bold focus:outline-none focus:border-[#B26FCB]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: TIMELINE PHASES */}
        {activeSection === 'timeline' && (
          <div className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/50 backdrop-blur-xl space-y-6">
            <h3 className="font-display text-lg font-bold text-white border-b border-[#855AB4]/20 pb-3">
              4-Phase Sequence Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="p-5 border border-[#855AB4]/30 rounded-2xl bg-[#110515]/60 space-y-3">
                  <div className="font-mono text-xs text-[#B26FCB] uppercase font-bold">
                    Phase {formData[`phase${num}Num`] || `0${num}`}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Phase Num (e.g. 01)"
                      value={formData[`phase${num}Num`] || ''}
                      onChange={(e) => handleChange(`phase${num}Num`, e.target.value)}
                      className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-[#B26FCB]"
                    />
                    <input
                      type="text"
                      placeholder="Phase Badge (e.g. PHASE 01)"
                      value={formData[`phase${num}Badge`] || ''}
                      onChange={(e) => handleChange(`phase${num}Badge`, e.target.value)}
                      className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-mono text-xs text-[#B26FCB] focus:outline-none focus:border-[#B26FCB]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Phase Title"
                    value={formData[`phase${num}Title`] || ''}
                    onChange={(e) => handleChange(`phase${num}Title`, e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-3 py-2 font-display text-sm text-white font-bold focus:outline-none focus:border-[#B26FCB]"
                  />
                  <textarea
                    rows="3"
                    placeholder="Phase Description"
                    value={formData[`phase${num}Desc`] || ''}
                    onChange={(e) => handleChange(`phase${num}Desc`, e.target.value)}
                    className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl p-2.5 font-sans text-xs text-zinc-300 focus:outline-none focus:border-[#B26FCB]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: FOOTER & META */}
        {activeSection === 'footer' && (
          <div className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/50 backdrop-blur-xl space-y-6">
            <h3 className="font-display text-lg font-bold text-white border-b border-[#855AB4]/20 pb-3">
              Footer &amp; Platform Metadata
            </h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Footer Brand Title
                </label>
                <input
                  type="text"
                  value={formData.footerTitle || ''}
                  onChange={(e) => handleChange('footerTitle', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Footer Description
                </label>
                <textarea
                  rows="3"
                  value={formData.footerDescription || ''}
                  onChange={(e) => handleChange('footerDescription', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl p-3 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Footer Tagline
                </label>
                <input
                  type="text"
                  value={formData.footerTagline || ''}
                  onChange={(e) => handleChange('footerTagline', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={formData.footerCopyright || ''}
                  onChange={(e) => handleChange('footerCopyright', e.target.value)}
                  className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-[#B26FCB]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="sticky bottom-6 z-20 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(178,111,203,0.4)] active:scale-95 border border-[#B26FCB]/50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "SYNCHRONIZING CHANGES..." : "PUBLISH ALL CMS CHANGES"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
