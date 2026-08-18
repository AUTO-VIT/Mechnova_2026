import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, ShieldAlert, ArrowRight, Lock, Loader2 } from 'lucide-react';

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
      setError('Team Code and Passkey are required.');
      return;
    }

    setLoading(true);
    try {
      await signInTeam(teamCode.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || 'Authentication failed. Please check Team Code and Passkey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto text-zinc-400">
          <KeyRound className="h-4 w-4" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
          Team Portal
        </h1>
        <p className="text-zinc-400 text-sm font-light">
          Sign in using your generated Team Code and Passkey.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded-xl font-mono text-xs text-red-300 flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block font-mono text-xs text-zinc-400 uppercase tracking-wider">
            Team Code
          </label>
          <input
            type="text"
            value={teamCode}
            onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
            placeholder="e.g. AUTO-7892"
            required
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono text-xs text-zinc-400 uppercase tracking-wider">
            Passkey
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter secret passkey"
            required
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] py-3.5 rounded-full hover:bg-zinc-200 transition-all duration-200 shadow-md active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AUTHENTICATING...</span>
            </>
          ) : (
            <>
              <span>SIGN IN</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-center pt-4 border-t border-white/[0.08] font-mono text-xs text-zinc-500">
          <span>Need to register? </span>
          <Link to="/register" className="text-white hover:underline font-semibold ml-1">
            Register team
          </Link>
        </div>
      </form>
    </div>
  );
}
