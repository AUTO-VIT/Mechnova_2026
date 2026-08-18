import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setAdminClaimApi } from '../../services/callableApi';
import { ControlPanel } from '../common/ControlPanel';
import { StatusBadge } from '../common/StatusBadge';
import { Shield, ShieldAlert, ArrowRight } from 'lucide-react';

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
        setBootstrapMsg('ADMIN CLAIM GRANTED. Proceed with login.');
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
    <div className="mx-auto max-w-md px-4 py-16">
      <ControlPanel
        title="ADMINISTRATOR MISSION CONTROL"
        subtitle="Privileged Access Gate"
        badge={<StatusBadge status="ADMIN LOCK" variant="red" />}
        hazardBorder={true}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {error && (
            <div className="border border-red-500/50 bg-red-950/60 p-3 font-mono text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {bootstrapMsg && (
            <div className="border border-emerald-500/50 bg-emerald-950/60 p-3 font-mono text-xs text-emerald-300">
              {bootstrapMsg}
            </div>
          )}

          <div>
            <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1.5">
              ADMINISTRATOR EMAIL *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hackathon.internal"
              required
              className="w-full border border-zinc-700 bg-black px-4 py-2.5 font-mono text-sm text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-bold uppercase text-zinc-300 mb-1.5">
              ADMIN PASSWORD *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full border border-zinc-700 bg-black px-4 py-2.5 font-mono text-sm text-white focus:border-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 py-3 font-mono text-xs font-extrabold uppercase tracking-widest text-white transition-all hover:bg-red-500 active:scale-[0.97] shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
          >
            <span>{loading ? "VERIFYING CLAIMS..." : "AUTHENTICATE ADMIN CONSOLE"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="pt-3 border-t border-zinc-800 flex justify-between items-center font-mono text-[10px]">
            <button
              type="button"
              onClick={() => setShowBootstrap(!showBootstrap)}
              className="text-zinc-500 hover:text-zinc-300 underline"
            >
              INITIAL SETUP / BOOTSTRAP CLAIM
            </button>
          </div>
        </form>

        {showBootstrap && (
          <div className="mt-4 border-t border-zinc-800 pt-4 space-y-3 font-mono">
            <div className="text-xs text-amber-400 font-bold uppercase">
              INITIAL BOOTSTRAP CLAIM AUTHORIZATION
            </div>
            <p className="text-[10px] text-zinc-400">
              Assigns custom claim <code>{`{ admin: true }`}</code> to the specified admin email.
            </p>
            <input
              type="password"
              value={bootstrapKey}
              onChange={(e) => setBootstrapKey(e.target.value)}
              placeholder="Enter BOOTSTRAP_SECRET"
              className="w-full border border-zinc-700 bg-black px-3 py-1.5 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleBootstrapClaim}
              className="w-full border border-amber-500/50 bg-amber-950/60 py-2 text-xs font-bold text-amber-300 hover:bg-amber-600 hover:text-white"
            >
              GRANT ADMIN CLAIM
            </button>
          </div>
        )}
      </ControlPanel>
    </div>
  );
}
