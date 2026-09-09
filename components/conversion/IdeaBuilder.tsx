"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, ShieldCheck, Compass, Check } from "lucide-react";

export const IdeaBuilder: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [objective, setObjective] = useState<string>("");
  const [audience, setAudience] = useState<string>("");
  const [friction, setFriction] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const objectives = [
    { label: "Build something new", desc: "Turn a fresh business concept or market opportunity into a working digital product" },
    { label: "Automate something", desc: "Replace repetitive manual work, spreadsheets, or slow lead response times" },
    { label: "Add AI", desc: "Equip your business with intelligent reasoning, conversational voice/chat, or data extraction" },
    { label: "Improve an existing system", desc: "Modernize current software, connect disjointed tools, or upgrade legacy code" },
    { label: "Create a digital product", desc: "Build a scalable SaaS or subscription platform to monetize in the market" },
  ];

  const audiences = [
    { label: "Internal Team & Staff", desc: "Employees who need tools to work faster and eliminate administrative drag" },
    { label: "Paying Customers & Clients", desc: "External end-users who browse, order, book, or consume digital services" },
    { label: "Both Staff & Customers", desc: "A unified platform connecting front-end users with back-office operations" },
    { label: "Founders / Solo Operators", desc: "Building a lean system that allows a small team to perform like an enterprise" },
  ];

  const frictions = [
    { label: "Repetitive data entry & manual handoffs", desc: "Too much time spent typing the same data across multiple tools" },
    { label: "Slow customer inquiries & response delays", desc: "Leads go cold or support tickets pile up outside business hours" },
    { label: "Outgrown spreadsheets & paper tickets", desc: "Operations have become too complex for simple documents and spreadsheets" },
    { label: "Need a competitive proprietary product", desc: "Want to own a custom software asset rather than renting inflexible third-party apps" },
  ];

  // Auto-advance handlers for smooth, frictionless client flow
  const handleSelectObjective = (val: string) => {
    setObjective(val);
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(2);
      setIsTransitioning(false);
    }, 240);
  };

  const handleSelectAudience = (val: string) => {
    setAudience(val);
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(3);
      setIsTransitioning(false);
    }, 240);
  };

  const handleSelectFriction = (val: string) => {
    setFriction(val);
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(4);
      setIsTransitioning(false);
    }, 240);
  };

  // Synthesize Project Direction recommendations based on user selections
  const getProjectDirection = () => {
    const modules: string[] = [];

    if (objective === "Automate something" || friction.includes("data entry")) {
      modules.push("Business Process Automation");
      modules.push("CRM & Database Synchronization");
    }
    if (objective === "Add AI" || friction.includes("customer inquiries")) {
      modules.push("Autonomous AI Agent (Chat / Voice)");
      modules.push("Intelligent Decision & Citation Guardrails");
    }
    if (objective === "Build something new" || objective === "Create a digital product") {
      modules.push("Modern Next.js Web Application");
      modules.push("Multi-Tenant Cloud Backend (FastAPI)");
    }
    if (objective === "Improve an existing system") {
      modules.push("System Architecture Refactoring & APIs");
      modules.push("Database Modernization");
    }
    if (audience.includes("Both Staff & Customers") || audience.includes("Paying Customers")) {
      modules.push("Role-Based Access Portals (RBAC)");
    }

    // Default fallback
    if (modules.length === 0) {
      modules.push("AI Agent", "Workflow Automation", "Web Application", "CRM Integration");
    }

    return Array.from(new Set(modules));
  };

  const resetBuilder = () => {
    setStep(1);
    setObjective("");
    setAudience("");
    setFriction("");
    setIsTransitioning(false);
  };

  return (
    <section id="idea-builder" className="py-20 lg:py-28 bg-[#FAF9F6] border-b border-brand-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4" />
            Interactive Scoping Tool
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-dark">
            IDEA BUILDER
          </h2>
          <p className="mt-3 text-base sm:text-lg text-brand-muted">
            Answer 3 non-technical questions to discover the ideal architectural direction for your project.
          </p>
        </div>

        {/* Builder Interactive Container */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-12 shadow-card relative">
          {/* Step Progress Bar with Clickable Tabs */}
          <div className="mb-8 pb-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-brand-dark uppercase tracking-wider block">
                {step <= 3 ? `Question 0${step} of 03` : "Recommended Direction"}
              </span>
              <span className="text-[11px] text-brand-muted">
                {step === 1 && "What are you trying to achieve?"}
                {step === 2 && "Who is this system being built for?"}
                {step === 3 && "What is your biggest current headache?"}
                {step === 4 && "Your Tailored Project Direction"}
              </span>
            </div>

            {/* Clickable Step Pills */}
            <div className="flex items-center gap-2">
              {[
                { num: 1, label: "Intent" },
                { num: 2, label: "Users" },
                { num: 3, label: "Friction" },
                { num: 4, label: "Direction" },
              ].map((s) => {
                const isActive = step === s.num;
                const isPast = step > s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num < step || (s.num === 2 && objective) || (s.num === 3 && audience) || (s.num === 4 && friction)) {
                        setStep(s.num);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-brand-accent text-white shadow-xs scale-105"
                        : isPast
                        ? "bg-brand-accentSoft text-brand-accent hover:bg-brand-accent hover:text-white"
                        : "bg-brand-surface text-brand-subtle cursor-default"
                    }`}
                  >
                    <span>0{s.num}</span>
                    <span className="hidden xs:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUESTION 1: WHAT ARE YOU TRYING TO ACHIEVE? */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-accent uppercase">
                    Question 01 • Objective
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    WHAT ARE YOU TRYING TO ACHIEVE?
                  </h3>
                  <p className="text-sm text-brand-muted mt-1">
                    Click any option below to select and auto-advance.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {objectives.map((item) => {
                  const isSelected = objective === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectObjective(item.label)}
                      className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                          : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                          {item.label}
                        </div>
                        <div className="text-xs text-brand-muted mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                            isSelected
                              ? "border-brand-accent bg-brand-accent text-white scale-110"
                              : "border-brand-border bg-white text-brand-subtle group-hover:border-brand-accent/50"
                          }`}
                        >
                          {isSelected ? "✓" : <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Action */}
              <div className="pt-4 flex items-center justify-between border-t border-brand-border/60">
                <span className="text-xs text-brand-muted font-medium">
                  {objective ? `Selected: ${objective}` : "Select an option to proceed"}
                </span>
                <button
                  type="button"
                  disabled={!objective}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <span>Continue to Question 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 2: WHO WILL USE THIS? */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-accent uppercase">
                    Question 02 • Target Audience
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    WHO IS THIS SYSTEM BEING BUILT FOR?
                  </h3>
                  <p className="text-sm text-brand-muted mt-1">
                    Click an audience below to select and auto-advance.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {audiences.map((item) => {
                  const isSelected = audience === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectAudience(item.label)}
                      className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                          : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                          {item.label}
                        </div>
                        <div className="text-xs text-brand-muted mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                            isSelected
                              ? "border-brand-accent bg-brand-accent text-white scale-110"
                              : "border-brand-border bg-white text-brand-subtle group-hover:border-brand-accent/50"
                          }`}
                        >
                          {isSelected ? "✓" : <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Question</span>
                </button>
                <button
                  type="button"
                  disabled={!audience}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <span>Continue to Question 3</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 3: MAIN FRICTION / BOTTLE NECK */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-accent uppercase">
                    Question 03 • Primary Challenge
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                    WHAT IS YOUR BIGGEST CURRENT HEADACHE?
                  </h3>
                  <p className="text-sm text-brand-muted mt-1">
                    Click your primary friction point to calculate your project direction.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {frictions.map((item) => {
                  const isSelected = friction === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectFriction(item.label)}
                      className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                        isSelected
                          ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                          : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm sm:text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                          {item.label}
                        </div>
                        <div className="text-xs text-brand-muted mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${
                            isSelected
                              ? "border-brand-accent bg-brand-accent text-white scale-110"
                              : "border-brand-border bg-white text-brand-subtle group-hover:border-brand-accent/50"
                          }`}
                        >
                          {isSelected ? "✓" : <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Question</span>
                </button>
                <button
                  type="button"
                  disabled={!friction}
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                >
                  <span>See Project Direction</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* OUTCOME: YOUR PROJECT DIRECTION */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tailored Strategic Analysis
                </div>
                <button
                  type="button"
                  onClick={resetBuilder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </button>
              </div>

              <div>
                <h3 className="text-2xl sm:text-4xl font-black text-brand-dark tracking-tight">
                  YOUR PROJECT DIRECTION
                </h3>
                <p className="text-sm text-brand-muted mt-2">
                  Based on your requirements, your project may involve the following core capabilities:
                </p>
              </div>

              {/* Recommended capabilities pill grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                {getProjectDirection().map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-surface border border-brand-border text-xs sm:text-sm font-bold text-brand-dark"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-teal flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Explicit non-binding assurance disclaimer */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
                <strong>Important Note:</strong> This recommendation outlines the high-level technological architecture suited to your goals. It is presented as a strategic roadmap for scoping and is not a binding technical quotation.
              </div>

              {/* User Selection Summary */}
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-brand-subtle font-bold">
                  Your Selected Inputs:
                </div>
                <div className="text-brand-charcoal">
                  <strong>Goal:</strong> {objective} • <strong>Users:</strong> {audience} • <strong>Friction:</strong> {friction}
                </div>
              </div>

              {/* Conversion CTA Button */}
              <div className="pt-2">
                <Link
                  href={`/start-a-project?objective=${encodeURIComponent(objective)}&users=${encodeURIComponent(audience)}&friction=${encodeURIComponent(friction)}`}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-accent hover:bg-brand-accentHover text-white font-black text-base shadow-md hover:shadow-cardHover transition-all flex items-center justify-center gap-2 text-center uppercase tracking-wider"
                >
                  <span>START PROJECT DISCUSSION WITH THIS ROADMAP</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
