import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../api/intelligence';
import { Building2, Hospital, Droplet, ShieldCheck, Check, RefreshCw, Save } from 'lucide-react';

export default function OrganizationDashboard() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadFacilities = () => {
    intelligenceApi.getFacilities()
      .then((res) => {
        const list = res.data.facilities || [];
        setFacilities(list);
        if (list.length > 0 && !selectedFacility) {
          setSelectedFacility(list[0]);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadFacilities();
  }, []);

  const handleCapacityChange = (field, value) => {
    setSelectedFacility((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleBloodChange = (group, value) => {
    setSelectedFacility((prev) => ({
      ...prev,
      bloodInventory: {
        ...prev.bloodInventory,
        [group]: Number(value),
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedFacility) return;
    setSaving(true);
    try {
      await intelligenceApi.updateFacilityCapacity(selectedFacility._id, {
        availableBeds: selectedFacility.availableBeds,
        icuBedsAvailable: selectedFacility.icuBedsAvailable,
        oxygenCylindersAvailable: selectedFacility.oxygenCylindersAvailable,
        ambulancesReady: selectedFacility.ambulancesReady,
        operatingStatus: selectedFacility.operatingStatus,
        bloodInventory: selectedFacility.bloodInventory,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      loadFacilities();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">Organization & Hospital Operations</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Live Capacity Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage hospital trauma beds, ICU saturation limits, oxygen inventory, and blood reserves.
            Live updates feed directly into the Living Digital Twin and Resource Coordination optimizer.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-2 rounded-lg border border-emerald-800 animate-in fade-in">
            <Check className="w-4 h-4" /> Capacity Telemetry Broadcasted
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Facilities List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Registered Healthcare Facilities ({facilities.length})
          </div>
          <div className="space-y-2.5">
            {facilities.map((fac) => {
              const isSelected = selectedFacility?._id === fac._id;
              return (
                <div
                  key={fac._id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{fac.name}</span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                      Level {fac.traumaLevel || 2}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{fac.address}</div>
                  <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-800 text-slate-300">
                    <span>{fac.availableBeds} beds open</span>
                    <span>&bull;</span>
                    <span className="text-cyan-400">{fac.icuBedsAvailable} ICU ready</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Facility Capacity Controls */}
        <div className="lg:col-span-8">
          {selectedFacility ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">{selectedFacility.name}</h2>
                  <p className="text-xs text-slate-400">{selectedFacility.address} &bull; {selectedFacility.phone}</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Update Telemetry'}
                </button>
              </div>

              {/* Sliders for Bed Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Available General Beds</span>
                    <span className="text-white font-bold">{selectedFacility.availableBeds} / {selectedFacility.totalBeds}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={selectedFacility.totalBeds || 500}
                    value={selectedFacility.availableBeds || 0}
                    onChange={(e) => handleCapacityChange('availableBeds', e.target.value)}
                    className="w-full accent-emerald-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Available ICU Trauma Beds</span>
                    <span className="text-cyan-400 font-bold">{selectedFacility.icuBedsAvailable} / {selectedFacility.icuBedsTotal}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={selectedFacility.icuBedsTotal || 60}
                    value={selectedFacility.icuBedsAvailable || 0}
                    onChange={(e) => handleCapacityChange('icuBedsAvailable', e.target.value)}
                    className="w-full accent-cyan-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Ready Ambulances</span>
                    <span className="text-amber-400 font-bold">{selectedFacility.ambulancesReady || 0} units</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={selectedFacility.ambulancesReady || 0}
                    onChange={(e) => handleCapacityChange('ambulancesReady', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white"
                  />
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Oxygen Reserves</span>
                    <span className="text-emerald-300 font-bold">{selectedFacility.oxygenCylindersAvailable || 0} cylinders</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={selectedFacility.oxygenCylindersAvailable || 0}
                    onChange={(e) => handleCapacityChange('oxygenCylindersAvailable', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-xs text-white"
                  />
                </div>
              </div>

              {/* Blood Inventory Controls */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <Droplet className="w-4 h-4" />
                  Facility Blood Bank Reserves (Units in Cold Storage)
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {Object.entries(selectedFacility.bloodInventory || {}).map(([grp, count]) => (
                    <div key={grp} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-center">
                      <div className="text-xs font-extrabold text-rose-300">{grp}</div>
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => handleBloodChange(grp, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center font-bold text-white text-xs mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
              Select a healthcare facility to manage live bed and inventory telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
