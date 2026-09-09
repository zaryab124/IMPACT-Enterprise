import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Layers, Server, Cpu, Database, Network, Clock, Key, AlertTriangle, Sparkles, Box, Workflow } from "lucide-react";
import { Metadata } from "next";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

interface CaseStudy {
  slug: string;
  title: string;
  category: string;
  headline: string;
  overview: string;
  problemPoints: { title: string; desc: string }[];
  approachPoints: { step: string; title: string; desc: string }[];
  architectureLayers: { layer: string; component: string; role: string }[];
  productModules: { name: string; user: string; capability: string }[];
  workflow: { step: string; node: string; desc: string }[];
  confirmedCapabilities: string[];
  techStack: string[];
  outcomeSummary: string;
}

const caseStudiesData: Record<string, CaseStudy> = {
  "restaurant-technology-platform": {
    slug: "restaurant-technology-platform",
    title: "Restaurant Technology Platform",
    category: "CUSTOM APPLICATIONS • AUTOMATION • ORDER MANAGEMENT",
    headline: "Commercial multi-branch restaurant management, digital ordering, and kitchen dispatch ecosystem.",
    overview:
      "A production-ready full-stack platform built with Next.js 14 on the frontend and FastAPI (PostgreSQL, Redis WebSockets) on the backend. It unifies digital ordering, kitchen preparation, delivery coordination, and executive financial governance into a synchronized real-time system across 6 isolated branches.",
    problemPoints: [
      { title: "Aggregator Margin Drag", desc: "Third-party delivery portals charging 25–35% predatory commissions without sharing customer data." },
      { title: "Kitchen Chaos & Lost Tickets", desc: "Physical paper tickets in busy commercial kitchens resulting in prep delays, lost orders, and inconsistent cook times." },
      { title: "Branch Noise & Disjointed Data", desc: "Franchise managers seeing global noise rather than isolated branch-specific order queues and inventory." },
      { title: "QR Code Spoofing Vulnerabilities", desc: "Standard unsecured QR codes allowing diners to tamper with URL parameters and submit false table orders." },
      { title: "Blind Operational Finances", desc: "Owners lacking real-time visibility into branch-level net profit/loss, daily food costs, and guest sentiment." },
    ],
    approachPoints: [
      { step: "01", title: "Cryptographic HMAC Signatures", desc: "Engineered tamper-proof QR table tokens hashed with backend secrets to verify table legitimacy." },
      { step: "02", title: "Redis Pub/Sub WebSockets", desc: "Constructed sub-second kitchen broadcasting, delivering instant order cards with live countdown timers." },
      { step: "03", title: "Server-Isolated Branch Partitioning", desc: "Segmented 6 initial branches (BR-MAIN, BR-CITY, etc.) server-side so managers see only their location." },
      { step: "04", title: "8 Granular RBAC Role Gates", desc: "Enforced endpoint security for Owner, Admin, Branch Manager, Kitchen Staff, Cashier, Rider, and Customer." },
      { step: "05", title: "Automated Deal & P&L Engine", desc: "Built discount cutoff validation (25% max) and live cost-of-goods vs. operating margin ledger." },
    ],
    architectureLayers: [
      { layer: "Frontend Client", component: "Next.js 14 + Tailwind CSS + TanStack Query", role: "Responsive customer self-ordering, dine-in QR UI, & staff portals" },
      { layer: "API & Microservices", component: "FastAPI (Python 3) + Pydantic v2", role: "High-concurrency async REST endpoints & HMAC token validation" },
      { layer: "Real-Time Channel", component: "Redis Pub/Sub + WebSockets", role: "Sub-second broadcast of tickets to Kitchen Display System (KDS)" },
      { layer: "Data & Storage", component: "PostgreSQL with SQLAlchemy 2 (UUID Keys)", role: "ACID transactional database with 6 isolated branch partitions" },
      { layer: "Access & Security", component: "JWT + 8 RBAC Role Permission Gates", role: "Endpoint-level permission enforcement across staff & owners" },
      { layer: "Containerization", component: "Docker Compose", role: "Fully reproducible local and cloud production environments" },
    ],
    productModules: [
      { name: "Digital Customer Menu & Dine-In", user: "Customers", capability: "HMAC QR table ordering, dish customization, & deal engine with 25% max discount cap" },
      { name: "Kitchen Display System (KDS)", user: "Chefs & Line Cooks", capability: "Real-time ticket kanban board with color-coded preparation timers and status toggles" },
      { name: "Branch Operations Portal", user: "Branch Managers", capability: "Isolated order queues, staff assignment, local menu availability, and table maps" },
      { name: "Delivery & Rider Dispatch", user: "Riders & Cashiers", capability: "Assigned order pickup notifications, delivery address routing, and fulfillment status" },
      { name: "Executive P&L Analytics", user: "Owners & CFO", capability: "Live revenue, food cost price tracking, operating expenses, and rule-based feedback sentiment" },
      { name: "Global Admin Console", user: "System Admin", capability: "CRUD management for all 6 branches, user roles, product catalogs, and deals" },
    ],
    workflow: [
      { step: "01", node: "CUSTOMER", desc: "Scans cryptographic HMAC QR code at dining table or opens mobile web app." },
      { step: "02", node: "DIGITAL MENU", desc: "Browses categories, builds custom deals with server-validated 25% discount cutoff." },
      { step: "03", node: "QR ORDER CREATION", desc: "Table and branch tokens verified on backend before order is persisted." },
      { step: "04", node: "ORDER MANAGEMENT", desc: "Order recorded in PostgreSQL with branch isolation (BR-MAIN, BR-CITY, etc.)." },
      { step: "05", node: "ADMIN / BRANCH QUEUE", desc: "Branch manager reviews incoming order queue and auto-assigns preparation slot." },
      { step: "06", node: "KITCHEN (KDS)", desc: "Head chef & line cook receive real-time Redis WebSocket alert with timer countdown." },
      { step: "07", node: "DELIVERY / RIDER", desc: "Takeaway/delivery orders assigned to rider with route status updates." },
      { step: "08", node: "CUSTOMER STATUS", desc: "Customer views real-time preparation status and submits post-meal sentiment feedback." },
    ],
    confirmedCapabilities: [
      "Digital menu & online self-ordering",
      "Cryptographic HMAC QR-code table ordering",
      "Dine-in, takeaway & delivery routing",
      "6 server-isolated branches (BR-MAIN, BR-CITY, etc.)",
      "8 RBAC roles with endpoint permission enforcement",
      "Real-time Redis Pub/Sub WebSocket Kitchen Display Board",
      "Deal Engine with 25% max custom discount cutoff",
      "Executive P&L ledger & sentiment feedback analytics",
    ],
    techStack: [
      "Next.js 14",
      "TypeScript",
      "FastAPI",
      "SQLAlchemy 2",
      "PostgreSQL",
      "Redis",
      "WebSockets",
      "Docker Compose",
    ],
    outcomeSummary:
      "Project capabilities demonstrated. Complete architecture implemented, database models verified, and multi-role workflows validated across local and containerized test environments.",
  },
  "lead-crm-automation-engine": {
    slug: "lead-crm-automation-engine",
    title: "Automated Lead Capture & CRM Pipeline",
    category: "BUSINESS AUTOMATION • WORKFLOW ENGINE",
    headline: "High-speed inbound lead qualification, CRM synchronization, and multi-channel notification engine.",
    overview:
      "An automated pipeline designed to solve lead decay by capturing inbound inquiries from forms and social ads, scoring them using commercial rule models, syncing data to CRM systems, and dispatching personalized WhatsApp and email follow-ups in seconds.",
    problemPoints: [
      { title: "Lead Decay Delay", desc: "Inbound leads taking hours to receive a response, losing 80% of conversion probability." },
      { title: "Manual Rep Bottlenecks", desc: "Sales reps spending 2+ hours daily copying form submissions into CRM fields." },
      { title: "Duplicate Records", desc: "Repeated form submissions causing clutter and unassigned leads across sales teams." },
    ],
    approachPoints: [
      { step: "01", title: "Idempotent Ingestion", desc: "Constructed resilient webhook receivers with payload hash verification to prevent duplicate entries." },
      { step: "02", title: "Automated Intent Scoring", desc: "Built rule models evaluating email domains, budget fit, and project urgency." },
      { step: "03", title: "Instant CRM Synchronization", desc: "Connected bidirectional APIs to update contacts and deal stages in sub-second intervals." },
      { step: "04", title: "Omnichannel Engagement", desc: "Hooked into WhatsApp Cloud API and transactional email for instant personalized booking links." },
    ],
    architectureLayers: [
      { layer: "Ingest Layer", component: "FastAPI Webhook Listeners", role: "Receives raw form submissions & verifies HMAC security signatures" },
      { layer: "Queue & Idempotency", component: "Redis Caching & Dead-Letter Queue", role: "Guarantees zero duplicate leads & handles automatic retries" },
      { layer: "Scoring Engine", component: "Python Intent Classifier", role: "Scores lead quality & assigns tier thresholds" },
      { layer: "CRM Sync", component: "Bidirectional REST Connectors", role: "Updates contacts, deals, and notes in CRM in real time" },
      { layer: "Messaging", component: "WhatsApp Cloud API + SendGrid", role: "Dispatches personalized greeting & calendar booking invite" },
    ],
    productModules: [
      { name: "Inbound Webhook Listener", user: "Marketing Forms", capability: "Sub-50ms ingestion of lead payloads with automatic retry queue" },
      { name: "Lead Scoring Pipeline", user: "Sales Leadership", capability: "Dynamic intent scoring and automatic lead qualification" },
      { name: "CRM Sync Engine", user: "Sales Reps", capability: "Automatic deal creation, task assignment, and stage movement" },
      { name: "Conversational Follow-Up", user: "Prospective Clients", capability: "Instant WhatsApp & email follow-up message with calendar booking" },
    ],
    workflow: [
      { step: "01", node: "LEAD CAPTURE", desc: "Prospective buyer submits website inquiry form or social ad widget." },
      { step: "02", node: "PAYLOAD INGEST", desc: "FastAPI webhook receives raw JSON, sanitizes input, and verifies HMAC signature." },
      { step: "03", node: "INTENT SCORING", desc: "Lead scored against commercial criteria (budget tier, company size, urgency)." },
      { step: "04", node: "CRM SYNC", desc: "Contact, deal record, and task created in CRM with rep assignment." },
      { step: "05", node: "INSTANT ENGAGE", desc: "Personalized WhatsApp & email message dispatched with booking calendar." },
      { step: "06", node: "MEETING BOOKED", desc: "Meeting logged and sales rep alerted via mobile push notification." },
    ],
    confirmedCapabilities: [
      "Idempotent multi-channel webhook capture",
      "Automated lead intent scoring & qualification",
      "Real-time bidirectional CRM database synchronization",
      "Personalized WhatsApp and email engagement triggers",
      "Dead-letter error queues with automatic retry",
    ],
    techStack: ["Python", "FastAPI", "Webhooks", "PostgreSQL", "CRM APIs", "WhatsApp Cloud API"],
    outcomeSummary:
      "Project capabilities demonstrated. End-to-end pipeline tested with simulated webhook payloads and validated API synchronization.",
  },
  "enterprise-knowledge-agent": {
    slug: "enterprise-knowledge-agent",
    title: "Enterprise Knowledge & Autonomous Research Agent",
    category: "AI ENGINEERING • RAG • AUTONOMOUS AGENTS",
    headline: "Autonomous knowledge retrieval and synthesis agent with deterministic citation verification.",
    overview:
      "An intelligent RAG system that ingests internal documentation, technical blueprints, and operational policies to provide staff with verified, cited answers and execute internal database lookup tools autonomously.",
    problemPoints: [
      { title: "Manual Search Drag", desc: "Employees wasting hundreds of hours searching complex PDF manuals and policy repositories." },
      { title: "AI Hallucination Risk", desc: "Generic chatbots inventing false policies or fabricating procedural instructions." },
      { title: "Internal Data Silos", desc: "Staff unable to cross-reference static documentation with live database query records." },
    ],
    approachPoints: [
      { step: "01", title: "Hybrid Vector Embedding", desc: "Combined dense semantic embeddings with sparse keyword search for exact technical terms." },
      { step: "02", title: "Mandatory Citation Grounding", desc: "Enforced strict prompt-level citation checks, rejecting claims without source document proofs." },
      { step: "03", title: "Deterministic Tool Calling", desc: "Equipped agent with schema-validated tools to query live internal database records safely." },
      { step: "04", title: "Role-Based Document Scopes", desc: "Partitioned vector search queries by employee department to prevent unauthorized access." },
    ],
    architectureLayers: [
      { layer: "User Workspace", component: "Next.js 14 Conversational UI", role: "Interface with live streaming responses and interactive source drawer" },
      { layer: "Agent Orchestration", component: "FastAPI + LangChain / Custom Logic", role: "Multi-step reasoning, plan formulation, and tool dispatch" },
      { layer: "Vector Database", component: "PostgreSQL (pgvector)", role: "Dense chunk embeddings with cosine similarity & metadata indexing" },
      { layer: "Tool Execution Gate", component: "Deterministic JSON Schema Validator", role: "Ensures agent only executes approved read-only tools" },
      { layer: "Security & Audit", component: "Enterprise RBAC & Query Log", role: "Full audit trail of all queries, retrieved chunks, and tool calls" },
    ],
    productModules: [
      { name: "Conversational Research Portal", user: "Internal Staff", capability: "Natural language questioning over thousands of technical documentation pages" },
      { name: "Verified Source Drawer", user: "Auditors & Analysts", capability: "Clickable source citations highlighting exact paragraph and page in original PDF" },
      { name: "Internal DB Query Tool", user: "Operations Units", capability: "Autonomous querying of live operational database tables within permitted scopes" },
    ],
    workflow: [
      { step: "01", node: "USER QUERY", desc: "Staff member asks complex operational, regulatory, or policy question." },
      { step: "02", node: "HYBRID RETRIEVAL", desc: "Semantic vector search retrieves top relevant document chunks." },
      { step: "03", node: "AGENT REASONING", desc: "Agent inspects chunks and checks if an internal database tool is required." },
      { step: "04", node: "TOOL EXECUTION", desc: "Agent executes verified tool with RBAC permission gate." },
      { step: "05", node: "CITATION SYNTHESIS", desc: "Synthesizes final answer with mandatory bracketed source citations." },
      { step: "06", node: "AUDIT LOG", desc: "Query, chunks, tool calls, and response recorded for compliance." },
    ],
    confirmedCapabilities: [
      "Dense semantic & sparse keyword hybrid vector search",
      "Zero-hallucination citation grounding on source files",
      "Deterministic JSON-schema tool calling validation",
      "Role-scoped access control preventing data leaks",
      "Audit logging of all agent queries and tool executions",
    ],
    techStack: ["Next.js", "Python", "FastAPI", "pgvector", "PostgreSQL", "LLM APIs"],
    outcomeSummary:
      "Project capabilities demonstrated. Verified on technical documentation corpus with 100% citation grounding and zero unauthorized tool calls.",
  },
};

export async function generateStaticParams() {
  return Object.keys(caseStudiesData).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const caseStudy = caseStudiesData[params.slug];
  if (!caseStudy) {
    return { title: "Project Case Study | IMPACT Technologies" };
  }
  return {
    title: `${caseStudy.title} | IMPACT Technologies Case Study`,
    description: caseStudy.headline,
  };
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const caseStudy = caseStudiesData[params.slug];

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="py-14 sm:py-20 bg-[#FAF9F6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Projects</span>
          </Link>
        </div>

        {/* Case Study Header Banner */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-card mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider">
              {caseStudy.slug === "restaurant-technology-platform" ? "Featured System Case Study" : "Verified Case Study"}
            </span>
            <span className="px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-muted text-xs font-bold uppercase tracking-wider">
              {caseStudy.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-dark mb-4">
            {caseStudy.title}
          </h1>

          <p className="text-lg sm:text-xl font-semibold text-brand-charcoal leading-snug max-w-3xl mb-4">
            {caseStudy.headline}
          </p>

          <p className="text-base text-brand-muted leading-relaxed max-w-3xl">
            {caseStudy.overview}
          </p>

          <div className="mt-8 pt-6 border-t border-brand-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {caseStudy.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-brand-dark font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-xs font-bold text-brand-teal">
              <ShieldCheck className="w-4 h-4" />
              <span>Project capabilities demonstrated</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VISUAL DIAGRAM PROGRESSION: Problem → Approach → Architecture → Product → Workflow → Result */}
        {/* ========================================================================= */}

        {/* STAGE 1: PROBLEM */}
        <section className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-card mb-12">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-mono font-bold text-xs">
              01
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-amber-900 block">
                The Business Problem
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                What Challenges Required Solving?
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseStudy.problemPoints.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60">
                <div className="text-xs font-bold text-amber-950 uppercase mb-1">
                  {item.title}
                </div>
                <p className="text-xs text-brand-charcoal leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STAGE 2: APPROACH */}
        <section className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-card mb-12">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
            <span className="w-8 h-8 rounded-lg bg-brand-accentSoft text-brand-accent flex items-center justify-center font-mono font-bold text-xs">
              02
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-brand-accent block">
                Technical Execution
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                Our Engineering Approach
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseStudy.approachPoints.map((item) => (
              <div key={item.step} className="p-4 rounded-2xl bg-brand-surface border border-brand-border">
                <span className="text-xs font-mono font-bold text-brand-accent block mb-1">
                  Step {item.step}
                </span>
                <h3 className="text-sm font-bold text-brand-dark mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STAGE 3: ARCHITECTURE DIAGRAM */}
        <section className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-card mb-12">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-brand-surface text-brand-dark border border-brand-border flex items-center justify-center font-mono font-bold text-xs">
                03
              </span>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-brand-subtle block">
                  System Architecture Diagram
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                  Layer-by-Layer Architecture
                </h2>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono text-brand-accent bg-brand-accentSoft px-2.5 py-1 rounded">
              High Concurrency Stack
            </span>
          </div>

          <div className="space-y-3">
            {caseStudy.architectureLayers.map((layer, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-brand-surface border border-brand-border grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
              >
                <div className="md:col-span-3 font-bold text-brand-dark uppercase tracking-wide">
                  {layer.layer}
                </div>
                <div className="md:col-span-4 font-mono text-brand-accent font-semibold">
                  {layer.component}
                </div>
                <div className="md:col-span-5 text-brand-muted">
                  {layer.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STAGE 4: PRODUCT MODULES */}
        <section className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-card mb-12">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
            <span className="w-8 h-8 rounded-lg bg-brand-surface text-brand-dark border border-brand-border flex items-center justify-center font-mono font-bold text-xs">
              04
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-brand-subtle block">
                Product Experience
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                Key Product Portals &amp; Modules
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseStudy.productModules.map((mod, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-accent uppercase block mb-1">
                    Role: {mod.user}
                  </span>
                  <h3 className="text-sm font-bold text-brand-dark mb-1">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    {mod.capability}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STAGE 5: WORKFLOW ECOSYSTEM */}
        <section className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-card mb-12">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-brand-accent text-white flex items-center justify-center font-mono font-bold text-xs">
                05
              </span>
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-brand-subtle block">
                  Workflow Ecosystem
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                  Real-Time Operational Loop
                </h2>
              </div>
            </div>
            <span className="hidden sm:inline-block text-xs font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
              Continuous Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {caseStudy.workflow.map((flow) => (
              <div key={flow.step} className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs">
                <span className="text-xs font-mono font-bold text-brand-accent block mb-1">
                  {flow.step}
                </span>
                <div className="font-bold text-brand-dark uppercase tracking-wider mb-1">
                  {flow.node}
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed">
                  {flow.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-brand-border text-center text-xs font-mono text-brand-muted">
            CUSTOMER → DIGITAL MENU → QR TABLE ORDER → ORDER MANAGEMENT → ADMIN → KITCHEN → DELIVERY / RIDER → CUSTOMER
          </div>
        </section>

        {/* STAGE 6: RESULT / DEMONSTRATED CAPABILITY */}
        <section className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-card mb-16">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-mono font-bold text-xs">
              06
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase text-emerald-800 block">
                Result &amp; Validation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                Project Capabilities Demonstrated
              </h2>
            </div>
          </div>

          <p className="text-sm text-brand-charcoal leading-relaxed mb-6">
            {caseStudy.outcomeSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-brand-dark mb-6">
            {caseStudy.confirmedCapabilities.map((cap, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-surface border border-brand-border">
                <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                <span>{cap}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs flex flex-wrap items-center justify-between gap-4">
            <span className="text-brand-muted">
              Ready to engineer a solution with similar architectural sophistication?
            </span>
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 font-bold text-brand-accent hover:underline uppercase"
            >
              <span>Submit Your Requirements</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Standardized Final CTA Banner */}
        <FinalCtaBanner />
      </div>
    </div>
  );
}
