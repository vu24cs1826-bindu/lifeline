import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../api/intelligence';
import { Activity, Radio, CheckCircle2, AlertOctagon, Clock, ArrowRight, ShieldAlert } from 'lucide-react';

export default function TrafficCorridorPage() {
  const [corridor, setCorridor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const loadCorridor = () => {
    setLoading(true);
    intelligenceApi.getTrafficCorridors()
      .then((res) => setCorridor(res.data.corridor))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCorridor();
  }, []);

  const handleToggle = async () => {
    if (!corridor) return;
    setToggling(true);
    try {
      const res = await intelligenceApi.preemptTrafficCorridor(!corridor.active);
      setActionNotice(res.data.message);
      setCorridor(res.data.corridor);
      setTimeout(() => setActionNotice(''), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const isActive = corridor?.active;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">Smart Ambulance Green-Light Corridor</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Traffic Signal Preemption System
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Connects en-route emergency ambulances directly to municipal smart traffic lights.
            Preempts downstream intersections to GREEN 200 meters ahead, preventing intersection gridlock and saving critical transit minutes.
          </p>
        </div>

        {/* Master Preemption Switch */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`px-5 py-3 rounded-xl font-black text-xs shadow-xl transition flex items-center gap-2 shrink-0 ${
            isActive
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          <Radio className="w-4 h-4 animate-pulse" />
          {isActive ? 'Normalize Standard Signals' : 'ACTIVATE GREEN CORRIDOR'}
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Transit Time Impact Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Standard Transit Time (Traffic Jam)</div>
          <div className="text-2xl font-black text-slate-400 mt-1">18 <span className="text-xs">mins</span></div>
          <p className="text-[11px] text-slate-400 mt-0.5">Heavy congestion at cross junctions</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Preempted Corridor Transit Time</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">7 <span className="text-xs">mins</span></div>
          <p className="text-[11px] text-emerald-400 mt-0.5">Saves 11 critical resuscitation minutes</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Active Corridor Status</div>
          <div className={`text-sm font-extrabold mt-2 uppercase ${isActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}>
            {isActive ? '● ALL SIGNALS PREEMPTED GREEN' : '○ STANDARD CITY TIMING'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to Unit: {corridor?.ambulanceId}</p>
        </div>
      </div>

      {/* Visual Traffic Light Intersection Chain */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Ambulance Route Signal Preemption Chain
          </h2>
          <span className="text-xs text-slate-400 font-mono">Real-time signal state</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(corridor?.signals || []).map((sig, idx) => {
            const isGreen = sig.status === 'GREEN';
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition space-y-3 ${
                  isGreen
                    ? 'bg-emerald-950/20 border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : 'bg-slate-800/60 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">Junction {idx + 1}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isGreen ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
                  }`}>
                    {sig.status}
                  </span>
                </div>

                <div className="font-extrabold text-white text-sm">{sig.name}</div>

                {/* Simulated Traffic Light Housing */}
                <div className="w-12 mx-auto bg-slate-950 border-2 border-slate-800 rounded-2xl p-2 flex flex-col gap-2 items-center shadow-lg">
                  <div className={`w-6 h-6 rounded-full transition ${!isGreen ? 'bg-red-500 shadow-lg shadow-red-500/60' : 'bg-red-950 opacity-30'}`}></div>
                  <div className="w-6 h-6 rounded-full bg-yellow-950 opacity-30"></div>
                  <div className={`w-6 h-6 rounded-full transition ${isGreen ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80' : 'bg-emerald-950 opacity-30'}`}></div>
                </div>

                <div className="text-[11px] text-center text-slate-400">
                  {isGreen ? 'Preempted Green for Unit' : 'Standard 90s Cycle'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
