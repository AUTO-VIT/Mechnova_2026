import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../../context/EventContext';
import { registerTeamApi } from '../../services/callableApi';
import { printCredentialSheet } from '../../utils/printCredentialDoc';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Users, Plus, Trash2, ShieldAlert, Copy, Printer, Check, ArrowRight } from 'lucide-react';

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
  const [credResult, setCredResult] = useState(null); // Single Display Modal State
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Registration Header */}
      <div className="border border-white/10 bg-zinc-950 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-500" />
            <h1 className="font-mono text-xl font-bold uppercase tracking-wider text-white">
              TEAM REGISTRATION GATEWAY
            </h1>
          </div>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Register your robotics team. Synthetic team credentials will be issued immediately upon submission.
          </p>
        </div>

        <StatusBadge
          status={isRegistrationOpen ? "REGISTRATION OPEN" : "CLOSED"}
          variant={isRegistrationOpen ? "emerald" : "zinc"}
        />
      </div>

      {/* Main Registration Form */}
      <ControlPanel title="SYNTHETIC IDENTITY PROVISIONING" subtitle="Roster Setup">
        {!isRegistrationOpen ? (
          <div className="p-6 text-center font-mono text-sm text-red-400">
            Registration is currently CLOSED by administrative directive.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            {error && (
              <div className="border border-red-500/50 bg-red-950/60 p-3 font-mono text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Team Name Input */}
            <div>
              <label className="block font-mono text-xs uppercase font-bold text-zinc-300 mb-2">
                TEAM NAME *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. CyberRobotics Squad 01"
                required
                className="w-full border border-zinc-700 bg-black px-4 py-2.5 font-mono text-sm text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Members Section (2-4 Members) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-mono text-xs uppercase font-bold text-zinc-300">
                  ROSTER MEMBERS ({members.length} / 4)
                </span>
                {members.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="flex items-center gap-1 border border-zinc-700 bg-zinc-900 px-3 py-1 font-mono text-[11px] font-bold text-zinc-300 transition-all hover:border-white hover:text-white active:scale-[0.97]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ADD MEMBER</span>
                  </button>
                )}
              </div>

              {members.map((m, idx) => (
                <div key={idx} className="border border-zinc-800 bg-zinc-900/50 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase text-red-400">
                      MEMBER 0{idx + 1} {idx === 0 ? "(TEAM LEAD)" : ""}
                    </span>
                    {members.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-zinc-500 hover:text-red-400 font-mono text-[11px]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] text-zinc-400 mb-1">FULL NAME *</label>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        placeholder="Name"
                        required
                        className="w-full border border-zinc-700 bg-black px-3 py-1.5 font-mono text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-zinc-400 mb-1">EMAIL *</label>
                      <input
                        type="email"
                        value={m.email}
                        onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                        placeholder="Email"
                        required
                        className="w-full border border-zinc-700 bg-black px-3 py-1.5 font-mono text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-zinc-400 mb-1">ROLE / TITLE</label>
                      <input
                        type="text"
                        value={m.role}
                        onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                        placeholder="e.g. Lead Dev"
                        className="w-full border border-zinc-700 bg-black px-3 py-1.5 font-mono text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 py-3.5 font-mono text-xs font-extrabold uppercase tracking-widest text-white transition-all hover:bg-red-500 active:scale-[0.97] shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:bg-zinc-800 disabled:text-zinc-600"
              >
                {loading ? "PROVISIONING SYNTHETIC IDENTITY..." : "PROVISION TEAM CREDENTIALS"}
              </button>
            </div>
          </form>
        )}
      </ControlPanel>

      {/* SINGLE DISPLAY CREDENTIAL MODAL */}
      {credResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl transform border-2 border-red-600 bg-zinc-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(220,38,38,0.5)] space-y-6">
            <div className="border-b border-red-900/50 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-mono text-lg font-black uppercase tracking-wider text-red-500">
                  CONFIDENTIAL TEAM ACCESS CREDENTIALS
                </h3>
                <p className="font-mono text-[10px] uppercase text-zinc-400">
                  SINGLE DISPLAY WARNING &bull; SAVE / PRINT IMMEDIATELY
                </p>
              </div>
              <StatusBadge status="ISSUED" variant="red" />
            </div>

            {/* Warning Banner */}
            <div className="border-l-4 border-red-600 bg-red-950/40 p-4 font-mono text-xs text-red-200 leading-relaxed">
              <strong>CRITICAL NOTICE:</strong> Passkeys are generated once and are <strong>NEVER stored raw in the database</strong>. If you close this window without saving or printing, access cannot be recovered without admin reset.
            </div>

            {/* Credential Data Box */}
            <div className="border border-white/15 bg-black p-5 space-y-4 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block">TEAM NAME</span>
                  <span className="text-base font-bold text-white">{credResult.teamName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block">SYNTHETIC EMAIL</span>
                  <span className="text-xs text-zinc-400">{credResult.syntheticEmail}</span>
                </div>
              </div>

              {/* Team Code */}
              <div className="flex items-center justify-between bg-zinc-900 p-3 border border-zinc-800">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block">8-DIGIT TEAM CODE</span>
                  <span className="text-xl font-extrabold text-red-400 tracking-widest">{credResult.teamCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(credResult.teamCode, 'code')}
                  className="flex items-center gap-1 border border-zinc-700 bg-black px-3 py-1 text-xs text-zinc-300 hover:text-white"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              {/* Passkey */}
              <div className="flex items-center justify-between bg-zinc-900 p-3 border border-zinc-800">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 block">SECRET PASSKEY</span>
                  <span className="text-xl font-extrabold text-amber-400 tracking-widest">{credResult.password}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(credResult.password, 'pass')}
                  className="flex items-center gap-1 border border-zinc-700 bg-black px-3 py-1 text-xs text-zinc-300 hover:text-white"
                >
                  {copiedPass ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPass ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Print & Save Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 border border-red-500/50 bg-red-950/60 px-5 py-2.5 font-mono text-xs font-bold text-red-300 hover:bg-red-600 hover:text-white active:scale-[0.97]"
              >
                <Printer className="h-4 w-4" />
                <span>PRINT / SAVE CREDENTIAL SHEET PDF</span>
              </button>

              <label className="flex items-center gap-2 font-mono text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConfirmedSave}
                  onChange={(e) => setHasConfirmedSave(e.target.checked)}
                  className="h-4 w-4 accent-red-600"
                />
                <span>I have saved & printed these credentials</span>
              </label>
            </div>

            {/* Dismiss Modal Button */}
            <button
              type="button"
              disabled={!hasConfirmedSave}
              onClick={handleCloseModal}
              className="w-full bg-red-600 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-red-500 active:scale-[0.97] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>PROCEED TO TEAM ACCESS GATE</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
