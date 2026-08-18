import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { registerTeamApi } from '../../services/callableApi';
import { printCredentialSheet } from '../../utils/printCredentialDoc';
import { Users, Plus, Trash2, ShieldAlert, Copy, Printer, Check, ArrowRight, Loader2, Sparkles, Lock } from 'lucide-react';

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

    if (!isRegistrationOpen) {
      setError('Registration is currently CLOSED by event mission control.');
      return;
    }

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
      <div className="space-y-3 pb-6 border-b border-[#855AB4]/20">
        <div className="inline-flex items-center gap-2 text-[#B26FCB] font-mono text-xs tracking-widest uppercase">
          <Users className="h-3.5 w-3.5" />
          <span>ROSTER INTAKE PROTOCOL</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Team Registration
        </h1>
        <p className="text-zinc-300 font-sans text-base max-w-3xl font-light">
          Register 2 to 4 team members. One-time passkeys and cryptographic team transponder codes will be issued upon submission.
        </p>
      </div>

      {!isRegistrationOpen ? (
        <div className="py-24 text-center border border-[#855AB4]/30 rounded-3xl bg-[#221545]/60 backdrop-blur-xl p-12 space-y-4 shadow-[0_0_50px_rgba(104,56,141,0.2)]">
          <div className="h-16 w-16 rounded-full border border-[#855AB4]/40 bg-[#110515]/80 flex items-center justify-center mx-auto text-[#B26FCB]">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Registration is Closed
          </h2>
          <p className="text-zinc-400 font-sans text-sm max-w-md mx-auto font-light">
            The team intake window is currently closed by event administration. If your team is already registered, proceed directly to the portal.
          </p>
          <div className="pt-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all active:scale-95 shadow-[0_0_25px_rgba(178,111,203,0.35)] border border-[#B26FCB]/40"
            >
              <span>ACCESS TEAM COCKPIT</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Summary Wing (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/60 backdrop-blur-xl space-y-6 sticky top-28 shadow-[0_0_40px_rgba(104,56,141,0.15)]">
              <span className="font-mono text-xs text-white font-bold uppercase tracking-wider block">
                REGISTRATION RULES
              </span>

              <div className="space-y-3 text-xs text-zinc-300 font-light leading-relaxed">
                <p>1. Teams require <strong>2 to 4 registered participants</strong>.</p>
                <p>2. Passkeys are displayed <strong>only once</strong> upon creation.</p>
                <p>3. The generated Transponder Code and Passkey grant access to the Quiz Arena and Theme Bidding.</p>
              </div>

              <div className="pt-4 border-t border-[#855AB4]/20 font-mono text-[11px] text-[#B26FCB]/80">
                <span>SECURITY: Passkeys zero-stored in plaintext</span>
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
              <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                Team Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Celestial Robotics Squad"
                required
                className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-2xl px-5 py-4 font-sans text-base text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B26FCB] transition-all"
              />
            </div>

            {/* Members List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#855AB4]/20">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold">
                  Roster Members ({members.length} / 4 Members)
                </span>
                {members.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-[#B26FCB] hover:text-white transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {members.map((m, idx) => (
                  <div key={idx} className="border border-[#855AB4]/30 rounded-2xl p-6 bg-[#110515]/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#B26FCB] font-bold uppercase tracking-wider">
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
                        className="bg-[#221545]/60 border border-[#855AB4]/40 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B26FCB]"
                      />
                      <input
                        type="email"
                        value={m.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        placeholder="Email Address *"
                        required
                        className="bg-[#221545]/60 border border-[#855AB4]/40 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B26FCB]"
                      />
                      <input
                        type="text"
                        value={m.role}
                        onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                        placeholder="Role (e.g. Navigation)"
                        className="bg-[#221545]/60 border border-[#855AB4]/40 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B26FCB]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-[#855AB4]/20">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] px-10 py-4 rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(178,111,203,0.4)] active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2 border border-[#B26FCB]/40"
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
          <div className="w-full max-w-xl bg-[#221545] border border-[#855AB4]/50 rounded-3xl p-8 sm:p-10 space-y-6 shadow-[0_0_60px_rgba(104,56,141,0.4)]">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-widest block font-bold">
                CREDENTIALS GENERATED
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Save Your Access Keys
              </h2>
              <p className="text-zinc-300 text-xs font-light">
                Passkeys are generated once and never stored plaintext in databases. Save or print this sheet immediately.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Code */}
              <div className="bg-[#110515] border border-[#855AB4]/40 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase block">TRANSPONDER CODE</span>
                  <span className="font-mono text-2xl font-bold text-white tracking-widest">{credResult.teamCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(credResult.teamCode, 'code')}
                  className="font-mono text-xs text-zinc-300 hover:text-white px-4 py-2 rounded-xl border border-[#855AB4]/40 bg-[#221545]/60"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400 inline" /> : <Copy className="h-3.5 w-3.5 inline" />}
                  <span className="ml-1.5">{copiedCode ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              {/* Password */}
              <div className="bg-[#110515] border border-[#855AB4]/40 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase block">SECRET PASSKEY</span>
                  <span className="font-mono text-2xl font-bold text-[#B26FCB] tracking-widest">{credResult.password}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(credResult.password, 'pass')}
                  className="font-mono text-xs text-zinc-300 hover:text-white px-4 py-2 rounded-xl border border-[#855AB4]/40 bg-[#221545]/60"
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
                className="inline-flex items-center gap-2 font-mono text-xs text-[#B26FCB] hover:text-white"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Download PDF</span>
              </button>

              <label className="flex items-center gap-2 font-mono text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConfirmedSave}
                  onChange={(e) => setHasConfirmedSave(e.target.checked)}
                  className="h-4 w-4 accent-[#68388D] rounded"
                />
                <span>I have saved these keys</span>
              </label>
            </div>

            <button
              type="button"
              disabled={!hasConfirmedSave}
              onClick={handleCloseModal}
              className="w-full bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(178,111,203,0.4)] border border-[#B26FCB]/40"
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
