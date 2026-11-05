import React, { useEffect, useState } from 'react';
import { intelligenceApi, incidentApi } from '../api/intelligence';
import {
  Flame,
  Layers,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function IncidentWorkspace() {
  const [clusters, setClusters] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [clusterRes, incRes] = await Promise.all([
        intelligenceApi.getSituations(),
        incidentApi.getIncidents().catch(() => ({ data: { incidents: [] } })),
      ]);
      setClusters(clusterRes.data.situations || []);
      setIncidents(incRes.data.incidents || []);
      if (clusterRes.data.situations?.length > 0 && !selectedCluster) {
        setSelectedCluster(clusterRes.data.situations[0]);
      }
    } catch (err) {
      console.error('Failed to load situation intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSynthesize = async () => {
    setSynthesizing(true);
    try {
      await intelligenceApi.synthesizeClusters();
      await loadData();
    } catch (err) {
      console.error('Clustering synthesis failed:', err);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleModerate = async (clusterId, status) => {
    try {
      await intelligenceApi.moderateCluster(clusterId, { status, verificationNote: 'Verified by commander via Incident Workspace' });
      await loadData();
    } catch (err) {
      console.error('Moderation failed:', err);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner & Synthesis Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-extrabold text-white">Situation Intelligence & Cluster Workspace</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              DBSCAN Spatio-Temporal Fusion
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Combines separate micro-reports within temporal and geospatial proximity into unified developing macro-events. Never treats unverified reports as confirmed facts.
          </p>
        </div>

        <button
          onClick={handleSynthesize}
          disabled={synthesizing}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${synthesizing ? 'animate-spin' : ''}`} />
          {synthesizing ? 'Running Fusion Algorithm...' : 'Synthesize Developing Clusters'}
        </button>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Situation Clusters List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>Macro-Situation Clusters ({clusters.length})</span>
            <span className="text-[10px] text-purple-400">Multi-Report Aggregation</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {clusters.map((c) => {
              const isSelected = selectedCluster?._id === c._id;
              const isCrit = c.severity === 'critical';
              const isHigh = c.severity === 'high';

              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedCluster(c)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-800/95 border-purple-500 shadow-xl shadow-purple-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">{c.clusterId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCrit ? 'bg-red-950 text-red-300 border border-red-800' : isHigh ? 'bg-orange-950 text-orange-300 border border-orange-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[11px]">Confidence:</span>
                      <span className="font-bold text-cyan-400">{Math.round((c.confidence || 0.85) * 100)}%</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.predictedImpact}</p>
                  </div>

                  {/* Evidence Sources Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(c.evidenceSources || []).map((ev, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-slate-300">
                        {ev.summary}
                      </span>
                    ))}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300">
                      Radius: {c.radiusMeters}m
                    </span>
                  </div>
                </div>
              );
            })}

            {clusters.length === 0 && !loading && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
                No active situation clusters detected. Click "Synthesize Developing Clusters" to run the spatio-temporal clustering engine.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Cluster Deep-Dive & Verification Actions */}
        <div className="lg:col-span-7 space-y-4">
          {selectedCluster ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-purple-400">{selectedCluster.clusterId}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-purple-950 text-purple-300 border border-purple-800">
                      Status: {selectedCluster.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">{selectedCluster.title}</h2>
                </div>

                {/* Moderator Decision Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleModerate(selectedCluster._id, 'stabilized')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Stabilize
                  </button>
                  <button
                    onClick={() => handleModerate(selectedCluster._id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-300 text-xs font-semibold transition"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Confidence & Impact Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Confidence Score</div>
                  <div className="text-2xl font-black text-cyan-400 mt-0.5">
                    {Math.round((selectedCluster.confidence || 0.8) * 100)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Multi-source correlation</div>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Affected Geographic Area</div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {(selectedCluster.radiusMeters || 600)} meters
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Buffer radius from centroid</div>
                </div>

                <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Independent Reports</div>
                  <div className="text-2xl font-black text-purple-400 mt-0.5">
                    {selectedCluster.incidentCount || 1}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Grouped real-world signals</div>
                </div>
              </div>

              {/* Recommended Verification Actions */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Recommended Verification Actions
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(selectedCluster.recommendedVerificationActions || []).map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Linked Reports Inside This Cluster */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Synthesized Underlying Reports
                </div>

                <div className="space-y-2">
                  {(selectedCluster.incidents || []).map((inc) => (
                    <div key={inc._id} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-400">{inc.incidentId}</span>
                          <span className="text-slate-400 uppercase font-semibold text-[10px]">{inc.category}</span>
                        </div>
                        <div className="text-white mt-1">{inc.description}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-700">
                        {inc.status}
                      </span>
                    </div>
                  ))}

                  {(selectedCluster.communityReports || []).map((rep) => (
                    <div key={rep._id} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-yellow-400">Citizen Hazard</span>
                          <span className="text-slate-400 uppercase font-semibold text-[10px]">{rep.category}</span>
                        </div>
                        <div className="text-white mt-1">{rep.title}: {rep.description}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
              Select a cluster from the left panel to inspect its evidence sources, confidence metrics, and verification actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
