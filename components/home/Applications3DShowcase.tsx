"use client";

import React, { useState } from "react";
import {
  AppWindow,
  LayoutDashboard,
  UtensilsCrossed,
  Smartphone,
  LineChart,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Tilt3DCard } from "@/components/ui/Tilt3DCard";

interface ShowcaseApp {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  headline: string;
  summary: string;
  windowUrl: string;
  features: string[];
  techStack: string[];
  interfaceMock: {
    statusBadge: string;
    kpis: { label: string; val: string }[];
    tableHeader: string[];
    rows: string[][];
  };
}

export const Applications3DShowcase: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState<string>("kds-kitchen");

  const apps: ShowcaseApp[] = [
    {
      id: "kds-kitchen",
      name: "Kitchen KDS & Order Engine",
      category: "Hospitality & Operations",
      icon: UtensilsCrossed,
      headline: "Real-Time Kitchen Display & Expediter Hub",
      summary:
        "Sub-second order dispatch from contactless QR tables directly to kitchen station screens with automated cook timers and dispatch sync.",
      windowUrl: "https://kds.impact-restaurant.internal/station-01",
      features: [
        "Sub-second WebSocket order dispatch",
        "Color-coded cook latency alerts (<10m, 15m, 20m+)",
        "Station-level item splitting (Grill, Fryer, Salad, Bar)",
        "Automated rider dispatch webhook on order completion",
      ],
      techStack: ["Next.js App Router", "WebSocket Gateway", "Redis PubSub", "Tailwind CSS"],
      interfaceMock: {
        statusBadge: "STATION 01 — ACTIVE (4 TICKETS QUEUED)",
        kpis: [
          { label: "AVG PREP TIME", val: "7m 42s" },
          { label: "STATION ACCURACY", val: "99.8%" },
          { label: "PEAK LOAD TICKETS", val: "38 / hr" },
        ],
        tableHeader: ["TICKET", "ITEMS", "TABLE", "TIMER", "STATUS"],
        rows: [
          ["#8941", "2x Truffle Smash Burger, 1x Truffle Fries", "T-04 (Dine-in)", "03:14", "Cooking"],
          ["#8942", "1x Margherita Artisan Pizza, 1x Sparkling Water", "T-12 (Terrace)", "01:20", "Prep"],
          ["#8943", "3x Crispy Chicken Bowl (Spicy, Extra Sauce)", "Delivery #R-10", "00:45", "Queued"],
        ],
      },
    },
    {
      id: "admin-portal",
      name: "Enterprise Admin Portal",
      category: "Multi-Tenant Platform",
      icon: LayoutDashboard,
      headline: "Executive Role-Based Administration",
      summary:
        "Granular access control, branch-by-branch audit logs, employee permission groups, and live multi-tenant database synchronization.",
      windowUrl: "https://admin.impact-enterprise.internal/governance",
      features: [
        "Row-level security (RLS) across branches and regions",
        "Immutable chronological change auditing with rollback",
        "JWT + TOTP 2-Factor authentication enforcement",
        "Exportable compliance records (CSV, PDF, JSON)",
      ],
      techStack: ["React 18", "PostgreSQL RLS", "FastAPI / Node.js", "OAuth2 / OIDC"],
      interfaceMock: {
        statusBadge: "CLUSTER: PRODUCTION US-EAST • RBAC ENFORCED",
        kpis: [
          { label: "ACTIVE TENANTS", val: "14 Organizations" },
          { label: "AUTH SESSIONS", val: "3,410 Active" },
          { label: "SECURITY AUDITS", val: "0 Critical Flags" },
        ],
        tableHeader: ["TENANT", "TIER", "REGIONS", "ENCRYPTION", "COMPLIANCE"],
        rows: [
          ["Apex Global Logistics", "Enterprise Dedicated", "US-East, EU-Central", "AES-256 GCM", "SOC 2 Type II"],
          ["Beacon Retail Systems", "Multi-Tenant Pro", "US-West", "AES-256 GCM", "ISO 27001"],
          ["Solaria Healthcare Hub", "HIPAA Compliant Pod", "US-East", "Hardware KMS", "HIPAA / BAA"],
        ],
      },
    },
    {
      id: "customer-portal",
      name: "Self-Service Customer Portal",
      category: "Client Experience",
      icon: AppWindow,
      headline: "Frictionless Client Self-Service & Billing",
      summary:
        "Empowers end-users to manage subscription seats, view live project milestones, access generated invoices, and launch support tickets.",
      windowUrl: "https://portal.impact-enterprise.internal/account",
      features: [
        "Integrated Stripe Customer Portal & invoice repository",
        "Interactive milestone delivery tracker with download links",
        "Encrypted credential sharing and private API key vault",
        "Instant live-chat connection to assigned engineering lead",
      ],
      techStack: ["Next.js", "Stripe Billing API", "Supabase Auth", "Shadcn UI"],
      interfaceMock: {
        statusBadge: "CLIENT ACCOUNT: VERIFIED ENTERPRISE",
        kpis: [
          { label: "ACCOUNT STATUS", val: "Active • Enterprise" },
          { label: "CURRENT SPRINT", val: "Sprint 04 of 06" },
          { label: "NEXT MILESTONE", val: "Production Deploy" },
        ],
        tableHeader: ["DELIVERABLE", "STAGE", "BRANCH", "ESTIMATE", "ACTION"],
        rows: [
          ["Restaurant Ordering MVP", "Final Verification", "main (v1.4.0)", "Complete", "Preview URL"],
          ["Autonomous Voice Agent", "Latency Optimization", "feature/vad", "In Review", "Test Audio"],
          ["HubSpot Sync Pipeline", "Unit Testing", "feat/hubspot", "Scheduled", "View Spec"],
        ],
      },
    },
    {
      id: "mobile-app",
      name: "Cross-Platform Mobile App",
      category: "Mobile Native",
      icon: Smartphone,
      headline: "Responsive High-Fidelity Mobile Architecture",
      summary:
        "High-performance native iOS and Android experiences with offline SQLite caching, biometric face authentication, and push notifications.",
      windowUrl: "https://mobile-simulator.impact-enterprise.internal/app",
      features: [
        "60 FPS smooth gesture handling and haptic responses",
        "Offline-first sync engine with local SQLite database",
        "Biometric FaceID and TouchID login integration",
        "Deep linking from WhatsApp, Email, and Push notifications",
      ],
      techStack: ["React Native", "Expo SDK", "SQLite Offline", "Firebase Cloud Messaging"],
      interfaceMock: {
        statusBadge: "SIMULATOR: IPHONE 16 PRO • IOS 18.1 (60 FPS)",
        kpis: [
          { label: "COLD BOOT TIME", val: "0.42 seconds" },
          { label: "CRASH-FREE USERS", val: "99.95%" },
          { label: "OFFLINE SYNC", val: "Synchronized" },
        ],
        tableHeader: ["NOTIFICATION", "TIMESTAMP", "CHANNEL", "PRIORITY", "STATUS"],
        rows: [
          ["Kitchen order #8941 prepared", "Just now", "APNs Push", "High", "Delivered"],
          ["Table 04 requested digital bill", "2m ago", "WebSocket", "Urgent", "Acknowledged"],
          ["Shift handover summary compiled", "15m ago", "Background", "Normal", "Archived"],
        ],
      },
    },
    {
      id: "analytics-suite",
      name: "High-Frequency Analytics & Monitor",
      category: "Observability",
      icon: LineChart,
      headline: "Real-Time Telemetry & Agent Health Monitor",
      summary:
        "Tracks token consumption, request latency percentiles (p50, p95, p99), API budget thresholds, and autonomous agent error rates.",
      windowUrl: "https://telemetry.impact-enterprise.internal/dash",
      features: [
        "Live p95/p99 latency graphs with second-by-second granularity",
        "Model token expenditure counters with automatic budget caps",
        "Autonomous agent error tracing and self-healing restart logs",
        "Webhook endpoint uptime monitoring and DNS health checks",
      ],
      techStack: ["ClickHouse", "OpenTelemetry", "Grafana / Custom Charts", "Go Gateway"],
      interfaceMock: {
        statusBadge: "HEALTH: 100% OPERATIONAL • P95 LATENCY: 240MS",
        kpis: [
          { label: "GLOBAL P95 LATENCY", val: "240 ms" },
          { label: "ERROR RATE (24H)", val: "0.002%" },
          { label: "TOTAL INVOCATIONS", val: "184,290 requests" },
        ],
        tableHeader: ["ENDPOINT", "METHOD", "AVG LATENCY", "CALLS (1H)", "STATUS"],
        rows: [
          ["/v1/agents/voice/stream", "WSS", "84 ms", "12,410", "Healthy (200)"],
          ["/v1/orders/webhook/pos", "POST", "112 ms", "4,820", "Healthy (200)"],
          ["/v1/leads/enrichment", "POST", "210 ms", "1,140", "Healthy (200)"],
        ],
      },
    },
    {
      id: "saas-platform",
      name: "Multi-Tier SaaS Engine",
      category: "Scalable Product",
      icon: Layers,
      headline: "Turnkey Multi-Tier SaaS Architecture",
      summary:
        "Complete subscription mechanics with metered billing, organization teams, invite links, role management, and white-label theming.",
      windowUrl: "https://saas-core.impact-enterprise.internal/billing",
      features: [
        "Per-seat and consumption-based metered billing",
        "Team member invitations with role hierarchies (Admin, Editor, Viewer)",
        "White-label custom domain routing with automatic SSL certs",
        "Feature gating based on subscription plan tiers",
      ],
      techStack: ["Next.js", "Stripe Metered Billing", "PostgreSQL", "Cloudflare SSL"],
      interfaceMock: {
        statusBadge: "STRIPE LIVE SYNC: CONNECTED (AUTOMATED RECONCILIATION)",
        kpis: [
          { label: "MONTHLY RECURRING (MRR)", val: "Verified Metric" },
          { label: "SEATS UTILIZATION", val: "88% Allocated" },
          { label: "CHURN MITIGATION", val: "Zero-Downtime Migration" },
        ],
        tableHeader: ["PLAN", "SEATS", "METERED LIMIT", "CUSTOM DOMAINS", "STATUS"],
        rows: [
          ["Starter", "Up to 5", "10,000 API calls", "Shared Subdomain", "Active"],
          ["Growth", "Up to 25", "100,000 API calls", "1 Custom Domain", "Active"],
          ["Enterprise", "Unlimited", "Custom Quota", "Unlimited SSL Domains", "Active"],
        ],
      },
    },
  ];

  const currentApp = apps.find((a) => a.id === selectedAppId) || apps[0];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-brand-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Systems Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-dark">
            APPLICATIONS SHOWCASE
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted leading-relaxed">
            Floating, high-performance interfaces engineered with clean software architecture and zero fake fluff.
          </p>
        </div>

        {/* 6 Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-10">
          {apps.map((app) => {
            const isSelected = app.id === selectedAppId;
            const Icon = app.icon;

            return (
              <button
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-brand-accent text-white border-brand-accent shadow-md font-bold"
                    : "bg-brand-surface hover:bg-brand-surfaceAlt border-brand-border text-brand-charcoal hover:text-brand-dark"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-brand-accent"}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </div>
                <div className="text-xs font-black tracking-tight leading-tight line-clamp-1">
                  {app.name}
                </div>
                <div
                  className={`text-[10px] mt-0.5 truncate ${
                    isSelected ? "text-white/80" : "text-brand-subtle"
                  }`}
                >
                  {app.category}
                </div>
              </button>
            );
          })}
        </div>

        {/* 3D Realistic Application Window */}
        <Tilt3DCard>
          <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
            {/* Realistic Window Chrome Header */}
            <div className="bg-white border-b border-brand-border px-5 py-3.5 flex items-center justify-between gap-4">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {/* URL Address Bar */}
              <div className="flex-1 max-w-xl mx-auto flex items-center justify-center gap-2 px-4 py-1 rounded-xl bg-brand-surface border border-brand-border text-xs font-mono text-brand-muted truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
                <span className="truncate">{currentApp.windowUrl}</span>
              </div>

              {/* Window Status */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-brand-accent">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
                <span>LIVE VIEW</span>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="p-6 sm:p-8 lg:p-10 space-y-8">
              {/* Top Banner Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/80">
                <div>
                  <div className="text-[11px] font-mono font-bold text-brand-teal uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-teal" />
                    <span>{currentApp.interfaceMock.statusBadge}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
                    {currentApp.headline}
                  </h3>
                </div>

                <Link
                  href="/solutions/software"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark hover:bg-brand-black text-white text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
                >
                  <span>Build This System</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentApp.interfaceMock.kpis.map((kpi, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-brand-border/80 shadow-xs"
                  >
                    <div className="text-[10px] font-mono font-bold text-brand-subtle uppercase tracking-wider">
                      {kpi.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-brand-dark mt-1 font-mono">
                      {kpi.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Data Table Mock */}
              <div className="rounded-2xl border border-brand-border overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-brand-surface border-b border-brand-border text-brand-subtle uppercase text-[10px] tracking-wider">
                      <tr>
                        {currentApp.interfaceMock.tableHeader.map((th, idx) => (
                          <th key={idx} className="py-3 px-4 font-bold">
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border text-brand-charcoal">
                      {currentApp.interfaceMock.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-brand-surface/60 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-3 px-4 font-medium">
                              {cIdx === row.length - 1 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {cell}
                                </span>
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Architecture Pillars & Tech Stack */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                {/* Feature Checklist */}
                <div className="md:col-span-8 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-subtle block mb-2">
                    Verified Capabilities:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentApp.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-brand-border/70 text-xs font-medium text-brand-charcoal"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-brand-border space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-subtle block">
                    Target Tech Stack:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentApp.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-brand-surface text-brand-dark text-xs font-mono font-bold border border-brand-border"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tilt3DCard>
      </div>
    </section>
  );
};
