'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { Lock, Mail, Key, Shield, ArrowRight, CheckCircle2, User, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(usernameOrEmail, password);
    if (!success) {
      setError('Invalid username/email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Radial Orange Glow matching Church Branding */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#0b1120] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Church Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-block p-1 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full shadow-lg shadow-orange-500/40">
            <img
              src="/church-logo.png"
              alt="Church Official Logo"
              className="w-20 h-20 rounded-full object-cover bg-white"
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Worship Ministry</h1>
            <p className="text-xs text-orange-400 font-bold tracking-wider uppercase">Worship Ministry OS</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {error && (
            <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-xl text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Email or Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. admin@church.org or admin"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>Sign In to Worship Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>



      </div>
    </div>
  );
}
