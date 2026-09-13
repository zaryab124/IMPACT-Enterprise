"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Flame,
  FileText,
  ChevronDown,
  X,
  Target,
  Clock,
  DollarSign,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
} from "lucide-react";

interface LeadItem {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_country?: string;
  stage: string;
  score: number;
  problem_statement: string | null;
  proposed_solution: string | null;
  budget_range: string | null;
  timeline: string | null;
  decision_maker_status: string | null;
  created_at: string;
}

interface BantDetails {
  budgetScore: number;
  budgetFormatted: string;
  authorityScore: number;
  authorityLevel: string;
  needScore: number;
  needAlignment: string[];
  needSummary: string;
  timelineScore: number;
  timelineFormatted: string;
  compositeScore: number;
  classification: string;
  reasoning: string;
}

interface ProposalScope {
  title: string;
  clientName: string;
  clientCompany?: string;
  problemSummary: string;
  proposedArchitecture: string;
  coreDeliverables: string[];
  recommendedTechStack: string[];
  estimatedTimelineWeeks: string;
  investmentTier: string;
  nextSteps: string[];
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);

  // Modals state
  const [selectedBant, setSelectedBant] = useState<{ leadId: string; bant: BantDetails } | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<{ leadId: string; scope: ProposalScope } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/leads");
      if (!res.ok) throw new Error(`Failed to load leads (${res.status})`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || "Failed to load leads pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStageChange = async (leadId: string, newStage: string) => {
    setUpdatingStageId(leadId);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, reason: "Manual stage transition via Admin CRM" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Failed to transition stage (${res.status})`);
      }
      // Update local state
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
      );
    } catch (err: any) {
      alert(`Stage transition error: ${err.message}`);
    } finally {
      setUpdatingStageId(null);
    }
  };

  const handleViewBant = async (leadId: string) => {
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/bant`);
      if (!res.ok) throw new Error("Failed to load BANT analysis");
      const data = await res.json();
      setSelectedBant({ leadId, bant: data.latestBantAnalysis });
    } catch (err: any) {
      alert(`BANT error: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleGenerateProposal = async (leadId: string) => {
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/proposal`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate proposal scope");
      const data = await res.json();
      setSelectedProposal({ leadId, scope: data.proposalScope });
      // Refresh lead list to reflect possible PROPOSAL stage progression
      fetchLeads();
    } catch (err: any) {
      alert(`Proposal scoping error: ${err.message}`);
    } finally {
      setModalLoading(false);
    }
  };

  const getStageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-50 text-blue-700 border-blue-200",
      CONTACTED: "bg-amber-50 text-amber-700 border-amber-200",
      QUALIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      PROPOSAL: "bg-purple-50 text-purple-700 border-purple-200",
      NEGOTIATION: "bg-indigo-50 text-indigo-700 border-indigo-200",
      WON: "bg-emerald-100 text-emerald-800 border-emerald-300 font-black",
      LOST: "bg-gray-100 text-gray-700 border-gray-200",
      NURTURE: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${colors[stage] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
        {stage}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight">
            Leads & Qualification CRM
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            BANT Qualification Matrix, Proposal Readiness, and CRM Deal Stage Progression
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-dark hover:bg-brand-surface transition-all shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-accent" : ""}`} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-brand-border flex items-center justify-between text-xs font-bold text-brand-muted uppercase tracking-wider">
          <span>Active Pipeline Deals ({leads.length})</span>
          <span className="text-[11px] font-normal lowercase">BANT weighted qualification active</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-brand-muted">
            Querying PostgreSQL database...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-muted">
            No leads recorded yet. New leads captured from website chat and intake wizard will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-surface/60 border-b border-brand-border text-brand-subtle font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Deal Stage</th>
                  <th className="py-3 px-4">BANT Score</th>
                  <th className="py-3 px-4">Prospect</th>
                  <th className="py-3 px-4">Requirement / Pain</th>
                  <th className="py-3 px-4">Budget / Timeline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-brand-surface/40 transition-colors">
                    {/* Deal Stage Selector */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStageBadge(l.stage)}
                        <div className="relative inline-block">
                          <select
                            value={l.stage}
                            disabled={updatingStageId === l.id}
                            onChange={(e) => handleStageChange(l.id, e.target.value)}
                            className="text-[11px] font-mono bg-transparent border border-brand-border rounded px-1.5 py-0.5 text-brand-dark focus:outline-none cursor-pointer"
                          >
                            <option value="NEW">NEW</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="QUALIFIED">QUALIFIED</option>
                            <option value="PROPOSAL">PROPOSAL</option>
                            <option value="NEGOTIATION">NEGOTIATION</option>
                            <option value="WON">WON</option>
                            <option value="LOST">LOST</option>
                            <option value="NURTURE">NURTURE</option>
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* BANT Score */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <button
                        onClick={() => handleViewBant(l.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all hover:scale-105 ${
                          l.score >= 80
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : l.score >= 65
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                        title="Click to view full BANT breakdown"
                      >
                        {l.score >= 75 ? (
                          <Flame className="w-3 h-3 text-amber-500" />
                        ) : (
                          <Target className="w-3 h-3 text-brand-accent" />
                        )}
                        <span>{l.score}/100</span>
                      </button>
                    </td>

                    {/* Prospect Info */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-brand-dark">
                        {l.customer_name || "Website Lead"}
                      </div>
                      <div className="text-[11px] font-mono text-brand-muted">
                        {l.customer_email || "No email"}
                      </div>
                    </td>

                    {/* Requirement */}
                    <td className="py-3 px-4 max-w-xs truncate text-brand-dark">
                      {l.problem_statement || l.proposed_solution || "General inquiry"}
                    </td>

                    {/* Budget & Timeline */}
                    <td className="py-3 px-4 font-mono text-[11px] text-brand-charcoal">
                      <div>{l.budget_range || "Flexible"}</div>
                      <div className="text-brand-subtle text-[10px]">{l.timeline || "Normal"}</div>
                    </td>

                    {/* Action: Proposal Scoping */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleGenerateProposal(l.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-dark text-white text-[11px] font-bold hover:bg-brand-accent transition-colors shadow-xs"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Scope Proposal</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BANT Scorecard Modal */}
      {selectedBant && (
        <div className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2 font-bold text-base text-brand-dark">
                <Target className="w-5 h-5 text-brand-accent" />
                <span>BANT Qualification Scorecard</span>
              </div>
              <button
                onClick={() => setSelectedBant(null)}
                className="p-1 rounded-full text-brand-muted hover:text-brand-dark hover:bg-brand-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-surface/70 border border-brand-border">
              <div>
                <div className="text-[10px] font-mono text-brand-muted uppercase">Composite BANT Score</div>
                <div className="text-2xl font-black text-brand-dark">
                  {selectedBant.bant.compositeScore} / 100
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                selectedBant.bant.classification === "PROPOSAL_READY"
                  ? "bg-purple-100 text-purple-900 border-purple-300"
                  : selectedBant.bant.classification === "HOT_QUALIFIED"
                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}>
                {selectedBant.bant.classification}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-brand-border bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-brand-muted font-bold text-[11px]">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Budget (25%)</span>
                </div>
                <div className="font-mono font-bold text-brand-dark text-sm">
                  {selectedBant.bant.budgetScore}/100
                </div>
                <div className="text-[10px] text-brand-muted truncate">
                  {selectedBant.bant.budgetFormatted}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-brand-border bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-brand-muted font-bold text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Authority (25%)</span>
                </div>
                <div className="font-mono font-bold text-brand-dark text-sm">
                  {selectedBant.bant.authorityScore}/100
                </div>
                <div className="text-[10px] text-brand-muted truncate">
                  {selectedBant.bant.authorityLevel}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-brand-border bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-brand-muted font-bold text-[11px]">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>Need & Fit (30%)</span>
                </div>
                <div className="font-mono font-bold text-brand-dark text-sm">
                  {selectedBant.bant.needScore}/100
                </div>
                <div className="text-[10px] text-brand-muted truncate">
                  {selectedBant.bant.needAlignment.join(", ") || "General Scoping"}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-brand-border bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-brand-muted font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Timeline (20%)</span>
                </div>
                <div className="font-mono font-bold text-brand-dark text-sm">
                  {selectedBant.bant.timelineScore}/100
                </div>
                <div className="text-[10px] text-brand-muted truncate">
                  {selectedBant.bant.timelineFormatted}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-brand-charcoal leading-relaxed">
              <span className="font-bold">Evaluation Rationale: </span>
              {selectedBant.bant.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Engineering Proposal Scope Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2 font-bold text-base text-brand-dark">
                <FileText className="w-5 h-5 text-brand-accent" />
                <span>Preliminary Engineering Scope</span>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="p-1 rounded-full text-brand-muted hover:text-brand-dark hover:bg-brand-surface"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-sm font-bold text-brand-dark">{selectedProposal.scope.title}</div>
              <div className="text-xs text-brand-muted mt-0.5">
                Client: {selectedProposal.scope.clientName} | Investment Tier: {selectedProposal.scope.investmentTier}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-brand-surface/60 border border-brand-border space-y-1 text-xs">
              <div className="font-bold text-brand-dark">Proposed System Architecture</div>
              <div className="text-brand-muted leading-relaxed font-mono text-[11px]">
                {selectedProposal.scope.proposedArchitecture}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-brand-dark">Core Scope Deliverables</div>
              <ul className="space-y-1.5">
                {selectedProposal.scope.coreDeliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-brand-charcoal">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-brand-dark">Recommended Tech Stack</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedProposal.scope.recommendedTechStack.map((tech, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-brand-surface text-brand-dark font-mono text-[10px] border border-brand-border">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-bold">
              <span>Estimated Delivery Window</span>
              <span className="font-mono">{selectedProposal.scope.estimatedTimelineWeeks}</span>
            </div>

            <div className="pt-2 border-t border-brand-border flex justify-end">
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-4 py-1.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-accent transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
