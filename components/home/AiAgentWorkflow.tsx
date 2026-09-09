"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Bot,
  Wrench,
  Database,
  BrainCircuit,
  Zap,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import Link from "next/link";

interface WorkflowStep {
  id: string;
  stepNumber: string;
  name: string;
  category: string;
  icon: React.ElementType;
  headline: string;
  summary: string;
  latency: string;
  telemetry: {
    status: string;
    engine: string;
    payloadPreview: string;
    securityCheck: string;
  };
  sampleLog: string[];
}

export const AiAgentWorkflow: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const steps: WorkflowStep[] = [
    {
      id: "user-intent",
      stepNumber: "01",
      name: "USER INTENT",
      category: "Input Channel",
      icon: User,
      headline: "Multi-Modal Ingestion & Intent Trigger",
      summary:
        "The workflow begins when a customer or system issues a request via conversational chat, voice audio stream, REST webhook, or WhatsApp.",
      latency: "12ms",
      telemetry: {
        status: "Ingested",
        engine: "Gateway Webhook / Audio Ingest",
        payloadPreview: '{"channel": "WhatsApp", "sender": "+92-314-***-****", "intent": "order_and_dispatch"}',
        securityCheck: "TLS 1.3 + HMAC Validated",
      },
      sampleLog: [
        "[00:00:012] Inbound webhook received from customer gateway",
        "[00:00:014] Auth signature verified via SHA-256 HMAC",
        "[00:00:018] Normalized payload passed to Orchestrator",
      ],
    },
    {
      id: "ai-agent",
      stepNumber: "02",
      name: "AI AGENT",
      category: "Cognitive Engine",
      icon: Bot,
      headline: "Autonomous Context & State Orchestration",
      summary:
        "The agent retrieves the conversation history, user identity, and session memory, formulating an execution plan with strict system guardrails.",
      latency: "84ms",
      telemetry: {
        status: "Planning",
        engine: "DeepSeek / Claude 3.5 / GPT-4o Multi-Model Router",
        payloadPreview: '{"agent_id": "IMPACT-Agent-709", "memory_window": "12_turns", "state": "active"}',
        securityCheck: "Prompt Injection Filter: Passed",
      },
      sampleLog: [
        "[00:00:035] Ingested 12 turns of active memory",
        "[00:00:052] Prompt injection heuristic scan passed (Score: 0.001)",
        "[00:00:084] Agent synthesized 3-step action graph",
      ],
    },
    {
      id: "tools",
      stepNumber: "03",
      name: "TOOLS",
      category: "Function Calling",
      icon: Wrench,
      headline: "Dynamic Tool Discovery & Execution",
      summary:
        "Instead of just chatting, the agent autonomously selects and invokes external tools: database lookups, calculation engines, and third-party APIs.",
      latency: "115ms",
      telemetry: {
        status: "Dispatched",
        engine: "IMPACT Function Calling Subsystem",
        payloadPreview: '{"selected_tool": "query_pos_inventory", "args": {"branch_id": "B-04", "item_code": "SKU-992"}}',
        securityCheck: "RBAC Scope: ReadInventory Allowed",
      },
      sampleLog: [
        "[00:00:110] Invoking tool: query_pos_inventory()",
        "[00:00:145] Microservice handshake completed (200 OK)",
        "[00:00:199] Tool response validated against JSON schema",
      ],
    },
    {
      id: "data",
      stepNumber: "04",
      name: "DATA & RAG",
      category: "Context Layer",
      icon: Database,
      headline: "Vector Retrieval & Enterprise Knowledge",
      summary:
        "Context is enriched with private enterprise knowledge bases, live inventory tables, customer preferences, and dynamic pricing matrices.",
      latency: "42ms",
      telemetry: {
        status: "Context Enriched",
        engine: "pgvector / Pinecone Vector Store",
        payloadPreview: '{"top_k": 3, "similarity_score": 0.942, "doc_ids": ["policy_v4.pdf", "menu_pricing_live"]}',
        securityCheck: "Tenant Isolation: Strict Row-Level Security",
      },
      sampleLog: [
        "[00:00:205] Generating 1536-dim text embedding",
        "[00:00:222] Querying vector index with cosine similarity threshold 0.85",
        "[00:00:247] 3 semantic chunks injected into working context window",
      ],
    },
    {
      id: "decision",
      stepNumber: "05",
      name: "DECISION",
      category: "Logic & Guardrails",
      icon: BrainCircuit,
      headline: "Deterministic Confidence & Policy Evaluation",
      summary:
        "Before any action is taken, IMPACT guardrails verify business logic, spending thresholds, compliance rules, and deterministic constraints.",
      latency: "68ms",
      telemetry: {
        status: "Approved",
        engine: "IMPACT Deterministic Policy Guard",
        payloadPreview: '{"confidence": 0.988, "threshold": 0.90, "policy_status": "APPROVED", "flags": 0}',
        securityCheck: "Budget Limit: Passed ($0.00 / Free tier or authorized billing)",
      },
      sampleLog: [
        "[00:00:255] Evaluating business guardrail matrix",
        "[00:00:280] Confidence score 98.8% exceeds threshold (90%)",
        "[00:00:315] Action approved for synchronous execution",
      ],
    },
    {
      id: "action",
      stepNumber: "06",
      name: "ACTION",
      category: "Execution Subsystem",
      icon: Zap,
      headline: "Synchronous Mutation & API Dispatch",
      summary:
        "The agent executes the confirmed business mutation: placing the POS order, charging the card, updating the CRM, or sending real-time push alerts.",
      latency: "140ms",
      telemetry: {
        status: "Committed",
        engine: "Transactional Database & Event Bus",
        payloadPreview: '{"action_type": "KITCHEN_TICKET_GENERATE", "order_id": "ORD-8941", "broadcast": "KDS_SCREEN_01"}',
        securityCheck: "ACID Transaction: Committed",
      },
      sampleLog: [
        "[00:00:325] Initiating 2-phase commit on order database",
        "[00:00:398] Kitchen Display System (KDS) received ticket ORD-8941",
        "[00:00:455] Event published to WebSocket broadcast queue",
      ],
    },
    {
      id: "result",
      stepNumber: "07",
      name: "RESULT",
      category: "Output & Feedback",
      icon: CheckCircle2,
      headline: "Instant Customer Feedback & Audit Logging",
      summary:
        "The final result is streamed to the user interface in natural language, complete with receipts, status tracking links, and immutable audit logs.",
      latency: "28ms",
      telemetry: {
        status: "Delivered",
        engine: "Real-Time WebSocket & Event Sinks",
        payloadPreview: '{"delivery_status": "200_OK", "user_notified": true, "audit_hash": "e3b0c44298fc1c149afbf4c8"}',
        securityCheck: "Immutable SHA-256 Audit Entry Logged",
      },
      sampleLog: [
        "[00:00:460] Streaming natural-language confirmation to WhatsApp client",
        "[00:00:482] Live GPS & Kitchen tracking link active",
        "[00:00:483] Total round-trip latency: 483ms. Task completed successfully.",
      ],
    },
  ];

  // Auto-advance loop when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  const current = steps[activeStepIndex];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-brand-border relative overflow-hidden">
      {/* Subtle background tech grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Architectural Visualization</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-dark">
              AI AGENT WORKFLOW
            </h2>
            <p className="mt-3 text-base sm:text-lg text-brand-muted leading-relaxed">
              How IMPACT autonomous agents move from raw human intent to deterministic execution—in milliseconds.
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2 bg-brand-surface p-1.5 rounded-xl border border-brand-border self-start md:self-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-brand-border text-xs font-bold text-brand-dark shadow-xs hover:bg-brand-surfaceAlt transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setActiveStepIndex(0);
                setIsPlaying(false);
              }}
              className="p-1.5 rounded-lg hover:bg-white text-brand-muted hover:text-brand-dark transition-all"
              title="Reset to Step 01"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The 7-Step Interactive Pipeline Strip */}
        <div className="relative mb-12">
          {/* Connecting Track Line */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-brand-border -translate-y-1/2 z-0" />
          {/* Active Glowing Progress Track */}
          <div
            className="hidden lg:block absolute top-1/2 left-4 h-0.5 bg-gradient-to-r from-brand-accent via-brand-teal to-brand-gold -translate-y-1/2 z-0 transition-all duration-500"
            style={{
              width: `${(activeStepIndex / (steps.length - 1)) * 95}%`,
            }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative z-10">
            {steps.map((step, idx) => {
              const isActive = activeStepIndex === idx;
              const isPast = activeStepIndex > idx;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`flex flex-col items-center p-3.5 sm:p-4 rounded-2xl border text-center transition-all duration-300 relative ${
                    isActive
                      ? "bg-brand-accent text-white border-brand-accent shadow-lg shadow-brand-accent/20 scale-[1.04]"
                      : isPast
                      ? "bg-white border-brand-accent/40 text-brand-dark hover:border-brand-accent"
                      : "bg-white/80 hover:bg-white border-brand-border text-brand-muted hover:text-brand-dark"
                  }`}
                >
                  {/* Step Number Badge */}
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 ${
                      isActive ? "text-white/80" : "text-brand-subtle"
                    }`}
                  >
                    STEP {step.stepNumber}
                  </span>

                  {/* Icon Circle */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-all ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isPast
                        ? "bg-brand-accentSoft text-brand-accent"
                        : "bg-brand-surface text-brand-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Step Name */}
                  <span
                    className={`text-xs font-black tracking-tight ${
                      isActive ? "text-white" : "text-brand-dark"
                    }`}
                  >
                    {step.name}
                  </span>

                  {/* Step Category */}
                  <span
                    className={`text-[10px] mt-0.5 line-clamp-1 ${
                      isActive ? "text-white/80" : "text-brand-subtle"
                    }`}
                  >
                    {step.category}
                  </span>

                  {/* Active Indicator Arrow */}
                  {isActive && (
                    <div className="absolute -bottom-2 w-3 h-3 bg-brand-accent rotate-45 rounded-xs" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Inspection Drawer for Active Step */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-cardHover">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Step Breakdown */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-brand-accent text-white text-xs font-mono font-bold">
                  STEP {current.stepNumber} OF 07
                </div>
                <div className="text-xs font-mono font-bold text-brand-subtle">
                  Telemetry Latency: <span className="text-brand-teal font-black">{current.latency}</span>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
                {current.headline}
              </h3>

              <p className="text-sm sm:text-base text-brand-charcoal leading-relaxed">
                {current.summary}
              </p>

              {/* Verified Security Rule */}
              <div className="p-3.5 rounded-xl bg-white border border-brand-border flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-teal flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-brand-dark">Enterprise Guardrail: </span>
                  <span className="text-brand-muted">{current.telemetry.securityCheck}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => setActiveStepIndex((prev) => (prev + 1) % steps.length)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-black text-white text-xs font-bold transition-all"
                >
                  <span>Next Step ({steps[(activeStepIndex + 1) % steps.length].name})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  href="/solutions/ai-agents"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline py-2"
                >
                  Explore AI Agent Architecture →
                </Link>
              </div>
            </div>

            {/* Right: Live Telemetry & Log Console */}
            <div className="lg:col-span-6 bg-brand-dark text-brand-surface rounded-2xl p-5 border border-brand-charcoal/40 shadow-inner font-mono text-xs space-y-4">
              {/* Console Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white/60">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-teal" />
                  <span className="font-bold uppercase tracking-wider text-[11px] text-white">
                    RUNTIME TELEMETRY STREAM
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 font-bold">{current.telemetry.status}</span>
                </div>
              </div>

              {/* Engine Specs */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-white/40 block text-[9px] uppercase">Engine Router</span>
                  <span className="text-white font-bold truncate block">{current.telemetry.engine}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-white/40 block text-[9px] uppercase">Sub-second Latency</span>
                  <span className="text-brand-gold font-bold block">{current.latency}</span>
                </div>
              </div>

              {/* JSON Payload Inspection */}
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                  Active State Payload (JSON)
                </span>
                <pre className="p-3 rounded-lg bg-black/60 border border-white/10 text-[11px] text-indigo-300 overflow-x-auto">
                  <code>{current.telemetry.payloadPreview}</code>
                </pre>
              </div>

              {/* Execution Logs */}
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                  Chronological Execution Trace
                </span>
                <div className="space-y-1 text-[10px] text-white/70">
                  {current.sampleLog.map((log, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-brand-teal">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
