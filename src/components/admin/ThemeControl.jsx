import React, { useState, useEffect } from 'react';
import { subscribeToPrivateThemes, savePrivateTheme } from '../../services/firestoreService';
import { revealThemesApi } from '../../services/callableApi';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Layers, Eye, Edit2, Lock, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

export function ThemeControl({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [privateThemes, setPrivateThemes] = useState([]);
  const [editingTheme, setEditingTheme] = useState(null);
  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [themeBrief, setThemeBrief] = useState('');
  const [eligibility, setEligibility] = useState('Open to all qualified robotics teams');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [revealMsg, setRevealMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToPrivateThemes(eventId, (themes) => {
      setPrivateThemes(themes || []);
    });
    return () => unsub();
  }, [eventId]);

  const defaultThemeSlots = [
    { num: 1, id: 'theme-1', name: 'Autonomous Kinematics & Path Planning' },
    { num: 2, id: 'theme-2', name: 'Industrial Computer Vision & Quality Inspection' },
    { num: 3, id: 'theme-3', name: 'PLC Logic & Process Automation Control' },
    { num: 4, id: 'theme-4', name: 'Multi-Robot Swarm Coordination & Fleet Telemetry' }
  ];

  const handleEdit = (slot) => {
    const existing = privateThemes.find(t => (t.id || t.themeId) === slot.id) || slot;
    setEditingTheme(existing);
    setThemeName(existing.name || existing.publicName || slot.name);
    setThemeDesc(existing.description || existing.publicDescription || '');
    setThemeBrief(existing.brief || '');
    setEligibility(existing.eligibility || 'Open to all qualified robotics teams');
  };

  const handleSavePrivateTheme = async (e) => {
    e.preventDefault();
    if (!themeName.trim()) return;
    setLoading(true);
    try {
      await savePrivateTheme(eventId, editingTheme.id || editingTheme.themeId, {
        themeNumber: editingTheme.num || editingTheme.themeNumber || 1,
        name: themeName.trim(),
        description: themeDesc.trim(),
        brief: themeBrief.trim(),
        eligibility: eligibility.trim(),
        adminNotes: 'Configured via Admin Theme Control'
      });
      setEditingTheme(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteReveal = async () => {
    setLoading(true);
    try {
      const res = await revealThemesApi({ eventId });
      if (res && res.success) {
        setRevealMsg(`Successfully revealed ${res.revealedCount} challenge themes to participants.`);
        setConfirmOpen(false);
      }
    } catch (err) {
      console.error("Theme reveal error:", err);
      alert(err.message || 'Theme reveal failed.');
    } finally {
      setLoading(false);
    }
  };

  const configuredCount = privateThemes.length;
  const isRevealed = eventData?.themesRevealed === true;

  return (
    <div className="space-y-8">
      {revealMsg && (
        <div className="border border-emerald-500/30 bg-emerald-500/10 p-3.5 rounded-xl font-mono text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{revealMsg}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-white/[0.08]">
        <div>
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider block">
            Theme Vault Configuration
          </span>
          <div className="font-display text-lg font-bold text-white">
            {configuredCount} / 4 Slots Configured
          </div>
        </div>

        <button
          type="button"
          disabled={isRevealed || configuredCount < 4}
          onClick={() => setConfirmOpen(true)}
          className="bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.15em] px-6 py-3 rounded-full hover:bg-zinc-200 transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
        >
          <Eye className="h-4 w-4" />
          <span>{isRevealed ? "Themes Revealed" : "Execute Audited Reveal"}</span>
        </button>
      </div>

      {/* 4 Theme Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultThemeSlots.map((slot) => {
          const configured = privateThemes.find(t => (t.id || t.themeId) === slot.id);
          return (
            <div
              key={slot.id}
              className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-red-500 font-bold uppercase tracking-wider">
                  THEME 0{slot.num}
                </span>
                <button
                  onClick={() => handleEdit(slot)}
                  className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-white px-3 py-1 rounded-lg border border-white/10 hover:bg-white/[0.05]"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{configured ? "Edit" : "Configure"}</span>
                </button>
              </div>

              <h3 className="font-display text-lg font-bold text-white">
                {configured ? (configured.name || configured.publicName) : slot.name}
              </h3>

              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                {configured?.description || "No description configured yet."}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] font-mono text-[11px] text-zinc-500">
                <span>Vault: themesPrivate/{slot.id}</span>
                <span className={configured ? "text-emerald-400 font-medium" : "text-zinc-600"}>
                  {configured ? "CONFIGURED" : "EMPTY"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingTheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl">
          <div className="w-full max-w-xl bg-void border border-white/20 rounded-2xl p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="font-display text-xl font-bold text-white">
                Edit Private Theme
              </h3>
              <button onClick={() => setEditingTheme(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePrivateTheme} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-400 uppercase">Theme Name *</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 font-sans text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-400 uppercase">Description</label>
                <textarea
                  rows="3"
                  value={themeDesc}
                  onChange={(e) => setThemeDesc(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 font-sans text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-400 uppercase">Technical Brief</label>
                <textarea
                  rows="3"
                  value={themeBrief}
                  onChange={(e) => setThemeBrief(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 font-sans text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-xs text-zinc-400 uppercase">Eligibility</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 font-sans text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingTheme(null)}
                  className="font-mono text-xs text-zinc-400 hover:text-white px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-black font-mono text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-full hover:bg-zinc-200"
                >
                  Save Theme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Authorize Audited Theme Reveal"
        message="This action will copy all 4 private themes to themesPublic/ and reveal problem statements to all participants. This generates an append-only audit log."
        confirmLabel="Authorize Theme Reveal"
        requireInputMatch="REVEAL"
        onConfirm={handleExecuteReveal}
        onClose={() => setConfirmOpen(false)}
        loading={loading}
      />
    </div>
  );
}
