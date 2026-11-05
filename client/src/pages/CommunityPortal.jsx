import React, { useState, useEffect } from 'react';
import { communityApi } from '../api/intelligence';
import {
  FilePlus2,
  AlertTriangle,
  Upload,
  CheckCircle,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function CommunityPortal() {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('flooded_road');
  const [address, setAddress] = useState('Ring Road Cross, Guntur');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadReports = () => {
    communityApi.getVerified()
      .then((res) => setReports(res.data.reports || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('address', address);
      formData.append('lat', (16.3067 + (Math.random() - 0.5) * 0.01).toFixed(4));
      formData.append('lng', (80.4365 + (Math.random() - 0.5) * 0.01).toFixed(4));

      await communityApi.createReport(formData);
      setSuccess(true);
      setTitle('');
      setDescription('');
      setTimeout(() => setSuccess(false), 4000);
      loadReports();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FilePlus2 className="w-5 h-5 text-yellow-400" />
            <h1 className="text-xl font-extrabold text-white">Community Hazard Reporting Portal</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
              Civic Prevention Channel
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Report road hazards, water-logging, or broken infrastructure before they turn into fatal emergencies.
            All reports feed into the Prevention Intelligence Engine and Situation Clusters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Submit Report Form */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Submit Community Safety Report
          </h2>

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Report submitted for moderation review!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Hazard Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 font-semibold focus:outline-none focus:border-yellow-500"
              >
                <option value="flooded_road">Flooded Road / Drainage Backup</option>
                <option value="accident_prone_road">Accident-Prone Intersection / Blind Spot</option>
                <option value="broken_streetlight">Broken Streetlight / Dark Corridor</option>
                <option value="fire_hazard">Fire Hazard / Exposed Gas/Electrical</option>
                <option value="dangerous_location">Dangerous Location / Structure Deficit</option>
              </select>
            </div>

            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Report Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Severe water logging under railway underpass"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Detailed Observation</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the hazard depth, traffic disruption, or safety threat..."
                rows={3}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-slate-400 block mb-1">Location / Street Landmark</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:border-yellow-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-yellow-600/30 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Civic Hazard Report'}
            </button>
          </form>
        </div>

        {/* Right: Verified Civic Hazards Feed */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Community Hazards ({reports.length})
            </h2>
            <span className="text-xs text-slate-400">Moderated civic safety feed</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {reports.map((rep) => (
              <div key={rep._id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{rep.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Verified
                  </span>
                </div>
                <p className="text-slate-300">{rep.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {rep.address || 'Guntur Municipality'}
                  </span>
                  <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-800 text-center text-xs text-slate-400">
                No verified community hazards in this area.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
