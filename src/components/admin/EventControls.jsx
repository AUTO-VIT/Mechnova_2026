import React, { useState } from 'react';
import { updateEventControls } from '../../services/firestoreService';
import { Radio, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function EventControls({ eventData }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleToggle = async (field, currentValue) => {
    setLoading(true);
    setMsg('');
    try {
      await updateEventControls(eventData?.id || 'default-event', {
        [field]: !currentValue
      });
      setMsg(`Updated ${field} state successfully.`);
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className="border border-emerald-500/30 bg-emerald-500/10 p-3.5 rounded-xl font-mono text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Registration */}
        <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
              Registration Phase
            </span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
              eventData?.registrationOpen !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.registrationOpen !== false ? "OPEN" : "CLOSED"}
            </span>
          </div>

          <p className="text-zinc-400 text-xs font-light leading-relaxed">
            Permits participant teams to register rosters and obtain synthetic passkeys.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('registrationOpen', eventData?.registrationOpen !== false)}
            className={`w-full font-mono text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95 ${
              eventData?.registrationOpen !== false
                ? 'border border-white/20 bg-transparent text-white hover:bg-white/[0.04]'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {eventData?.registrationOpen !== false ? "Close Registration" : "Open Registration"}
          </button>
        </div>

        {/* Quiz */}
        <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
              Quiz Channel
            </span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
              eventData?.quizOpen ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.quizOpen ? "ACTIVE" : "SEALED"}
            </span>
          </div>

          <p className="text-zinc-400 text-xs font-light leading-relaxed">
            Enables 10s Read + 10s Answer authoritative timed quiz engine.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('quizOpen', eventData?.quizOpen === true)}
            className={`w-full font-mono text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95 ${
              eventData?.quizOpen
                ? 'border border-white/20 bg-transparent text-white hover:bg-white/[0.04]'
                : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            {eventData?.quizOpen ? "Close Quiz Channel" : "Open Quiz Channel"}
          </button>
        </div>

        {/* Bidding */}
        <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider">
              Theme Bidding
            </span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
              eventData?.biddingOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-zinc-500'
            }`}>
              {eventData?.biddingOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>

          <p className="text-zinc-400 text-xs font-light leading-relaxed">
            Permits teams to allocate their quiz score points towards preferred themes.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('biddingOpen', eventData?.biddingOpen === true)}
            className={`w-full font-mono text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all active:scale-95 ${
              eventData?.biddingOpen
                ? 'border border-white/20 bg-transparent text-white hover:bg-white/[0.04]'
                : 'bg-cyan-600 text-white hover:bg-cyan-500'
            }`}
          >
            {eventData?.biddingOpen ? "Close Bidding" : "Open Bidding"}
          </button>
        </div>
      </div>
    </div>
  );
}
