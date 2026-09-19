"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  MousePointer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { CORE_SERVICES } from "@/packages/growth-os/constants";

export default function CrmCampaignsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    objective: "LEAD_GENERATION",
    service: CORE_SERVICES[0].name,
    target_audience: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    budget: "5000",
    platforms: ["linkedin"],
    content: "",
    landing_page: "https://impact-enterprise.vercel.app/services/ai-automation",
    lead_source: "campaign",
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/campaigns");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/crm/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback("Campaign created successfully with full funnel attribution tracking!");
        setShowModal(false);
        fetchCampaigns();
      } else {
        setFeedback(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
              Phase 13 Inbound Engine
            </span>
            <span className="text-xs text-brand-muted font-mono">Multi-Touch Attribution</span>
          </div>
          <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2 mt-1">
            <Megaphone className="w-5 h-5 text-brand-accent" />
            <span>Campaign Management & Full Funnel Attribution</span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Track customer journeys: Campaign → Content → Click → Lead → Qualified Lead → Deal → Won Deal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-muted border border-brand-border hover:bg-brand-surface/80 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-accent hover:bg-brand-accent/90 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Aggregate Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-brand-muted">Campaigns</p>
          <p className="text-xl font-bold text-brand-dark mt-0.5 font-mono">
            {data ? data.total_campaigns : "..."}
          </p>
          <p className="text-[10px] text-brand-muted mt-1 font-mono">
            Budget: ${data ? Number(data.total_budget).toLocaleString() : "0"}
          </p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-brand-muted flex items-center gap-1">
            <MousePointer className="w-3 h-3 text-blue-500" />
            <span>Total Clicks</span>
          </p>
          <p className="text-xl font-bold text-brand-dark mt-0.5 font-mono">
            {data ? data.total_clicks : "..."}
          </p>
          <p className="text-[10px] text-blue-600 font-mono mt-1">Traffic Volume</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-brand-muted flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-500" />
            <span>Total Leads</span>
          </p>
          <p className="text-xl font-bold text-brand-dark mt-0.5 font-mono">
            {data ? data.total_leads : "..."}
          </p>
          <p className="text-[10px] text-indigo-600 font-mono mt-1">Inbound Leads</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-brand-muted flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-500" />
            <span>Qualified Leads</span>
          </p>
          <p className="text-xl font-bold text-brand-dark mt-0.5 font-mono">
            {data ? data.total_qualified_leads : "..."}
          </p>
          <p className="text-[10px] text-emerald-600 font-mono mt-1">Score ≥ 70</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-brand-muted flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-500" />
            <span>CRM Deals</span>
          </p>
          <p className="text-xl font-bold text-brand-dark mt-0.5 font-mono">
            {data ? data.total_deals : "..."}
          </p>
          <p className="text-[10px] text-amber-600 font-mono mt-1">Pipeline Created</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-brand-muted flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-500" />
            <span>Won Deals</span>
          </p>
          <p className="text-xl font-bold text-brand-dark mt-0.5 font-mono">
            {data ? data.total_won_deals : "..."}
          </p>
          <p className="text-[10px] text-teal-600 font-mono mt-1">Closed-Won</p>
        </div>

        <div className="bg-white border border-brand-border rounded-xl p-3.5 shadow-xs">
          <p className="text-[11px] font-medium text-brand-muted flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-purple-500" />
            <span>Entered Revenue</span>
          </p>
          <p className="text-lg font-bold text-purple-700 mt-0.5 font-mono truncate">
            {data ? data.total_revenue_display : "..."}
          </p>
          <p className="text-[9px] text-brand-muted font-mono mt-1">
            Zero-fabrication rule
          </p>
        </div>
      </div>

      {/* Funnel Flow Architecture Guide */}
      <div className="bg-brand-surface/40 border border-brand-border rounded-2xl p-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto text-xs py-1">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">1</div>
            <div>
              <p className="font-bold text-brand-dark">Campaign & Content</p>
              <p className="text-[10px] text-brand-muted">Grounded in 9 Services</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-muted flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">2</div>
            <div>
              <p className="font-bold text-brand-dark">Click & Inbound</p>
              <p className="text-[10px] text-brand-muted">10 Canonical Sources</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-muted flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">3</div>
            <div>
              <p className="font-bold text-brand-dark">Lead & Deduplication</p>
              <p className="text-[10px] text-brand-muted">Normalized CRM Record</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-muted flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">4</div>
            <div>
              <p className="font-bold text-brand-dark">AI Qualification</p>
              <p className="text-[10px] text-brand-muted">4-Tier Scoring & Overrides</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-brand-muted flex-shrink-0" />
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">5</div>
            <div>
              <p className="font-bold text-brand-dark">Deal & Won Revenue</p>
              <p className="text-[10px] text-brand-muted">Strict CRM Attribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-brand-dark">Active Campaigns & Performance Funnels</h3>
        {loading ? (
          <div className="p-12 text-center text-brand-muted text-xs bg-white rounded-2xl border border-brand-border">
            Loading campaigns and multi-touch funnel data...
          </div>
        ) : !data || data.campaigns.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs bg-white rounded-2xl border border-brand-border">
            No campaigns found. Click "New Campaign" above to launch an initiative.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {data.campaigns.map((c: any) => (
              <div
                key={c.campaign_id}
                className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs hover:border-brand-accent/40 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-brand-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-surface text-brand-dark border border-brand-border">
                        {c.service}
                      </span>
                      <h4 className="font-bold text-brand-dark text-base">{c.campaign_name}</h4>
                    </div>
                    <p className="text-xs text-brand-muted mt-1">
                      Campaign ID: <span className="font-mono">{c.campaign_id}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-brand-muted text-[11px] block">Entered Revenue</span>
                      <span className={`font-bold ${c.revenue.is_unknown ? "text-amber-600" : "text-emerald-700"}`}>
                        {c.revenue.display}
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-muted text-[11px] block">Overall Funnel Rate</span>
                      <span className="font-bold text-brand-dark">{c.conversion_rates.overall_funnel}</span>
                    </div>
                  </div>
                </div>

                {/* Funnel Breakdown Stages */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
                  <div className="bg-brand-surface/40 p-3 rounded-xl">
                    <p className="text-[10px] text-brand-muted font-medium">1. Clicks</p>
                    <p className="text-base font-bold text-brand-dark font-mono mt-0.5">{c.clicks}</p>
                    <p className="text-[10px] text-brand-muted font-mono mt-0.5">Rate to Lead: {c.conversion_rates.click_to_lead}</p>
                  </div>

                  <div className="bg-brand-surface/40 p-3 rounded-xl">
                    <p className="text-[10px] text-brand-muted font-medium">2. Inbound Leads</p>
                    <p className="text-base font-bold text-brand-dark font-mono mt-0.5">{c.leads}</p>
                    <p className="text-[10px] text-brand-muted font-mono mt-0.5">Rate to Qual: {c.conversion_rates.lead_to_qualified}</p>
                  </div>

                  <div className="bg-brand-surface/40 p-3 rounded-xl">
                    <p className="text-[10px] text-brand-muted font-medium">3. Qualified Leads</p>
                    <p className="text-base font-bold text-emerald-700 font-mono mt-0.5">{c.qualified_leads}</p>
                    <p className="text-[10px] text-brand-muted font-mono mt-0.5">Rate to Deal: {c.conversion_rates.qualified_to_deal}</p>
                  </div>

                  <div className="bg-brand-surface/40 p-3 rounded-xl">
                    <p className="text-[10px] text-brand-muted font-medium">4. Deals Created</p>
                    <p className="text-base font-bold text-indigo-700 font-mono mt-0.5">{c.deals}</p>
                    <p className="text-[10px] text-brand-muted font-mono mt-0.5">Rate to Won: {c.conversion_rates.deal_to_won}</p>
                  </div>

                  <div className="bg-brand-surface/40 p-3 rounded-xl">
                    <p className="text-[10px] text-brand-muted font-medium">5. Won Deals</p>
                    <p className="text-base font-bold text-purple-700 font-mono mt-0.5">{c.won_deals}</p>
                    <p className="text-[10px] text-brand-muted font-mono mt-0.5">Revenue: {c.revenue.display}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-accent" />
                <span>Create Marketing Campaign</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-muted hover:text-brand-dark text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Enterprise AI Automation 2026"
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Grounded Service (9 Official) *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent bg-white"
                  >
                    {CORE_SERVICES.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Objective *
                  </label>
                  <select
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent bg-white"
                  >
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="BRAND_AWARENESS">Brand Awareness</option>
                    <option value="PRODUCT_LAUNCH">Product Launch</option>
                    <option value="EVENT_REGISTRATION">Event Registration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                  Target Audience *
                </label>
                <input
                  type="text"
                  required
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="e.g. CTOs and Operations Leaders seeking automation"
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                    Lead Source
                  </label>
                  <input
                    type="text"
                    value={formData.lead_source}
                    onChange={(e) => setFormData({ ...formData, lead_source: e.target.value })}
                    className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                  Landing Page URL
                </label>
                <input
                  type="url"
                  value={formData.landing_page}
                  onChange={(e) => setFormData({ ...formData, landing_page: e.target.value })}
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-brand-dark mb-1">
                  Content Brief / Creative Copy
                </label>
                <textarea
                  rows={2}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Summary of promotional angle, case study theme, or value proposition..."
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs text-brand-dark focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-brand-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-accent hover:bg-brand-accent/90 shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? "Creating..." : "Launch Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
