import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { ShieldAlert, Activity, User, LogOut, ChevronDown, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchDemoPersona, loading } = useAuth();
  const { connected } = useSocket();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const handlePersonaSelect = async (demo) => {
    setDropdownOpen(false);
    await switchDemoPersona(demo);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white">LIFELINE</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  v2.0 AI-OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block tracking-tight">
                Crisis Prevention & Situational Intelligence
              </p>
            </div>
          </Link>

          {/* System Telemetry Status */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {connected ? 'GRID LIVE' : 'CONNECTING...'}
            </span>
          </div>
        </div>

        {/* Center: Quick Live Workspace Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs">
          <Link
            to="/map"
            className={`px-3 py-1.5 rounded-md font-medium transition ${location.pathname === '/map' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
          >
            Digital Twin
          </Link>
          <Link
            to="/incidents"
            className={`px-3 py-1.5 rounded-md font-medium transition ${location.pathname === '/incidents' ? 'bg-red-500/15 text-red-400 border border-red-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
          >
            Situation Clusters
          </Link>
          <Link
            to="/predictive-risk"
            className={`px-3 py-1.5 rounded-md font-medium transition ${location.pathname === '/predictive-risk' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
          >
            Predictive Risk
          </Link>
          <Link
            to="/simulation"
            className={`px-3 py-1.5 rounded-md font-medium transition ${location.pathname === '/simulation' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
          >
            Crisis Lab
          </Link>
          <Link
            to="/coordination"
            className={`px-3 py-1.5 rounded-md font-medium transition ${location.pathname === '/coordination' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`}
          >
            Resource Engine
          </Link>
        </nav>

        {/* Right: Quick Demo Persona Switcher & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Demo Persona Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition shadow-sm"
              title="Switch demo persona for project review and testing"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-semibold text-white capitalize">
                {user ? user.role.replace(/_/g, ' ') : 'Select Persona'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Demo Persona (Instant Review)
                </div>
                <div className="space-y-1 mt-1">
                  {DEMO_ACCOUNTS.map((d) => (
                    <button
                      key={d.email}
                      onClick={() => handlePersonaSelect(d)}
                      disabled={loading}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-left transition ${user?.email === d.email ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-300'}`}
                    >
                      <div>
                        <div className="font-semibold">{d.label}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.email}</div>
                      </div>
                      {user?.email === d.email && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Status / Logout */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700/80 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
