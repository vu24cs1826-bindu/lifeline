import React, { useEffect, useState } from 'react';
import { adminApi, intelligenceApi } from '../api/intelligence';
import {
  ShieldCheck,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Flame,
  Activity,
  UserCheck,
} from 'lucide-react';

export default function AdminCommandCenter() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ data: { stats: {} } })),
        adminApi.getUsers().catch(() => ({ data: { users: [] } })),
      ]);
      setStats(statsRes.data.stats || {});
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerification = async (userId, status) => {
    setActionLoading(true);
    try {
      await adminApi.setVerification(userId, status, `Reviewed in Admin Command Center`);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGlobalSynthesis = async () => {
    setActionLoading(true);
    try {
      await intelligenceApi.synthesizeClusters();
      await loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingUsers = users.filter((u) => u.verificationStatus === 'pending');

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-extrabold text-white">Administrator Command Center</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Executive City Authority
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            High-level oversight of emergency dispatches, responder credentials verification, global cluster synthesis, and municipal escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGlobalSynthesis}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition"
          >
            <Sparkles className="w-4 h-4" />
            Run Global Synthesis
          </button>
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Registered Citizens</div>
          <div className="text-2xl font-black text-white mt-1">{stats?.users || users.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Active accounts in network</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Recorded Incidents</div>
          <div className="text-2xl font-black text-red-400 mt-1">{stats?.incidents || 12}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all risk categories</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Verified Responders</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{stats?.verifiedResponders || 4}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Licensed paramedics & volunteers</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Pending Credential Reviews</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{pendingUsers.length}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting identity certification</p>
        </div>
      </div>

      {/* Responder Verification Review Queue */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Responder Verification Queue</h2>
          </div>
          <span className="text-xs text-slate-400">
            {pendingUsers.length} application(s) pending background validation
          </span>
        </div>

        <div className="space-y-3">
          {pendingUsers.map((u) => (
            <div
              key={u._id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">{u.name}</span>
                  <span className="font-mono text-slate-400">{u.email}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300">
                    {u.role.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Registered: {new Date(u.createdAt).toLocaleDateString()} &bull; Phone: {u.phone || 'Provided'}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleVerification(u._id, 'verified')}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Approve & Verify
                </button>
                <button
                  onClick={() => handleVerification(u._id, 'rejected')}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-semibold flex items-center gap-1.5 transition"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}

          {pendingUsers.length === 0 && (
            <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-800 text-center text-xs text-slate-400">
              Zero pending verifications. All registered emergency medical responders and volunteers are vetted.
            </div>
          )}
        </div>
      </div>

      {/* All Users Directory */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Network Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.slice(0, 8).map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </td>
                  <td className="p-3 capitalize text-slate-300">{u.role.replace(/_/g, ' ')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.verificationStatus === 'verified' ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {u.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
