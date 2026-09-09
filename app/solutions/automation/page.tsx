import React from "react";
import Link from "next/link";
import { Workflow, ArrowRight, CheckCircle2, Zap, Database, Mail, Bell, Layers, Sparkles, TrendingUp } from "lucide-react";
import { Metadata } from "next";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export const metadata: Metadata = {
  title: "Business Automation | IMPACT Technologies",
  description:
    "Automate the work. Amplify the business. End-to-end workflow automation connecting leads, CRMs, operations, notifications, and AI decision systems.",
};

export default function AutomationPage() {
  const pipelineSteps = [
    { step: "01", stage: "LEAD", detail: "Inbound visitor reaches website, social ad, WhatsApp, or referral channel." },
    { step: "02", stage: "CAPTURE", detail: "Instant webhook capture, payload normalization, and contact deduplication." },
    { step: "03", stage: "QUALIFY", detail: "AI evaluates lead score, company size, intent signals, and budget fit." },
    { step: "04", stage: "CRM SYNC", detail: "Instant synchronization to HubSpot, Salesforce, or custom internal database." },
    { step: "05", stage: "FOLLOW-UP", detail: "Contextual WhatsApp / Email message dispatched within seconds of submission." },
    { step: "06", stage: "CONVERSION", detail: "Call booked on calendar, proposal generated, or cashier checkout initialized." },
  ];

  const automationDomains = [
    {
      title: "Lead & Sales Automation",
      desc: "Speed-to-lead is everything. Capture inbound inquiries across web forms, ads, and messaging apps, qualify them automatically, and route them to sales reps with full historical context.",
      icon: TrendingUp,
      bullet: "Sub-minute automated response and meeting booking.",
    },
    {
      title: "CRM & Pipeline Automation",
      desc: "Never let leads go cold or manual data entry stall your pipeline. Automatically update stages, assign tasks, log touchpoints, and trigger personalized drip campaigns.",
      icon: Database,
      bullet: "Zero manual data re-entry across sales tools.",
    },
    {
      title: "Operations & Process Automation",
      desc: "Connect back-office spreadsheets, accounting systems, inventory monitors, and vendor communications into a synchronized, hands-free operational backbone.",
      icon: Layers,
      bullet: "End-to-end task handoffs without human delays.",
    },
    {
      title: "Event-Driven Notifications",
      desc: "Keep customers and internal teams instantly informed with real-time SMS, WhatsApp, and Slack alerts triggered by order changes, status updates, or contract signings.",
      icon: Bell,
      bullet: "Instant multi-channel alerts that reduce support volume.",
    },
    {
      title: "Intelligent Data Processing",
      desc: "Extract structured data from unstructured invoices, PDFs, emails, and receipts using vision and LLM parsing, feeding clean records straight into databases.",
      icon: Zap,
      bullet: "99%+ accuracy document extraction pipelines.",
    },
    {
      title: "AI-Powered Decision Workflows",
      desc: "Workflows that don't just follow static if/then rules, but use AI to triage customer sentiment, classify priority escalations, and draft custom resolutions.",
      icon: Sparkles,
      bullet: "Adaptive logic that handles edge cases intelligently.",
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Workflow className="w-4 h-4" />
            Intelligent Process Automation
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark">
            AUTOMATE THE WORK. <br />
            <span className="text-brand-accent">AMPLIFY THE BUSINESS.</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            We don&apos;t just automate individual tasks—we redesign workflows around intelligence. We eliminate the manual friction that costs your company time, customers, and revenue.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>AUTOMATE MY WORKFLOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center px-6 py-3.5 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-brand-dark font-semibold text-sm transition-all shadow-xs"
            >
              SEE REAL AUTOMATIONS
            </Link>
          </div>
        </div>

        {/* Example Pipeline: Lead to Conversion */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-card mb-16">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-1">
              End-to-End Pipeline Demonstration
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark">
              Example Workflow: Inbound Lead to Revenue
            </h2>
            <p className="text-sm text-brand-muted mt-2">
              How IMPACT orchestrates an automated sales flow without any manual bottleneck.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {pipelineSteps.map((item, idx) => (
              <div
                key={item.step}
                className="relative flex flex-col p-5 rounded-2xl bg-brand-surface border border-brand-border"
              >
                <div className="text-xs font-mono font-bold text-brand-accent mb-2">
                  {item.step}
                </div>
                <div className="text-sm font-black text-brand-dark uppercase tracking-wider mb-2">
                  {item.stage}
                </div>
                <p className="text-xs text-brand-muted leading-relaxed flex-1">
                  {item.detail}
                </p>
                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-brand-subtle">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-brand-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-brand-muted">
            <span className="font-semibold text-brand-dark">
              LEAD → CAPTURE → QUALIFY → CRM → FOLLOW-UP → CONVERSION
            </span>
            <span className="text-brand-teal font-bold">
              ✓ 100% Automated • Sub-60 Second Execution Time
            </span>
          </div>
        </div>

        {/* Automation Types Grid */}
        <div className="mb-16">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-dark">
              Workflows We Automate
            </h2>
            <p className="text-base text-brand-muted mt-2">
              Engineered to replace hours of daily administrative drag with reliable, auditable code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automationDomains.map((domain, idx) => {
              const Icon = domain.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-brand-border rounded-2xl p-7 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 rounded-xl bg-brand-surface border border-brand-border text-brand-accent w-fit mb-5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-brand-dark mb-2">
                      {domain.title}
                    </h3>
                    <p className="text-sm text-brand-muted leading-relaxed mb-6">
                      {domain.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border flex items-center gap-2 text-xs font-semibold text-brand-teal">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{domain.bullet}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Universal Final Conversion CTA */}
        <div className="mt-16">
          <FinalCtaBanner customSubtitle="Eliminate the manual bottlenecks and slow response times that cost your company time, customers, and revenue." />
        </div>
      </div>
    </div>
  );
}
