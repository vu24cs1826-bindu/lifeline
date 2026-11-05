import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, ShieldAlert, Hospital, Droplet, Flame, Users, Radio, Activity } from 'lucide-react';

// Custom modern SVG DivIcons
const createIcon = (bgClass, borderClass, symbol) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full ${bgClass} border-2 ${borderClass} shadow-lg shadow-black/60 transform transition-transform hover:scale-125 cursor-pointer">
        <span class="text-xs font-bold text-white">${symbol}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const icons = {
  incidentCritical: createIcon('bg-red-600', 'border-red-300 ring-4 ring-red-500/30 animate-pulse', '!'),
  incidentHigh: createIcon('bg-orange-600', 'border-orange-300', '!'),
  incidentMedium: createIcon('bg-amber-600', 'border-amber-300', 'i'),
  hazard: createIcon('bg-yellow-600', 'border-yellow-300', 'H'),
  cluster: createIcon('bg-purple-600', 'border-purple-300 ring-4 ring-purple-500/40 animate-pulse', 'C'),
  hospital: createIcon('bg-emerald-600', 'border-emerald-300', '+'),
  bloodBank: createIcon('bg-rose-700', 'border-rose-300', 'B'),
  fireStation: createIcon('bg-amber-700', 'border-amber-400', 'F'),
  shelter: createIcon('bg-cyan-700', 'border-cyan-300', 'S'),
  responder: createIcon('bg-blue-600', 'border-blue-300 ring-2 ring-blue-400/40', 'R'),
};

export default function LeafletMap({
  center = [16.3067, 80.4365],
  zoom = 13,
  layers = {},
  selectedItem = null,
  onSelect = () => {},
  height = '600px',
}) {
  const [activeLayers, setActiveLayers] = useState({
    incidents: true,
    hazards: true,
    clusters: true,
    riskZones: true,
    facilities: true,
    responders: true,
  });

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const incidents = layers.activeIncidents?.data || [];
  const hazards = layers.verifiedCommunityHazards?.data || [];
  const clusters = layers.macroSituationClusters?.data || [];
  const riskZones = layers.predictiveRiskZones?.data || [];
  const facilities = layers.infrastructureFacilities?.data || [];
  const responders = layers.activeRespondersOnDuty?.data || [];

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090D16]" style={{ height }}>
      {/* Floating Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-xs shadow-xl flex flex-wrap gap-2 max-w-md">
        <button
          onClick={() => toggleLayer('incidents')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${activeLayers.incidents ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-400'}`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Incidents ({incidents.length})
        </button>
        <button
          onClick={() => toggleLayer('clusters')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${activeLayers.clusters ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'}`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-500"></span> Clusters ({clusters.length})
        </button>
        <button
          onClick={() => toggleLayer('riskZones')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${activeLayers.riskZones ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Risk Zones ({riskZones.length})
        </button>
        <button
          onClick={() => toggleLayer('facilities')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${activeLayers.facilities ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hospitals & Beds ({facilities.length})
        </button>
        <button
          onClick={() => toggleLayer('hazards')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${activeLayers.hazards ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-slate-800 text-slate-400'}`}
        >
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Hazards ({hazards.length})
        </button>
        <button
          onClick={() => toggleLayer('responders')}
          className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${activeLayers.responders ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'}`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Responders ({responders.length})
        </button>
      </div>

      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* 1. Macro-Situation Clusters (DBSCAN Polygons / Buffers) */}
        {activeLayers.clusters && clusters.map((cluster) => {
          const [lng, lat] = cluster.center?.coordinates || [];
          if (!lat || !lng) return null;
          return (
            <React.Fragment key={cluster._id}>
              <Circle
                center={[lat, lng]}
                radius={cluster.radiusMeters || 600}
                pathOptions={{
                  color: '#A855F7',
                  fillColor: '#9333EA',
                  fillOpacity: 0.18,
                  weight: 2,
                  dashArray: '4, 6',
                }}
              />
              <Marker position={[lat, lng]} icon={icons.cluster}>
                <Popup>
                  <div className="p-1 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 uppercase tracking-wider">{cluster.clusterId}</span>
                      <span className="bg-purple-900/60 text-purple-200 px-1.5 py-0.5 rounded text-[10px]">
                        Confidence: {Math.round((cluster.confidence || 0.8) * 100)}%
                      </span>
                    </div>
                    <div className="font-semibold text-white text-sm">{cluster.title}</div>
                    <div className="text-slate-300">{cluster.predictedImpact}</div>
                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60 text-[11px]">
                      <div className="font-semibold text-slate-300 mb-1">Recommended Verification:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                        {(cluster.recommendedVerificationActions || []).map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 2. Predictive Risk Zones (Dynamic Heat sectors) */}
        {activeLayers.riskZones && riskZones.map((zone) => {
          const [lng, lat] = zone.center?.coordinates || [];
          if (!lat || !lng) return null;
          const isSevere = zone.riskLevel === 'severe';
          const isElevated = zone.riskLevel === 'elevated';
          const strokeColor = isSevere ? '#EF4444' : isElevated ? '#F97316' : '#EAB308';
          const fillColor = isSevere ? '#DC2626' : isElevated ? '#EA580C' : '#CA8A04';

          return (
            <React.Fragment key={zone._id}>
              <Circle
                center={[lat, lng]}
                radius={zone.radiusMeters || 1200}
                pathOptions={{
                  color: strokeColor,
                  fillColor: fillColor,
                  fillOpacity: 0.12,
                  weight: 1.5,
                }}
              />
              <Marker
                position={[lat, lng]}
                icon={createIcon(isSevere ? 'bg-red-700' : 'bg-amber-600', 'border-amber-300', isSevere ? '!' : 'R')}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="font-bold text-amber-400">{zone.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isSevere ? 'bg-red-900/80 text-red-200' : 'bg-amber-900/80 text-amber-200'}`}>
                        Risk: {zone.predictedRisk}/100
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px] font-medium">Sector: {zone.sector}</div>
                    <div className="bg-slate-800/80 p-2 rounded border border-slate-700/60">
                      <div className="text-cyan-300 font-semibold mb-0.5">Explainability Factor:</div>
                      <div className="text-slate-200">{zone.explainability?.primaryDriver || 'Historical multi-crash hotspot'}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Poisson Baseline: {zone.baselineRisk} | Multi-Factor ML: {zone.predictedRisk}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* 3. Active Emergency Incidents */}
        {activeLayers.incidents && incidents.map((inc) => {
          const [lng, lat] = inc.location?.coordinates || [];
          if (!lat || !lng) return null;
          const isCrit = inc.priority === 'critical';
          const icon = isCrit ? icons.incidentCritical : icons.incidentHigh;

          return (
            <Marker key={inc._id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="p-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400">{inc.incidentId}</span>
                    <span className="bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded text-[10px] uppercase font-bold">
                      {inc.status}
                    </span>
                  </div>
                  <div className="font-medium text-white text-sm">{inc.category.replace(/_/g, ' ').toUpperCase()}</div>
                  <div className="text-slate-300">{inc.description}</div>
                  <div className="text-slate-400 text-[11px]">{inc.address || 'GPS Coordinate Pin'}</div>
                  {inc.assignedResponder && (
                    <div className="text-emerald-400 text-[11px]">Assigned: {inc.assignedResponder.name}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 4. Infrastructure Facilities (Hospitals, Blood Banks, Fire Stations) */}
        {activeLayers.facilities && facilities.map((fac) => {
          const [lng, lat] = fac.location?.coordinates || [];
          if (!lat || !lng) return null;
          let icon = icons.hospital;
          if (fac.type === 'blood_bank') icon = icons.bloodBank;
          else if (fac.type === 'fire_station') icon = icons.fireStation;
          else if (fac.type === 'emergency_shelter') icon = icons.shelter;

          return (
            <Marker key={fac._id} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className="p-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{fac.name}</span>
                    <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] uppercase">
                      Level {fac.traumaLevel || 2}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">{fac.address} | {fac.phone}</div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800 text-[11px]">
                    <div className="bg-slate-800/60 p-1.5 rounded">
                      <div className="text-slate-400 text-[10px]">Available Beds</div>
                      <div className="text-white font-bold">{fac.availableBeds} / {fac.totalBeds}</div>
                    </div>
                    <div className="bg-slate-800/60 p-1.5 rounded">
                      <div className="text-slate-400 text-[10px]">ICU Beds Open</div>
                      <div className="text-cyan-300 font-bold">{fac.icuBedsAvailable} / {fac.icuBedsTotal}</div>
                    </div>
                    <div className="bg-slate-800/60 p-1.5 rounded">
                      <div className="text-slate-400 text-[10px]">Ambulances</div>
                      <div className="text-white font-bold">{fac.ambulancesReady} ready</div>
                    </div>
                    <div className="bg-slate-800/60 p-1.5 rounded">
                      <div className="text-slate-400 text-[10px]">Oxygen Cylinders</div>
                      <div className="text-emerald-300 font-bold">{fac.oxygenCylindersAvailable}</div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 5. Verified Community Hazard Reports */}
        {activeLayers.hazards && hazards.map((hz) => {
          const [lng, lat] = hz.location?.coordinates || [];
          if (!lat || !lng) return null;
          return (
            <Marker key={hz._id} position={[lat, lng]} icon={icons.hazard}>
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-bold text-yellow-400">{hz.title}</div>
                  <div className="text-slate-300">{hz.description}</div>
                  <div className="text-slate-400 text-[10px]">{hz.address}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 6. Active Responders On Duty */}
        {activeLayers.responders && responders.map((rp) => {
          const [lng, lat] = rp.location?.coordinates || [];
          if (!lat || !lng) return null;
          return (
            <Marker key={rp._id} position={[lat, lng]} icon={icons.responder}>
              <Popup>
                <div className="p-1 space-y-1 text-xs">
                  <div className="font-bold text-blue-400">{rp.user?.name || 'Verified Responder'}</div>
                  <div className="text-slate-300 text-[11px] capitalize">{rp.user?.role?.replace(/_/g, ' ')}</div>
                  <div className="text-[10px] text-slate-400">Skills: {(rp.skills || []).join(', ')}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
