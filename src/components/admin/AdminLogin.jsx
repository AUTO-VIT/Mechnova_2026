import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setAdminClaimApi } from '../../services/callableApi';
import { Shield, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';

export function AdminLogin() {
  const { signInAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [bootstrapKey, setBootstrapKey] = useState('');
  const [bootstrapMsg, setBootstrapMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Admin Email and Password are required.');
      return;
    }

    setLoading(true);
    try {
      await signInAdmin(email.trim(), password.trim());
      navigate('/admin');
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapClaim = async () => {
    if (!bootstrapKey.trim()) return;
    setLoading(true);
    setError('');
    setBootstrapMsg('');
    try {
      const res = await setAdminClaimApi({
        targetEmail: email.trim(),
        passkey: bootstrapKey.trim()
      });
      if (res && res.success) {
        setBootstrapMsg('Admin custom claim granted. You can now sign in.');
        setShowBootstrap(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Bootstrap authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="h-10 w-10 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
          <Shield className="h-4 w-4" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
          Admin Console
        </h1>
        <p className="text-zinc-400 text-sm font-light">
          Privileged authentication for event administration and theme reveals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-3.5 rounded-xl font-mono text-xs text-red-300 flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {bootstrapMsg && (
          <div className="border border-emerald-500/30 bg-emerald-500/10 p-3.5 rounded-xl font-mono text-xs text-emerald-300">
            {bootstrapMsg}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block font-mono text-xs text-zinc-400 uppercase tracking-wider">
            Admin Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@hackathon.internal"
            required
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:bg-white/[0.06] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block font-mono text-xs text-zinc-400 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 font-sans text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:bg-white/[0.06] transition-all"
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
              <span>SIGN IN TO CONSOLE</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2 font-mono text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => setShowBootstrap(!showBootstrap)}
            className="hover:text-zinc-300 underline"
          >
            Bootstrap Admin Claim
          </button>
        </div>
      </form>

      {showBootstrap && (
        <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.02] space-y-4 font-mono text-xs">
          <div className="text-amber-400 font-bold uppercase">
            Initial Bootstrap Claim Setup
          </div>
          <p className="text-zinc-400 text-xs font-light">
            Assigns custom claim <code>{`{ admin: true }`}</code> to the specified admin email.
          </p>
          <input
            type="password"
            value={bootstrapKey}
            onChange={(e) => setBootstrapKey(e.target.value)}
            placeholder="Enter BOOTSTRAP_SECRET"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white"
          />
          <button
            type="button"
            onClick={handleBootstrapClaim}
            className="w-full bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl py-2.5 font-bold hover:bg-amber-500 hover:text-black transition-all"
          >
            Grant Admin Claim
          </button>
        </div>
      )}
    </div>
  );
}
