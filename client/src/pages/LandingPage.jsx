import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { intelligenceApi } from '../api/intelligence';
import {
  ShieldAlert,
  Radio,
  Cpu,
  MapPin,
  TrendingUp,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Flame,
  Hospital,
  Activity,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const [pulse, setPulse] = useState({
    clusters: 0,
    riskZones: 0,
    availableIcuBeds: 0,
    activeIncidents: 0,
    loading: true,
  });

  useEffect(() => {
    intelligenceApi.getDigitalTwin()
      .then((res) => {
        const layers = res.data.layers || {};
        const facilities = layers.infrastructureFacilities?.data || [];
        const icuBeds = facilities.reduce((sum, f) => sum + (f.icuBedsAvailable || 0), 0);
        setPulse({
          clusters: layers.macroSituationClusters?.count || 1,
          riskZones: layers.predictiveRiskZones?.count || 3,
          availableIcuBeds: icuBeds,
          activeIncidents: layers.activeIncidents?.count || 2,
          loading: false,
        });
      })
      .catch(() => {
        setPulse((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  const QUESTIONS = [
    {
      q: '1. What is happening around us?',
      a: 'LifeLine continuously ingests citizen SOS alerts, verified community road hazards, and sensor telemetry, grouping fragmented micro-reports into unified Macro-Situation Clusters.',
      badge: 'Situation Clustering Engine',
    },
    {
      q: '2. What could happen next?',
      a: 'The Predictive Risk Engine evaluates multi-factor vulnerability—combining rainfall depth, traffic friction, and historical crash density—to identify flashpoints before disaster occurs.',
      badge: 'Predictive Risk Intelligence',
    },
    {
      q: '3. Where are people and infrastructure at risk?',
      a: 'The Living Digital Twin GIS projects dynamic risk sectors, submerged causeways, and structural deficits directly onto a high-resolution interactive geospatial grid.',
      badge: 'Living Digital Twin',
    },
    {
      q: '4. What resources are available to respond?',
      a: 'Tracks verified paramedics, volunteer fleets, trauma centers, oxygen reserves, and blood bank units in real-time with automated double-booking prevention.',
      badge: 'Resource Intelligence',
    },
    {
      q: '5. What is the best action to minimize harm?',
      a: 'Synthesizes heterogeneous response bundles (paramedic + extraction equipment + receiving ICU hospital) while the Prevention Engine generates civil engineering work orders.',
      badge: 'Coordinated Prevention',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 md:px-8 bg-gradient-to-b from-[#0B1222] via-[#080D1A] to-[#070B14] border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold tracking-wide">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            THE INTELLIGENCE LAYER FOR A SAFER WORLD
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Every Second Matters.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Intelligence Should Come Before Disaster.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            LifeLine is an AI-powered real-world intelligence and crisis prevention operating system.
            Moving beyond reactive SOS buttons into multi-source situation clustering, predictive risk modeling,
            and dynamic crisis simulations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/map"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition"
            >
              Launch Living Digital Twin
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/simulation"
              className="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              Crisis Simulation Laboratory
            </Link>
            <Link
              to="/citizen"
              className="px-6 py-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 font-semibold text-sm transition"
            >
              Citizen Safety Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Live Threat Pulse Bar */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Live City Safety Telemetry Pulse
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Aggregated from MongoDB & Sensor Feeds
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
                <Flame className="w-4 h-4" /> Macro Clusters Active
              </div>
              <div className="text-2xl font-black text-white">{pulse.clusters}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Spatio-temporal incident fusions</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                <ShieldAlert className="w-4 h-4" /> Evaluated Risk Sectors
              </div>
              <div className="text-2xl font-black text-white">{pulse.riskZones}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Dynamic Bayesian risk models</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                <Hospital className="w-4 h-4" /> Open ICU Trauma Beds
              </div>
              <div className="text-2xl font-black text-white">{pulse.availableIcuBeds}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Real-time facility telemetry</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1">
                <Activity className="w-4 h-4" /> Active Triage Incidents
              </div>
              <div className="text-2xl font-black text-white">{pulse.activeIncidents}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Under verified responder care</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Fundamental Questions LifeLine Solves */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Architectural Paradigm</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The 5 Questions LifeLine Answers</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Traditional 911/112 dispatch answers only who called. LifeLine provides predictive situational awareness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUESTIONS.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 inline-block">
                  {item.badge}
                </span>
                <h3 className="font-bold text-white text-base leading-snug">{item.q}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{item.a}</p>
              </div>
            </div>
          ))}

          {/* Differentiator Callout Card */}
          <div className="bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-800/50 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-900/80 text-purple-300 inline-block mb-2">
                STARTUP ADVANTAGE
              </span>
              <h3 className="font-bold text-white text-base mb-2">The Flight Simulator for Disasters</h3>
              <p className="text-xs text-slate-300">
                Explore the Crisis Simulation Lab to model extreme flooding and highway pileups, identifying hospital bed exhaustion before disasters strike.
              </p>
            </div>
            <Link
              to="/simulation"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition"
            >
              Open Simulation Lab <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core MVP Pillars */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Core Technological Moat</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Three Differentiating Pillars</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">1. Multi-Report Situation Clustering</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              DBSCAN spatial cohesion and temporal decay group 5 citizen calls reporting rising water into a single high-confidence "Developing Deluge" polygon with verification checklists.
            </p>
            <Link to="/incidents" className="text-xs font-semibold text-purple-400 hover:underline inline-block pt-2">
              View Situation Workspace &rarr;
            </Link>
          </div>

          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">2. Explainable Predictive Risk Index</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Contrasts simple Poisson frequency baselines against dynamic multi-factor models. Provides transparent factor attributions explaining why each zone is flagged.
            </p>
            <Link to="/predictive-risk" className="text-xs font-semibold text-amber-400 hover:underline inline-block pt-2">
              Inspect Risk Models &rarr;
            </Link>
          </div>

          <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">3. Crisis Simulation Laboratory</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stress-test urban resilience against extreme rainfall and mass casualties. Detects ICU bed exhaustion timelines and auto-generates contingency diversion plans.
            </p>
            <Link to="/simulation" className="text-xs font-semibold text-cyan-400 hover:underline inline-block pt-2">
              Launch Crisis Simulator &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
