"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Cpu, Cog, Layers, TrendingUp, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { NeuralCanvas } from "@/components/visuals/NeuralCanvas";
import { Tilt3DCard } from "@/components/ui/Tilt3DCard";

export const HeroSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      num: "01",
      name: "IDEA",
      title: "Raw Concept & Business Objective",
      desc: "Every breakthrough starts with a problem to solve, an inefficient manual process, or an ambitious market vision.",
      icon: Lightbulb,
      highlight: "Understanding the commercial goal first.",
    },
    {
      num: "02",
      name: "INTELLIGENCE",
      title: "AI Architecture & Models",
      desc: "We engineer LLM workflows, custom embeddings, predictive logic, and decision systems suited to the domain.",
      icon: Cpu,
      highlight: "Precision AI models that reason and decide.",
    },
    {
      num: "03",
      name: "AUTOMATION",
      title: "Autonomous Workflows & Sync",
      desc: "Repetitive human bottlenecks are converted into resilient automated pipelines with instant alerts and CRM synchronizations.",
      icon: Cog,
      highlight: "Eliminating manual drag across operations.",
    },
    {
      num: "04",
      name: "PRODUCT",
      title: "Production Web, Mobile & APIs",
      desc: "Robust Next.js interfaces, FastAPI backends, secure multi-tenant databases, and role-based portals for users.",
      icon: Layers,
      highlight: "Enterprise-ready software engineered for scale.",
    },
    {
      num: "05",
      name: "IMPACT",
      title: "Measurable Business Value",
      desc: "Higher lead conversions, lower operational costs, delighted customers, and a defensible digital advantage.",
      icon: TrendingUp,
      highlight: "Real-world transformation you can measure.",
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-brand-border bg-[#FAF9F6]">
      {/* 3D Interactive Neural Particle Mesh */}
      <NeuralCanvas />

      {/* Subtle tech grid background with depth */}
      <div className="absolute inset-0 bg-tech-grid opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Positioning Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-border shadow-xs text-xs font-bold text-brand-dark uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span>AI • Agents • Automation • Software • Products</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-brand-dark leading-[1.06]">
              TURNING IDEAS INTO <span className="text-brand-accent underline decoration-brand-accent/20 decoration-wavy decoration-2">IMPACT.</span>
            </h1>

            {/* Supporting Headline */}
            <p className="text-xl sm:text-2xl font-semibold text-brand-charcoal leading-snug">
              AI, automation and software engineered to turn ambitious ideas into working products.
            </p>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed max-w-2xl">
              From intelligent agents and automated workflows to complete digital platforms, IMPACT builds technology around real business problems. We design and ship production systems for businesses, startups, and enterprise teams.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="/start-a-project"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-base shadow-sm hover:shadow-cardHover transition-all text-center"
              >
                <span>START A PROJECT</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-brand-dark font-semibold text-base shadow-card transition-all text-center"
              >
                EXPLORE OUR WORK
              </Link>
            </div>

            {/* Quick Assurance */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-brand-muted font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Problem-First Engineering</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Enterprise Security & RBAC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Production Turnkey Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Abstract Flow Progression */}
          <div className="lg:col-span-5">
            <Tilt3DCard>
              <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-7 shadow-cardHover">
                <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                  <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle">
                    The Transformation Lifecycle
                  </div>
                  <div className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-accentSoft text-brand-accent">
                    Interactive Pipeline
                  </div>
                </div>

                {/* Step progression buttons */}
                <div className="mt-4 grid grid-cols-5 gap-1.5">
                  {steps.map((step, idx) => {
                    const isActive = activeStep === idx;
                    const Icon = step.icon;
                    return (
                      <button
                        key={step.name}
                        onClick={() => setActiveStep(idx)}
                        className={`flex flex-col items-center p-2 rounded-lg text-center transition-all ${
                          isActive
                            ? "bg-brand-accent text-white shadow-xs font-bold"
                            : "bg-brand-surface hover:bg-brand-surfaceAlt text-brand-muted hover:text-brand-dark"
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1" />
                        <span className="text-[10px] tracking-tight">{step.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Step Card */}
                <div className="mt-5 p-5 rounded-xl bg-brand-surface border border-brand-border/80 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-brand-accent">
                      Step {steps[activeStep].num} — {steps[activeStep].name}
                    </span>
                    <span className="text-xs font-mono font-bold text-brand-muted">
                      {activeStep + 1} of 5
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                    {steps[activeStep].desc}
                  </p>
                  <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-charcoal">
                      {steps[activeStep].highlight}
                    </span>
                    <button
                      onClick={() => setActiveStep((prev) => (prev + 1) % steps.length)}
                      className="inline-flex items-center gap-1 font-bold text-brand-accent hover:underline"
                    >
                      Next Stage <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Linear Flow Diagram */}
                <div className="mt-5 pt-4 border-t border-brand-border text-center">
                  <div className="text-[11px] font-mono font-bold text-brand-muted tracking-wider flex items-center justify-center gap-1.5 flex-wrap">
                    <span className={activeStep === 0 ? "text-brand-accent font-black underline" : ""}>IDEA</span>
                    <span>→</span>
                    <span className={activeStep === 1 ? "text-brand-accent font-black underline" : ""}>INTELLIGENCE</span>
                    <span>→</span>
                    <span className={activeStep === 2 ? "text-brand-accent font-black underline" : ""}>AUTOMATION</span>
                    <span>→</span>
                    <span className={activeStep === 3 ? "text-brand-accent font-black underline" : ""}>PRODUCT</span>
                    <span>→</span>
                    <span className={activeStep === 4 ? "text-brand-accent font-black underline" : ""}>IMPACT</span>
                  </div>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </div>
    </section>
  );
};
