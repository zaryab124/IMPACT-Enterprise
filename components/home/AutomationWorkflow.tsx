"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Users,
  Filter,
  Layers,
  Send,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

interface AutomationStep {
  num: string;
  name: string;
  stageTitle: string;
  icon: React.ElementType;
  timeSpentAutonomous: string;
  timeSpentManual: string;
  desc: string;
  automatedActions: string[];
  techUsed: string;
}

export const AutomationWorkflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [comparisonMode, setComparisonMode] = useState<"impact" | "legacy">("impact");

  const pipelineSteps: AutomationStep[] = [
    {
      num: "01",
      name: "LEAD INGESTION",
      stageTitle: "Multi-Source Lead Capture",
      icon: Users,
      timeSpentAutonomous: "0.2 seconds",
      timeSpentManual: "2 to 8 hours",
      desc: "Captures inbound prospects across WhatsApp, website forms, Google Ads, LinkedIn, and referral webhooks simultaneously into an unified pipeline.",
      automatedActions: [
        "Inbound webhook received and decrypted",
        "Deduplication against existing database records",
        "Source attribution tags logged automatically",
      ],
      techUsed: "Webhook Gateway • Cloud Pub/Sub • Next.js API",
    },
    {
      num: "02",
      name: "QUALIFICATION",
      stageTitle: "AI Scoring & Enrichment",
      icon: Filter,
      timeSpentAutonomous: "1.4 seconds",
      timeSpentManual: "4 to 24 hours",
      desc: "Autonomous AI evaluates budget, business fit, tech stack requirements, and intent score, rejecting spam and prioritizing high-value founders.",
      automatedActions: [
        "Company domain enrichment via automated registry check",
        "LLM qualification score assigned (1 - 100)",
        "Automated tier routing: High-Value vs Self-Serve",
      ],
      techUsed: "LLM Classifier • Apollo/Clearbit API • Redis Cache",
    },
    {
      num: "03",
      name: "CRM SYNC",
      stageTitle: "Instant CRM & Pipeline Sync",
      icon: Layers,
      timeSpentAutonomous: "0.8 seconds",
      timeSpentManual: "Manual data entry (Often missed)",
      desc: "Creates or updates deals in HubSpot, Salesforce, or custom PostgreSQL databases with zero human copy-pasting or lost lead history.",
      automatedActions: [
        "Deal object generated with estimated value",
        "Assigned to appropriate account executive or engineer",
        "Full conversation transcript attached to contact record",
      ],
      techUsed: "HubSpot / Salesforce REST API • PostgreSQL RLS",
    },
    {
      num: "04",
      name: "FOLLOW-UP",
      stageTitle: "Sub-90s Dynamic Outreach",
      icon: Send,
      timeSpentAutonomous: "Sub-90 seconds",
      timeSpentManual: "1 to 2 business days",
      desc: "Dispatches personalized email and WhatsApp responses addressing the customer's exact project scope, technical stack, and timeline needs.",
      automatedActions: [
        "Personalized technical brief generated based on inquiry",
        "Interactive calendar booking link dispatched via WhatsApp/Email",
        "Read-receipt and delivery webhooks monitored in real time",
      ],
      techUsed: "WhatsApp Cloud API • SendGrid • Dynamic Templates",
    },
    {
      num: "05",
      name: "SALES ALIGNMENT",
      stageTitle: "Executive Briefing & Discovery",
      icon: CalendarCheck,
      timeSpentAutonomous: "Automated sync",
      timeSpentManual: "3 to 5 back-and-forth emails",
      desc: "The client selects a confirmed meeting slot on the executive's calendar. An AI briefing dossier is auto-compiled for the leadership team.",
      automatedActions: [
        "Google Calendar / Cal.com invitation confirmed",
        "Pre-meeting briefing memo prepared for CEO/CGO",
        "SMS and WhatsApp reminder sequence scheduled",
      ],
      techUsed: "Cal.com API • Google Workspace SDK • AI Summarizer",
    },
    {
      num: "06",
      name: "CONVERSION",
      stageTitle: "Contracting & Project Kickoff",
      icon: TrendingUp,
      timeSpentAutonomous: "Immediate trigger",
      timeSpentManual: "3 to 7 days of manual drafting",
      desc: "Upon agreement, project intake, NDA generation, milestone contracts, and GitHub workspace repositories are provisioned in minutes.",
      automatedActions: [
        "Dynamic contract & milestone schedule generated",
        "Client portal credentials and onboarding roadmap dispatched",
        "Private Slack / WhatsApp project channel provisioned",
      ],
      techUsed: "DocuSign / PandaDoc API • GitHub API • Stripe Invoicing",
    },
  ];

  const current = pipelineSteps[activeTab];

  return (
    <section className="py-20 lg:py-28 bg-[#FAF9F6] border-b border-brand-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Revenue Engine</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-dark">
              AUTOMATION VISUALIZATION
            </h2>
            <p className="mt-3 text-base sm:text-lg text-brand-muted leading-relaxed">
              From the instant a lead arrives to closed conversion: every bottleneck eliminated with zero data dropped.
            </p>
          </div>

          {/* Comparison Mode Toggle */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white border border-brand-border shadow-xs self-start lg:self-auto">
            <button
              onClick={() => setComparisonMode("impact")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                comparisonMode === "impact"
                  ? "bg-brand-accent text-white shadow-xs"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>IMPACT Autonomous Engine</span>
            </button>
            <button
              onClick={() => setComparisonMode("legacy")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                comparisonMode === "legacy"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Legacy Manual Process</span>
            </button>
          </div>
        </div>

        {/* 6-Step Pipeline Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {pipelineSteps.map((step, idx) => {
            const isActive = activeTab === idx;
            const Icon = step.icon;

            return (
              <button
                key={step.num}
                onClick={() => setActiveTab(idx)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative ${
                  isActive
                    ? "bg-white border-brand-accent shadow-cardHover scale-[1.02]"
                    : "bg-white/70 hover:bg-white border-brand-border hover:border-brand-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-black ${
                      isActive ? "text-brand-accent" : "text-brand-subtle"
                    }`}
                  >
                    STEP {step.num}
                  </span>
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-brand-accentSoft text-brand-accent"
                        : "bg-brand-surface text-brand-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="text-xs font-black text-brand-dark tracking-tight line-clamp-1">
                  {step.name}
                </div>

                <div className="mt-2 text-[11px] font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-teal" />
                  <span className="text-brand-teal truncate">
                    {comparisonMode === "impact"
                      ? step.timeSpentAutonomous
                      : step.timeSpentManual}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep Dive Card */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Description & Checklist */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-brand-surface text-brand-dark border border-brand-border text-xs font-mono font-bold">
                  STAGE {current.num} OF 06
                </span>
                <span className="text-xs font-mono font-bold text-brand-teal uppercase">
                  {comparisonMode === "impact" ? "Fully Automated" : "High Friction Risk"}
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-black text-brand-dark tracking-tight">
                {current.stageTitle}
              </h3>

              <p className="text-base text-brand-muted leading-relaxed">
                {current.desc}
              </p>

              {/* Automated Actions Checklist */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-subtle block">
                  Autonomous Execution Sequence:
                </span>
                {current.automatedActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-brand-surface border border-brand-border/70">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-semibold text-brand-dark">{action}</span>
                  </div>
                ))}
              </div>

              {/* Technologies */}
              <div className="pt-2 text-xs text-brand-muted flex items-center gap-2">
                <span className="font-bold text-brand-dark">Built On:</span>
                <span className="font-mono text-brand-accent">{current.techUsed}</span>
              </div>
            </div>

            {/* Right: Comparative Impact Matrix */}
            <div className="lg:col-span-5 bg-brand-surface rounded-2xl p-6 sm:p-7 border border-brand-border space-y-5">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand-subtle">
                Comparative Velocity Benchmark
              </div>

              {/* IMPACT Autonomous Box */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  comparisonMode === "impact"
                    ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30"
                    : "bg-white border-brand-border opacity-70"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                    IMPACT Autonomous Pipeline
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {current.timeSpentAutonomous}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 leading-snug">
                  Zero human lag. Instant CRM synchronization, instant personalized reply, automated calendar invite.
                </p>
              </div>

              {/* Legacy Manual Box */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  comparisonMode === "legacy"
                    ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/30"
                    : "bg-white border-brand-border opacity-70"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-rose-800 uppercase tracking-wide">
                    Legacy Manual Process
                  </span>
                  <span className="text-xs font-mono font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                    {current.timeSpentManual}
                  </span>
                </div>
                <p className="text-xs text-rose-700 leading-snug">
                  High friction, delayed responses, leads go cold to competitors, missed CRM entries.
                </p>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Link
                  href="/solutions/automation"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-xs shadow-xs transition-all text-center"
                >
                  <span>Build This Automation Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
