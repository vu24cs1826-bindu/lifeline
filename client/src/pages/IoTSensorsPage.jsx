import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../api/intelligence';
import { Radio, AlertTriangle, RefreshCw, CheckCircle2, Waves, Wind, Battery, ArrowUpRight } from 'lucide-react';

export default function IoTSensorsPage() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadSensors = () => {
    setLoading(true);
    intelligenceApi.getIoTSensors()
      .then((res) => setSensors(res.data.sensors || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSensors();
  }, []);

  const handleSpike = async (sensorId) => {
    setActionLoading(true);
    try {
      const res = await intelligenceApi.simulateSensorSpike(sensorId);
      setActionNotice(res.data.message);
      loadSensors();
      setTimeout(() => setActionNotice(''), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async (sensorId) => {
    setActionLoading(true);
    try {
      const res = await intelligenceApi.resetSensor(sensorId);
      setActionNotice(res.data.message);
      loadSensors();
      setTimeout(() => setActionNotice(''), 4000);
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
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h1 className="text-xl font-extrabold text-white">IoT Flood & River Sensors Grid</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Automated Physical Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Monitors ultrasonic water-level sensors on river causeways, drainage underpasses, and chemical air quality.
            When a sensor exceeds critical thresholds, LifeLine automatically registers a flood incident without waiting for human 911 calls.
          </p>
        </div>

        <button
          onClick={loadSensors}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sensors.map((s) => {
          const isCrit = s.status === 'critical_alert';
          const isWarn = s.status === 'warning';

          return (
            <div
              key={s._id}
              className={`p-5 rounded-2xl border transition space-y-4 ${
                isCrit
                  ? 'bg-red-950/30 border-red-500 shadow-xl shadow-red-500/10'
                  : isWarn
                  ? 'bg-amber-950/20 border-amber-600'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-400">{s.sensorCode}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  isCrit ? 'bg-red-600 text-white animate-pulse' : isWarn ? 'bg-amber-900 text-amber-200' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {s.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-white text-base leading-snug">{s.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{s.address}</p>
              </div>

              {/* Gauge Display */}
              <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 text-center space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400">Current Reading</div>
                <div className={`text-3xl font-black ${isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {s.currentValue} <span className="text-sm text-slate-400">{s.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Warning limit: {s.thresholdWarning}{s.unit} &bull; Danger limit: {s.thresholdCritical}{s.unit}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery: {s.batteryPercent}%
                </span>
                <span>Active 24/7</span>
              </div>

              {/* Simulation Testing Buttons for Examiners */}
              <div className="pt-1 flex gap-2">
                {isCrit ? (
                  <button
                    onClick={() => handleReset(s._id)}
                    disabled={actionLoading}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
                  >
                    Reset Reading to Normal
                  </button>
                ) : (
                  <button
                    onClick={() => handleSpike(s._id)}
                    disabled={actionLoading}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-600/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Waves className="w-3.5 h-3.5" /> Simulate Flood Spike (+35cm)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
