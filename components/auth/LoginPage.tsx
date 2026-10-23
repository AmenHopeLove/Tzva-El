'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import {
  Lock,
  Mail,
  Key,
  Shield,
  ArrowRight,
  CheckCircle2,
  User as UserIcon,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Music,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

export function LoginPage() {
  const { login, signUp, verifyResetAccount, resetPassword, allChoirs } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  // Shared / Alert State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup State
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupChoirId, setSignupChoirId] = useState(allChoirs[0]?.id || 'choir-1');
  const [signupVocalRole, setSignupVocalRole] = useState('Soprano');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [maskedUserEmail, setMaskedUserEmail] = useState('');

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  // --- HANDLERS ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const ok = await login(loginIdentifier.trim(), loginPassword);
      setIsLoading(false);
      if (!ok) {
        setError('Invalid username/email or password. Please verify your credentials or use Forgot Password.');
      }
    } catch {
      setIsLoading(false);
      setError('An error occurred during sign in. Please try again.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!agreedToGuidelines) {
      setError('Please agree to the Worship Ministry guidelines and commitment statement.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = signUp({
        fullName: signupFullName,
        email: signupEmail,
        username: signupUsername || signupEmail.split('@')[0],
        password: signupPassword,
        phone: signupPhone,
        primaryChoirId: signupChoirId,
        vocalPart: signupVocalRole as any,
        role: 'MEMBER'
      });
      setIsLoading(false);

      if (!res.success) {
        setError(res.error || 'Failed to create account.');
      }
    }, 500);
  };

  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = verifyResetAccount(forgotIdentifier.trim());
      if (!res.success || !res.user) {
        setError(res.error || 'No account matching this username or email was found.');
        return;
      }
      // Mask email for display
      const email = res.user.email;
      const parts = email.split('@');
      const masked = parts[0].slice(0, 2) + '***@' + parts[1];
      setMaskedUserEmail(masked);
      setForgotStep(2);
      setSuccessMsg(`Recovery code generated for ${masked}. (Test verification code: 777-888)`);
    }, 450);
  };

  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = resetPassword(forgotIdentifier.trim(), newPassword);
      if (!res.success) {
        setError(res.error || 'Unable to reset password.');
        return;
      }

      setSuccessMsg('Your password has been successfully reset! You can now sign in.');
      setMode('login');
      setLoginIdentifier(forgotIdentifier);
      setLoginPassword('');
      setForgotStep(1);
    }, 500);
  };

  const fillQuickDemo = (user: string, pass: string) => {
    setLoginIdentifier(user);
    setLoginPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#060a12] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient Radial Orange/Amber Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-[#0b1120] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Church Logo & Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block p-1 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-full shadow-lg shadow-orange-500/40">
            <img
              src="/church-logo.png"
              alt="Church Official Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-white"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">TZVA EL</h1>
            <p className="text-xs text-orange-400 font-bold tracking-widest uppercase mt-0.5">
              Worship Ministry Management OS
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Sign In / Sign Up) */}
        {mode !== 'forgot' && (
          <div className="flex bg-[#0f172a] p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up / Register
            </button>
          </div>
        )}

        {/* Global Alert Messages */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-2xl text-rose-200 flex items-start gap-2.5 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-2xl text-emerald-200 flex items-start gap-2.5 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODE 1: SIGN IN FORM */}
        {/* ==================================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or admin@church.org"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                  className="text-orange-400 hover:text-orange-300 font-medium hover:underline text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0f172a] border-slate-700 text-orange-500 focus:ring-orange-500"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Worship Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Credentials Switcher */}
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-[11px] text-slate-500 mb-2 font-medium text-center">Quick Demo Testing Access:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillQuickDemo('admin', 'admin123')}
                  className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 p-2 rounded-xl text-left transition-all group"
                >
                  <p className="text-[11px] font-bold text-orange-400 group-hover:text-amber-300">Super Admin</p>
                  <p className="text-[10px] text-slate-400">admin / admin123</p>
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); }}
                  className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 hover:border-orange-500/40 p-2 rounded-xl text-left transition-all group"
                >
                  <p className="text-[11px] font-bold text-slate-300 group-hover:text-white">New Member?</p>
                  <p className="text-[10px] text-orange-400 underline">Sign Up Account →</p>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ==================================================================== */}
        {/* MODE 2: SIGN UP / REGISTRATION FORM */}
        {/* ==================================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Username (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. sjenkins"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@church.org"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Choir Assignment & Ministry Part */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Choir / Team</label>
                <select
                  value={signupChoirId}
                  onChange={(e) => setSignupChoirId(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
                >
                  {allChoirs.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0b1120]">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vocal Part / Role</label>
                <select
                  value={signupVocalRole}
                  onChange={(e) => setSignupVocalRole(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 text-xs"
                >
                  <option value="Soprano" className="bg-[#0b1120]">Soprano</option>
                  <option value="Alto" className="bg-[#0b1120]">Alto</option>
                  <option value="Tenor" className="bg-[#0b1120]">Tenor</option>
                  <option value="Bass" className="bg-[#0b1120]">Bass</option>
                  <option value="Musician" className="bg-[#0b1120]">Musician / Band</option>
                  <option value="Worship Leader" className="bg-[#0b1120]">Worship Leader</option>
                </select>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 6 chars"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    className={`w-full bg-[#0f172a] border rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none transition-all text-xs ${
                      signupConfirmPassword && signupConfirmPassword === signupPassword
                        ? 'border-emerald-500'
                        : 'border-slate-800 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {signupPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Password strength: <strong className="text-white">{passwordStrength.label}</strong></span>
                  {signupConfirmPassword && (
                    <span className={signupPassword === signupConfirmPassword ? 'text-emerald-400' : 'text-rose-400'}>
                      {signupPassword === signupConfirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-800'}`} />
                  <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-800'}`} />
                  <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-800'}`} />
                </div>
              </div>
            )}

            {/* Ministry Guidelines Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-slate-400 select-none text-[11px]">
                <input
                  type="checkbox"
                  required
                  checked={agreedToGuidelines}
                  onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0f172a] border-slate-700 text-orange-500 focus:ring-orange-500 mt-0.5"
                />
                <span>
                  I commit to punctual rehearsal attendance and worship ministry standards.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Join Worship Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ==================================================================== */}
        {/* MODE 3: FORGOT PASSWORD RECOVERY FLOW */}
        {/* ==================================================================== */}
        {mode === 'forgot' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); setForgotStep(1); }}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
              <span className="text-[11px] text-orange-400 font-semibold">Password Recovery (Step {forgotStep} of 2)</span>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotStep1} className="space-y-4">
                <p className="text-slate-300 text-xs leading-relaxed">
                  Enter your email address or username associated with your worship ministry account. We will verify your account to reset your password.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email or Username</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin@church.org or admin"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying account...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Account & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotStep2} className="space-y-3.5">
                <p className="text-slate-300 text-xs">
                  Account verified for <span className="text-amber-300 font-bold">{maskedUserEmail}</span>. Enter the verification code and set your new password.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    placeholder="e.g. 777-888"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-center tracking-widest font-mono text-sm focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Hint: Test recovery code is 777-888</p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reset Password & Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
