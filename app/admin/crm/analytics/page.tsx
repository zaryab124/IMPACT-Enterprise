"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Share2,
  Bot,
  Calendar,
  Info,
  RefreshCw,
  Sparkles,
  MousePointer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { GrowthAnalyticsReport, MetricTransparency } from "@/packages/growth-os/analytics/types";

export default function GrowthAnalyticsPage() {
  const [report, setReport] = useState<GrowthAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [activeTab, setActiveTab] = useState<"social" | "leads" | "sales" | "ai">("social");
  const [selectedMetric, setSelectedMetric] = useState<MetricTransparency<any> | null>(null);

  const fetchAnalytics = async (range = timeRange) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/analytics/growth?timeRange=${range}`);
      const json = await res.json();
      if (json.success) {
        setReport(json.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const renderMetricCard = (
    title: string,
    metric: MetricTransparency<any> | undefined,
    colorClass: string = "text-brand-dark"
  ) => {
    if (!metric) return null;
    return (
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs hover:border-brand-accent/40 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">{title}</span>
            <button
              onClick={() => setSelectedMetric(metric)}
              className="text-brand-muted hover:text-brand-accent transition-colors"
              title="View metric definition & verified source"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className={`text-2xl font-black mt-2 font-mono ${colorClass}`}>{metric.display}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-brand-border/60">
          <p className="text-[10px] text-brand-muted line-clamp-1">{metric.definition}</p>
          <p className="text-[9px] text-brand-muted font-mono mt-0.5 truncate">
            Source: <span className="text-brand-dark font-medium">{metric.source}</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 14 Growth Analytics
            </span>
            <span className="text-xs text-brand-muted font-mono">Anti-Fabrication & Transparent Grounding</span>
          </div>
          <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2 mt-1">
            <BarChart3 className="w-5 h-5 text-brand-accent" />
            <span>Growth Intelligence & Performance Analytics</span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">
            Every metric is grounded in transparent definitions, exact timeframes, and verified database sources.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center gap-2 bg-brand-surface/60 p-1.5 rounded-xl border border-brand-border text-xs">
          <span className="text-[10px] font-bold text-brand-muted uppercase px-2">Period:</span>
          {["7d", "30d", "90d", "all"].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === r
                  ? "bg-white text-brand-accent shadow-xs border border-brand-border"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => fetchAnalytics()}
            disabled={loading}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("social")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === "social"
              ? "bg-brand-accent text-white shadow-xs"
              : "text-brand-muted hover:text-brand-dark hover:bg-white"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>1. Social Media</span>
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === "leads"
              ? "bg-brand-accent text-white shadow-xs"
              : "text-brand-muted hover:text-brand-dark hover:bg-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. Inbound Leads</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === "sales"
              ? "bg-brand-accent text-white shadow-xs"
              : "text-brand-muted hover:text-brand-dark hover:bg-white"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>3. Sales Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
            activeTab === "ai"
              ? "bg-brand-accent text-white shadow-xs"
              : "text-brand-muted hover:text-brand-dark hover:bg-white"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>4. AI Operations</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-brand-muted text-xs bg-white rounded-2xl border border-brand-border">
          Gathering transparent growth telemetry...
        </div>
      ) : !report ? (
        <div className="p-16 text-center text-brand-muted text-xs bg-white rounded-2xl border border-brand-border">
          No analytics data found for this period.
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: SOCIAL MEDIA */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {renderMetricCard("Total Posts", report.social.posts)}
                {renderMetricCard("Reach (Impressions)", report.social.reach, "text-blue-600")}
                {renderMetricCard("Engagement", report.social.engagement, "text-indigo-600")}
                {renderMetricCard("Funnel Clicks", report.social.clicks, "text-emerald-600")}
                {renderMetricCard("Follower Changes", report.social.follower_changes, "text-teal-600")}
              </div>

              {/* Platform Comparison */}
              <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-brand-dark">Platform Performance Comparison</h3>
                    <p className="text-[10px] text-brand-muted">{report.social.platform_comparison.definition}</p>
                  </div>
                  <span className="text-[10px] font-mono text-brand-muted bg-brand-surface px-2.5 py-1 rounded-md border border-brand-border">
                    {report.social.platform_comparison.source}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-brand-border text-[10px] font-bold text-brand-muted uppercase">
                        <th className="py-2.5 px-3">Platform</th>
                        <th className="py-2.5 px-3">Posts Authored</th>
                        <th className="py-2.5 px-3">Reach Verified</th>
                        <th className="py-2.5 px-3">Engagements</th>
                        <th className="py-2.5 px-3">Link Clicks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40 font-mono">
                      {report.social.platform_comparison.platforms.map((p) => (
                        <tr key={p.platform} className="hover:bg-brand-surface/30">
                          <td className="py-2.5 px-3 font-sans font-bold capitalize text-brand-dark">{p.platform}</td>
                          <td className="py-2.5 px-3">{p.posts}</td>
                          <td className="py-2.5 px-3">{p.reach.toLocaleString()}</td>
                          <td className="py-2.5 px-3">{p.engagement.toLocaleString()}</td>
                          <td className="py-2.5 px-3">{p.clicks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS */}
          {activeTab === "leads" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderMetricCard("Total Inbound Leads", report.leads.total_leads)}
                {renderMetricCard("Qualified Leads", report.leads.qualified_leads, "text-emerald-600")}
                {renderMetricCard("Lead Response Time", report.leads.lead_response_time_minutes, "text-indigo-600")}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Leads by Source */}
                <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-brand-dark">Leads by 10 Canonical Sources</h4>
                  <div className="space-y-2 font-mono text-xs">
                    {Object.entries(report.leads.leads_by_source.breakdown).length === 0 ? (
                      <p className="text-[11px] text-brand-muted">No leads in this period</p>
                    ) : (
                      Object.entries(report.leads.leads_by_source.breakdown).map(([src, cnt]) => (
                        <div key={src} className="flex items-center justify-between p-2 rounded-lg bg-brand-surface/40">
                          <span className="text-[11px] font-sans capitalize text-brand-dark">{src.replace(/_/g, " ")}</span>
                          <span className="font-bold text-brand-dark">{cnt}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[9px] text-brand-muted font-mono pt-2 border-t border-brand-border/60">
                    Source: {report.leads.leads_by_source.source}
                  </p>
                </div>

                {/* Leads by Campaign */}
                <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-brand-dark">Leads by Campaign</h4>
                  <div className="space-y-2 font-mono text-xs">
                    {Object.entries(report.leads.leads_by_campaign.breakdown).length === 0 ? (
                      <p className="text-[11px] text-brand-muted">No campaign leads recorded</p>
                    ) : (
                      Object.entries(report.leads.leads_by_campaign.breakdown).map(([camp, cnt]) => (
                        <div key={camp} className="flex items-center justify-between p-2 rounded-lg bg-brand-surface/40">
                          <span className="text-[11px] font-sans text-brand-dark truncate max-w-[150px]">{camp}</span>
                          <span className="font-bold text-brand-dark">{cnt}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[9px] text-brand-muted font-mono pt-2 border-t border-brand-border/60">
                    Source: {report.leads.leads_by_campaign.source}
                  </p>
                </div>

                {/* Leads by Service */}
                <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-brand-dark">Leads by Official Service (9)</h4>
                  <div className="space-y-2 font-mono text-xs">
                    {Object.entries(report.leads.leads_by_service.breakdown).length === 0 ? (
                      <p className="text-[11px] text-brand-muted">No service-attributed leads</p>
                    ) : (
                      Object.entries(report.leads.leads_by_service.breakdown).map(([srv, cnt]) => (
                        <div key={srv} className="flex items-center justify-between p-2 rounded-lg bg-brand-surface/40">
                          <span className="text-[11px] font-sans text-brand-dark truncate max-w-[150px]">{srv}</span>
                          <span className="font-bold text-brand-dark">{cnt}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[9px] text-brand-muted font-mono pt-2 border-t border-brand-border/60">
                    Source: {report.leads.leads_by_service.source}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SALES */}
          {activeTab === "sales" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderMetricCard("Active Pipeline Value", report.sales.pipeline_value, "text-brand-accent")}
                {renderMetricCard("Active Deals Count", report.sales.active_deals)}
                {renderMetricCard("Won Deals", report.sales.won_deals, "text-emerald-600")}
                {renderMetricCard(
                  "Verified Won Revenue",
                  report.sales.won_revenue,
                  report.sales.won_revenue.value ? "text-emerald-700" : "text-amber-600"
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderMetricCard("Lost Deals", report.sales.lost_deals, "text-rose-600")}
                {renderMetricCard("Average Deal Value", report.sales.average_deal_value)}
                {renderMetricCard("Sales-Cycle Duration", report.sales.sales_cycle_duration_days)}
              </div>
            </div>
          )}

          {/* TAB 4: AI OPERATIONS */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderMetricCard("AI Content Generated", report.ai.ai_generated_content)}
                {renderMetricCard("Approved Content", report.ai.approved_content, "text-emerald-600")}
                {renderMetricCard("Rejected Content", report.ai.rejected_content, "text-rose-600")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {renderMetricCard("AI-Qualified Leads", report.ai.ai_qualified_leads, "text-indigo-600")}
                {renderMetricCard("Human Overrides", report.ai.human_overrides, "text-amber-600")}
                {renderMetricCard("AI Follow-ups Drafted", report.ai.ai_follow_ups, "text-purple-600")}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metric Transparency Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-brand-dark">Metric Transparency Verification</h3>
              </div>
              <button
                onClick={() => setSelectedMetric(null)}
                className="text-brand-muted hover:text-brand-dark text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-brand-muted uppercase block">Value Display</span>
                <p className="text-xl font-black text-brand-dark font-mono mt-0.5">{selectedMetric.display}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-brand-muted uppercase block">Formal Definition</span>
                <p className="text-brand-dark mt-0.5">{selectedMetric.definition}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-brand-muted uppercase block">Time Period Evaluated</span>
                <p className="font-mono text-brand-dark mt-0.5">{selectedMetric.time_period}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-brand-muted uppercase block">Database Source & Grounding</span>
                <p className="font-mono bg-brand-surface p-2.5 rounded-xl border border-brand-border text-brand-dark text-[11px] mt-0.5">
                  {selectedMetric.source}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-brand-border flex justify-end">
              <button
                onClick={() => setSelectedMetric(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-accent hover:bg-brand-accent/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
