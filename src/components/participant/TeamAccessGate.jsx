import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { KeyRound, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export function TeamAccessGate() {
  const { signInTeam } = useAuth();
  const navigate = useNavigate();

  const [teamCode, setTeamCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamCode.trim() || !password.trim()) {
      setError('8-Digit Team Code and Passkey are required.');
      return;
    }

    setLoading(true);
    try {
      await signInTeam(teamCode.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || 'Authentication failed. Please verify Team Code and Passkey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <ControlPanel
        title="TEAM ACCESS GATEWAY"
        subtitle="Authentication Terminal"
        badge={<StatusBadge status="SECURE GATE" variant="red" />}
        hazardBorder={true}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {error && (
            <div className="border border-red-500/50 bg-red-950/60 p-3 font-mono text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1.5">
              8-DIGIT TEAM CODE *
            </label>
            <input
              type="text"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              placeholder="e.g. AUTO-7892"
              required
              className="w-full border border-zinc-700 bg-black px-4 py-2.5 font-mono text-sm font-bold text-red-400 tracking-wider focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1.5">
              SECRET PASSKEY *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passkey"
              required
              className="w-full border border-zinc-700 bg-black px-4 py-2.5 font-mono text-sm text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-3 font-mono text-xs font-extrabold uppercase tracking-widest text-white transition-all hover:bg-red-500 active:scale-[0.97] shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
          >
            <span>{loading ? "VERIFYING IDENTITY..." : "AUTHENTICATE TEAM GATE"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between font-mono text-[11px]">
            <span className="text-zinc-500">Unregistered team?</span>
            <Link to="/register" className="text-red-400 hover:underline font-bold">
              REGISTER NEW TEAM &rarr;
            </Link>
          </div>
        </form>
      </ControlPanel>
    </div>
  );
}
