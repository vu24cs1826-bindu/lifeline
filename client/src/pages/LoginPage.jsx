import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, User, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, register, switchDemoPersona, loading } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('citizen');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      const res = await register(name, email, password, role);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.error || 'Registration failed');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.error || 'Login failed. Check your credentials.');
      }
    }
  };

  const [demoSelectedNotice, setDemoSelectedNotice] = useState('');

  const handleQuickDemo = (demoAccount) => {
    setIsRegister(false);
    setErrorMsg('');
    setEmail(demoAccount.email);
    setPassword(demoAccount.password);
    setDemoSelectedNotice(`Filled credentials for ${demoAccount.label}. Click the 'Sign In' button below to log in.`);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center p-4 bg-[#070B14]">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            {isRegister ? 'Create LifeLine Account' : 'Welcome to LifeLine'}
          </h1>
          <p className="text-xs text-slate-400">
            {isRegister
              ? 'Join as a citizen, volunteer, or emergency responder'
              : 'Sign in to access your dashboard and emergency tools'}
          </p>
        </div>

        {/* Quick Demo Examiner / Review Logins */}
        <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Quick Demo Logins
            </span>
            <span className="text-[10px] text-slate-400 font-normal">One-click testing</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => handleQuickDemo(d)}
                disabled={loading}
                className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-bold text-white text-[11px] truncate">{d.label}</div>
                <div className="text-[10px] text-slate-400 capitalize">{d.role.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Selection Feedback Banner */}
        {demoSelectedNotice && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{demoSelectedNotice}</span>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Login / Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-bold focus:outline-none focus:border-cyan-500"
              >
                <option value="citizen">Civilian Citizen (Report & Request Help)</option>
                <option value="volunteer">Community Volunteer (First Aid & Driving)</option>
                <option value="medical_responder">Medical Responder (Paramedic / Ambulance)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm shadow-lg shadow-cyan-600/25 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs">
          {isRegister ? (
            <p className="text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(false); setErrorMsg(''); }}
                className="text-cyan-400 hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-slate-400">
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegister(true); setErrorMsg(''); }}
                className="text-cyan-400 hover:underline font-bold"
              >
                Register Here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
