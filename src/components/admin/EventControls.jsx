import React, { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Play, Square, Trophy, UsersRound } from 'lucide-react';
import { updateEventControls } from '../../services/firestoreService';

export function EventControls({ eventData }) {
  const [controls, setControls] = useState({
    registrationOpen: eventData?.registrationOpen !== false,
    quizOpen: eventData?.quizOpen === true,
    biddingOpen: eventData?.biddingOpen === true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (eventData) setControls({ registrationOpen: eventData.registrationOpen !== false, quizOpen: eventData.quizOpen === true, biddingOpen: eventData.biddingOpen === true });
  }, [eventData]);

  const controlItems = [
    { field: 'registrationOpen', label: 'Registration', icon: UsersRound, openCopy: 'Teams can submit registrations and receive their access credentials.', closedCopy: 'New team registrations are paused.' },
    { field: 'quizOpen', label: 'Quiz', icon: ClipboardList, openCopy: 'Signed-in teams can start the timed quiz.', closedCopy: 'Teams cannot start or submit quiz attempts.' },
    { field: 'biddingOpen', label: 'Theme preferences', icon: Trophy, openCopy: 'Teams can rank every revealed theme and submit their order.', closedCopy: 'Theme preference submissions are paused.' }
  ];

  const handleToggle = async (field, currentValue) => {
    setLoading(true);
    setMessage('');
    const nextValue = !currentValue;
    setControls((current) => ({ ...current, [field]: nextValue }));
    try {
      await updateEventControls(eventData?.id || 'default-event', { [field]: nextValue });
      setMessage(`${controlItems.find((item) => item.field === field)?.label} is now ${nextValue ? 'open' : 'closed'}.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.warn('Control toggle Firestore sync note:', error.message);
      setMessage(`${controlItems.find((item) => item.field === field)?.label} changed locally; Firebase sync needs attention.`);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && <div role="status" className="mn-alert mn-alert-success"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}
      <div className="grid gap-4 lg:grid-cols-3">
        {controlItems.map((item, index) => {
          const Icon = item.icon;
          const isOpen = controls[item.field];
          return (
            <section key={item.field} className="mn-panel flex min-h-[300px] flex-col justify-between" data-tilt>
              <div>
                <div className="flex items-center justify-between gap-4"><span className="grid h-11 w-11 place-items-center border border-[var(--mn-line-strong)] text-[var(--mn-violet)]"><Icon className="h-5 w-5" /></span><span className={`mn-status ${isOpen ? 'is-live' : ''}`}><span className="mn-live-dot" />{isOpen ? 'Open' : 'Closed'}</span></div>
                <span className="mn-label mt-8 block">Phase 0{index + 1}</span>
                <h3 className="mt-2 font-['Syne'] text-2xl font-semibold">{item.label}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--mn-muted)]">{isOpen ? item.openCopy : item.closedCopy}</p>
              </div>
              <button type="button" disabled={loading} onClick={() => handleToggle(item.field, isOpen)} className={`mn-button mt-8 w-full ${isOpen ? 'mn-button-danger' : 'mn-button-accent'}`}>{isOpen ? <><Square className="h-3.5 w-3.5" />Close {item.label.toLowerCase()}</> : <><Play className="h-3.5 w-3.5" />Open {item.label.toLowerCase()}</>}</button>
            </section>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-[var(--mn-faint)]">Changes take effect immediately for participant pages. Close a phase only when you are ready to stop new submissions.</p>
    </div>
  );
}
