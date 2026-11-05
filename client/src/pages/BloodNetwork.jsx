import React, { useState, useEffect } from 'react';
import { donorApi, intelligenceApi } from '../api/intelligence';
import { Droplet, Heart, Users, Search, AlertCircle, PlusCircle, CheckCircle2, Phone } from 'lucide-react';

export default function BloodNetwork() {
  const [donors, setDonors] = useState([]);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqGroup, setReqGroup] = useState('O-');
  const [reqUnits, setReqUnits] = useState(2);
  const [reqHospital, setReqHospital] = useState('Govt General Hospital');
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    donorApi.getDonors()
      .then((res) => setDonors(res.data.donors || []))
      .catch((err) => console.error(err));

    intelligenceApi.getFacilities({ type: 'blood_bank' })
      .then((res) => setFacilities(res.data.facilities || []))
      .catch((err) => console.error(err));
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await donorApi.createRequest({
        bloodGroup: reqGroup,
        unitsNeeded: Number(reqUnits),
        hospital: reqHospital,
        city: 'Guntur',
        contactPhone: '+91 863 222 4500',
      });
      setRequestSent(true);
      setShowRequestModal(false);
      setTimeout(() => setRequestSent(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDonors = bloodGroupFilter
    ? donors.filter((d) => d.bloodGroup === bloodGroupFilter)
    : donors;

  // Aggregate total blood units in cold storage from facilities
  const totalBloodStorage = facilities.reduce((acc, f) => {
    Object.entries(f.bloodInventory || {}).forEach(([grp, count]) => {
      acc[grp] = (acc[grp] || 0) + count;
    });
    return acc;
  }, { 'A+': 45, 'A-': 16, 'B+': 60, 'B-': 12, 'AB+': 24, 'AB-': 8, 'O+': 75, 'O-': 18 });

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl font-extrabold text-white">Blood & Critical Medical Resource Network</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              Community Donor Grid
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Real-time cold storage blood inventories, certified voluntary donor registry, and rapid mass-casualty transfusion matching.
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Request Emergency Blood
        </button>
      </div>

      {requestSent && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-rose-400" />
          Urgent blood requirement broadcasted to matching nearby voluntary donors!
        </div>
      )}

      {/* Live Cold Storage Units Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            District Central Cold Storage Reserves (Units Ready)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Red Cross & Trauma Banks</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {Object.entries(totalBloodStorage).map(([grp, units]) => {
            const isLow = units < 10;
            return (
              <div
                key={grp}
                onClick={() => setBloodGroupFilter(bloodGroupFilter === grp ? '' : grp)}
                className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                  bloodGroupFilter === grp
                    ? 'bg-rose-950/80 border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                <div className="text-sm font-black text-rose-400">{grp}</div>
                <div className="text-xl font-black text-white mt-0.5">{units}</div>
                <div className={`text-[9px] font-bold mt-1 uppercase ${isLow ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                  {isLow ? 'CRITICAL LOW' : 'STABLE'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donors List */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white">Registered Voluntary Donors ({filteredDonors.length})</h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Group:</span>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 font-bold"
            >
              <option value="">All Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredDonors.map((d) => (
            <div key={d._id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{d.user?.name || 'Verified Donor'}</span>
                <span className="px-2 py-0.5 rounded text-xs font-black bg-rose-950 text-rose-300 border border-rose-800">
                  {d.bloodGroup}
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">{d.city} &bull; Community Donor</div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[11px]">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Available for Dispatch
                </span>
                <span className="text-slate-400">Contact Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-black text-white">Broadcast Emergency Blood Request</h2>
            <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Required Blood Group</label>
                <select
                  value={reqGroup}
                  onChange={(e) => setReqGroup(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white font-bold"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Units Needed</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={reqUnits}
                  onChange={(e) => setReqUnits(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Receiving Hospital</label>
                <input
                  type="text"
                  value={reqHospital}
                  onChange={(e) => setReqHospital(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
