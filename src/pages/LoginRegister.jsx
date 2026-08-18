// src/pages/LoginRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginRegister = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [role, setRole] = useState('participant'); // 'participant' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        await register(email, password, role, name);
      } else {
        await login(email, password, role);
      }
      navigate(role === 'admin' ? '/admin' : '/team');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUser = (demoRole) => {
    setError('');
    if (demoRole === 'admin') {
      login('admin@autohack.io', 'demo123', 'admin');
      navigate('/admin');
    } else {
      login('teamlead@cyberbotics.io', 'demo123', 'participant');
      navigate('/team');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-zinc-950 border border-zinc-800 p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-red-600 text-black font-mono text-[10px] font-bold px-3 py-0.5 uppercase tracking-widest">
          AUTH_GATEWAY
        </div>

        {/* Form Title */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black border border-red-600/60 mb-2">
            {role === 'admin' ? <Shield className="w-6 h-6 text-red-500" /> : <User className="w-6 h-6 text-red-500" />}
          </div>
          <h1 className="font-mono text-2xl font-extrabold text-white uppercase tracking-tight">
            {isRegisterMode ? 'CREATE ACCOUNT' : 'SYSTEM LOGIN'}
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            AUTHENTICATE TO ACCESS THE SCADA HACKATHON MATRIX
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black border border-zinc-800 mb-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => setRole('participant')}
            className={`py-2 px-3 flex items-center justify-center space-x-2 transition-all ${
              role === 'participant'
                ? 'bg-red-950/60 text-white border border-red-800 font-bold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>PARTICIPANT</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2 px-3 flex items-center justify-center space-x-2 transition-all ${
              role === 'admin'
                ? 'bg-red-600 text-white font-bold shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>ADMINISTRATOR</span>
          </button>
        </div>

        {/* Quick Demo Login Presets */}
        <div className="bg-black border border-zinc-900 p-3 mb-6 space-y-2 font-mono text-xs">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">⚡ INSTANT DEMO PRESETS:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoUser('participant')}
              className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[11px] truncate text-center"
            >
              Demo Team Lead
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoUser('admin')}
              className="py-1.5 px-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-[11px] truncate text-center"
            >
              Demo Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-200 p-3 text-xs font-mono mb-6 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {isRegisterMode && (
            <div>
              <label className="block text-zinc-400 uppercase tracking-wider mb-1">FULL NAME / HANDLE</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CyberLead"
                  className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2.5 text-white placeholder-zinc-700 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-zinc-400 uppercase tracking-wider mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === 'admin' ? 'admin@autohack.io' : 'teamlead@cyberbotics.io'}
                className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2.5 text-white placeholder-zinc-700 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 uppercase tracking-wider mb-1">PASSWORD</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black border border-zinc-800 focus:border-red-600 px-3 py-2.5 text-white placeholder-zinc-700 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(220,38,38,0.3)] mt-6"
          >
            <span>{isRegisterMode ? 'REGISTER OPERATOR' : 'AUTHENTICATE SESSION'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-6 text-center text-xs font-mono text-zinc-500">
          {isRegisterMode ? 'Already have an operator account?' : "Don't have an operator account?"}{' '}
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-red-500 underline font-bold hover:text-red-400 ml-1"
          >
            {isRegisterMode ? 'SIGN IN' : 'REGISTER'}
          </button>
        </div>
      </div>
    </div>
  );
};
