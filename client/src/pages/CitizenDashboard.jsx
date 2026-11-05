import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/intelligence';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Send,
  MapPin,
  CheckCircle,
  EyeOff,
  Flame,
  Phone,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [category, setCategory] = useState('medical');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Collectorate Crossroad, Guntur');
  const [confirmed, setConfirmed] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [silent, setSilent] = useState(false);
  const [sending, setSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [myIncidents, setMyIncidents] = useState([]);

  const loadMyIncidents = () => {
    incidentApi.getMine()
      .then((res) => setMyIncidents(res.data.incidents || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadMyIncidents();
  }, []);

  const handleSOS = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessNotice(null);

    if (!confirmed) {
      setErrorMsg('Please tick the emergency confirmation safeguard before sending.');
      return;
    }

    setSending(true);
    try {
      const res = await incidentApi.createIncident({
        category,
        description: description || (silent ? 'Silent SOS triggered' : 'Emergency assistance requested'),
        lat: 16.3067 + (Math.random() - 0.5) * 0.01,
        lng: 80.4365 + (Math.random() - 0.5) * 0.01,
        address,
        confirmed: true,
        shareLocation,
        silent,
      });

      setSuccessNotice(res.data.notice || 'Emergency alert dispatched to nearby verified responders.');
      setDescription('');
      setConfirmed(false);
      loadMyIncidents();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch SOS alert.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-white">Citizen Intelligence & Safety Portal</h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Personal emergency response network. In immediate life threat, always call official emergency lines (112 / 108).
            LifeLine activates verified community first responders in your immediate radius.
          </p>
        </div>

        <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-xl text-xs text-red-200">
          <div className="font-bold flex items-center gap-1.5 text-red-400">
            <Phone className="w-3.5 h-3.5" /> Official Helpline Numbers
          </div>
          <div className="mt-1 font-mono text-[11px] text-red-300">
            Police & Fire: 112 &bull; Ambulance Trauma: 108
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive SOS Dispatcher */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Emergency Response Dispatch
            </h2>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Community Dispatch Grid
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {successNotice && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                <CheckCircle className="w-4 h-4" /> SOS Successfully Dispatched!
              </div>
              <div className="text-[11px] text-emerald-300/80">{successNotice}</div>
            </div>
          )}

          <form onSubmit={handleSOS} className="space-y-4">
            {/* Category Select */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Emergency Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'medical', label: 'Medical Emergency' },
                  { id: 'road_accident', label: 'Road Collision' },
                  { id: 'fire', label: 'Fire / Explosion' },
                  { id: 'stranded', label: 'Flood / Stranded' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-center transition ${
                      category === c.id
                        ? 'bg-red-600/20 border-red-500 text-red-300'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Emergency Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, injuries, or exact landmarks..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Nearest Landmark / Street</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0"
                />
                <span>Share exact GPS coordinate with assigned verified responder</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={silent}
                  onChange={(e) => setSilent(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0"
                />
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  Silent SOS Mode (Person unable to speak or make sound)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-red-300 font-bold bg-red-950/40 p-2.5 rounded-lg border border-red-900/60 mt-2">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="rounded bg-red-950 border-red-800 text-red-600 focus:ring-0"
                />
                <span>I confirm this is an active emergency requiring immediate assistance.</span>
              </label>
            </div>

            {/* Dispatch Action */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition"
            >
              <Send className={`w-4 h-4 ${sending ? 'animate-bounce' : ''}`} />
              {sending ? 'Broadcasting Alert...' : 'DISPATCH EMERGENCY SOS'}
            </button>
          </form>
        </div>

        {/* Right: My Submitted Reports & Neighborhood Safety */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>My Emergency Tickets ({myIncidents.length})</span>
              <span className="text-[10px] text-cyan-400">Live Status</span>
            </h2>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {myIncidents.map((inc) => (
                <div key={inc._id} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-400">{inc.incidentId}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700">
                      {inc.status}
                    </span>
                  </div>
                  <div className="text-white font-medium">{inc.description}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>{new Date(inc.createdAt).toLocaleTimeString()}</span>
                    <span className="capitalize">{inc.category}</span>
                  </div>
                </div>
              ))}

              {myIncidents.length === 0 && (
                <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-800 text-center text-xs text-slate-400">
                  No active SOS calls placed. Your local status is safe.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
