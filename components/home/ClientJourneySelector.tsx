"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lightbulb, Workflow, Bot, Laptop, Wrench, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export const ClientJourneySelector: React.FC = () => {
  const [selectedJourney, setSelectedJourney] = useState<number>(0);

  const journeys = [
    {
      id: "idea",
      choice: "I have an idea.",
      badge: "Concept → Launch",
      icon: Lightbulb,
      tagline: "Turn your concept into a production product.",
      description:
        "You have a market vision, product idea, or business opportunity, but need an engineering team to translate it from concept to a working, high-impact digital product.",
      recommendation: [
        "Rapid high-fidelity MVP scoping",
        "Clear non-technical architectural roadmap",
        "Full intellectual property ownership",
      ],
      primaryAction: {
        label: "BUILD MY IDEA",
        href: "/start-a-project?situation=idea",
      },
      secondaryAction: {
        label: "Try The Idea Builder",
        href: "#idea-builder",
      },
    },
    {
      id: "automation",
      choice: "I need automation.",
      badge: "Workflow & Speed",
      icon: Workflow,
      tagline: "Eliminate manual drag across your operations.",
      description:
        "Your team is held back by repetitive data re-entry, slow speed-to-lead, disjointed software tools, or manual administrative tasks that bottleneck company growth.",
      recommendation: [
        "Sub-60-second lead capture to CRM sync",
        "Automated WhatsApp & email engagement",
        "Hands-free cross-platform operations",
      ],
      primaryAction: {
        label: "AUTOMATE MY WORKFLOW",
        href: "/start-a-project?solution=automation",
      },
      secondaryAction: {
        label: "See Automation Examples",
        href: "/solutions/automation",
      },
    },
    {
      id: "agent",
      choice: "I need an AI agent.",
      badge: "Autonomous Intelligence",
      icon: Bot,
      tagline: "Intelligence that acts, decides, and executes.",
      description:
        "You need an autonomous agent that does more than chat—one that can understand goals, conduct telephone calls, qualify sales leads, or run internal operational research.",
      recommendation: [
        "24/7 customer-service & sales bots",
        "Sub-500ms voice telephone agents",
        "Zero-hallucination citation guardrails",
      ],
      primaryAction: {
        label: "BUILD AN AI AGENT",
        href: "/start-a-project?solution=ai-agent",
      },
      secondaryAction: {
        label: "Explore Agent Types",
        href: "/solutions/ai-agents",
      },
    },
    {
      id: "app",
      choice: "I need an application.",
      badge: "Web, Mobile & SaaS",
      icon: Laptop,
      tagline: "Engineered for speed, scale, and multi-role access.",
      description:
        "You need a custom web application, mobile app, multi-tenant SaaS platform, or administrative dashboard engineered with modern, maintainable, type-safe code.",
      recommendation: [
        "Next.js 14 & FastAPI architecture",
        "Granular Role-Based Access Control (RBAC)",
        "Real-time WebSockets & secure APIs",
      ],
      primaryAction: {
        label: "BUILD MY APPLICATION",
        href: "/start-a-project?solution=web-app",
      },
      secondaryAction: {
        label: "View App Capabilities",
        href: "/solutions/software",
      },
    },
    {
      id: "improve",
      choice: "I need to improve an existing system.",
      badge: "Refactoring & Modernization",
      icon: Wrench,
      tagline: "Upgrade legacy software with AI and integrations.",
      description:
        "You already have a working software platform, database, or business workflow that needs modernization, performance refactoring, API integrations, or AI capabilities injected.",
      recommendation: [
        "Modernize legacy backend bottlenecks",
        "Integrate AI models and search layers",
        "Connect third-party CRMs and APIs",
      ],
      primaryAction: {
        label: "DISCUSS SYSTEM UPGRADE",
        href: "/start-a-project?situation=existing",
      },
      secondaryAction: {
        label: "Review Integrations",
        href: "/solutions/software",
      },
    },
  ];

  const current = journeys[selectedJourney];
  const CurrentIcon = current.icon;

  return (
    <section className="py-14 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-bold text-brand-dark uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            Tailored Client Journey
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-brand-dark">
            WHERE ARE YOU STARTING FROM?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-brand-muted">
            Select the situation that matches your current requirement to view our recommended approach.
          </p>
        </div>

        {/* 5 Situation Entry Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-8">
          {journeys.map((j, idx) => {
            const isSelected = selectedJourney === idx;
            const Icon = j.icon;
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => setSelectedJourney(idx)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-brand-accent text-white border-brand-accent shadow-cardHover scale-[1.02]"
                    : "bg-brand-surface hover:bg-[#FAF9F6] text-brand-dark border-brand-border shadow-card"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected ? "bg-white/15 text-white" : "bg-white text-brand-accent border border-brand-border"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                        isSelected ? "text-white/80" : "text-brand-subtle"
                      }`}
                    >
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black tracking-tight leading-snug">
                    &ldquo;{j.choice}&rdquo;
                  </div>
                </div>
                <div
                  className={`text-[10px] font-mono mt-3 uppercase tracking-wider ${
                    isSelected ? "text-white/90 font-bold" : "text-brand-muted"
                  }`}
                >
                  {j.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Journey Detail Card */}
        <div className="bg-[#FAF9F6] border border-brand-border rounded-3xl p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent text-white flex items-center justify-center font-bold shadow-xs">
                  <CurrentIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-accent">
                    Solution Path: {current.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-brand-dark tracking-tight">
                    {current.tagline}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-brand-charcoal leading-relaxed">
                {current.description}
              </p>

              <div className="pt-3 border-t border-brand-border/70">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">
                  What IMPACT Provides for This Situation:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {current.recommendation.map((rec, rIdx) => (
                    <div
                      key={rIdx}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-dark"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Action Box */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-brand-border flex flex-col justify-center space-y-3 text-center shadow-xs">
              <span className="text-[11px] font-mono font-bold text-brand-subtle uppercase">
                Recommended Next Step
              </span>
              <div className="text-base font-bold text-brand-dark">
                Ready to take action on this?
              </div>
              <p className="text-xs text-brand-muted">
                Complete a guided project intake with your selected requirements pre-configured.
              </p>
              <div className="pt-2 space-y-2">
                <Link
                  href={current.primaryAction.href}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  <span>{current.primaryAction.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={current.secondaryAction.href}
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-brand-border bg-brand-surface hover:bg-white text-brand-charcoal font-semibold text-xs transition-colors"
                >
                  {current.secondaryAction.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
