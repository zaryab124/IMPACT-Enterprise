import React from "react";
import Link from "next/link";
import { Bot, ArrowRight, CheckCircle2, Cpu, Wrench, Zap, MessageSquare, PhoneCall, Search, Sparkles, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export const metadata: Metadata = {
  title: "AI & Autonomous Agents | IMPACT Technologies",
  description:
    "Intelligence that acts. Autonomous AI agents engineered to understand goals, reason over context, use tools, and take real-world action.",
};

export default function AiAgentsPage() {
  const agentWorkflow = [
    { step: "01", name: "UNDERSTAND", desc: "Ingests user prompt, customer voice, or system event and extracts intent & context." },
    { step: "02", name: "REASON", desc: "Evaluates business rules, constraints, memory, and objectives." },
    { step: "03", name: "PLAN", desc: "Deconstructs the goal into a deterministic, multi-step sequence of tasks." },
    { step: "04", name: "USE TOOLS", desc: "Calls APIs, queries databases, executes code, or reads documentation." },
    { step: "05", name: "TAKE ACTION", desc: "Updates CRM, triggers emails, dispatches orders, or dials numbers." },
    { step: "06", name: "RETURN RESULT", desc: "Delivers verified answer, operational status, or confirmation to human." },
  ];

  const agentTypes = [
    {
      title: "Customer-Service Agents",
      desc: "Available 24/7 to resolve complex support inquiries, look up order statuses, handle returns, and escalate to humans only when necessary.",
      icon: MessageSquare,
      tags: ["Omnichannel", "Zero Hallucination", "Instant Resolution"],
    },
    {
      title: "Sales & Lead Qualification Agents",
      desc: "Engage inbound website and WhatsApp visitors immediately, ask qualifying B2B questions, verify budget/timeline, and book calendar meetings.",
      icon: Zap,
      tags: ["Speed-to-Lead", "Calendar Booking", "CRM Sync"],
    },
    {
      title: "Voice & Phone Call Agents",
      desc: "Ultra-low latency conversational voice agents capable of conducting human-like telephone calls for appointments, confirmations, and customer outreach.",
      icon: PhoneCall,
      tags: ["Sub-500ms Latency", "Natural Tone", "Call Transcription"],
    },
    {
      title: "Autonomous Research Agents",
      desc: "Scan thousands of PDFs, regulatory filings, competitor websites, or internal knowledge bases to synthesize structured executive briefings.",
      icon: Search,
      tags: ["Deep Research", "Exact Citations", "Structured Markdown"],
    },
    {
      title: "Internal Operational Agents",
      desc: "Empower staff to query internal company databases, draft invoices, generate financial reports, and orchestrate cross-departmental handoffs.",
      icon: Cpu,
      tags: ["Role-Based Access", "Audit Trail", "Internal Productivity"],
    },
    {
      title: "Multi-Step Autonomous Workflows",
      desc: "Self-healing autonomous agents that monitor background exceptions, reconcile data discrepancies between platforms, and notify stakeholders.",
      icon: Wrench,
      tags: ["Self-Healing", "Tool Calling", "Deterministic Logic"],
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Bot className="w-4 h-4" />
            Autonomous Agent Engineering
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark">
            INTELLIGENCE THAT ACTS.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            Most chatbots only talk. IMPACT develops AI agents that understand, reason, plan, use tools, and take real-world action to solve business problems.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>BUILD AN AI AGENT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3.5 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-brand-dark font-semibold text-sm transition-all shadow-xs"
            >
              DISCUSS AGENT ARCHITECTURE
            </Link>
          </div>
        </div>

        {/* How an Agent Works (Visual Step Diagram) */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-card mb-16">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-1">
              Deterministic Reasoning Cycle
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark">
              How an IMPACT Agent Operates
            </h2>
            <p className="text-sm text-brand-muted mt-2">
              Unlike generic LLM wrappers that make fragile assumptions, our agents follow strict verification loops before touching external systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {agentWorkflow.map((step, idx) => (
              <div
                key={step.step}
                className="relative flex flex-col p-5 rounded-2xl bg-brand-surface border border-brand-border"
              >
                <div className="text-xs font-mono font-bold text-brand-accent mb-2">
                  {step.step}
                </div>
                <div className="text-sm font-black text-brand-dark uppercase tracking-wider mb-2">
                  {step.name}
                </div>
                <p className="text-xs text-brand-muted leading-relaxed flex-1">
                  {step.desc}
                </p>
                {idx < agentWorkflow.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-brand-subtle">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-brand-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-brand-muted">
            <span className="font-semibold text-brand-dark">
              Cycle: Understand → Reason → Plan → Use Tools → Take Action → Return Result
            </span>
            <span className="text-brand-teal font-bold">
              ✓ Deterministic Guardrails & Strict Tool Validation
            </span>
          </div>
        </div>

        {/* Agent Deployments Grid */}
        <div className="mb-16">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-brand-dark">
              Agent Architectures We Build
            </h2>
            <p className="text-base text-brand-muted mt-2">
              Configured for specific enterprise, commercial, and operational domains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentTypes.map((agent, idx) => {
              const Icon = agent.icon;
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
                      {agent.title}
                    </h3>
                    <p className="text-sm text-brand-muted leading-relaxed mb-6">
                      {agent.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border flex flex-wrap gap-1.5">
                    {agent.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-surface text-brand-charcoal border border-brand-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Universal Final Conversion CTA */}
        <div className="mt-16">
          <FinalCtaBanner customSubtitle="Deploy an intelligent autonomous agent that reasons, plans, uses tools, and takes real-world action for your business." />
        </div>
      </div>
    </div>
  );
}
