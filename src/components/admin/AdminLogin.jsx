import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Loader2, Shield, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLogin() {
  const { signInAdmin } = useAuth();
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!login.trim() || !password.trim()) {
      setError('Admin login and password are required.');
      return;
    }
    setLoading(true);
    try {
      await signInAdmin(login.trim(), password.trim());
      setSuccess(true);
      setTimeout(() => navigate('/admin'), 600);
    } catch (authError) {
      console.error('Admin login error:', authError);
      setError(authError.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mn-access-layout grid min-h-[calc(100vh-250px)] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-24">
      <section className="mn-access-copy max-w-3xl">
        <span className="mn-kicker"><Shield className="h-3.5 w-3.5" /> Administrator access</span>
        <h1 className="mt-6 mn-title">Run the event with a clear view of every phase.</h1>
        <p className="mt-6 mn-lede">Authorized organizers can manage teams, questions, theme capacity, allocations, results, and homepage content.</p>
        <div className="mt-10 hidden grid-cols-3 border-l border-t border-[var(--mn-line)] md:grid">
          {['Event phases', 'Team allocation', 'Public content'].map((item, index) => <div key={item} className="mn-panel-soft min-h-28 rounded-none border-0 border-b border-r border-[var(--mn-line)] p-4"><span className="mn-label">0{index + 1}</span><strong className="mt-7 block text-sm font-medium">{item}</strong></div>)}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mn-panel mn-access-card space-y-6">
        <div><span className="mn-label">Secure sign in</span><h2 className="mt-2 font-['Syne'] text-2xl font-semibold">Admin account</h2><p className="mt-2 text-sm text-[var(--mn-muted)]">Use the credentials configured for this Firebase project.</p></div>
        {error && <div role="alert" className="mn-alert mn-alert-error"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        {success && <div role="status" className="mn-alert mn-alert-success"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />Signed in. Opening the admin workspace…</div>}
        <label className="mn-field"><span className="mn-label">Admin login or email</span><input type="text" value={login} onChange={(event) => setLogin(event.target.value)} placeholder="Admin login" autoComplete="username" required className="mn-input" /></label>
        <label className="mn-field"><span className="mn-label">Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete="current-password" required className="mn-input" /></label>
        <button type="submit" disabled={loading || success} className="mn-button mn-button-primary w-full">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in</> : <>Open admin workspace<ArrowRight className="h-4 w-4" /></>}</button>
      </form>
    </div>
  );
}
