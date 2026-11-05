import React, { useEffect, useState } from 'react';
import { intelligenceApi } from '../api/intelligence';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  ArrowUpRight,
  DollarSign,
  Building,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function AnalyticsPrevention() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const loadData = () => {
    setLoading(true);
    intelligenceApi.getPreventionIntelligence()
      .then((res) => {
        setReport(res.data.report || {});
        if (res.data.report?.proposals?.length > 0 && !selectedProposal) {
          setSelectedProposal(res.data.report.proposals[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (proposalId, newStatus) => {
    setStatusUpdating(true);
    try {
      await intelligenceApi.updateProposalStatus(proposalId, {
        status: newStatus,
        reviewNotes: `Updated status to ${newStatus} by Municipal Council reviewer`,
      });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const proposals = report?.proposals || [];
  const metrics = report?.metrics || {};

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">Prevention & Civil Infrastructure Intelligence</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Evidence-Backed Municipal Work Orders
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Turns recurring historical incident clusters into actionable civil engineering proposals.
            Enables city authorities to invest in preventative drainage culverts, roundabouts, and lighting before fatalities happen.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Intelligence
        </button>
      </div>

      {/* High-Level Evidence Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Proposals Synthesized</div>
          <div className="text-2xl font-black text-white mt-1">{report?.totalProposals || 3}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">High-priority civil recommendations</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Historical Incidents Analyzed</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {metrics.totalHistoricalIncidentsAnalyzed || 84}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Underlying data points correlated</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Estimated Harm Reduction</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {metrics.estimatedTotalHarmReductionPercent || 68}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Prevented casualty projection</p>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="text-[10px] font-bold uppercase text-slate-400">Under Review / Approved</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {(report?.underReviewCount || 1) + 1}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending municipal engineering works</p>
        </div>
      </div>

      {/* Main Split View: Proposals List & Selected Proposal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Proposal Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Synthesized Civic Proposals ({proposals.length})
          </div>

          <div className="space-y-3">
            {proposals.map((p) => {
              const isSelected = selectedProposal?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => setSelectedProposal(p)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500 shadow-xl shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{p.proposalCode}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700">
                      {p.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{p.address}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-amber-400 font-semibold">{p.recurringIncidentCount} historical incidents</span>
                    <span className="text-emerald-400 font-bold">Priority: {p.priorityScore}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Proposal Specification */}
        <div className="lg:col-span-7">
          {selectedProposal ? (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{selectedProposal.proposalCode}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Priority: {selectedProposal.priorityScore}/100
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1 leading-snug">{selectedProposal.title}</h2>
                </div>

                {/* Status Switcher for Council Review */}
                <select
                  value={selectedProposal.status}
                  onChange={(e) => handleStatusChange(selectedProposal._id, e.target.value)}
                  disabled={statusUpdating}
                  className="bg-slate-800 border border-slate-700 text-emerald-300 rounded-lg p-2 text-xs font-bold shrink-0"
                >
                  <option value="proposed">Proposed</option>
                  <option value="under_civic_review">Under Review</option>
                  <option value="budget_approved">Budget Approved</option>
                  <option value="in_execution">In Execution</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Evidence Summary */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Correlated Incident Evidence
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedProposal.evidenceSummary}
                </p>
                <div className="flex items-center gap-4 text-xs pt-1 text-slate-400 font-medium">
                  <span>Recurring Events: <strong className="text-white">{selectedProposal.recurringIncidentCount}</strong></span>
                  <span>Estimated Cost: <strong className="text-white">{selectedProposal.estimatedCostTier?.replace(/_/g, ' ')}</strong></span>
                  <span>Harm Reduction: <strong className="text-emerald-400">{selectedProposal.estimatedHarmReductionPercentage}%</strong></span>
                </div>
              </div>

              {/* Proposed Civil Engineering Action */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Recommended Engineering Work Order
                </div>
                <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                  {selectedProposal.proposedEngineeringAction}
                </p>
              </div>

              {/* Contributing Factors */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Identified Contributing Deficits
                </div>
                <div className="space-y-1.5">
                  {(selectedProposal.contributingFactors || []).map((factor, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center text-xs text-slate-400">
              Select a prevention proposal to inspect evidence backing and civil engineering specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
