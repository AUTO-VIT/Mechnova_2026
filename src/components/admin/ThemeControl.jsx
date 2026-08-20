import React, { useEffect, useState } from 'react';
import { CheckCircle2, Edit2, Eye, EyeOff, UsersRound, X } from 'lucide-react';
import { setThemeRevealApi } from '../../services/callableApi';
import { savePrivateTheme, subscribeToPrivateThemes } from '../../services/firestoreService';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ModalLayer } from '../common/ModalLayer';

const defaultThemeSlots = [
  { num: 1, id: 'theme-1', name: 'Autonomous Kinematics & Path Planning' },
  { num: 2, id: 'theme-2', name: 'Industrial Computer Vision & Quality Inspection' },
  { num: 3, id: 'theme-3', name: 'PLC Logic & Process Automation Control' },
  { num: 4, id: 'theme-4', name: 'Multi-Robot Swarm Coordination' },
  { num: 5, id: 'theme-5', name: 'Advanced Mechatronics & Control Systems' }
];

export function ThemeControl({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [privateThemes, setPrivateThemes] = useState([]);
  const [editingTheme, setEditingTheme] = useState(null);
  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [themeBrief, setThemeBrief] = useState('');
  const [eligibility, setEligibility] = useState('Open to all qualified robotics teams');
  const [seatCapacity, setSeatCapacity] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => subscribeToPrivateThemes(eventId, (themes) => setPrivateThemes(themes || [])), [eventId]);

  const handleEdit = (slot) => {
    const existing = privateThemes.find((theme) => (theme.id || theme.themeId) === slot.id) || slot;
    setEditingTheme(existing);
    setThemeName(existing.name || existing.publicName || slot.name);
    setThemeDesc(existing.description || existing.publicDescription || '');
    setThemeBrief(existing.brief || '');
    setEligibility(existing.eligibility || 'Open to all qualified robotics teams');
    setSeatCapacity(Math.max(1, Number(existing.seatCapacity || existing.capacity || 1)));
  };

  const handleSavePrivateTheme = async (event) => {
    event.preventDefault();
    if (!themeName.trim()) return;
    setLoading(true);
    try {
      await savePrivateTheme(eventId, editingTheme.id || editingTheme.themeId, {
        themeNumber: editingTheme.num || editingTheme.themeNumber || 1,
        name: themeName.trim(),
        description: themeDesc.trim(),
        brief: themeBrief.trim(),
        eligibility: eligibility.trim(),
        seatCapacity,
        adminNotes: 'Configured via Admin Theme Control'
      });
      setEditingTheme(null);
      setMessage('Theme saved.');
    } catch (error) {
      console.error(error);
      setMessage(`Could not save theme: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isRevealed = eventData?.themesRevealed === true;
  const configuredCount = privateThemes.length;

  const handleSetThemeVisibility = async () => {
    setLoading(true);
    try {
      const result = await setThemeRevealApi({ eventId, revealed: !isRevealed });
      if (result?.success) {
        setMessage(isRevealed ? 'Themes are now hidden from participants.' : `${result.revealedCount} themes are now visible to participants.`);
        setConfirmOpen(false);
      }
    } catch (error) {
      console.error('Theme visibility error:', error);
      window.alert(error.message || 'Theme visibility update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      {message && <div role="status" className={`mn-alert ${message.startsWith('Could not') ? 'mn-alert-error' : 'mn-alert-success'}`}><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}

      <section className="mn-panel flex flex-col justify-between gap-6 border-t-[3px] border-t-[var(--mn-violet)] lg:flex-row lg:items-center">
        <div><span className="mn-label">Participant visibility</span><h2 className="mt-2 font-['Syne'] text-2xl font-semibold">{isRevealed ? 'Themes are visible' : 'Themes are hidden'}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--mn-muted)]">Theme details stay private until you reveal them. Hiding them later never deletes the saved content or capacities.</p></div>
        <button type="button" role="switch" aria-checked={isRevealed} disabled={configuredCount < 5 || loading} onClick={() => setConfirmOpen(true)} className={`mn-button min-w-56 ${isRevealed ? 'mn-button-danger' : 'mn-button-accent'}`}>{isRevealed ? <><EyeOff className="h-4 w-4" />Hide themes</> : <><Eye className="h-4 w-4" />Reveal themes</>}</button>
      </section>

      <div className="flex items-end justify-between gap-4"><div><span className="mn-kicker">Theme setup</span><h2 className="mt-3 font-['Syne'] text-3xl font-semibold">Challenge themes</h2></div><span className={`mn-status ${configuredCount >= 5 ? 'is-live' : ''}`}>{configuredCount} / 5 configured</span></div>

      <div className="mn-theme-grid">
        {defaultThemeSlots.map((slot) => {
          const configured = privateThemes.find((theme) => (theme.id || theme.themeId) === slot.id);
          const capacity = configured?.seatCapacity || configured?.capacity || 1;
          return (
            <article key={slot.id} className="mn-theme-card min-h-[300px]" data-tilt>
              <div className="flex items-center justify-between"><span className="mn-theme-card-index">THEME {String(slot.num).padStart(2, '0')}</span><button type="button" onClick={() => handleEdit(slot)} className="mn-icon-button h-9 w-9" aria-label={`${configured ? 'Edit' : 'Configure'} theme ${slot.num}`}><Edit2 className="h-3.5 w-3.5" /></button></div>
              <h3>{configured ? (configured.name || configured.publicName) : slot.name}</h3>
              <p>{configured?.description || 'Add the public description and technical brief for this challenge.'}</p>
              <div className="mn-theme-card-foot"><span className="inline-flex items-center gap-2"><UsersRound className="h-3.5 w-3.5" />{configured ? `${capacity} team seat${Number(capacity) === 1 ? '' : 's'}` : 'Capacity not set'}</span><strong className={configured ? 'text-[var(--mn-green)]' : ''}>{configured ? 'Ready' : 'Draft'}</strong></div>
            </article>
          );
        })}
      </div>

      {editingTheme && (
        <ModalLayer labelledBy="theme-editor-title" onClose={loading ? undefined : () => setEditingTheme(null)}>
          <div className="mn-panel mn-modal-surface w-full max-w-2xl border-t-[3px] border-t-[var(--mn-violet)]">
            <div className="flex items-start justify-between border-b border-[var(--mn-line)] pb-5"><div><span className="mn-label">Theme {editingTheme.themeNumber || editingTheme.num || ''}</span><h3 id="theme-editor-title" className="mt-2 font-['Syne'] text-2xl font-semibold">Edit challenge theme</h3></div><button type="button" onClick={() => setEditingTheme(null)} disabled={loading} aria-label="Close theme editor" className="mn-icon-button"><X className="h-4 w-4" /></button></div>
            <form onSubmit={handleSavePrivateTheme} className="mt-6 space-y-5">
              <label className="mn-field"><span className="mn-label">Theme name *</span><input type="text" value={themeName} onChange={(event) => setThemeName(event.target.value)} required className="mn-input" /></label>
              <label className="mn-field"><span className="mn-label">Public description</span><textarea rows="3" value={themeDesc} onChange={(event) => setThemeDesc(event.target.value)} className="mn-textarea" /></label>
              <label className="mn-field"><span className="mn-label">Technical brief</span><textarea rows="3" value={themeBrief} onChange={(event) => setThemeBrief(event.target.value)} className="mn-textarea" /></label>
              <div className="grid gap-4 sm:grid-cols-[1fr_180px]"><label className="mn-field"><span className="mn-label">Eligibility</span><input type="text" value={eligibility} onChange={(event) => setEligibility(event.target.value)} className="mn-input" /></label><label className="mn-field"><span className="mn-label">Team capacity *</span><input type="number" min="1" step="1" value={seatCapacity} onChange={(event) => setSeatCapacity(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} required className="mn-input" /></label></div>
              <div className="flex justify-end gap-3 border-t border-[var(--mn-line)] pt-5"><button type="button" onClick={() => setEditingTheme(null)} className="mn-button mn-button-secondary">Cancel</button><button type="submit" disabled={loading} className="mn-button mn-button-primary">Save theme</button></div>
            </form>
          </div>
        </ModalLayer>
      )}

      <ConfirmDialog isOpen={confirmOpen} title={isRevealed ? 'Hide themes from teams?' : 'Reveal themes to teams?'} message={isRevealed ? 'This immediately removes themes from participant pages. All saved theme details and capacities remain available here.' : 'This publishes the configured themes, descriptions, briefs, and capacities to participant pages.'} confirmLabel={isRevealed ? 'Hide themes' : 'Reveal themes'} requireInputMatch={isRevealed ? 'HIDE' : 'REVEAL'} onConfirm={handleSetThemeVisibility} onClose={() => setConfirmOpen(false)} loading={loading} />
    </div>
  );
}
