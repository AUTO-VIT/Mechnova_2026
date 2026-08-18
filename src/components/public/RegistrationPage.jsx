import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { registerTeamApi } from '../../services/callableApi';
import { printCredentialSheet } from '../../utils/printCredentialDoc';
import { Users, Plus, Trash2, ShieldAlert, Copy, Printer, Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export function RegistrationPage() {
  const { eventData } = useEvent();
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState([
    { name: '', email: '', phone: '', role: 'Team Lead' },
    { name: '', email: '', phone: '', role: 'Hardware Lead' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credResult, setCredResult] = useState(null);
  const [hasConfirmedSave, setHasConfirmedSave] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const isRegistrationOpen = eventData?.registrationOpen !== false;

  const handleAddMember = () => {
    if (members.length >= 4) return;
    setMembers([...members, { name: '', email: '', phone: '', role: 'Developer' }]);
  };

  const handleRemoveMember = (idx) => {
    if (members.length <= 2) return;
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx, field, val) => {
    const updated = [...members];
    updated[idx][field] = val;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamName.trim()) {
      setError('Team Name is required.');
      return;
    }

    if (members.length < 2 || members.length > 4) {
      setError('Teams must consist of 2 to 4 members.');
      return;
    }

    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim() || !members[i].email.trim()) {
        setError(`Member ${i + 1} requires a valid Name and Email.`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await registerTeamApi({
        eventId: eventData?.id || 'default-event',
        teamName: teamName.trim(),
        members
      });

      if (res && res.success) {
        setCredResult({
          teamId: res.teamId,
          teamCode: res.teamCode,
          password: res.password,
          teamName: res.teamName,
          syntheticEmail: res.syntheticEmail,
          members
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed. Please check form inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handlePrint = () => {
    if (credResult) {
      printCredentialSheet(credResult);
    }
  };

  const handleCloseModal = () => {
    if (!hasConfirmedSave) return;
    setCredResult(null);
    navigate('/login');
  };

  return (
    <div className="w-full space-y-12">
      {/* Title */}
      <div className="space-y-3 pb-6 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-red-500 font-mono text-xs tracking-widest uppercase">
          <Users className="h-3.5 w-3.5" />
          <span>ROSTER INTAKE PROTOCOL</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Team Registration
        </h1>
        <p className="text-zinc-400 font-sans text-base max-w-3xl font-light">
          Register 2 to 4 team members. One-time passkeys and cryptographic team identifiers will be issued upon submission.
        </p>
      </div>

      {!isRegistrationOpen ? (
        <div className="py-24 text-center border border-white/10 rounded-3xl bg-white/[0.02] text-red-400 font-mono text-sm">
          Registration is currently closed by event administration.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Summary Wing (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-white/10 rounded-3xl p-8 bg-white/[0.02] space-y-6 sticky top-28">
              <span className="font-mono text-xs text-white font-bold uppercase tracking-wider block">
                REGISTRATION RULES
              </span>

              <div className="space-y-3 text-xs text-zinc-400 font-light leading-relaxed">
                <p>1. Teams require <strong>2 to 4 registered participants</strong>.</p>
                <p>2. Passkeys are displayed <strong>only once</strong> upon creation.</p>
                <p>3. The generated Team Code and Passkey give access to both the Quiz Arena and Theme Bidding.</p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] font-mono text-[11px] text-zinc-500">
                <span>SECURITY: Passkeys zero-stored in database</span>
              </div>
            </div>
          </div>

          {/* Right Form Wing (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {error && (
              <div className="border border-red-500/30 bg-red-500/10 p-4 rounded-2xl font-mono text-xs text-red-300 flex items-center gap-3">
                <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Team Name */}
            <div className="space-y-2">
              <label className="block font-mono text-xs text-zinc-400 uppercase tracking-wider">
                Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Autonomous Motion Squad"
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 font-sans text-base text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Members List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                  Roster Members ({members.length} / 4 Members)
                </span>
                {members.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-white hover:text-red-400 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {members.map((m, idx) => (
                  <div key={idx} className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-red-500 font-bold uppercase tracking-wider">
                        Member 0{idx + 1} {idx === 0 ? "(Lead)" : ""}
                      </span>
                      {members.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(idx)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        placeholder="Full Name *"
                        required
                        className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="email"
                        value={m.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        placeholder="Email Address *"
                        required
                        className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        value={m.role}
                        onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                        placeholder="Role (e.g. Kinematics)"
                        className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-white/[0.08]">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] px-10 py-4 rounded-full hover:bg-zinc-200 transition-all duration-200 shadow-lg active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>PROVISIONING CREDENTIALS...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM &amp; GENERATE PASSKEYS</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* CREDENTIAL MODAL */}
      {credResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-2xl">
          <div className="w-full max-w-xl bg-void border border-white/20 rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <span className="font-mono text-xs text-red-500 uppercase tracking-widest block font-bold">
                CREDENTIALS GENERATED
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Save Your Access Keys
              </h2>
              <p className="text-zinc-400 text-xs font-light">
                Passkeys are generated once and never stored plaintext in databases. Save or print this sheet immediately.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Code */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">TEAM CODE</span>
                  <span className="font-mono text-2xl font-bold text-white tracking-widest">{credResult.teamCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(credResult.teamCode, 'code')}
                  className="font-mono text-xs text-zinc-300 hover:text-white px-4 py-2 rounded-xl border border-white/10 bg-white/[0.05]"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400 inline" /> : <Copy className="h-3.5 w-3.5 inline" />}
                  <span className="ml-1.5">{copiedCode ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              {/* Password */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">SECRET PASSKEY</span>
                  <span className="font-mono text-2xl font-bold text-red-400 tracking-widest">{credResult.password}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(credResult.password, 'pass')}
                  className="font-mono text-xs text-zinc-300 hover:text-white px-4 py-2 rounded-xl border border-white/10 bg-white/[0.05]"
                >
                  {copiedPass ? <Check className="h-3.5 w-3.5 text-emerald-400 inline" /> : <Copy className="h-3.5 w-3.5 inline" />}
                  <span className="ml-1.5">{copiedPass ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 font-mono text-xs text-zinc-300 hover:text-white"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Download PDF</span>
              </button>

              <label className="flex items-center gap-2 font-mono text-xs text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConfirmedSave}
                  onChange={(e) => setHasConfirmedSave(e.target.checked)}
                  className="h-4 w-4 accent-red-600 rounded"
                />
                <span>I have saved these keys</span>
              </label>
            </div>

            <button
              type="button"
              disabled={!hasConfirmedSave}
              onClick={handleCloseModal}
              className="w-full bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full hover:bg-zinc-200 transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
            >
              <span>PROCEED TO SIGN IN</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
