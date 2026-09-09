"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Layers, UtensilsCrossed, Workflow, Bot, Server, Sparkles, Filter, Laptop, Smartphone, Database, Check } from "lucide-react";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

interface ProjectItem {
  slug: string;
  title: string;
  categoryTags: string[];
  filterCategories: string[];
  whoIsItFor: string;
  problem: string;
  whatWeBuilt: string;
  technologies: string[];
  systemCapabilities: string[];
  visualType: "restaurant" | "crm" | "rag";
  outcomeNote: string;
}

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filterTabs = [
    "All",
    "AI",
    "Agents",
    "Automation",
    "Applications",
    "Products",
    "Business Systems",
  ];

  const projects: ProjectItem[] = [
    {
      slug: "restaurant-technology-platform",
      title: "Restaurant Technology Platform",
      categoryTags: ["Applications", "Automation", "Products", "Business Systems"],
      filterCategories: ["Applications", "Automation", "Products", "Business Systems"],
      whoIsItFor: "Multi-branch restaurant owners, franchise operators, kitchen staff, delivery riders, and dining guests.",
      problem:
        "Chaotic paper tickets causing kitchen delays, 30% aggregator commission fees, vulnerability to table spoofing in QR ordering, and zero real-time branch P&L visibility.",
      whatWeBuilt:
        "A full-stack commercial ordering, kitchen dispatch, delivery, and financial analytics platform uniting 6 isolated branches and 8 RBAC roles in real time.",
      technologies: ["Next.js 14", "FastAPI", "PostgreSQL", "SQLAlchemy 2", "Redis Pub/Sub", "WebSockets", "Docker Compose"],
      systemCapabilities: [
        "Cryptographic HMAC QR table ordering eliminating spoofing",
        "Redis Pub/Sub WebSocket Kitchen Display Board (KDS)",
        "Server-isolated 6-branch database partitioning",
        "8-tier RBAC security (Owner, Admin, Manager, Chef, Rider)",
        "Deal Engine with 25% max custom discount cutoff",
        "Executive P&L ledger & sentiment feedback parsing",
      ],
      visualType: "restaurant",
      outcomeNote: "Project capabilities demonstrated",
    },
    {
      slug: "lead-crm-automation-engine",
      title: "Automated Lead Capture & CRM Pipeline",
      categoryTags: ["Automation", "AI", "Business Systems"],
      filterCategories: ["Automation", "AI", "Business Systems"],
      whoIsItFor: "B2B sales teams, commercial agencies, high-growth startups, and inbound operations managers.",
      problem:
        "Inbound leads waiting hours for manual follow-up, losing momentum to competitors, and sales reps wasting 10+ hours weekly manually typing data into CRMs.",
      whatWeBuilt:
        "A zero-delay automated conversion pipeline that ingests webhook payloads, scores lead intent, syncs bidirectional CRM contacts, and dispatches WhatsApp follow-ups in under 60 seconds.",
      technologies: ["Python", "FastAPI", "Webhooks", "CRM APIs", "WhatsApp Cloud API", "PostgreSQL"],
      systemCapabilities: [
        "Idempotent multi-channel webhook ingestion",
        "Automated lead intent scoring & qualification",
        "Real-time bidirectional CRM database synchronization",
        "Personalized WhatsApp and email engagement triggers",
        "Dead-letter error queues with automatic retry",
      ],
      visualType: "crm",
      outcomeNote: "Project capabilities demonstrated",
    },
    {
      slug: "enterprise-knowledge-agent",
      title: "Enterprise Knowledge & Autonomous Research Agent",
      categoryTags: ["AI", "Agents", "Applications", "Products"],
      filterCategories: ["AI", "Agents", "Applications", "Products"],
      whoIsItFor: "Enterprise executive teams, legal & compliance staff, analysts, and internal operational units.",
      problem:
        "Employees wasting hundreds of hours searching disjointed technical manuals and policy documents, while generic AI chatbots hallucinated facts and risked corporate IP.",
      whatWeBuilt:
        "A hallucination-resistant enterprise RAG agent with hybrid vector search, strict citation grounding, and role-based access gates to query internal databases safely.",
      technologies: ["LLM Orchestration", "Python", "FastAPI", "pgvector", "PostgreSQL", "Next.js"],
      systemCapabilities: [
        "Dense semantic & sparse keyword hybrid vector search",
        "Zero-hallucination citation grounding on source files",
        "Deterministic JSON-schema tool calling validation",
        "Role-scoped access control preventing data leaks",
        "Audit logging of all agent queries and tool executions",
      ],
      visualType: "rag",
      outcomeNote: "Project capabilities demonstrated",
    },
  ];

  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.filterCategories.includes(activeFilter));

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Case Studies
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark">
            BUILT FOR THE REAL WORLD.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            Every system built by IMPACT answers five fundamental questions: the problem, the solution, the technology, the target user, and its confirmed capabilities.
          </p>
        </div>

        {/* 6 Category Filter Tabs */}
        <div className="mb-12 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-subtle mr-2 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </span>
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-brand-accent text-white shadow-sm"
                    : "bg-white border border-brand-border text-brand-charcoal hover:bg-brand-surface"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Filtered Projects List */}
        <div className="space-y-16">
          {filteredProjects.map((project) => (
            <div
              key={project.slug}
              className="bg-white border border-brand-border rounded-3xl p-6 sm:p-12 shadow-card hover:shadow-cardHover transition-all"
            >
              {/* Project Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-brand-border mb-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {project.categoryTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-brand-surface border border-brand-border text-[11px] font-bold uppercase tracking-wider text-brand-charcoal"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-brand-dark tracking-tight">
                    {project.title}
                  </h2>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-brand-teal shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{project.outcomeNote}</span>
                </div>
              </div>

              {/* Grid: 5 Question Anatomy & Prominent Visual Screenshot Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 5 Questions Column */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Q1: Who is it for? */}
                  <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-subtle block mb-1">
                      01 • Who is it for?
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-brand-dark">
                      {project.whoIsItFor}
                    </p>
                  </div>

                  {/* Q2: What was the problem? */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900 block mb-1">
                      02 • What was the problem?
                    </span>
                    <p className="text-xs sm:text-sm text-brand-charcoal leading-relaxed">
                      {project.problem}
                    </p>
                  </div>

                  {/* Q3: What did we build? */}
                  <div className="p-4 rounded-2xl bg-brand-accentSoft/50 border border-brand-accent/20">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-accent block mb-1">
                      03 • What did we build?
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-brand-dark leading-relaxed">
                      {project.whatWeBuilt}
                    </p>
                  </div>

                  {/* Q4: What technologies were involved? */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-subtle block mb-2">
                      04 • What technologies/capabilities were involved?
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-brand-dark font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Q5: What can the system do? */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-subtle block mb-2">
                      05 • What can the system do?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-brand-dark">
                      {project.systemCapabilities.map((cap, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-dark hover:bg-brand-accent text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                    >
                      <span>VIEW FULL VISUAL CASE STUDY</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Visual Screenshot / System Architecture Diagram Column */}
                <div className="lg:col-span-5">
                  <div className="bg-[#FAF9F6] border border-brand-border rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-brand-border text-[11px] font-mono font-bold text-brand-subtle uppercase">
                      <span>System Architecture View</span>
                      <span className="text-brand-accent">Live Snapshot</span>
                    </div>

                    {/* Visual UI mockup for Restaurant Platform */}
                    {project.visualType === "restaurant" && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>KITCHEN DISPLAY BOARD (KDS)</span>
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">WebSocket Connected</span>
                          </div>
                          <div className="text-[11px] text-brand-muted">BR-MAIN Station #2 • Table 04</div>
                          <div className="mt-2 p-2 bg-brand-surface rounded text-[11px] font-mono">
                            <div>2x Gourmet Truffle Burger [PREPARING - 08:42]</div>
                            <div>1x Garlic Parmesan Fries [READY]</div>
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>CRYPTOGRAPHIC QR VERIFICATION</span>
                            <span className="text-[10px] font-mono text-brand-accent bg-brand-accentSoft px-2 py-0.5 rounded">HMAC-SHA256 Valid</span>
                          </div>
                          <div className="text-[11px] font-mono text-brand-muted truncate">
                            token: 9a7b...c4e1 | branch: BR-MAIN | table: T-04
                          </div>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>EXECUTIVE MULTI-BRANCH LEDGER</span>
                            <span className="text-[10px] font-mono text-brand-charcoal bg-brand-surface px-2 py-0.5 rounded">6 Branches Active</span>
                          </div>
                          <div className="text-[11px] text-brand-muted">
                            Live Gross Sales, Food Cost &amp; Net Operating Margin tracking
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visual UI mockup for CRM Lead Pipeline */}
                    {project.visualType === "crm" && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>WEBHOOK INGESTION</span>
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">200 OK • 42ms</span>
                          </div>
                          <div className="text-[11px] text-brand-muted">Payload normalized &amp; deduplicated via Redis</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>AI LEAD SCORING</span>
                            <span className="text-[10px] font-mono text-brand-accent bg-brand-accentSoft px-2 py-0.5 rounded">Score: 94/100</span>
                          </div>
                          <div className="text-[11px] text-brand-muted">Enterprise intent detected → routed to Senior Rep</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>WHATSAPP CLOUD API</span>
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Dispatched in 18s</span>
                          </div>
                          <div className="text-[11px] text-brand-muted">Personalized confirmation &amp; meeting booking link</div>
                        </div>
                      </div>
                    )}

                    {/* Visual UI mockup for Enterprise RAG */}
                    {project.visualType === "rag" && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>HYBRID SEMANTIC SEARCH</span>
                            <span className="text-[10px] font-mono text-brand-accent bg-brand-accentSoft px-2 py-0.5 rounded">pgvector + BM25</span>
                          </div>
                          <div className="text-[11px] text-brand-muted">Top 5 chunks retrieved with dense &amp; sparse re-ranking</div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>CITATION GROUNDING</span>
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">100% Grounded</span>
                          </div>
                          <div className="text-[11px] font-mono text-brand-muted">
                            [Doc: Sec_Ops_Policy_v3.pdf #Page 42]
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-brand-border text-xs">
                          <div className="flex items-center justify-between font-bold text-brand-dark mb-1">
                            <span>DETERMINISTIC TOOL EXEC</span>
                            <span className="text-[10px] font-mono text-brand-charcoal bg-brand-surface px-2 py-0.5 rounded">Role Checked</span>
                          </div>
                          <div className="text-[11px] text-brand-muted">
                            Query internal staff database tool with RBAC permission gate
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-brand-border text-center text-[10px] font-mono text-brand-subtle">
                      Reproducible verified code in production
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standardized Final CTA Banner */}
      <div className="mt-20">
        <FinalCtaBanner />
      </div>
    </div>
  );
}
