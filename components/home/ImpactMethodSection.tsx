"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Network, Cpu, Code2, Cable, BarChart3, CheckCircle } from "lucide-react";

export const ImpactMethodSection: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(0);

  const stages = [
    {
      letter: "I",
      name: "IDENTIFY",
      tagline: "Understand the problem and objective.",
      icon: Compass,
      focus: "Commercial & Technical Discovery",
      details:
        "We dissect the business challenge, operational bottleneck, or product vision. We identify who uses the system, what value it creates, and what success looks like in plain commercial metrics before writing a line of code.",
      deliverables: ["Problem Definition", "System Scope & User Personas", "Technical Feasibility Assessment"],
    },
    {
      letter: "M",
      name: "MODEL",
      tagline: "Design the intelligence and architecture.",
      icon: Cpu,
      focus: "AI & System Architecture",
      details:
        "We architect the data models, LLM pipelines, security parameters, and technical stack (e.g. FastAPI, Next.js, vector databases, Redis, PostgreSQL). We blueprint how AI models will reason over domain data reliably.",
      deliverables: ["System Architecture Blueprint", "AI Prompt & Model Specifications", "Database & Schema Models"],
    },
    {
      letter: "P",
      name: "PROCESS",
      tagline: "Design the workflow and automation.",
      icon: Network,
      focus: "Workflow & Operational Logic",
      details:
        "We map out the exact sequence of events from user trigger to final fulfillment. We isolate friction points and design automated handoffs between AI agents, databases, and human teams.",
      deliverables: ["End-to-End Workflow Diagrams", "Agent Decision Trees", "Trigger & Notification Maps"],
    },
    {
      letter: "A",
      name: "ASSEMBLE",
      tagline: "Build the application, agents and integrations.",
      icon: Code2,
      focus: "Full-Stack & Agent Engineering",
      details:
        "Our engineers build the production frontends, robust backend APIs, autonomous agents, and role-based access portals. Everything is written in clean, type-safe, tested code.",
      deliverables: ["Next.js Responsive Frontends", "FastAPI / Node Microservices", "Autonomous Multi-Step Agents"],
    },
    {
      letter: "C",
      name: "CONNECT",
      tagline: "Connect technology with people, data and business systems.",
      icon: Cable,
      focus: "Enterprise System Integration",
      details:
        "We integrate the new platform with your existing CRMs, communication channels (WhatsApp, Slack, email), payment gateways, and internal legacy databases, ensuring unified zero-loss data flow.",
      deliverables: ["Live API & Webhook Integrations", "Payment & CRM Synchronization", "Multi-Role Staff Access Setup"],
    },
    {
      letter: "T",
      name: "TRANSFORM",
      tagline: "Deploy, optimize and measure the outcome.",
      icon: BarChart3,
      focus: "Launch & Measured Impact",
      details:
        "We deploy to secure production environments, run real-world load tests, monitor live operational logs, and continuously optimize agent precision and system speed to ensure measurable business return.",
      deliverables: ["Production Cloud Deployment", "Real-Time Observability & Monitoring", "Executive Impact & Performance Review"],
    },
  ];

  return (
    <section id="method" className="py-20 lg:py-28 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-dark text-xs font-bold uppercase tracking-wider mb-4">
              Our Methodology
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-dark">
              HOW WE TURN IDEAS INTO IMPACT
            </h2>
            <p className="mt-4 text-lg text-brand-muted max-w-2xl">
              The IMPACT Method™ is a battle-tested six-stage framework designed to navigate complex technology builds from problem to real-world deployment.
            </p>
          </div>
          <div>
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-brand-dark font-bold text-sm transition-all shadow-xs"
            >
              <span>Apply The Method to Your Project</span>
              <ArrowRight className="w-4 h-4 text-brand-accent" />
            </Link>
          </div>
        </div>

        {/* 6 Stage Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {stages.map((stage, idx) => {
            const isSelected = selectedStage === idx;
            return (
              <button
                key={stage.letter}
                onClick={() => setSelectedStage(idx)}
                className={`flex flex-col p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-brand-accent text-white border-brand-accent shadow-cardHover"
                    : "bg-brand-surface hover:bg-white text-brand-dark border-brand-border shadow-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-2xl font-black ${
                      isSelected ? "text-white" : "text-brand-accent"
                    }`}
                  >
                    {stage.letter}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isSelected ? "text-white/80" : "text-brand-subtle"
                    }`}
                  >
                    Stage 0{idx + 1}
                  </span>
                </div>
                <div className="text-xs font-bold tracking-tight uppercase">
                  {stage.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Deep-Dive Card */}
        <div className="bg-[#FAF9F6] border border-brand-border rounded-2xl p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-accent text-white flex items-center justify-center font-black text-xl shadow-xs">
                  {stages[selectedStage].letter}
                </span>
                <div>
                  <h3 className="text-2xl font-black text-brand-dark tracking-tight">
                    {stages[selectedStage].name} — {stages[selectedStage].tagline}
                  </h3>
                  <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                    {stages[selectedStage].focus}
                  </span>
                </div>
              </div>

              <p className="text-base text-brand-charcoal leading-relaxed pt-2">
                {stages[selectedStage].details}
              </p>

              <div className="pt-4 border-t border-brand-border/80">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-3">
                  Key Stage Deliverables:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stages[selectedStage].deliverables.map((item, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center gap-2 p-3 rounded-lg bg-white border border-brand-border text-xs font-semibold text-brand-dark"
                    >
                      <CheckCircle className="w-4 h-4 text-brand-teal flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-brand-border text-center flex flex-col justify-center items-center">
              <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center text-brand-accent mb-3">
                {React.createElement(stages[selectedStage].icon, { className: "w-6 h-6" })}
              </div>
              <div className="text-xs font-mono font-bold text-brand-subtle uppercase">
                Stage {selectedStage + 1} of 6
              </div>
              <div className="text-lg font-bold text-brand-dark mt-1">
                The {stages[selectedStage].letter} Phase
              </div>
              <p className="text-xs text-brand-muted mt-2 max-w-xs">
                {stages[selectedStage].tagline}
              </p>
              <button
                onClick={() => setSelectedStage((prev) => (prev + 1) % stages.length)}
                className="mt-5 w-full py-2.5 px-4 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt text-brand-dark border border-brand-border font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Next Phase: {stages[(selectedStage + 1) % stages.length].name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
