import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../api/intelligence';
import { MessageSquare, Send, CheckCircle2, PhoneCall, Radio, Users, ShieldAlert, Sparkles } from 'lucide-react';

export default function BroadcastPage() {
  const [alerts, setAlerts] = useState([]);
  const [title, setTitle] = useState('Flash Flood Warning: Collectorate Low Causeway');
  const [message, setMessage] = useState('URGENT CIVIC ADVISORY: Water level on Krishna low causeway has crossed 60cm danger threshold. Route is closed to all 2-wheelers and autos. Please use Elevated NH-16 Bypass. Nearest relief center: B.R. Stadium.');
  const [targetArea, setTargetArea] = useState('Krishna Basin & Collectorate Ward');
  const [radiusKm, setRadiusKm] = useState(3);
  const [channel, setChannel] = useState('whatsapp_and_sms');
  const [sending, setSending] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const loadAlerts = () => {
    intelligenceApi.getBroadcasts()
      .then((res) => setAlerts(res.data.alerts || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await intelligenceApi.sendBroadcast({
        title,
        message,
        targetArea,
        radiusKm,
        channel,
      });
      setSuccessNotice(res.data.message);
      loadAlerts();
      setTimeout(() => setSuccessNotice(''), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">Citizen WhatsApp & SMS Broadcast Console</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Geofenced Public Alerts
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Dispatch mass emergency alerts directly to citizens' WhatsApp and SMS without requiring an app installed.
            Geofences recipients within a 1 to 10 km radius of an active crisis.
          </p>
        </div>
      </div>

      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Radio className="w-4 h-4 text-emerald-400" />
            Compose Geofenced Emergency Alert
          </h2>

          <form onSubmit={handleSend} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Broadcast Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Target Geofence Radius</label>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Dispatch Perimeter:</span>
                <span className="font-bold text-cyan-400">{radiusKm} km radius (~{Math.round(radiusKm * 480 + 350).toLocaleString()} citizens)</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Target Neighborhood</label>
              <input
                type="text"
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Broadcast Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 leading-relaxed focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Delivery Channels</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="whatsapp_and_sms">WhatsApp + Telecom SMS (Recommended)</option>
                <option value="whatsapp_only">WhatsApp Verified Channel Only</option>
                <option value="sms_only">Direct Carrier SMS Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Transmitting Geofence Packets...' : 'TRANSMIT GEOFENCED BROADCAST'}
            </button>
          </form>
        </div>

        {/* Right: Live Citizen Phone Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Citizen Smartphone Screen Preview
            </h2>

            {/* Simulated Phone Frame */}
            <div className="max-w-xs mx-auto bg-slate-950 border-4 border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3">
              <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mb-2"></div>

              {/* WhatsApp Bubble Preview */}
              <div className="bg-[#0B141B] border border-emerald-900/60 rounded-xl p-3 space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> LifeLine Official Safety
                  </span>
                  <span className="text-slate-500">Just now</span>
                </div>
                <div className="font-bold text-white text-xs">{title}</div>
                <p className="text-[11px] text-slate-300 leading-snug">{message}</p>
                <div className="pt-1 text-[10px] text-emerald-400 underline font-mono">
                  maps.lifeline.gov/evacuate
                </div>
              </div>

              {/* SMS Notification Banner Preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[10px] space-y-0.5">
                <div className="text-slate-400 font-bold uppercase">SMS from GOV-LIFELN:</div>
                <div className="text-slate-200 line-clamp-2">{message}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
