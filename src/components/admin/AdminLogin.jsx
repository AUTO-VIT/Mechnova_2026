import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ShieldAlert, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export function AdminLogin() {
  const { signInAdmin } = useAuth();
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!login.trim() || !password.trim()) {
      setError('Admin Login and Password are required.');
      return;
    }

    setLoading(true);
    try {
      await signInAdmin(login.trim(), password.trim());
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 600);
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="h-14 w-14 rounded-full border border-[#855AB4]/40 bg-[#221545]/80 flex items-center justify-center mx-auto text-[#B26FCB] shadow-[0_0_30px_rgba(178,111,203,0.3)]">
          <Shield className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-xs text-[#B26FCB] uppercase tracking-widest block font-bold">
            RESTRICTED ACCESS
          </span>
          <h1 className="font-sans text-3xl font-bold text-white tracking-tight">
            Admin Command
          </h1>
        </div>
        <p className="text-zinc-400 text-xs font-light">
          Privileged authentication for event administration and theme reveals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border border-[#855AB4]/30 rounded-3xl p-8 bg-[#221545]/60 backdrop-blur-2xl space-y-6 shadow-[0_0_50px_rgba(104,56,141,0.25)]">
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded-xl font-mono text-xs text-red-300 flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="border border-emerald-500/30 bg-emerald-500/10 p-3.5 rounded-xl font-mono text-xs text-emerald-300 flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>Authenticated successfully. Redirecting to console...</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
            Admin Login / ID
          </label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="e.g. Smec@clubs26"
            required
            className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B26FCB] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono text-xs text-zinc-300 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
            className="w-full bg-[#110515] border border-[#855AB4]/40 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#B26FCB] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-[#68388D] hover:bg-[#855AB4] text-white font-mono text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full transition-all duration-200 shadow-[0_0_25px_rgba(178,111,203,0.35)] active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2 border border-[#B26FCB]/40"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AUTHENTICATING...</span>
            </>
          ) : (
            <>
              <span>SIGN IN TO CONSOLE</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
