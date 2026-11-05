import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../api/intelligence';
import {
  TrendingUp,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
  Layers,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export default function PredictiveRiskDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(null);

  const loadRisk = () => {
    setLoading(true);
    intelligenceApi.getPredictiveRisk()
      .then((res) => {
        setData(res.data);
        if (res.data.zones?.length > 0 && !selectedZone) {
          setSelectedZone(res.data.zones[0]);
        }
      })
      .catch((err) => console.error('Failed to load predictive risk:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRisk();
  }, []);

  const zones = data?.zones || [];
  const summary = data?.summary || {};

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white">Predictive Risk Intelligence Engine</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Explainable Dynamic ML Model
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Identifies locations with elevated future risk by combining historical incidents, weather vulnerability, traffic friction, and infrastructure deficits.
            Transparently compares against simple Poisson baselines.
          </p>
        </div>

        <button
          onClick={loadRisk}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Re-evaluate Sectors
        </button>
      </div>

      {/* Model vs Baseline Comparative Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Average Municipal Risk</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {summary.averageMunicipalRiskScore || 58} <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Weighted dynamic city average</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Severe Sectors Flagged</div>
          <div className="text-2xl font-black text-red-400 mt-1">
            {summary.severeRiskZonesCount || 1}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Critical proactive intervention needed</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Active Model Type</div>
          <div className="text-sm font-extrabold text-cyan-400 mt-1">Multi-Factor Bayesian</div>
          <p className="text-[11px] text-slate-400 mt-1">5 dynamic environmental weights</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Comparative Baseline</div>
          <div className="text-sm font-extrabold text-slate-300 mt-1">Poisson Historical Rate</div>
          <p className="text-[11px] text-slate-400 mt-1">Evaluated against simple baseline</p>
        </div>
      </div>

      {/* Main Grid: Zone Selector & Factor Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Zone List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Evaluated Geographic Sectors ({zones.length})
          </div>

          <div className="space-y-3">
            {zones.map((zone) => {
              const isSelected = selectedZone?._id === zone._id;
              const isSevere = zone.riskLevel === 'severe';
              const isElevated = zone.riskLevel === 'elevated';

              return (
                <div
                  key={zone._id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-800/95 border-amber-500 shadow-xl shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{zone.zoneCode}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isSevere ? 'bg-red-950 text-red-300 border border-red-800' : isElevated ? 'bg-orange-950 text-orange-300 border border-orange-800' : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}>
                        {zone.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] text-slate-400">Score:</span>
                      <span className="font-black text-amber-400 text-sm">{zone.predictedRisk}/100</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{zone.name}</h3>
                    <p className="text-xs text-slate-400">{zone.sector} &bull; Radius {zone.radiusMeters}m</p>
                  </div>

                  {/* Primary Driver Line */}
                  <div className="text-[11px] text-cyan-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 font-semibold">Primary Driver: </span>
                    {zone.explainability?.primaryDriver || 'Historical multi-crash hotspot'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Explainability & Contributing Factors */}
        <div className="lg:col-span-7">
          {selectedZone ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{selectedZone.zoneCode}</span>
                    <span className="text-xs font-semibold text-slate-400">{selectedZone.sector}</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">{selectedZone.name}</h2>
                </div>

                {/* Score Comparison Badge */}
                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Dynamic Model</div>
                    <div className="text-lg font-black text-amber-400">{selectedZone.predictedRisk}</div>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-700"></div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Baseline Rate</div>
                    <div className="text-lg font-black text-slate-400">{selectedZone.baselineRisk}</div>
                  </div>
                </div>
              </div>

              {/* Explainability Breakdown (Factor Contributions) */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Contributing Factor Attribution</span>
                  <span className="text-[10px] text-slate-400 font-mono">Normalized Impact Breakdown</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Weather & Flood Susceptibility', value: selectedZone.factors?.weatherVulnerability || 40, weight: '30%', color: 'bg-blue-500' },
                    { label: 'Historical Incident Density (90-day)', value: selectedZone.factors?.historicalIncidentDensity || 30, weight: '25%', color: 'bg-red-500' },
                    { label: 'Peak Traffic Congestion & Friction', value: selectedZone.factors?.trafficCongestion || 50, weight: '20%', color: 'bg-amber-500' },
                    { label: 'Civil Infrastructure & Lighting Deficit', value: selectedZone.factors?.infrastructureDeficit || 35, weight: '15%', color: 'bg-purple-500' },
                    { label: 'First Responder Transit Remoteness', value: selectedZone.factors?.responseRemoteness || 25, weight: '10%', color: 'bg-emerald-500' },
                  ].map((f, i) => (
                    <div key={i} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{f.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">Weight: {f.weight}</span>
                          <span className="font-bold text-slate-200">{f.value}/100</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${f.color}`} style={{ width: `${f.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainability Narrative Insights */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Model Insights & Explainability Reasoning
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(selectedZone.explainability?.insights || []).map((ins, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Preventative Mitigations */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Recommended Preventative Interventions
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedZone.recommendedMitigations || []).map((mit, i) => (
                    <div key={i} className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
                      <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{mit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
              Select a risk sector to inspect contributing factors and comparative model outputs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
