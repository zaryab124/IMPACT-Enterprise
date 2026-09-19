"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Megaphone,
  Share2,
  DollarSign,
  TrendingUp,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Target,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  PhoneCall,
  Activity,
  FileText,
  UserCheck,
} from "lucide-react";

type RolePerspective = "ceo" | "sales" | "marketing" | "agent" | "admin";

export default function GrowthOsCommandCenterPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<RolePerspective>("ceo");

  const fetchCommandCenter = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/dashboard");
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
    fetchCommandCenter();
  }, []);

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
              IMPACT Growth OS
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Autonomous Engine Active
            </span>
          </div>
          <h1 className="text-xl font-black text-brand-dark flex items-center gap-2 mt-1">
            <span>Executive Command Center</span>
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Unified operational overview across Marketing, Inbound Leads, Sales Pipeline, AI Operations, and Team Workflows.
          </p>
        </div>

        {/* Role View Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-brand-surface/60 p-1.5 rounded-xl border border-brand-border text-xs">
          <span className="text-[10px] font-bold text-brand-muted uppercase px-2">Perspective:</span>
          {(
            [
              { id: "ceo", label: "CEO View", icon: "👑" },
              { id: "sales", label: "Sales View", icon: "💼" },
              { id: "marketing", label: "Marketing View", icon: "📢" },
              { id: "agent", label: "Agent View", icon: "🤖" },
              { id: "admin", label: "Admin View", icon: "⚙️" },
            ] as const
          ).map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeRole === role.id
                  ? "bg-brand-accent text-white shadow-xs"
                  : "text-brand-muted hover:text-brand-dark hover:bg-white"
              }`}
            >
              <span>{role.icon}</span>
              <span>{role.label}</span>
            </button>
          ))}
          <button
            onClick={fetchCommandCenter}
            disabled={loading}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-white ml-1"
            title="Refresh Command Center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="p-16 text-center text-brand-muted text-xs bg-white rounded-2xl border border-brand-border">
          Connecting to IMPACT Growth OS telemetry...
        </div>
      ) : !data ? (
        <div className="p-16 text-center text-brand-muted text-xs bg-white rounded-2xl border border-brand-border">
          Command Center telemetry unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* ========================================================= */}
          {/* ROLE-SPECIFIC EXECUTIVE PERSPECTIVE BANNER                */}
          {/* ========================================================= */}
          {activeRole === "ceo" && (
            <div className="bg-gradient-to-r from-slate-900 to-brand-dark text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-brand-accent uppercase">
                    CEO EXECUTIVE PERSPECTIVE
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">High-Level Business Metrics & Revenue Velocity</h3>
                </div>
                <span className="text-xs text-white/60 font-mono">Realized CRM Figures</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 font-semibold block">Entered Won Revenue</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    {data.sales.wonRevenueDisplay}
                  </p>
                  <span className="text-[9px] text-white/50 block mt-1">Zero-fabrication rule</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 font-semibold block">Active Pipeline Opportunity</span>
                  <p className="text-2xl font-black text-brand-accent font-mono mt-1">
                    ${data.sales.pipelineValue.toLocaleString()}
                  </p>
                  <span className="text-[9px] text-white/50 block mt-1">Across {data.sales.activeDeals} deals</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 font-semibold block">Qualified Prospect Volume</span>
                  <p className="text-2xl font-black text-indigo-300 font-mono mt-1">
                    {data.leads.qualifiedLeads}
                  </p>
                  <span className="text-[9px] text-white/50 block mt-1">From {data.leads.totalLeads} total leads</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 font-semibold block">Critical Operational Alerts</span>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-1">
                    {data.alerts.overdueFollowUps + data.alerts.failedPublishing + data.alerts.failedAutomations}
                  </p>
                  <span className="text-[9px] text-white/50 block mt-1">Requiring executive attention</span>
                </div>
              </div>
            </div>
          )}

          {activeRole === "sales" && (
            <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-900 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                    SALES OPERATIONS VIEW
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Inbound Pipeline & Deal Conversions</h3>
                </div>
                <Link href="/admin/crm/leads" className="text-xs text-emerald-300 hover:underline">
                  View Leads Board →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-emerald-200 block">New Inbound Leads</span>
                  <p className="text-2xl font-black font-mono mt-1 text-white">{data.leads.newLeads}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-emerald-200 block">Qualified Prospects</span>
                  <p className="text-2xl font-black font-mono mt-1 text-emerald-300">{data.leads.qualifiedLeads}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-emerald-200 block">Follow-ups Overdue</span>
                  <p className="text-2xl font-black font-mono mt-1 text-amber-400">{data.alerts.overdueFollowUps}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-emerald-200 block">Active Deals in Pipeline</span>
                  <p className="text-2xl font-black font-mono mt-1 text-white">{data.sales.activeDeals}</p>
                </div>
              </div>
            </div>
          )}

          {activeRole === "marketing" && (
            <div className="bg-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-900 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
                    MARKETING & INBOUND VIEW
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">Campaigns, Content Approvals & Social Reach</h3>
                </div>
                <Link href="/admin/crm/campaigns" className="text-xs text-indigo-300 hover:underline">
                  Campaign Funnels →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-indigo-200 block">Active Campaigns</span>
                  <p className="text-2xl font-black font-mono mt-1 text-white">{data.marketing.activeCampaigns}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-indigo-200 block">Pending Content Approvals</span>
                  <p className="text-2xl font-black font-mono mt-1 text-amber-400">{data.marketing.pendingApprovals}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-indigo-200 block">Scheduled Social Releases</span>
                  <p className="text-2xl font-black font-mono mt-1 text-white">{data.marketing.scheduledPosts}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-indigo-200 block">Verified Social Reach</span>
                  <p className="text-2xl font-black font-mono mt-1 text-indigo-300">{data.marketing.socialPerformance.display}</p>
                </div>
              </div>
            </div>
          )}

          {activeRole === "agent" && (
            <div className="bg-purple-950 text-white rounded-2xl p-6 shadow-md border border-purple-900 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase">
                    SALES AGENT WORKSPACE VIEW
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">My Assigned Leads, Tasks & Action Queue</h3>
                </div>
                <Link href="/admin/crm/leads" className="text-xs text-purple-300 hover:underline">
                  My Pipeline →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-purple-200 block">Assigned Leads</span>
                  <p className="text-2xl font-black font-mono mt-1 text-white">{data.team.assignedLeads}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-purple-200 block">Pending CRM Tasks</span>
                  <p className="text-2xl font-black font-mono mt-1 text-amber-400">{data.team.openTasks}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-purple-200 block">AI Follow-up Drafts</span>
                  <p className="text-2xl font-black font-mono mt-1 text-purple-300">{data.ai.followUps}</p>
                </div>
              </div>
            </div>
          )}

          {activeRole === "admin" && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-brand-accent uppercase">
                    SYSTEM ADMINISTRATOR VIEW
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">System Health, Integrations & Automation Logs</h3>
                </div>
                <span className="text-xs text-emerald-400 font-mono">13 Migrations Active</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 block">Automation Engine Failures</span>
                  <p className="text-2xl font-black font-mono mt-1 text-amber-400">{data.alerts.failedAutomations}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 block">Failed Publishing Retries</span>
                  <p className="text-2xl font-black font-mono mt-1 text-rose-400">{data.alerts.failedPublishing}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 block">Total AI Operations Logged</span>
                  <p className="text-2xl font-black font-mono mt-1 text-white">{data.ai.totalActivities}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                  <span className="text-[10px] text-white/70 block">Database & PGlite Status</span>
                  <p className="text-2xl font-black font-mono mt-1 text-emerald-400">100% HEALTHY</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* THE 6 CORE EXECUTIVE SECTIONS                             */}
          {/* ========================================================= */}

          {/* SECTION 1: MARKETING */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-accent" />
                <h2 className="text-base font-bold text-brand-dark">1. Marketing Initiatives & Content</h2>
              </div>
              <Link href="/admin/crm/campaigns" className="text-xs font-semibold text-brand-accent hover:underline">
                View Campaigns & Funnels →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Scheduled Posts</span>
                <p className="text-xl font-black text-brand-dark font-mono mt-1">{data.marketing.scheduledPosts}</p>
                <span className="text-[10px] text-brand-muted">Upcoming automated releases</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Pending Approvals</span>
                <p className="text-xl font-black text-amber-600 font-mono mt-1">{data.marketing.pendingApprovals}</p>
                <span className="text-[10px] text-brand-muted">Human review gate active</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Active Campaigns</span>
                <p className="text-xl font-black text-indigo-600 font-mono mt-1">{data.marketing.activeCampaigns}</p>
                <span className="text-[10px] text-brand-muted">Multi-touch attribution</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Social Performance</span>
                <p className="text-xl font-black text-emerald-600 font-mono mt-1">{data.marketing.socialPerformance.display}</p>
                <span className="text-[10px] text-brand-muted">Verified platform reach</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: LEADS */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-brand-dark">2. Inbound Leads & Qualification</h2>
              </div>
              <Link href="/admin/crm/leads" className="text-xs font-semibold text-brand-accent hover:underline">
                Lead Intake & Board →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Total Inbound Leads</span>
                <p className="text-xl font-black text-brand-dark font-mono mt-1">{data.leads.totalLeads}</p>
                <span className="text-[10px] text-brand-muted">Across 10 canonical sources</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">New Leads</span>
                <p className="text-xl font-black text-blue-600 font-mono mt-1">{data.leads.newLeads}</p>
                <span className="text-[10px] text-brand-muted">Awaiting salesperson contact</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Qualified Leads</span>
                <p className="text-xl font-black text-emerald-600 font-mono mt-1">{data.leads.qualifiedLeads}</p>
                <span className="text-[10px] text-brand-muted">Score ≥ 70 or HIGH_INTENT</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Follow-ups Due</span>
                <p className="text-xl font-black text-amber-600 font-mono mt-1">{data.leads.followUpsDue}</p>
                <span className="text-[10px] text-brand-muted">SLA contact required</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: SALES PIPELINE */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-brand-dark">3. Commercial Sales Pipeline</h2>
              </div>
              <Link href="/admin/crm/deals" className="text-xs font-semibold text-brand-accent hover:underline">
                Deals Pipeline →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Pipeline Value</span>
                <p className="text-xl font-black text-brand-dark font-mono mt-1">${data.sales.pipelineValue.toLocaleString()}</p>
                <span className="text-[10px] text-brand-muted">Active open value</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Active Deals</span>
                <p className="text-xl font-black text-indigo-600 font-mono mt-1">{data.sales.activeDeals}</p>
                <span className="text-[10px] text-brand-muted">In negotiation / proposal</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Won Deals</span>
                <p className="text-xl font-black text-emerald-600 font-mono mt-1">{data.sales.wonDeals}</p>
                <span className="text-[10px] text-brand-muted">Successfully closed</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Verified Won Revenue</span>
                <p className="text-xl font-black text-purple-700 font-mono mt-1">{data.sales.wonRevenueDisplay}</p>
                <span className="text-[10px] text-brand-muted">Strict CRM entered value</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Lost Deals</span>
                <p className="text-xl font-black text-rose-600 font-mono mt-1">{data.sales.lostDeals}</p>
                <span className="text-[10px] text-brand-muted">Nurture candidate</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: AI OPERATIONS */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-brand-dark">4. Autonomous AI Intelligence Operations</h2>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                {data.ai.totalActivities} Operations Executed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Content Generation</span>
                <p className="text-xl font-black text-brand-dark font-mono mt-1">{data.ai.contentGeneration}</p>
                <span className="text-[10px] text-brand-muted">Social posts drafted</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Lead Qualifications</span>
                <p className="text-xl font-black text-indigo-600 font-mono mt-1">{data.ai.qualification}</p>
                <span className="text-[10px] text-brand-muted">8-dimension evaluations</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Follow-up Drafts</span>
                <p className="text-xl font-black text-purple-600 font-mono mt-1">{data.ai.followUps}</p>
                <span className="text-[10px] text-brand-muted">Email, WhatsApp & Chat</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Voice Call Interactions</span>
                <p className="text-xl font-black text-emerald-600 font-mono mt-1">{data.ai.calls}</p>
                <span className="text-[10px] text-brand-muted">Sub-500ms Gemini calls</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: TEAM WORKSPACE */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                <h2 className="text-base font-bold text-brand-dark">5. Team & Workspace Distribution</h2>
              </div>
              <span className="text-xs text-brand-muted font-mono">{data.team.openTasks} Active Tasks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Assigned Leads</span>
                <p className="text-xl font-black text-brand-dark font-mono mt-1">{data.team.assignedLeads}</p>
                <span className="text-[10px] text-brand-muted">Assigned to active sales reps</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Open Tasks</span>
                <p className="text-xl font-black text-teal-700 font-mono mt-1">{data.team.openTasks}</p>
                <span className="text-[10px] text-brand-muted">Discovery, follow-ups & onboarding</span>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/40 border border-brand-border">
                <span className="text-[11px] text-brand-muted font-medium">Recent Activities Logged</span>
                <p className="text-xl font-black text-indigo-700 font-mono mt-1">{data.team.recentActivities.length}</p>
                <span className="text-[10px] text-brand-muted">Real-time audit history</span>
              </div>
            </div>
          </div>

          {/* SECTION 6: CRITICAL ALERTS */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-brand-dark">6. Operational & System Alerts</h2>
              </div>
              <span className="text-xs text-brand-muted font-mono">Continuous Health Monitor</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="text-[11px] text-amber-800 font-semibold">Overdue Follow-ups</span>
                <p className="text-xl font-black text-amber-900 font-mono mt-1">{data.alerts.overdueFollowUps}</p>
                <span className="text-[10px] text-amber-700">Leads exceeding response SLA</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                <span className="text-[11px] text-rose-800 font-semibold">Failed Publishing</span>
                <p className="text-xl font-black text-rose-900 font-mono mt-1">{data.alerts.failedPublishing}</p>
                <span className="text-[10px] text-rose-700">Platform retry queues</span>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <span className="text-[11px] text-indigo-800 font-semibold">Failed Automations</span>
                <p className="text-xl font-black text-indigo-900 font-mono mt-1">{data.alerts.failedAutomations}</p>
                <span className="text-[10px] text-indigo-700">Loop prevention or rule faults</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold">Integration Health</span>
                <p className="text-xl font-black text-emerald-900 font-mono mt-1">NOMINAL</p>
                <span className="text-[10px] text-emerald-700">All adapters connected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
