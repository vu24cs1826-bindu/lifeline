import React, { useEffect, useState } from 'react';
import { adminApi, communityApi } from '../api/intelligence';
import { FileText, ShieldAlert, CheckCircle, XCircle, Clock, Search, RefreshCw } from 'lucide-react';

export default function AuditWorkspace() {
  const [logs, setLogs] = useState([]);
  const [moderationReports, setModerationReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const [logsRes, modRes] = await Promise.all([
        adminApi.getAuditLogs({ limit: 40 }).catch(() => ({ data: { logs: [] } })),
        communityApi.getModerationQueue().catch(() => ({ data: { reports: [] } })),
      ]);
      setLogs(logsRes.data.logs || []);
      setModerationReports(modRes.data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const handleModerateReport = async (id, status) => {
    try {
      await communityApi.moderate(id, status, 'Approved in Audit Workspace');
      loadAuditData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-extrabold text-white">Audit & Verification Workspace</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Immutable Governance Trail
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Cryptographically logged audit trail of all incident dispatches, responder assignments, cluster syntheses,
            and administrative actions with origin IP tracking.
          </p>
        </div>

        <button
          onClick={loadAuditData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Moderation Review Queue for Citizen Hazard Reports */}
      {moderationReports.length > 0 && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Pending Citizen Hazard Reports ({moderationReports.length})
            </h2>
            <span className="text-xs text-slate-400">Requires human moderation before map display</span>
          </div>

          <div className="space-y-3">
            {moderationReports.map((r) => (
              <div key={r._id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-white text-sm">{r.title}</div>
                  <div className="text-slate-300 mt-0.5">{r.description}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{r.address} &bull; Category: {r.category}</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleModerateReport(r._id, 'verified')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Verify & Publish
                  </button>
                  <button
                    onClick={() => handleModerateReport(r._id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-semibold transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white">System Audit Trail ({logs.length} events)</h2>
          <span className="text-xs text-slate-400 font-mono">Real database records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white">{log.actor?.name || 'System / Admin'}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-cyan-400 font-semibold">{log.action}</span>
                  </td>
                  <td className="p-3 text-slate-300">{log.entityType}</td>
                  <td className="p-3 font-mono text-slate-400">{log.ip || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
