"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, ShieldCheck, Compass } from "lucide-react";

export const IdeaBuilder: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [objective, setObjective] = useState<string>("");
  const [audience, setAudience] = useState<string>("");
  const [friction, setFriction] = useState<string>("");

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
  };

  return (
    <section id="idea-builder" className="py-20 lg:py-28 bg-[#FAF9F6] border-b border-brand-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
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
        <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-12 shadow-card">
          {/* Step Progress Bar */}
          <div className="mb-8 pb-4 border-b border-brand-border flex items-center justify-between text-xs font-bold text-brand-subtle uppercase tracking-wider">
            <span>
              {step <= 3 ? `Question 0${step} of 03` : "Recommended Direction"}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <span
                  key={s}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    step >= s ? "bg-brand-accent" : "bg-brand-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* QUESTION 1: WHAT ARE YOU TRYING TO ACHIEVE? */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-brand-accent uppercase">
                  Initial Intent
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                  WHAT ARE YOU TRYING TO ACHIEVE?
                </h3>
                <p className="text-sm text-brand-muted mt-1">
                  Select the main outcome you want to produce.
                </p>
              </div>

              <div className="space-y-3">
                {objectives.map((item) => {
                  const isSelected = objective === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setObjective(item.label)}
                      className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                          : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm sm:text-base text-brand-dark">
                          {item.label}
                        </div>
                        <div className="text-xs text-brand-muted mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? "border-brand-accent bg-brand-accent text-white"
                            : "border-brand-border bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!objective}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 2: WHO WILL USE THIS? */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-brand-accent uppercase">
                  Target Users
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                  WHO IS THIS SYSTEM BEING BUILT FOR?
                </h3>
                <p className="text-sm text-brand-muted mt-1">
                  Understanding the users helps us design the right roles and permissions.
                </p>
              </div>

              <div className="space-y-3">
                {audiences.map((item) => {
                  const isSelected = audience === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setAudience(item.label)}
                      className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                          : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm sm:text-base text-brand-dark">
                          {item.label}
                        </div>
                        <div className="text-xs text-brand-muted mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? "border-brand-accent bg-brand-accent text-white"
                            : "border-brand-border bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!audience}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QUESTION 3: MAIN FRICTION / BOTTLE NECK */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <span className="text-xs font-mono font-bold text-brand-accent uppercase">
                  Primary Challenge
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight mt-1">
                  WHAT IS YOUR BIGGEST CURRENT HEADACHE?
                </h3>
                <p className="text-sm text-brand-muted mt-1">
                  What friction or pain point must this technology eliminate?
                </p>
              </div>

              <div className="space-y-3">
                {frictions.map((item) => {
                  const isSelected = friction === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setFriction(item.label)}
                      className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-brand-accentSoft border-brand-accent text-brand-dark ring-2 ring-brand-accent/20"
                          : "bg-brand-surface border-brand-border hover:bg-white hover:border-brand-accent/40"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm sm:text-base text-brand-dark">
                          {item.label}
                        </div>
                        <div className="text-xs text-brand-muted mt-0.5">
                          {item.desc}
                        </div>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? "border-brand-accent bg-brand-accent text-white"
                            : "border-brand-border bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!friction}
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <span>See Project Direction</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* OUTCOME: YOUR PROJECT DIRECTION */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tailored Strategic Analysis
                </div>
                <button
                  type="button"
                  onClick={resetBuilder}
                  className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-brand-dark"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Questions</span>
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
                  Your Inputs:
                </div>
                <div className="text-brand-charcoal">
                  <strong>Goal:</strong> {objective} • <strong>Users:</strong> {audience} • <strong>Friction:</strong> {friction}
                </div>
              </div>

              {/* Conversion CTA Button */}
              <div className="pt-2">
                <Link
                  href={`/start-a-project?objective=${encodeURIComponent(objective)}&users=${encodeURIComponent(audience)}&friction=${encodeURIComponent(friction)}`}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-accent hover:bg-brand-accentHover text-white font-black text-base shadow-sm hover:shadow-cardHover transition-all flex items-center justify-center gap-2 text-center uppercase tracking-wider"
                >
                  <span>START PROJECT DISCUSSION</span>
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
