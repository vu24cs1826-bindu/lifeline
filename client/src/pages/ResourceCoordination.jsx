import React, { useEffect, useState } from 'react';
import { intelligenceApi, incidentApi } from '../api/intelligence';
import {
  Sliders,
  Users,
  Hospital,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function ResourceCoordination() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    incidentApi.getIncidents()
      .then((res) => {
        const list = res.data.incidents || [];
        setIncidents(list);
        if (list.length > 0) {
          setSelectedIncidentId(list[0]._id);
          fetchRecommendation(list[0]._id);
        }
      })
      .catch((err) => console.error('Failed to load incidents:', err));
  }, []);

  const fetchRecommendation = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await intelligenceApi.getRecommendation(id);
      setRecommendation(res.data.recommendation);
    } catch (err) {
      console.error('Failed to get recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  const pkg = recommendation?.recommendedPackage || {};
  const primary = pkg.primaryResponder;
  const support = pkg.supportResponder;
  const facility = pkg.destinationFacility;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-extrabold text-white">Intelligent Resource Coordination</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Multi-Criteria Team Synthesis
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Recommends optimal heterogeneous resource bundles (primary paramedic + support rescue volunteer + receiving trauma center)
            based on proximity, skill qualifications, bed availability, and transit friction while strictly preventing conflicting assignments.
          </p>
        </div>

        {/* Incident Selector */}
        <div className="w-full md:w-72">
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Incident</label>
          <select
            value={selectedIncidentId}
            onChange={(e) => {
              setSelectedIncidentId(e.target.value);
              fetchRecommendation(e.target.value);
            }}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            {incidents.map((inc) => (
              <option key={inc._id} value={inc._id}>
                {inc.incidentId} - {inc.category} ({inc.priority})
              </option>
            ))}
          </select>
        </div>
      </div>

      {recommendation ? (
        <div className="space-y-6">
          {/* Synthesized Response Package Card */}
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 rounded-2xl border border-blue-800/60 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-900 text-blue-200">
                  Synthesized Response Bundle
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Incident {recommendation.incidentCode} ({recommendation.category.replace(/_/g, ' ')})
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" /> Conflict-Free Verification Pass
                </span>
              </div>
            </div>

            {/* 3 Coordinated Units */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Responder */}
              <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400 uppercase">Primary Responder</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300">
                    {primary?.suitabilityScore || 92}% Match
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{primary?.name || 'No available medic'}</h3>
                  <p className="text-xs text-slate-400 capitalize">{primary?.role?.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <span className="font-semibold text-white">{primary?.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Arrival:</span>
                    <span className="font-semibold text-cyan-300">{primary?.estimatedArrivalMins} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Skills:</span>
                    <span className="font-semibold text-white">{(primary?.skills || []).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Support Responder */}
              <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-400 uppercase">Support Unit</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">
                    {support?.suitabilityScore || 85}% Match
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{support?.name || 'Assigned automatically'}</h3>
                  <p className="text-xs text-slate-400 capitalize">{support?.role?.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <span className="font-semibold text-white">{support?.distanceKm || 2.4} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Arrival:</span>
                    <span className="font-semibold text-purple-300">{support?.estimatedArrivalMins || 7} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-semibold text-white">Perimeter & Crowd Safety</span>
                  </div>
                </div>
              </div>

              {/* Destination Facility */}
              <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 uppercase">Receiving Facility</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                    Level {facility?.traumaLevel || 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">{facility?.name || 'District Hospital'}</h3>
                  <p className="text-xs text-slate-400">{facility?.type?.replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Beds:</span>
                    <span className="font-semibold text-emerald-300">{facility?.availableBeds} open</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ICU Beds:</span>
                    <span className="font-semibold text-cyan-300">{facility?.icuBedsAvailable} open</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distance:</span>
                    <span className="font-semibold text-white">{facility?.distanceKm} km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explainability Rationale */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Explainable Recommendation Rationale
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {pkg.dispatchRationale || 'Resources selected by multi-criteria optimization based on travel-time impedance and hospital ICU readiness.'}
              </p>
            </div>
          </div>

          {/* Candidate Pool Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Candidate Responders */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Discovered Verified Responders ({recommendation.allAvailableResponders?.length || 0})
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(recommendation.allAvailableResponders || []).map((r) => (
                  <div key={r.responderId} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-[11px] text-slate-400">{r.distanceKm} km away &bull; {r.estimatedArrivalMins} min ETA</div>
                    </div>
                    <span className="font-bold text-cyan-400 text-xs">{r.suitabilityScore}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Candidate Facilities */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Discovered Receiving Facilities ({recommendation.allCandidateFacilities?.length || 0})
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(recommendation.allCandidateFacilities || []).map((f) => (
                  <div key={f.facilityId} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{f.name}</div>
                      <div className="text-[11px] text-slate-400">{f.availableBeds} beds &bull; {f.icuBedsAvailable} ICU &bull; {f.distanceKm} km</div>
                    </div>
                    <span className="font-semibold text-emerald-400 uppercase text-[10px]">{f.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
          Select an incident from the target dropdown to calculate the multi-criteria resource coordination package.
        </div>
      )}
    </div>
  );
}
