import React, { useState, useEffect } from 'react';
import { subscribeToCmsContent, saveCmsPage } from '../../services/firestoreService';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Edit3, CheckCircle } from 'lucide-react';

export function CmsEditor({ eventData }) {
  const eventId = eventData?.id || 'default-event';
  const [heroLabel, setHeroLabel] = useState('ROBOTICS & AUTOMATION QUIZ & THEME ALLOCATION');
  const [announcements, setAnnouncements] = useState('Registration is open. Quiz evaluation begins soon.');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeToCmsContent(eventId, 'homepage', (content) => {
      if (content) {
        if (content.heroLabel) setHeroLabel(content.heroLabel);
        if (content.announcements) setAnnouncements(content.announcements);
      }
    });
    return () => unsub();
  }, [eventId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      await saveCmsPage(eventId, 'homepage', {
        heroLabel,
        announcements,
        published: true
      });
      setMsg('CMS Content published successfully.');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ControlPanel title="PUBLIC CMS CONTENT EDITOR" subtitle="Homepage & Announcements">
      <form onSubmit={handleSave} className="space-y-4 pt-2 font-mono">
        {msg && (
          <div className="border border-emerald-500/50 bg-emerald-950/60 p-3 text-xs text-emerald-300">
            {msg}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase font-bold text-zinc-300 mb-1.5">
            HOMEPAGE HERO HEADLINE LABEL
          </label>
          <input
            type="text"
            value={heroLabel}
            onChange={(e) => setHeroLabel(e.target.value)}
            className="w-full border border-zinc-700 bg-black px-4 py-2 text-xs text-white"
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-zinc-300 mb-1.5">
            EVENT ANNOUNCEMENTS BULLETIN
          </label>
          <textarea
            rows="4"
            value={announcements}
            onChange={(e) => setAnnouncements(e.target.value)}
            className="w-full border border-zinc-700 bg-black p-3 text-xs text-white"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-red-500 active:scale-[0.97]"
          >
            {loading ? "PUBLISHING..." : "PUBLISH CMS CHANGES"}
          </button>
        </div>
      </form>
    </ControlPanel>
  );
}
