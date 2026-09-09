import React from "react";
import Link from "next/link";
import { Cpu, Bot, Workflow, Code2, Box, Network, ArrowUpRight } from "lucide-react";

export const TrustBar: React.FC = () => {
  const capabilities = [
    {
      name: "AI SYSTEMS",
      desc: "LLMs, RAG & Predictive Models",
      icon: Cpu,
      href: "/solutions/ai-agents",
    },
    {
      name: "AI AGENTS",
      desc: "Autonomous Reasoning & Action",
      icon: Bot,
      href: "/solutions/ai-agents",
    },
    {
      name: "AUTOMATION",
      desc: "Lead, CRM & Process Pipelines",
      icon: Workflow,
      href: "/solutions/automation",
    },
    {
      name: "APPLICATIONS",
      desc: "Web, Mobile & Multi-Role Apps",
      icon: Code2,
      href: "/solutions/software",
    },
    {
      name: "PRODUCTS",
      desc: "Proprietary Platforms & MVPs",
      icon: Box,
      href: "/products",
    },
    {
      name: "INTEGRATIONS",
      desc: "APIs, Cloud & Enterprise Data",
      icon: Network,
      href: "/solutions/software",
    },
  ];

  return (
    <section className="py-10 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="text-xs font-bold uppercase tracking-widest text-brand-subtle">
            Core Technological Capabilities
          </div>
          <div className="text-xs text-brand-muted font-medium">
            Engineered for founders, business operators, and enterprise engineering teams
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.name}
                href={cap.href}
                className="group relative flex flex-col p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-accent/40 hover:bg-white transition-all shadow-card hover:shadow-cardHover"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white border border-brand-border text-brand-accent group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-subtle group-hover:text-brand-accent transition-colors" />
                </div>
                <div className="text-xs font-black tracking-wider text-brand-dark uppercase">
                  {cap.name}
                </div>
                <div className="text-[11px] text-brand-muted mt-1 leading-snug line-clamp-2">
                  {cap.desc}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
