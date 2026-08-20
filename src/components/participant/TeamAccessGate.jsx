import React, { useState } from 'react';
import { ArrowRight, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function TeamAccessGate() {
  const { signInTeam } = useAuth();
  const navigate = useNavigate();
  const [teamCode, setTeamCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!teamCode.trim() || !password.trim()) {
      setError('Enter both your team code and passkey.');
      return;
    }
    setLoading(true);
    try {
      await signInTeam(teamCode.trim(), password.trim());
      navigate('/');
    } catch (signInError) {
      setError(signInError.message || 'Sign in failed. Check your team code and passkey.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mn-access-layout grid min-h-[650px] items-center gap-12 lg:grid-cols-[1fr_.8fr]">
      <section className="mn-access-copy"><div className="mn-kicker">Participant access</div><h1 className="mn-title mt-5">One login for your team.</h1><p className="mn-lede mt-6">Use the team code and passkey created during registration. The same account gives your team access to the quiz, preference submission, and results.</p><div className="mt-10 border-t border-[var(--mn-line)] pt-5 text-sm text-[var(--mn-faint)]">Not registered yet? <Link to="/register" className="text-[var(--mn-violet)] hover:text-white">Create a team</Link></div></section>
      <form onSubmit={handleSubmit} className="mn-panel mn-access-card p-7 sm:p-9">
        <div className="mb-8 flex items-center justify-between"><div><span className="mn-label">Team sign in</span><h2 className="mt-2 font-['Syne'] text-2xl font-semibold">Enter the portal</h2></div><KeyRound className="h-6 w-6 text-[var(--mn-violet)]" /></div>
        {error && <div role="alert" className="mn-alert mn-alert-error mb-5"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <div className="space-y-5"><label className="mn-field"><span className="mn-label">Team code</span><input className="mn-input font-mono uppercase" type="text" value={teamCode} onChange={(event) => setTeamCode(event.target.value.toUpperCase())} placeholder="AUTO-1234" autoComplete="username" required /></label><label className="mn-field"><span className="mn-label">Passkey</span><input className="mn-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your passkey" autoComplete="current-password" required /></label><button type="submit" disabled={loading} className="mn-button mn-button-primary mt-2 w-full">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : <>Sign in<ArrowRight className="h-4 w-4" /></>}</button></div>
      </form>
    </div>
  );
}
