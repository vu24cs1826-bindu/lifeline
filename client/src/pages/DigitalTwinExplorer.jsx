import React, { useEffect, useState } from 'react';
import LeafletMap from '../components/LeafletMap';
import { intelligenceApi } from '../api/intelligence';
import { MapPin, RefreshCw, Layers, ShieldAlert, Hospital, Droplet, Flame, Filter, Info } from 'lucide-react';

export default function DigitalTwinExplorer() {
  const [layers, setLayers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');

  const loadTwin = () => {
    setLoading(true);
    intelligenceApi.getDigitalTwin()
      .then((res) => {
        setLayers(res.data.layers || {});
      })
      .catch((err) => console.error('Failed to load digital twin:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTwin();
  }, []);

  const totalIncidents = layers.activeIncidents?.count || 0;
  const totalClusters = layers.macroSituationClusters?.count || 0;
  const totalRiskZones = layers.predictiveRiskZones?.count || 0;
  const totalFacilities = layers.infrastructureFacilities?.count || 0;

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-black text-white tracking-wide">Living Digital Twin Explorer</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Interactive Geospatial Grid
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time urban representation integrating active emergency calls, verified road hazards, hospital beds, and predictive risk heatmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time filter */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 text-xs border border-slate-700">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition ${timeFilter === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Live Real-Time
            </button>
            <button
              onClick={() => setTimeFilter('24h')}
              className={`px-2.5 py-1 rounded font-medium transition ${timeFilter === '24h' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Past 24h
            </button>
          </div>

          <button
            onClick={loadTwin}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Grid
          </button>
        </div>
      </div>

      {/* Grid Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Active Incidents</div>
            <div className="text-xl font-extrabold text-red-400">{totalIncidents}</div>
          </div>
          <Flame className="w-6 h-6 text-red-500/30" />
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Macro Clusters</div>
            <div className="text-xl font-extrabold text-purple-400">{totalClusters}</div>
          </div>
          <Layers className="w-6 h-6 text-purple-500/30" />
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Risk Sectors</div>
            <div className="text-xl font-extrabold text-amber-400">{totalRiskZones}</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-amber-500/30" />
        </div>
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Facilities Active</div>
            <div className="text-xl font-extrabold text-emerald-400">{totalFacilities}</div>
          </div>
          <Hospital className="w-6 h-6 text-emerald-500/30" />
        </div>
      </div>

      {/* Main Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <LeafletMap
            center={[16.3067, 80.4365]}
            zoom={13}
            layers={layers}
            height="680px"
          />
        </div>

        {/* Right Inspection Column */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Info className="w-4 h-4 text-cyan-400" />
              Digital Twin Legend
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                <div>
                  <div className="font-semibold text-white">Emergency Incidents</div>
                  <div className="text-[10px] text-slate-400">Live citizen calls under active triage</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                <div>
                  <div className="font-semibold text-white">Macro Situation Clusters</div>
                  <div className="text-[10px] text-slate-400">AI-fused multi-report incidents with buffer radius</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <div>
                  <div className="font-semibold text-white">Predictive Risk Sectors</div>
                  <div className="text-[10px] text-slate-400">Multi-factor vulnerable geographical zones</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <div>
                  <div className="font-semibold text-white">Medical Facilities</div>
                  <div className="text-[10px] text-slate-400">Hospitals, trauma units, and live ICU telemetry</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Active Clusters Feed */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
              <span>Active Clusters ({totalClusters})</span>
              <span className="text-[10px] text-slate-400">Auto-DBSCAN</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(layers.macroSituationClusters?.data || []).map((c) => (
                <div key={c._id} className="p-2.5 rounded-lg bg-slate-800/80 border border-purple-800/40 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-purple-300">{c.clusterId}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 font-bold">
                      {Math.round((c.confidence || 0.8) * 100)}% Conf
                    </span>
                  </div>
                  <div className="font-semibold text-white text-xs leading-snug">{c.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2">{c.predictedImpact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
