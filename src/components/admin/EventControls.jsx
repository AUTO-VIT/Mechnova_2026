import React, { useState } from 'react';
import { updateEventControls } from '../../services/firestoreService';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Radio, ShieldAlert, CheckCircle } from 'lucide-react';

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
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ControlPanel title="OPERATIONAL CONTROL SWITCHBOARD" subtitle="Event Phase Toggles">
      <div className="space-y-4 pt-2">
        {msg && (
          <div className="border border-emerald-500/40 bg-emerald-950/60 p-3 font-mono text-xs text-emerald-300">
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Registration Toggle */}
          <div className="border border-zinc-800 bg-zinc-900/60 p-4 font-mono space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white">TEAM REGISTRATION</span>
              <StatusBadge
                status={eventData?.registrationOpen !== false ? "OPEN" : "CLOSED"}
                variant={eventData?.registrationOpen !== false ? "emerald" : "zinc"}
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Permits new team roster registration and credential generation.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleToggle('registrationOpen', eventData?.registrationOpen !== false)}
              className={`w-full py-2 text-xs font-bold uppercase transition-all active:scale-[0.97] ${
                eventData?.registrationOpen !== false
                  ? 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-red-500 hover:text-red-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {eventData?.registrationOpen !== false ? "CLOSE REGISTRATION" : "OPEN REGISTRATION"}
            </button>
          </div>

          {/* Quiz Toggle */}
          <div className="border border-zinc-800 bg-zinc-900/60 p-4 font-mono space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white">AUTHORITATIVE QUIZ</span>
              <StatusBadge
                status={eventData?.quizOpen ? "OPEN" : "CLOSED"}
                variant={eventData?.quizOpen ? "red" : "zinc"}
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Enables 10s read prompt + 10s answer phase quiz engine.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleToggle('quizOpen', eventData?.quizOpen === true)}
              className={`w-full py-2 text-xs font-bold uppercase transition-all active:scale-[0.97] ${
                eventData?.quizOpen
                  ? 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-red-500 hover:text-red-400'
                  : 'bg-red-600 text-white hover:bg-red-500'
              }`}
            >
              {eventData?.quizOpen ? "CLOSE QUIZ CHANNEL" : "OPEN QUIZ CHANNEL"}
            </button>
          </div>

          {/* Bidding Toggle */}
          <div className="border border-zinc-800 bg-zinc-900/60 p-4 font-mono space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white">THEME BIDDING</span>
              <StatusBadge
                status={eventData?.biddingOpen ? "OPEN" : "CLOSED"}
                variant={eventData?.biddingOpen ? "cyan" : "zinc"}
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              Permits teams to spend quiz score points to bid on revealed themes.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleToggle('biddingOpen', eventData?.biddingOpen === true)}
              className={`w-full py-2 text-xs font-bold uppercase transition-all active:scale-[0.97] ${
                eventData?.biddingOpen
                  ? 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-red-500 hover:text-red-400'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500'
              }`}
            >
              {eventData?.biddingOpen ? "CLOSE BIDDING CHANNEL" : "OPEN BIDDING CHANNEL"}
            </button>
          </div>
        </div>
      </div>
    </ControlPanel>
  );
}
