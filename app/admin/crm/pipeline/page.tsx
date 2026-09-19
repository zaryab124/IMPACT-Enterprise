"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Kanban,
  DollarSign,
  Plus,
  RefreshCw,
  AlertCircle,
  Building2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { CrmDeal, CrmPipeline, CrmPipelineStage } from "@/packages/growth-os/crm";
import { IMPACT_SERVICES } from "@/packages/growth-os/constants";

const KANBAN_STAGES = [
  { name: "NEW", label: "New Leads", color: "border-t-blue-500", badgeBg: "bg-blue-50 text-blue-700" },
  { name: "CONTACTED", label: "Contacted", color: "border-t-cyan-500", badgeBg: "bg-cyan-50 text-cyan-700" },
  { name: "QUALIFIED", label: "Qualified", color: "border-t-indigo-500", badgeBg: "bg-indigo-50 text-indigo-700" },
  { name: "PROPOSAL", label: "Proposal Sent", color: "border-t-purple-500", badgeBg: "bg-purple-50 text-purple-700" },
  { name: "NEGOTIATION", label: "Negotiation", color: "border-t-amber-500", badgeBg: "bg-amber-50 text-amber-700" },
  { name: "WON", label: "Closed Won", color: "border-t-emerald-500", badgeBg: "bg-emerald-50 text-emerald-700" },
  { name: "LOST", label: "Closed Lost", color: "border-t-rose-500", badgeBg: "bg-rose-50 text-rose-700" },
];

export default function CrmPipelinePage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [pipelines, setPipelines] = useState<(CrmPipeline & { stages: CrmPipelineStage[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Deal Modal state
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    amount: 25000,
    currency: "USD",
    service_interest: IMPACT_SERVICES[0] || "AI models",
    stage_id: "",
  });

  const fetchPipelineData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/deals");
      if (!res.ok) throw new Error(`Failed to load deals (HTTP ${res.status})`);
      const json = await res.json();
      if (json.success) {
        setDeals(json.deals || []);
        setPipelines(json.pipelines || []);
        if (json.pipelines?.[0]?.stages?.[0]?.id) {
          setNewDeal((prev) => ({ ...prev, stage_id: json.pipelines[0].stages[0].id }));
        }
      } else {
        throw new Error(json.error?.message || "Failed to load pipeline");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  const defaultPipeline = pipelines[0];
  const stages = defaultPipeline?.stages || [];

  // Move deal to target stage
  const handleMoveStage = async (dealId: string, targetStageId: string) => {
    try {
      const res = await fetch(`/api/crm/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_id: targetStageId }),
      });
      if (res.ok) {
        await fetchPipelineData();
      } else {
        const err = await res.json();
        alert(`Stage transition failed: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Stage transition error: ${err.message}`);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDeal.title,
          amount: Number(newDeal.amount),
          currency: newDeal.currency,
          service_interest: newDeal.service_interest,
          pipeline_id: defaultPipeline?.id,
          stage_id: newDeal.stage_id || stages[0]?.id,
        }),
      });
      if (res.ok) {
        setShowAddDeal(false);
        setNewDeal({
          title: "",
          amount: 25000,
          currency: "USD",
          service_interest: IMPACT_SERVICES[0] || "AI models",
          stage_id: stages[0]?.id || "",
        });
        await fetchPipelineData();
      } else {
        const err = await res.json();
        alert(`Deal creation failed: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Deal creation error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPipelineValue = deals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Kanban className="w-5 h-5 text-brand-accent" />
            <h2 className="text-base font-bold text-brand-dark">Sales Pipeline Kanban</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {deals.length} Active Deals
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-0.5">
            Total Pipeline Value:{" "}
            <span className="font-bold text-brand-dark font-mono">
              ${totalPipelineValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPipelineData()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddDeal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-brand-muted space-y-3 bg-white border border-brand-border rounded-2xl">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-accent" />
          <p className="text-xs font-medium">Loading sales pipeline stages and deals...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center text-red-600 space-y-3 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="text-xs font-bold">{error}</p>
          <button
            onClick={() => fetchPipelineData()}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        /* 7-Stage Kanban Columns */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1300px]">
            {KANBAN_STAGES.map((stageConfig, index) => {
              // Match stage by name or index
              const stageEntity = stages.find(
                (s) => s.name.toUpperCase() === stageConfig.name || s.order_index === index
              );
              const stageDeals = deals.filter(
                (d) =>
                  d.stage_id === stageEntity?.id ||
                  (!stageEntity && d.status === stageConfig.name)
              );
              const stageSum = stageDeals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

              const prevStage = index > 0 ? stages[index - 1] : null;
              const nextStage = index < KANBAN_STAGES.length - 1 ? stages[index + 1] : null;

              return (
                <div
                  key={stageConfig.name}
                  className={`w-72 shrink-0 bg-[#F7F6F2] border border-brand-border rounded-2xl p-3 flex flex-col min-h-[500px] border-t-4 ${stageConfig.color}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border/60">
                    <div>
                      <h3 className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                        {stageConfig.label}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-brand-muted block">
                        ${stageSum.toLocaleString()}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${stageConfig.badgeBg}`}>
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Deals Cards */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {stageDeals.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-brand-border/80 rounded-xl flex items-center justify-center text-center p-3 text-[11px] text-brand-muted">
                        No deals in this stage
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs space-y-2.5 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-brand-dark text-xs leading-snug line-clamp-2">
                              {deal.title}
                            </h4>
                            <span className="font-mono font-black text-brand-dark text-xs whitespace-nowrap">
                              ${Number(deal.amount).toLocaleString()}
                            </span>
                          </div>

                          {deal.service_interest && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border text-[10px] font-bold text-brand-charcoal truncate max-w-full">
                              {deal.service_interest}
                            </span>
                          )}

                          {/* Stage Movement Controls */}
                          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between">
                            {prevStage ? (
                              <button
                                onClick={() => handleMoveStage(deal.id, prevStage.id)}
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-muted hover:text-brand-dark"
                                title={`Move to ${prevStage.name}`}
                              >
                                <ChevronLeft className="w-3 h-3" />
                                <span>Back</span>
                              </button>
                            ) : (
                              <span />
                            )}

                            {nextStage ? (
                              <button
                                onClick={() => handleMoveStage(deal.id, nextStage.id)}
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-accent hover:text-brand-accentHover"
                                title={`Advance to ${nextStage.name}`}
                              >
                                <span>Advance</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Final</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark">Add New Deal to Pipeline</h3>
              <button onClick={() => setShowAddDeal(false)}>
                <X className="w-4 h-4 text-brand-muted" />
              </button>
            </div>
            <form onSubmit={handleCreateDeal} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                  placeholder="e.g. Vance Logistics Automation Deployment"
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Value ($) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newDeal.amount}
                    onChange={(e) => setNewDeal({ ...newDeal, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Currency</label>
                  <select
                    value={newDeal.currency}
                    onChange={(e) => setNewDeal({ ...newDeal, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Service Interest</label>
                <select
                  value={newDeal.service_interest}
                  onChange={(e) => setNewDeal({ ...newDeal, service_interest: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                >
                  {IMPACT_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAddDeal(false)}
                  className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
