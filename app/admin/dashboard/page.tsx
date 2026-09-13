"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  MessageSquare,
  Calendar,
  Flame,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  BarChart3,
} from "lucide-react";

interface MetricsData {
  totalLeads: number;
  qualifiedLeads: number;
  hotLeads: number;
  totalCustomers: number;
  activeConversations: number;
  bookedAppointments: number;
  pendingHandoffs: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dashboard/metrics");
      if (!res.ok) {
        throw new Error(`Failed to load metrics (${res.status})`);
      }
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const kpis = [
    {
      label: "Total Inbound Leads",
      value: metrics?.totalLeads ?? 0,
      icon: Users,
      color: "text-brand-accent",
      bg: "bg-brand-accentSoft",
      href: "/admin/leads",
    },
    {
      label: "Qualified Prospects",
      value: metrics?.qualifiedLeads ?? 0,
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/admin/leads",
    },
    {
      label: "Hot Leads (Score ≥75)",
      value: metrics?.hotLeads ?? 0,
      icon: Flame,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/leads",
    },
    {
      label: "Total Customers",
      value: metrics?.totalCustomers ?? 0,
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/customers",
    },
    {
      label: "Conversations Active",
      value: metrics?.activeConversations ?? 0,
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/admin/conversations",
    },
    {
      label: "Appointments Booked",
      value: metrics?.bookedAppointments ?? 0,
      icon: Calendar,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: "/admin/appointments",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Telemetry Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            Sales & Operational Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Real-time pipeline metrics, customer qualification streams, and autonomous agent status
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accent/90 transition-all shadow-xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Telemetry & Exports →</span>
          </Link>

          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-dark hover:bg-brand-surface transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-accent" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Human Handoff Banner (if pending) */}
      {(metrics?.pendingHandoffs ?? 0) > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <div>
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                🔴 Urgent Attention Required
              </div>
              <div className="text-xs text-amber-700 font-medium">
                {metrics?.pendingHandoffs} conversation(s) currently awaiting human takeover.
              </div>
            </div>
          </div>
          <Link
            href="/admin/conversations"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Review Queue
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              href={kpi.href}
              className="bg-white border border-brand-border rounded-2xl p-5 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  {kpi.label}
                </span>
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-brand-dark tracking-tight">
                  {loading ? "..." : kpi.value}
                </span>
                <span className="text-xs font-semibold text-brand-accent group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
              Pipeline Management
            </h2>
            <Link href="/admin/leads" className="text-xs font-bold text-brand-accent hover:underline">
              All Leads →
            </Link>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            Review customer intake briefs, score metrics across budget, authority, and problem clarity, and transition leads from NEW to QUALIFIED, PROPOSAL, or WON.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/admin/leads"
              className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-xs font-bold text-brand-dark transition-colors"
            >
              Review Leads
            </Link>
            <Link
              href="/admin/appointments"
              className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-xs font-bold text-brand-dark transition-colors"
            >
              Calendar Schedule
            </Link>
            <Link
              href="/requests"
              className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-xs font-bold text-brand-dark transition-colors"
            >
              Public Form Submissions
            </Link>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
              AI & System Controls
            </h2>
            <Link href="/admin/settings" className="text-xs font-bold text-brand-accent hover:underline">
              Settings →
            </Link>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed">
            Inspect conversation transcripts, configure system model parameters, verify zero-hallucination guardrails, and audit platform security actions.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/admin/conversations"
              className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-xs font-bold text-brand-dark transition-colors"
            >
              Inspect Conversations
            </Link>
            <Link
              href="/admin/settings"
              className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-xs font-bold text-brand-dark transition-colors"
            >
              System Configuration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
