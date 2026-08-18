import React, { useState, useEffect } from 'react';
import { updateEventControls } from '../../services/firestoreService';
import { Radio, ShieldAlert, CheckCircle2, Play, Square, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export function EventControls({ eventData }) {
  // Local state initialized with eventData and instantly updated on toggle
  const [controls, setControls] = useState({
    registrationOpen: eventData?.registrationOpen !== false,
    quizOpen: eventData?.quizOpen === true,
    biddingOpen: eventData?.biddingOpen === true
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (eventData) {
      setControls({
        registrationOpen: eventData.registrationOpen !== false,
        quizOpen: eventData.quizOpen === true,
        biddingOpen: eventData.biddingOpen === true
      });
    }
  }, [eventData]);

  const handleToggle = async (field, currentValue) => {
    setLoading(true);
    setMsg('');
    const newValue = !currentValue;
    
    // 1. Optimistic instant UI update
    setControls(prev => ({ ...prev, [field]: newValue }));

    try {
      await updateEventControls(eventData?.id || 'default-event', {
        [field]: newValue
      });
      const fieldNames = {
        quizOpen: 'Quiz Evaluation Channel',
        registrationOpen: 'Team Registration Gate',
        biddingOpen: 'Theme Bidding Arena'
      };
      setMsg(`${fieldNames[field] || field} set to ${newValue ? 'ACTIVE / OPEN' : 'SEALED / CLOSED'}.`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error("Control toggle error:", err);
      // Revert if error
      setControls(prev => ({ ...prev, [field]: currentValue }));
      setMsg(`Error updating control: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className="border border-emerald-500/40 bg-emerald-500/15 p-4 rounded-2xl font-mono text-xs text-emerald-300 flex items-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold">{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Registration Gate Control Card */}
        <div className="border border-[#855AB4]/30 rounded-3xl p-6 bg-[#221545]/60 backdrop-blur-xl space-y-5 shadow-[0_0_35px_rgba(104,56,141,0.15)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-300 uppercase tracking-wider font-bold">
                Registration Gate
              </span>
              <span className={`font-mono text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                controls.registrationOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              }`}>
                {controls.registrationOpen ? "● OPEN" : "○ CLOSED"}
              </span>
            </div>

            <p className="text-zinc-300 text-xs font-light leading-relaxed">
              {controls.registrationOpen
                ? "Participant teams can register 2-4 members and receive synthetic passkeys."
                : "Registration is currently CLOSED. Participants cannot submit new rosters."}
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('registrationOpen', controls.registrationOpen)}
            className={`w-full font-mono text-xs font-bold uppercase tracking-[0.15em] py-3.5 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border cursor-pointer ${
              controls.registrationOpen
                ? 'border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                : 'border-[#B26FCB]/60 bg-[#68388D] text-white hover:bg-[#855AB4] shadow-[0_0_25px_rgba(178,111,203,0.4)]'
            }`}
          >
            {controls.registrationOpen ? (
              <>
                <Square className="h-3.5 w-3.5" />
                <span>CLOSE REGISTRATION</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>OPEN REGISTRATION</span>
              </>
            )}
          </button>
        </div>

        {/* Quiz Channel Control Card */}
        <div className="border border-[#855AB4]/30 rounded-3xl p-6 bg-[#221545]/60 backdrop-blur-xl space-y-5 shadow-[0_0_35px_rgba(104,56,141,0.15)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-300 uppercase tracking-wider font-bold">
                Quiz Channel
              </span>
              <span className={`font-mono text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                controls.quizOpen
                  ? 'bg-[#B26FCB]/20 text-[#B26FCB] border border-[#B26FCB]/50 shadow-[0_0_15px_rgba(178,111,203,0.35)]'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                {controls.quizOpen ? "● ACTIVE" : "○ SEALED"}
              </span>
            </div>

            <p className="text-zinc-300 text-xs font-light leading-relaxed">
              {controls.quizOpen
                ? "10s Read + 10s Answer authoritative timed quiz engine is LIVE for all teams."
                : "Quiz channel is SEALED. Teams cannot start or submit quiz sessions."}
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('quizOpen', controls.quizOpen)}
            className={`w-full font-mono text-xs font-bold uppercase tracking-[0.15em] py-3.5 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border cursor-pointer ${
              controls.quizOpen
                ? 'border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                : 'border-[#B26FCB]/60 bg-[#68388D] text-white hover:bg-[#855AB4] shadow-[0_0_25px_rgba(178,111,203,0.4)]'
            }`}
          >
            {controls.quizOpen ? (
              <>
                <Square className="h-3.5 w-3.5" />
                <span>CLOSE QUIZ CHANNEL</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>OPEN QUIZ CHANNEL</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Bidding Control Card */}
        <div className="border border-[#855AB4]/30 rounded-3xl p-6 bg-[#221545]/60 backdrop-blur-xl space-y-5 shadow-[0_0_35px_rgba(104,56,141,0.15)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-zinc-300 uppercase tracking-wider font-bold">
                Theme Bidding
              </span>
              <span className={`font-mono text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                controls.biddingOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                {controls.biddingOpen ? "● OPEN" : "○ CLOSED"}
              </span>
            </div>

            <p className="text-zinc-300 text-xs font-light leading-relaxed">
              {controls.biddingOpen
                ? "Theme bidding arena is OPEN. Teams can allocate quiz points to themes."
                : "Theme bidding is LOCKED. Bids cannot be submitted."}
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleToggle('biddingOpen', controls.biddingOpen)}
            className={`w-full font-mono text-xs font-bold uppercase tracking-[0.15em] py-3.5 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border cursor-pointer ${
              controls.biddingOpen
                ? 'border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                : 'border-[#B26FCB]/50 bg-[#68388D] text-white hover:bg-[#855AB4] shadow-[0_0_20px_rgba(178,111,203,0.3)]'
            }`}
          >
            {controls.biddingOpen ? (
              <>
                <Square className="h-3.5 w-3.5" />
                <span>CLOSE BIDDING ARENA</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>OPEN BIDDING ARENA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
