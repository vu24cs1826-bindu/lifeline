import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../api/intelligence';
import {
  Cpu,
  Play,
  RotateCcw,
  AlertOctagon,
  Clock,
  Layers,
  Hospital,
  Droplet,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function CrisisSimulationLab() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [rainOverride, setRainOverride] = useState(85);
  const [trafficOverride, setTrafficOverride] = useState(1.5);
  const [simulationResult, setSimulationResult] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    intelligenceApi.getSimulationScenarios()
      .then((res) => {
        const list = res.data.scenarios || [];
        setScenarios(list);
        if (list.length > 0) {
          setSelectedScenarioId(list[0].scenarioId);
          handleRun(list[0].scenarioId, rainOverride, trafficOverride);
        }
      })
      .catch((err) => console.error('Failed to load scenarios:', err));
  }, []);

  const handleRun = async (scenarioId = selectedScenarioId, rain = rainOverride, traffic = trafficOverride) => {
    setLoading(true);
    try {
      const res = await intelligenceApi.runSimulation(scenarioId, {
        rainfallMmPerHour: Number(rain),
        trafficLoadFactor: Number(traffic),
      });
      setSimulationResult(res.data.simulation);
      setActiveStepIndex(0);
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const steps = simulationResult?.timelineSteps || [];
  const currentStep = steps[activeStepIndex] || {};
  const baseline = simulationResult?.liveBaselineCapacity || {};
  const impactSummary = simulationResult?.estimatedImpactSummary || {};

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-5 rounded-2xl border border-purple-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl font-black text-white">Crisis Simulation Laboratory</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-700 uppercase">
              Municipal Stress-Testing Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            The flight simulator for disaster response. Run scenario propagation models, stress-test live hospital capacity,
            detect resource bottlenecks, and evaluate contingency plans before real crises occur.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            Transparent Mathematical Simulation
          </span>
        </div>
      </div>

      {/* Scenario Selection & Stress Parameters Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Select Crisis Scenario Template</label>
          <select
            value={selectedScenarioId}
            onChange={(e) => {
              setSelectedScenarioId(e.target.value);
              handleRun(e.target.value, rainOverride, trafficOverride);
            }}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-purple-500"
          >
            {scenarios.map((sc) => (
              <option key={sc._id} value={sc.scenarioId}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-bold uppercase text-slate-400">Precipitation Intensity</span>
            <span className="font-bold text-cyan-400">{rainOverride} mm / hr</span>
          </div>
          <input
            type="range"
            min="20"
            max="150"
            step="5"
            value={rainOverride}
            onChange={(e) => setRainOverride(e.target.value)}
            className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-bold uppercase text-slate-400">Traffic Impedance Factor</span>
              <span className="font-bold text-amber-400">{trafficOverride}x Jam</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={trafficOverride}
              onChange={(e) => setTrafficOverride(e.target.value)}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleRun(selectedScenarioId, rainOverride, trafficOverride)}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition shrink-0"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Simulation
          </button>
        </div>
      </div>

      {/* Interactive Timeline Stepper */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Disaster Propagation Timeline (Elapsed Time Step)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Click any step to inspect resource bottlenecks
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {steps.map((st, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`flex-1 min-w-[120px] p-3 rounded-xl border text-left transition ${
                activeStepIndex === idx
                  ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-500/20 text-white'
                  : 'bg-slate-800/60 border-slate-700/70 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-bold text-purple-400">T+{st.tHours} Hours</span>
                <span className="text-[10px] text-slate-400">{st.spreadRadiusKm} km</span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium truncate">
                {st.projectedCasualties} casualties
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1 mt-1.5 overflow-hidden">
                <div
                  className={`h-full ${st.icuSaturationPercent >= 90 ? 'bg-red-500' : 'bg-purple-400'}`}
                  style={{ width: `${st.icuSaturationPercent}%` }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Affected Geographic Radius</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {currentStep.spreadRadiusKm || 1.2} <span className="text-xs text-slate-400">km</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Disaster footprint perimeter</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Projected Casualties</div>
          <div className="text-2xl font-black text-red-400 mt-1">
            {currentStep.projectedCasualties || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            +{(currentStep.projectedDisplacedPeople || 0).toLocaleString()} displaced citizens
          </p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Hospital ICU Saturation</div>
          <div className={`text-2xl font-black mt-1 ${currentStep.icuSaturationPercent >= 85 ? 'text-red-400' : 'text-amber-400'}`}>
            {currentStep.icuSaturationPercent || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">General Bed Load: {currentStep.hospitalBedUtilizationPercent}%</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Emergency Blood Deficit</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            -{currentStep.bloodDeficitUnits || 0} <span className="text-xs text-slate-400">units</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Primarily O-negative and B-negative</p>
        </div>
      </div>

      {/* Critical Bottlenecks & Evacuation Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Identified System Bottlenecks */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
            <AlertOctagon className="w-4 h-4 text-red-500" />
            Detected Operational Bottlenecks at T+{currentStep.tHours}h
          </div>

          <div className="space-y-2">
            {(currentStep.bottlenecks || []).map((bot, i) => (
              <div key={i} className="p-3 rounded-lg bg-red-950/20 border border-red-800/40 text-xs text-red-200 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0"></span>
                <span className="font-medium leading-relaxed">{bot}</span>
              </div>
            ))}
          </div>

          {/* Recommended Contingency Dispatches */}
          <div className="pt-2 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Contingency Response Package Generated
            </div>
            <div className="space-y-2">
              {(currentStep.recommendedDispatches || []).map((disp, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/80 text-xs flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">
                      {disp.quantity}x {disp.resourceType}
                    </div>
                    <div className="text-[11px] text-slate-400">Target: {disp.targetZone}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                    {disp.objective}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Evacuation Corridors & Pre-Disaster Mitigation Strategy */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Evacuation Corridor Status & Harmonic Mitigation
          </div>

          <div className="space-y-2">
            {(currentStep.evacuationRoutesStatus || []).map((rt, i) => {
              const isSubmerged = rt.status === 'submerged' || rt.status === 'blocked';
              return (
                <div key={i} className="p-3 rounded-lg bg-slate-800/70 border border-slate-700/80 text-xs flex items-center justify-between">
                  <span className="font-semibold text-white">{rt.route}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isSubmerged ? 'bg-red-950 text-red-300 border border-red-800' : rt.status === 'congested' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {rt.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mitigation Strategy Summary */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300 uppercase">Pre-Emptive Action Plan</span>
              <span className="font-bold text-emerald-400">
                Prevents ~{impactSummary.mitigationPotentialPercentage || 76}% of peak harm
              </span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              {(impactSummary.contingencyActionPlan || []).map((plan, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-900/70 p-2 rounded border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{plan}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
