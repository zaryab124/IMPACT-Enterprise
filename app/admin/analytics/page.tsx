"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Download,
  FileSpreadsheet,
  FileCode2,
  Calendar,
  Mic,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight,
  Filter,
} from "lucide-react";
import { AnalyticsSummary, ExportType, ExportFormat } from "@/packages/analytics/types";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Export Station State
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const fetchAnalytics = async (range: "7d" | "30d" | "all") => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/analytics?timeRange=${range}`);
      if (!res.ok) {
        throw new Error(`Failed to load analytics (${res.status})`);
      }
      const json = await res.json();
      setData(json.analytics);
    } catch (err: any) {
      setError(err.message || "Failed to load telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const handleDownload = async (type: ExportType) => {
    setExportLoading(type);
    try {
      const url = `/api/admin/analytics/export?type=${type}&format=${exportFormat}&timeRange=${timeRange}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const filename =
        res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") ||
        `impact_${type}_export.${exportFormat}`;

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setExportLoading(null);
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case "web_chat":
        return "bg-indigo-500";
      case "whatsapp":
        return "bg-emerald-500";
      case "email":
        return "bg-amber-500";
      case "phone":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Business Intelligence & SLA Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            Analytics & Telemetry Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Omnichannel volume distribution, multi-stage sales funnels, and real-time SLA metrics
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time Filter Pills */}
          <div className="inline-flex rounded-xl bg-white border border-brand-border p-1 shadow-xs">
            {(["7d", "30d", "all"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? "bg-brand-accent text-white shadow-xs"
                    : "text-brand-muted hover:text-brand-dark"
                }`}
              >
                {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "All Time"}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics(timeRange)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-dark hover:bg-brand-surface transition-all shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-accent" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Total Inbound Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-brand-dark tracking-tight">
              {loading ? "..." : data?.totalInteractions ?? 0}
            </div>
            <div className="text-[11px] text-brand-muted mt-1 font-medium">
              Conversations across all channels
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Leads Captured & Scored
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-brand-dark tracking-tight">
              {loading ? "..." : data?.totalLeads ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-bold">
              {data?.totalQualified ?? 0} BANT Qualified Prospects
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Overall Conversion
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-brand-dark tracking-tight">
              {loading ? "..." : `${data?.overallConversionRate ?? 0}%`}
            </div>
            <div className="text-[11px] text-brand-muted mt-1 font-medium">
              {data?.totalWon ?? 0} Closed Deals Won
            </div>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              AI First Response SLA
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-brand-dark tracking-tight">
              {loading ? "..." : `${data?.sla?.aiFirstResponseTimeAvgMs ?? 0}ms`}
            </div>
            <div className="text-[11px] text-purple-600 mt-1 font-bold">
              P95: {data?.sla?.aiFirstResponseTimeP95Ms ?? 0}ms
            </div>
          </div>
        </div>
      </div>

      {/* Row: Sales Conversion Funnel & Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Conversion Funnel (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-brand-dark">Sales Conversion Funnel</h2>
              <p className="text-xs text-brand-muted">
                Prospect progression from initial contact through deal completion
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-surface text-brand-charcoal text-[11px] font-mono font-bold">
              Top Drop-off: {data?.funnel?.topDropoffStage || "None"}
            </span>
          </div>

          <div className="space-y-4">
            {data?.funnel?.stages.map((stage, idx) => (
              <div key={stage.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-brand-surface flex items-center justify-center text-[10px] font-bold text-brand-muted">
                      {idx + 1}
                    </span>
                    <span className="text-brand-dark font-bold">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-brand-dark">{stage.count}</span>
                    <span className="text-brand-muted text-[11px]">
                      {stage.conversionRateFromPrevious}% step
                    </span>
                    <span className="text-brand-accent font-bold text-[11px]">
                      ({stage.overallConversionRate}% overall)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, stage.overallConversionRate)}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Omnichannel Traffic & Leads Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-black text-brand-dark">Channel Breakdown</h2>
            <p className="text-xs text-brand-muted">Inbound traffic and lead generation by channel</p>
          </div>

          {/* Comparative Stacked Bar */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Share of Conversations
            </div>
            <div className="w-full h-4 rounded-full bg-gray-100 overflow-hidden flex">
              {data?.channels.map((c) => (
                <div
                  key={c.channel}
                  className={`h-full ${getChannelColor(c.channel)} transition-all`}
                  style={{ width: `${c.percentageOfTotal}%` }}
                  title={`${c.label}: ${c.percentageOfTotal}%`}
                />
              ))}
            </div>

            {/* Legend & Breakdown Table */}
            <div className="space-y-2.5 pt-2">
              {data?.channels.map((c) => (
                <div
                  key={c.channel}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-brand-surface/50 border border-brand-border text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getChannelColor(c.channel)}`} />
                    <span className="font-bold text-brand-dark">{c.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-mono font-bold text-brand-dark">{c.conversationCount}</div>
                      <div className="text-[10px] text-brand-muted">convs</div>
                    </div>
                    <div>
                      <div className="font-mono font-bold text-brand-accent">{c.leadCount}</div>
                      <div className="text-[10px] text-brand-muted">leads</div>
                    </div>
                    <div className="w-12 text-right">
                      <div className="font-bold text-emerald-600">{c.conversionRate}%</div>
                      <div className="text-[10px] text-brand-muted">rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row: SLA Response Times & Operational Performance */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-brand-dark">SLA Response Times & Performance</h2>
            <p className="text-xs text-brand-muted">
              Measured operational response velocity across AI agents, human takeovers, and messaging
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            SLA Compliant (99.4%)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase">
              <Zap className="w-4 h-4 text-indigo-600" />
              AI Agent Speed
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-dark">
                {data?.sla?.aiFirstResponseTimeAvgMs ?? 0}
              </span>
              <span className="text-xs font-semibold text-brand-muted">ms average</span>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Gemini 2.5 Flash time-to-first-token in live chat widget and voice turns.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase">
              <Clock className="w-4 h-4 text-amber-600" />
              Human Takeover Pickup
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-brand-dark">
                {data?.sla?.humanHandoffPickupAvgSec ?? 0}
              </span>
              <span className="text-xs font-semibold text-brand-muted">seconds avg</span>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Time from visitor handoff request until human agent claim in Admin Console.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-muted uppercase">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Omnichannel Delivery
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">
                {data?.sla?.omnichannelDeliveryRate ?? 0}%
              </span>
              <span className="text-xs font-semibold text-brand-muted">
                ({data?.sla?.omnichannelAvgDeliverySec ?? 0}s latency)
              </span>
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              WhatsApp & Email delivery success rate with automatic retry queueing.
            </p>
          </div>
        </div>
      </div>

      {/* Row: Data Export Station */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-brand-dark">Data Export Station</h2>
            <p className="text-xs text-brand-muted">
              Download complete, unmasked customer records, CRM deal pipelines, appointments, and voice intelligence
            </p>
          </div>

          {/* Format Radio Pills */}
          <div className="inline-flex rounded-xl bg-brand-surface border border-brand-border p-1 self-start sm:self-auto">
            <button
              onClick={() => setExportFormat("csv")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                exportFormat === "csv"
                  ? "bg-brand-dark text-white shadow-xs"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV (RFC 4180)</span>
            </button>
            <button
              onClick={() => setExportFormat("json")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                exportFormat === "json"
                  ? "bg-brand-dark text-white shadow-xs"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>JSON (Raw Data)</span>
            </button>
          </div>
        </div>

        {/* 4 Export Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-brand-border bg-white hover:border-brand-accent transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-brand-dark">Qualified Leads CRM</div>
              <p className="text-[11px] text-brand-muted leading-relaxed">
                Complete lead records with BANT scores, stages, budget, timeline, and problem descriptions.
              </p>
            </div>
            <button
              onClick={() => handleDownload("leads")}
              disabled={exportLoading === "leads"}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-surface hover:bg-brand-accent hover:text-white text-xs font-bold text-brand-dark transition-all border border-brand-border group-hover:border-brand-accent"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportLoading === "leads" ? "Exporting..." : `Export Leads (${exportFormat.toUpperCase()})`}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-brand-border bg-white hover:border-brand-accent transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-brand-dark">Inbound Conversations</div>
              <p className="text-[11px] text-brand-muted leading-relaxed">
                Omnichannel conversation threads across Web Chat, WhatsApp, Email, with statuses and turn counts.
              </p>
            </div>
            <button
              onClick={() => handleDownload("conversations")}
              disabled={exportLoading === "conversations"}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-surface hover:bg-brand-accent hover:text-white text-xs font-bold text-brand-dark transition-all border border-brand-border group-hover:border-brand-accent"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportLoading === "conversations" ? "Exporting..." : `Export Convs (${exportFormat.toUpperCase()})`}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-brand-border bg-white hover:border-brand-accent transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-brand-dark">Booked Consultations</div>
              <p className="text-[11px] text-brand-muted leading-relaxed">
                Consultation reservations, start/end timestamps, meeting links, and customer contact details.
              </p>
            </div>
            <button
              onClick={() => handleDownload("appointments")}
              disabled={exportLoading === "appointments"}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-surface hover:bg-brand-accent hover:text-white text-xs font-bold text-brand-dark transition-all border border-brand-border group-hover:border-brand-accent"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportLoading === "appointments" ? "Exporting..." : `Export Schedule (${exportFormat.toUpperCase()})`}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-brand-border bg-white hover:border-brand-accent transition-all flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-brand-dark">Voice Intelligence</div>
              <p className="text-[11px] text-brand-muted leading-relaxed">
                Call recording dossiers with duration, sentiment trajectories, extracted topics, and action items.
              </p>
            </div>
            <button
              onClick={() => handleDownload("voice")}
              disabled={exportLoading === "voice"}
              className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-brand-surface hover:bg-brand-accent hover:text-white text-xs font-bold text-brand-dark transition-all border border-brand-border group-hover:border-brand-accent"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportLoading === "voice" ? "Exporting..." : `Export Voice (${exportFormat.toUpperCase()})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
