import React from "react";
import Link from "next/link";
import { ShieldCheck, Cpu, Workflow, Code2, Box, Network, CheckCircle2, Lock, FileCode2, Zap, ArrowRight } from "lucide-react";

export const CapabilitiesTrustSection: React.FC = () => {
  const capabilities = [
    {
      id: "ai",
      title: "AI Engineering",
      icon: Cpu,
      tag: "Deterministic & Grounded",
      evidence: [
        "Zero-hallucination citation grounding on domain data",
        "Sub-500ms latency voice and conversational agents",
        "Deterministic JSON schema tool-calling validation",
        "Hybrid vector search with dense & sparse re-ranking",
      ],
    },
    {
      id: "automation",
      title: "Automation",
      icon: Workflow,
      tag: "Idempotent & Resilient",
      evidence: [
        "Idempotent webhook capture to prevent duplicate entries",
        "Exponential backoff retry queues with dead-letter logging",
        "Sub-60-second speed-to-lead CRM synchronization",
        "Automated multi-channel alerts (WhatsApp, Email, SMS)",
      ],
    },
    {
      id: "software",
      title: "Software Engineering",
      icon: Code2,
      tag: "Type-Safe & High-Throughput",
      evidence: [
        "Strict end-to-end type safety (TypeScript + Pydantic v2)",
        "Asynchronous FastAPI microservices for high concurrency",
        "8-tier Role-Based Access Control (RBAC) endpoint gates",
        "PostgreSQL ACID transactions with zero data corruption",
      ],
    },
    {
      id: "product",
      title: "Product Development",
      icon: Box,
      tag: "Production Scalability",
      evidence: [
        "Cryptographic HMAC-SHA256 signature tokens",
        "Dynamic multi-branch server-isolated database schemas",
        "Containerized Docker & cloud production deployments",
        "Automated seed scripts and end-to-end integration tests",
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: Network,
      tag: "Real-Time & Connected",
      evidence: [
        "Redis Pub/Sub WebSockets for sub-second live dispatch",
        "Stripe, payment gateways, and automated billing webhooks",
        "Bidirectional CRM APIs (HubSpot, Salesforce, custom DBs)",
        "OpenAPI / Swagger auto-generated live documentation",
      ],
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface border border-brand-border text-xs font-bold text-brand-dark uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            Verified Technical Assurance
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-dark">
            BUILT ON PROVABLE CAPABILITIES.
          </h2>
          <p className="mt-4 text-lg text-brand-muted leading-relaxed">
            We do not manufacture fake social proof or fictional testimonials. We prove credibility through architectural rigor, verifiable code standards, and concrete engineering practices.
          </p>
        </div>

        {/* 5 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                className="bg-[#FAF9F6] border border-brand-border rounded-3xl p-7 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-white border border-brand-border text-brand-accent shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent bg-brand-accentSoft px-2.5 py-1 rounded-md">
                      {cap.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-dark tracking-tight mb-4">
                    {cap.title}
                  </h3>

                  <div className="space-y-2.5 border-t border-brand-border/70 pt-4 mb-4">
                    {cap.evidence.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-brand-charcoal">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-border text-[11px] font-mono text-brand-subtle">
                  Verified in live production repositories
                </div>
              </div>
            );
          })}

          {/* 6th Card: Enterprise Assurance Guarantee */}
          <div className="bg-brand-dark text-white rounded-3xl p-7 flex flex-col justify-between shadow-card">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/70 bg-white/10 px-2 py-0.5 rounded">
                Client Governance
              </span>
              <h3 className="text-xl font-bold mt-3 mb-2 text-white">
                100% Client Code &amp; IP Ownership
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                You retain full intellectual property rights, database ownership, and clean source code repositories. We provide mutual NDAs before any sensitive discussion.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <Link
                href="/start-a-project"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-brand-accentSoft uppercase tracking-wider"
              >
                <span>Initiate Project Intake</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
