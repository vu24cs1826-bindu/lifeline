import React, { useEffect, useState } from 'react';
import { incidentApi } from '../api/intelligence';
import { useAuth } from '../context/AuthContext';
import {
  LifeBuoy,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Check,
  X,
  Play,
  CheckCheck,
  RefreshCw,
} from 'lucide-react';

export default function ResponderWorkspace() {
  const { user } = useAuth();
  const [availableIncidents, setAvailableIncidents] = useState([]);
  const [assignedIncidents, setAssignedIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [availRes, assignRes] = await Promise.all([
        incidentApi.getAvailable().catch(() => ({ data: { incidents: [] } })),
        incidentApi.getAssigned().catch(() => ({ data: { incidents: [] } })),
      ]);
      setAvailableIncidents(availRes.data.incidents || []);
      setAssignedIncidents(assignRes.data.incidents || []);
      if (assignRes.data.incidents?.length > 0 && !selectedIncident) {
        setSelectedIncident(assignRes.data.incidents[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await incidentApi.acceptIncident(id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, note = '') => {
    setActionLoading(true);
    try {
      await incidentApi.updateStatus(id, status, note);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-extrabold text-white">Responder Mission Operational Workspace</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              Field Responder Unit
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Accept emergency calls, review approximate or exact GPS coordinates based on assignment status,
            and report mission progression (IN_PROGRESS &bull; RESOLVED).
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned & Available Incidents */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Assigned Missions */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
              <span>My Active Missions ({assignedIncidents.length})</span>
              <span className="text-[10px] text-slate-400">Assigned To You</span>
            </div>

            <div className="space-y-2.5">
              {assignedIncidents.map((inc) => {
                const isSelected = selectedIncident?._id === inc._id;
                return (
                  <div
                    key={inc._id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                      isSelected
                        ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-400 text-xs">{inc.incidentId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-800">
                        {inc.status}
                      </span>
                    </div>
                    <div className="text-white text-xs font-semibold">{inc.description}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{inc.address || 'Exact Coordinate Access Active'}</span>
                    </div>
                  </div>
                );
              })}

              {assignedIncidents.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800 text-center text-xs text-slate-400">
                  No active assignments currently claimed.
                </div>
              )}
            </div>
          </div>

          {/* Available In Radius (Pending Acceptance) */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span>Available Emergency Calls Nearby ({availableIncidents.length})</span>
              <span className="text-[10px] text-slate-400">Within 10 km</span>
            </div>

            <div className="space-y-2.5">
              {availableIncidents.map((inc) => (
                <div key={inc._id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-300">{inc.incidentId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950 text-red-300">
                      {inc.category}
                    </span>
                  </div>
                  <p className="text-slate-200">{inc.description}</p>
                  <div className="text-[11px] text-slate-400">Approximate Location (Protected until accepted)</div>

                  <button
                    onClick={() => handleAccept(inc._id)}
                    disabled={actionLoading}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Mission Dispatch
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mission Action Center */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-red-400">{selectedIncident.incidentId}</span>
                  <h2 className="text-xl font-black text-white mt-0.5">
                    {selectedIncident.category?.replace(/_/g, ' ').toUpperCase()} Mission
                  </h2>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-blue-950 text-blue-300 border border-blue-800">
                  {selectedIncident.status}
                </span>
              </div>

              {/* Exact Location & Contact Details */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase text-slate-400">Dispatched Location Details</div>
                <div className="text-white font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-400" />
                  {selectedIncident.address || 'Collectorate Low-Level Approach, Guntur'}
                </div>
                {selectedIncident.location && (
                  <div className="font-mono text-[11px] text-cyan-300">
                    GPS Coordinates: [{selectedIncident.location.coordinates[1].toFixed(5)}, {selectedIncident.location.coordinates[0].toFixed(5)}]
                  </div>
                )}
                {selectedIncident.reporter && (
                  <div className="text-slate-300 pt-1 border-t border-slate-700">
                    Citizen Caller: <strong>{selectedIncident.reporter.name}</strong> ({selectedIncident.reporter.phone || 'Emergency line active'})
                  </div>
                )}
              </div>

              {/* Mission Progression Controls */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mission Progression Step
                </div>

                {selectedIncident.status === 'RESPONDER_ASSIGNED' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedIncident._id, 'IN_PROGRESS', 'Responder en route to scene')}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition"
                  >
                    <Play className="w-4 h-4" /> Start Response (Mark IN_PROGRESS)
                  </button>
                )}

                {selectedIncident.status === 'IN_PROGRESS' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Resolution handover note (e.g. Patient stabilized and transferred to ambulance)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleStatusUpdate(selectedIncident._id, 'RESOLVED', resolutionNote || 'Mission successfully completed by responder')}
                      disabled={actionLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
                    >
                      <CheckCheck className="w-4 h-4" /> Resolve & Handover Mission (Mark RESOLVED)
                    </button>
                  </div>
                )}

                {selectedIncident.status === 'RESOLVED' && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> This mission is resolved and handed over.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
              Select an assigned mission from the left panel to execute status progression and view exact dispatched coordinates.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
