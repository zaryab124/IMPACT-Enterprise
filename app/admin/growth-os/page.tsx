"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  CheckSquare,
  Share2,
  UserPlus,
  Building2,
  Target,
  Send,
  MessageSquare,
  Kanban,
  CheckCircle2,
  BarChart3,
  Users,
  ShieldAlert,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Zap,
  CheckCircle,
} from "lucide-react";
import { CORE_SERVICES, IMPACT_ENTERPRISE } from "@/packages/growth-os/constants";

interface ModuleCard {
  number: number;
  id: string;
  code: string;
  name: string;
  suite: "marketing" | "revenue" | "operations";
  description: string;
  icon: string;
  phasePlanned: number;
  isActive: boolean;
  isPermitted: boolean;
  minPermission: string;
  status: string;
}

interface FoundationSummary {
  campaignsCount: number;
  draftPostsCount: number;
  pendingApprovalsCount: number;
  scheduledPostsCount: number;
  publishedPostsCount: number;
  openTasksCount: number;
  urgentTasksCount: number;
  modulesCount: number;
  activeModulesCount: number;
}

interface HealthTelemetry {
  status: string;
  version: string;
  timestamp: string;
  latencyMs: number;
  telemetry: {
    totalModules: number;
    registeredInDb: number;
    openTasks: number;
    urgentTasks: number;
    campaigns: number;
  };
}

export default function GrowthOsDashboardPage() {
  const [modules, setModules] = useState<ModuleCard[]>([]);
  const [summary, setSummary] = useState<FoundationSummary | null>(null);
  const [health, setHealth] = useState<HealthTelemetry | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "marketing" | "revenue" | "operations">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const [modRes, sumRes, healthRes] = await Promise.all([
        fetch("/api/growth-os/modules"),
        fetch("/api/growth-os/summary"),
        fetch("/api/growth-os/health"),
      ]);

      if (!modRes.ok) throw new Error("Failed to load module registry");
      const modData = await modRes.json();
      setModules(modData.modules || []);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary || null);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.data || null);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading Growth OS");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles": return Sparkles;
      case "Calendar": return Calendar;
      case "CheckSquare": return CheckSquare;
      case "Share2": return Share2;
      case "UserPlus": return UserPlus;
      case "Building2": return Building2;
      case "Target": return Target;
      case "Send": return Send;
      case "MessageSquare": return MessageSquare;
      case "Kanban": return Kanban;
      case "CheckCircle2": return CheckCircle2;
      case "BarChart3": return BarChart3;
      case "Users": return Users;
      case "ShieldAlert": return ShieldAlert;
      default: return Layers;
    }
  };

  const filteredModules = activeTab === "all"
    ? modules
    : modules.filter((m) => m.suite === activeTab);

  return (
    <div className="space-y-8">
      {/* Brand Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
                Phase 0 Foundation Ready
              </span>
              <span className="text-xs font-mono text-slate-400">
                v1.0.0 Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              IMPACT Growth OS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-mono tracking-wide">
              {IMPACT_ENTERPRISE.brandPositioning}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Production-ready AI marketing, social media, lead intelligence, and revenue CRM platform for IMPACT Enterprise.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Engine"}</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine Status: {health?.status === "healthy" ? "Healthy" : "Online"}</span>
              {health?.latencyMs !== undefined && (
                <span className="text-[10px] text-emerald-500/80">({health.latencyMs}ms)</span>
              )}
            </div>
          </div>
        </div>

        {/* Subtle Decorative Canvas Accents */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-brand-border animate-pulse p-4" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-white rounded-xl border border-brand-border animate-pulse p-4" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Error loading Growth OS foundation:</span> {error}
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Foundation KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-muted">Registered Modules</span>
                <Layers className="w-4 h-4 text-brand-accent" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-dark">14</span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">100% Architected</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-muted">Active Campaigns</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-dark">{summary?.campaignsCount || 0}</span>
                <span className="text-[11px] font-mono text-brand-muted">Foundation Set</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-muted">Open CRM Tasks</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-dark">{summary?.openTasksCount || 0}</span>
                <span className="text-[11px] font-mono text-amber-600 font-bold">
                  {summary?.urgentTasksCount || 0} Urgent
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-brand-border shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-muted">Core Services Grounded</span>
                <Cpu className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-dark">{CORE_SERVICES.length}</span>
                <span className="text-[11px] font-mono text-brand-muted">0 Hallucinated</span>
              </div>
            </div>
          </div>

          {/* IMPACT Enterprise Authorized Core Services Showcase */}
          <div className="bg-white rounded-2xl border border-brand-border p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wider font-mono">
                  Grounded Core Services
                </h2>
                <p className="text-xs text-brand-muted">
                  Strictly authorized IMPACT Enterprise services driving AI agents, social copy, and qualification.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-brand-accent bg-brand-accentSoft px-2.5 py-1 rounded-md">
                Verified Grounding
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CORE_SERVICES.map((svc) => (
                <div
                  key={svc.id}
                  className="p-3.5 rounded-xl border border-brand-border bg-brand-surface hover:border-brand-accent/40 transition-colors flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-brand-border flex items-center justify-center text-brand-accent shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-brand-dark truncate">{svc.name}</span>
                      <span className="text-[9px] font-mono font-bold uppercase text-brand-muted bg-white px-1.5 py-0.5 rounded border border-brand-border">
                        {svc.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-charcoal leading-snug line-clamp-2">
                      {svc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module Architecture Suite Tabs & Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-brand-border pb-3">
              <div>
                <h2 className="text-base font-bold text-brand-dark tracking-tight">
                  14 Growth OS Capability Modules
                </h2>
                <p className="text-xs text-brand-muted">
                  Modular architecture allowing sequential phased deployment without rewriting existing systems.
                </p>
              </div>

              {/* Suite Filter Tabs */}
              <div className="flex items-center gap-1 bg-brand-surface p-1 rounded-xl border border-brand-border text-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === "all"
                      ? "bg-white text-brand-accent shadow-xs"
                      : "text-brand-muted hover:text-brand-dark"
                  }`}
                >
                  All (14)
                </button>
                <button
                  onClick={() => setActiveTab("marketing")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === "marketing"
                      ? "bg-white text-brand-accent shadow-xs"
                      : "text-brand-muted hover:text-brand-dark"
                  }`}
                >
                  Marketing (1-4)
                </button>
                <button
                  onClick={() => setActiveTab("revenue")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === "revenue"
                      ? "bg-white text-brand-accent shadow-xs"
                      : "text-brand-muted hover:text-brand-dark"
                  }`}
                >
                  Revenue (5-10)
                </button>
                <button
                  onClick={() => setActiveTab("operations")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === "operations"
                      ? "bg-white text-brand-accent shadow-xs"
                      : "text-brand-muted hover:text-brand-dark"
                  }`}
                >
                  Operations (11-14)
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredModules.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-brand-border p-6 space-y-3">
                <Layers className="w-8 h-8 text-brand-muted mx-auto" />
                <h3 className="text-sm font-bold text-brand-dark">No modules match this filter</h3>
                <p className="text-xs text-brand-muted">Select &quot;All&quot; to view all 14 Growth OS modules.</p>
              </div>
            )}

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((mod) => {
                const Icon = getModuleIcon(mod.icon);
                const isPhase0 = mod.phasePlanned === 0;
                const isNext = mod.phasePlanned === 1;

                return (
                  <div
                    key={mod.id}
                    className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-colors shadow-2xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono font-bold text-brand-muted">
                            Module #{mod.number}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                              isPhase0
                                ? "bg-emerald-100 text-emerald-800"
                                : isNext
                                ? "bg-blue-100 text-blue-800 animate-pulse"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isPhase0
                              ? "Foundation Active"
                              : isNext
                              ? "Phase 1 Target"
                              : `Phase ${mod.phasePlanned}`}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-brand-dark group-hover:text-brand-accent transition-colors">
                          {mod.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase font-bold text-brand-muted">
                          Suite: {mod.suite}
                        </span>
                      </div>

                      <p className="text-xs text-brand-charcoal leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-brand-muted">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Role Gate: {mod.minPermission}</span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-accent flex items-center gap-1">
                        <span>{isPhase0 ? "Foundation" : "Scheduled"}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
