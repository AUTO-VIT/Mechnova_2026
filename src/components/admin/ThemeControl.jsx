import React, { useState, useEffect } from 'react';
import { subscribeToPrivateThemes, savePrivateTheme } from '../../services/firestoreService';
import { revealThemesApi } from '../../services/callableApi';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Layers, Eye, Edit2, Lock, ShieldCheck } from 'lucide-react';

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
    <ControlPanel
      title="SECRET THEME VAULT & REVEAL ENGINE"
      subtitle="Strict Pre-Reveal Privacy Protocol"
      badge={
        <StatusBadge
          status={isRevealed ? "THEMES REVEALED" : "VAULT LOCKED"}
          variant={isRevealed ? "emerald" : "red"}
        />
      }
    >
      <div className="space-y-6 pt-2 font-mono">
        {revealMsg && (
          <div className="border border-emerald-500/50 bg-emerald-950/60 p-3 text-xs text-emerald-300">
            {revealMsg}
          </div>
        )}

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border border-zinc-800 bg-zinc-900/60 p-4">
          <div>
            <div className="text-xs uppercase text-zinc-400">PRIVATE THEMES CONFIGURED</div>
            <div className="text-xl font-bold text-white">
              {configuredCount} / 4 SLOTS READY
            </div>
          </div>

          <button
            type="button"
            disabled={isRevealed || configuredCount < 4}
            onClick={() => setConfirmOpen(true)}
            className="bg-red-600 px-6 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-red-500 active:scale-[0.97] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            <span>{isRevealed ? "THEMES REVEALED" : "EXECUTE THEME REVEAL (AUDITED)"}</span>
          </button>
        </div>

        {/* 4 Theme Slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {defaultThemeSlots.map((slot) => {
            const configured = privateThemes.find(t => (t.id || t.themeId) === slot.id);
            return (
              <div key={slot.id} className="border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-red-400">
                    THEME 0{slot.num}
                  </span>
                  <button
                    onClick={() => handleEdit(slot)}
                    className="flex items-center gap-1 border border-zinc-700 bg-black px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>{configured ? "EDIT DRAFT" : "CONFIGURE"}</span>
                  </button>
                </div>

                <div className="text-sm font-bold text-white">
                  {configured ? (configured.name || configured.publicName) : slot.name}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2">
                  {configured?.description || "No description configured yet."}
                </p>

                <div className="text-[10px] text-zinc-500 border-t border-zinc-800 pt-2 flex items-center justify-between">
                  <span>VAULT NODE: themesPrivate/{slot.id}</span>
                  <StatusBadge status={configured ? "CONFIGURED" : "EMPTY"} variant={configured ? "emerald" : "zinc"} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Private Theme Modal */}
        {editingTheme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-xl border border-red-600 bg-zinc-950 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-base text-red-400">
                  EDIT PRIVATE THEME DRAFT
                </h3>
                <button onClick={() => setEditingTheme(null)} className="text-zinc-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSavePrivateTheme} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">THEME NAME *</label>
                  <input
                    type="text"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    required
                    className="w-full border border-zinc-700 bg-black px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">PUBLIC DESCRIPTION</label>
                  <textarea
                    rows="3"
                    value={themeDesc}
                    onChange={(e) => setThemeDesc(e.target.value)}
                    className="w-full border border-zinc-700 bg-black p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">TECHNICAL BRIEF</label>
                  <textarea
                    rows="3"
                    value={themeBrief}
                    onChange={(e) => setThemeBrief(e.target.value)}
                    className="w-full border border-zinc-700 bg-black p-3 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">ELIGIBILITY</label>
                  <input
                    type="text"
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    className="w-full border border-zinc-700 bg-black px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-zinc-800 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingTheme(null)}
                    className="border border-zinc-700 px-4 py-2 text-xs text-zinc-400"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500"
                  >
                    SAVE PRIVATE THEME
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* REVEAL THEMES AUDITED CONFIRM DIALOG */}
        <ConfirmDialog
          isOpen={confirmOpen}
          title="EXECUTE THEME REVEAL (AUDITED)"
          message="This action will copy all 4 private themes to the public node themesPublic/ and publish problem statements to all hackathon participants. This action generates an append-only audit log and CANNOT BE UNDONE."
          confirmLabel="AUTHORIZE THEME REVEAL"
          requireInputMatch="REVEAL"
          onConfirm={handleExecuteReveal}
          onClose={() => setConfirmOpen(false)}
          loading={loading}
        />
      </div>
    </ControlPanel>
  );
}
