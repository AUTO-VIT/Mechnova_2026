import React, { useState } from 'react';
import { ArrowRight, Check, Copy, Loader2, Lock, Plus, Printer, ShieldAlert, Trash2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { registerTeamApi } from '../../services/callableApi';
import { printCredentialSheet } from '../../utils/printCredentialDoc';
import { ModalLayer } from '../common/ModalLayer';

const emptyMember = () => ({ name: '', email: '', phone: '', registrationProofUrl: '' });

export function RegistrationPage() {
  const { eventData } = useEvent();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([emptyMember(), emptyMember()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credResult, setCredResult] = useState(null);
  const [hasConfirmedSave, setHasConfirmedSave] = useState(false);
  const [copied, setCopied] = useState('');
  const isRegistrationOpen = eventData?.registrationOpen !== false;

  const updateMember = (index, field, value) => setMembers((current) => current.map((member, memberIndex) => memberIndex === index ? { ...member, [field]: value } : member));
  const addMember = () => members.length < 4 && setMembers((current) => [...current, emptyMember()]);
  const removeMember = (index) => members.length > 2 && setMembers((current) => current.filter((_, memberIndex) => memberIndex !== index));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!isRegistrationOpen) return setError('Registration is currently closed.');
    if (!teamName.trim()) return setError('Enter a team name.');
    if (members.length < 2 || members.length > 4) return setError('A team must have between 2 and 4 members.');
    for (let index = 0; index < members.length; index += 1) {
      const member = members[index];
      if (!member.name.trim() || !member.email.trim() || !member.registrationProofUrl.trim()) return setError(`Complete the name, email, and proof link for member ${index + 1}.`);
      try { new URL(member.registrationProofUrl.trim()); } catch { return setError(`Member ${index + 1} has an invalid registration proof link.`); }
    }
    setLoading(true);
    try {
      const response = await registerTeamApi({ eventId: eventData?.id || 'default-event', teamName: teamName.trim(), members });
      if (response?.success) setCredResult({ ...response, members });
    } catch (registrationError) {
      setError(registrationError.message || 'Registration failed. Check the form and try again.');
    } finally { setLoading(false); }
  };

  const copyCredential = async (value, type) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(''), 1800);
  };

  const continueToLogin = () => {
    if (!hasConfirmedSave) return;
    setCredResult(null);
    navigate('/login');
  };

  return (
    <div className="mn-page">
      <header className="mn-page-head">
        <div className="mn-kicker">Team registration</div>
        <h1 className="mn-title">Create your team once. Use it throughout the event.</h1>
        <p className="mn-lede">Register 2–4 members. After submission, save the team code and passkey shown on screen—they are your shared portal credentials.</p>
      </header>

      {!isRegistrationOpen ? (
        <section className="mn-panel rounded-none py-20 text-center"><Lock className="mx-auto h-7 w-7 text-[var(--mn-violet)]" /><h2 className="mt-6 font-['Syne'] text-3xl font-semibold">Registration is closed.</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-zinc-400">The event team has closed new registrations. Existing teams can still sign in.</p><Link to="/login" className="mn-button mn-button-primary mt-8">Team sign in<ArrowRight className="h-4 w-4" /></Link></section>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="mn-panel mn-form-sidebar h-fit lg:sticky lg:top-28">
            <Users className="h-5 w-5 text-[var(--mn-violet)]" />
            <h2 className="mt-5 font-['Syne'] text-xl font-semibold">Before you submit</h2>
            <ol className="mt-5 space-y-4 text-sm leading-6 text-zinc-400">
              <li><strong className="text-white">01.</strong> Add 2–4 team members.</li>
              <li><strong className="text-white">02.</strong> Add a shareable Google Drive proof link for each member.</li>
              <li><strong className="text-white">03.</strong> Save the credentials shown after registration.</li>
              <li><strong className="text-white">04.</strong> Use one shared team login for every event stage.</li>
            </ol>
            <div className="mt-7 border-t border-[var(--mn-line)] pt-5 text-xs leading-5 text-zinc-500">Passkeys are shown once and are not displayed in the admin registration list.</div>
          </aside>

          <div className="space-y-7">
            {error && <div role="alert" className="mn-alert mn-alert-error"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
            <label className="mn-field"><span className="mn-label">Team name *</span><input className="mn-input text-base" value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="e.g. Atlas Mechanics" required /></label>

            <div className="flex items-center justify-between border-b border-[var(--mn-line)] pb-4">
              <div><span className="mn-label">Team roster</span><p className="mt-1 text-sm text-zinc-500">{members.length} of 4 members added</p></div>
              {members.length < 4 && <button type="button" onClick={addMember} className="mn-button mn-button-secondary min-h-10"><Plus className="h-4 w-4" />Add member</button>}
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <fieldset key={index} className="mn-panel mn-member-card p-5 sm:p-6">
                  <legend className="sr-only">Member {index + 1}</legend>
                  <div className="mb-5 flex items-center justify-between"><div><span className="mn-label">Member {String(index + 1).padStart(2, '0')}</span>{index === 0 && <span className="ml-3 text-xs text-[var(--mn-violet)]">Team lead</span>}</div>{members.length > 2 && <button type="button" onClick={() => removeMember(index)} aria-label={`Remove member ${index + 1}`} className="mn-icon-button h-9 w-9"><Trash2 className="h-4 w-4" /></button>}</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="mn-field"><span className="mn-label">Full name *</span><input className="mn-input" value={member.name} onChange={(event) => updateMember(index, 'name', event.target.value)} required /></label>
                    <label className="mn-field"><span className="mn-label">Email *</span><input className="mn-input" type="email" value={member.email} onChange={(event) => updateMember(index, 'email', event.target.value)} required /></label>
                    <label className="mn-field"><span className="mn-label">Phone (optional)</span><input className="mn-input" type="tel" value={member.phone} onChange={(event) => updateMember(index, 'phone', event.target.value)} /></label>
                    <label className="mn-field"><span className="mn-label">Registration proof link *</span><input className="mn-input" type="url" value={member.registrationProofUrl} onChange={(event) => updateMember(index, 'registrationProofUrl', event.target.value)} placeholder="https://drive.google.com/..." required /></label>
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="flex justify-end border-t border-[var(--mn-line)] pt-6"><button type="submit" disabled={loading} className="mn-button mn-button-primary min-w-64">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating team…</> : <>Create team &amp; credentials<ArrowRight className="h-4 w-4" /></>}</button></div>
          </div>
        </form>
      )}

      {credResult && (
        <ModalLayer labelledBy="credentials-title">
          <div className="mn-panel mn-modal-surface mn-credential-card w-full max-w-2xl p-6 sm:p-9">
            <span className="mn-status is-live"><Check className="h-3 w-3" />Registration complete</span>
            <h2 id="credentials-title" className="mt-5 font-['Syne'] text-3xl font-semibold tracking-[-.04em]">Save these team credentials.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">They will not be shown again. Share them only with your team.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[['Team code', credResult.teamCode, 'code'], ['Passkey', credResult.password, 'pass']].map(([label, value, type]) => <div key={type} className="border border-[var(--mn-line)] bg-black/20 p-4"><span className="mn-label">{label}</span><div className="mt-3 flex items-center justify-between gap-3"><strong className="break-all font-mono text-lg text-white">{value}</strong><button type="button" onClick={() => copyCredential(value, type)} aria-label={`Copy ${label}`} className="mn-icon-button shrink-0">{copied === type ? <Check className="h-4 w-4 text-[var(--mn-green)]" /> : <Copy className="h-4 w-4" />}</button></div></div>)}
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--mn-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => printCredentialSheet(credResult)} className="mn-button mn-button-secondary"><Printer className="h-4 w-4" />Print / save PDF</button>
              <label className="flex items-start gap-3 text-xs leading-5 text-zinc-400"><input type="checkbox" checked={hasConfirmedSave} onChange={(event) => setHasConfirmedSave(event.target.checked)} className="mt-1 accent-violet-500" /><span>I have saved both credentials.</span></label>
            </div>
            <button type="button" onClick={continueToLogin} disabled={!hasConfirmedSave} className="mn-button mn-button-primary mt-5 w-full">Continue to team sign in<ArrowRight className="h-4 w-4" /></button>
          </div>
        </ModalLayer>
      )}
    </div>
  );
}
