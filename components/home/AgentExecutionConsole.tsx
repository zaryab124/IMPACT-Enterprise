'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Terminal, CheckCircle2, ShieldCheck, Zap, Activity, Cpu, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface AgentStep {
  time: string;
  stage: string;
  action: string;
  detail: string;
  badge: string;
  type: 'info' | 'success' | 'tool' | 'guard';
}

interface Scenario {
  id: string;
  title: string;
  badge: string;
  description: string;
  metrics: { latency: string; tokens: string; confidence: string };
  steps: AgentStep[];
  jsonOutput: object;
}

export const AgentExecutionConsole: React.FC = () => {
  const scenarios: Scenario[] = [
    {
      id: 'voice-agent',
      title: 'Autonomous Voice & Reservation Agent',
      badge: 'Sub-400ms Voice Pipeline',
      description: 'Customer dials in to modify reservation and request private room menu options.',
      metrics: { latency: '342ms', tokens: '148 t/s', confidence: '99.8%' },
      steps: [
        {
          time: '00:00.038',
          stage: 'AUDIO_STREAM',
          action: 'Deepgram Nova-2 WebRTC Ingestion',
          detail: '"Hi, I want to move our table of 6 tonight at 8pm to the private lounge if possible."',
          badge: 'SPEECH-TO-TEXT',
          type: 'info',
        },
        {
          time: '00:00.114',
          stage: 'VECTOR_RAG',
          action: 'Branch Floorplan & Availability Query',
          detail: 'Queried branch table indices. Table L-1 is available; 6 guests allowed.',
          badge: 'EMBEDDINGS',
          type: 'info',
        },
        {
          time: '00:00.210',
          stage: 'TOOL_CALL',
          action: 'POST /api/v1/reservations/update',
          detail: 'Payload: { bookingId: "BK-8841", room: "LOUNGE_01", time: "20:00:00", covers: 6 }',
          badge: 'IDEMPOTENT API',
          type: 'tool',
        },
        {
          time: '00:00.298',
          stage: 'GUARDRAIL',
          action: 'Hallucination & Policy Verification',
          detail: 'Zero deviation. Dietary allergy notice appended from customer profile.',
          badge: 'VERIFIED',
          type: 'guard',
        },
        {
          time: '00:00.342',
          stage: 'AUDIO_SYNTHESIS',
          action: 'Cartesia Sonic Stream Generated',
          detail: '"Certainly! I have upgraded your party of 6 to Private Lounge 1 for 8:00 PM. SMS sent."',
          badge: 'COMPLETE 200 OK',
          type: 'success',
        },
      ],
      jsonOutput: {
        status: 'SUCCESS',
        intent: 'RESERVATION_TRANSFER',
        execution_ms: 342,
        tool_results: {
          booking_ref: 'BK-8841',
          room_assigned: 'LOUNGE_01',
          calendar_synced: true,
          sms_dispatched: true,
        },
      },
    },
    {
      id: 'crm-automation',
      title: 'Inbound Lead Scoring & CRM Agent',
      badge: 'Autonomous Sales Ops',
      description: 'Inbound high-value enterprise inquiry captured, enriched, and routed to executive calendar.',
      metrics: { latency: '410ms', tokens: '185 t/s', confidence: '99.4%' },
      steps: [
        {
          time: '00:00.045',
          stage: 'WEBHOOK_IN',
          action: 'Intake Payload Decrypted & Normalized',
          detail: 'Captured inquiry: Enterprise FinTech looking for custom AI voice agent and CRM sync.',
          badge: 'HMAC VALID',
          type: 'info',
        },
        {
          time: '00:00.142',
          stage: 'ENRICHMENT',
          action: 'Entity Resolution & Tech Stack Analysis',
          detail: 'Company: Series-B Fintech. Budget tier: $25k-$50k. Primary bottleneck: 32hr lead delay.',
          badge: 'VECTOR SIMILARITY',
          type: 'tool',
        },
        {
          time: '00:00.260',
          stage: 'AI_REASONING',
          action: 'Priority Scoring & Solution Mapping',
          detail: 'Calculated urgency score: 9.4/10. Recommended: Voice Agent + Redis WebSockets + RBAC.',
          badge: 'PRIORITY_HIGH',
          type: 'guard',
        },
        {
          time: '00:00.370',
          stage: 'INTEGRATION',
          action: 'HubSpot & Slack Executive Dispatch',
          detail: 'Created Deal record #DL-4921, generated executive summary briefing for leadership.',
          badge: 'SYNCHRONIZED',
          type: 'tool',
        },
        {
          time: '00:00.410',
          stage: 'OUTCOME',
          action: 'Instant Personalized Proposal Scheduled',
          detail: 'Sent verified intake confirmation email with custom architecture preview PDF.',
          badge: 'COMPLETE 200 OK',
          type: 'success',
        },
      ],
      jsonOutput: {
        status: 'ENRICHED_AND_ROUTED',
        priority: 'TIER_1_ENTERPRISE',
        score: 9.4,
        routing: {
          assigned_team: 'ENTERPRISE_SOLUTIONS',
          hubspot_id: 'DEAL-9921',
          instant_briefing_sent: true,
        },
      },
    },
    {
      id: 'kds-dispatch',
      title: 'Realtime KDS & Multi-Branch Order Dispatch',
      badge: 'Mission-Critical Event Stream',
      description: 'Cryptographic QR order verified and routed to specific kitchen stations with live inventory sync.',
      metrics: { latency: '198ms', tokens: '210 t/s', confidence: '100%' },
      steps: [
        {
          time: '00:00.015',
          stage: 'ORDER_PACKET',
          action: 'Encrypted QR Token Verification',
          detail: 'HMAC token verified against Branch #01 secret. Table 14 authenticated.',
          badge: 'HMAC_SHA256',
          type: 'guard',
        },
        {
          time: '00:00.065',
          stage: 'INVENTORY_GATE',
          action: 'Atomic Redis Decrement & Check',
          detail: 'Ingredient stocks verified: Wagyu Cut (42 remaining), Truffle Fries (88 remaining).',
          badge: 'ATOMIC REDIS',
          type: 'tool',
        },
        {
          time: '00:00.120',
          stage: 'PUB_SUB_DISPATCH',
          action: 'Redis Channel: kds_branch_01_grill',
          detail: 'Pushed order item #1 to Grill Station KDS display with priority timer flag.',
          badge: 'WEBSOCKET BROADCAST',
          type: 'tool',
        },
        {
          time: '00:00.198',
          stage: 'STATE_CONFIRMED',
          action: 'PostgreSQL ACID Ledger & Receipt',
          detail: 'Order #ORD-7718 committed. Waiter handheld notified. Customer live tracker updated.',
          badge: 'COMPLETE 200 OK',
          type: 'success',
        },
      ],
      jsonOutput: {
        status: 'CONFIRMED_AND_COOKING',
        order_id: 'ORD-7718',
        branch_id: 'BRANCH_LON_01',
        table: 14,
        kds_stations_notified: ['GRILL_01', 'FRYER_02'],
        latency_ms: 198,
      },
    },
  ];

  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'stream' | 'json'>('stream');
  const [visibleStepCount, setVisibleStepCount] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const activeScenario = scenarios[activeScenarioIdx];

  const triggerRun = () => {
    setVisibleStepCount(1);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;
    if (visibleStepCount < activeScenario.steps.length) {
      const timer = setTimeout(() => {
        setVisibleStepCount((prev) => prev + 1);
      }, 550);
      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [visibleStepCount, isRunning, activeScenario]);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-brand-border relative overflow-hidden">
      {/* Subtle radial glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-brand-accent/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-xs font-bold text-brand-dark uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
              <span>Realtime Engineering Benchmark</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
              LIVING INTELLIGENCE IN ACTION.
            </h2>
            <p className="text-base text-brand-muted mt-2 max-w-2xl">
              Watch IMPACT&apos;s autonomous agents, vector retrieval pipelines, and realtime microservices execute in sub-second cycles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerRun}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>TRIGGER AGENT CYCLE</span>
            </button>
            <Link
              href="/solutions/ai-agents"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-surfaceAlt text-brand-dark text-xs font-semibold transition-all"
            >
              <span>EXPLORE AGENTS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Console Container */}
        <div className="bg-brand-dark rounded-3xl border border-brand-dark/20 shadow-2xl overflow-hidden text-white font-mono text-xs">
          {/* Top Bar / Mac-style Controls & Live Telemetry */}
          <div className="bg-[#141418] px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              </div>
              <div className="h-4 w-px bg-white/15 mx-1 hidden sm:block" />
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Terminal className="w-3.5 h-3.5 text-brand-accent" />
                <span className="text-gray-200 font-bold">impact-engine@v4.2-cluster</span>
                <span className="hidden md:inline text-gray-500">|</span>
                <span className="hidden md:inline text-emerald-400 items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  ONLINE • 99.98% UPTIME
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>LATENCY: <strong className="text-white font-bold">{activeScenario.metrics.latency}</strong></span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-gray-300">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>SPEED: <strong className="text-white font-bold">{activeScenario.metrics.tokens}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ACCURACY: <strong className="text-white font-bold">{activeScenario.metrics.confidence}</strong></span>
              </div>
            </div>
          </div>

          {/* Scenario Selector Tabs */}
          <div className="bg-[#18181F] px-4 pt-3 border-b border-white/10 flex flex-wrap gap-2 overflow-x-auto">
            {scenarios.map((scen, idx) => {
              const isSelected = activeScenarioIdx === idx;
              return (
                <button
                  key={scen.id}
                  onClick={() => {
                    setActiveScenarioIdx(idx);
                    setVisibleStepCount(scen.steps.length);
                  }}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-sans font-bold transition-all flex items-center gap-2.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#0D0D11] text-white border-t-2 border-brand-accent shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <span>{scen.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isSelected ? 'bg-brand-accent/30 text-indigo-300 border border-brand-accent/40' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {scen.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main Execution Viewport */}
          <div className="p-5 sm:p-7 bg-[#0D0D11] min-h-[380px] flex flex-col justify-between">
            {/* View Switcher Tabs (Stream vs JSON Payload) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 text-xs font-sans">
              <div className="text-gray-400 text-xs">
                {activeScenario.description}
              </div>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setActiveTab('stream')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    activeTab === 'stream' ? 'bg-brand-accent text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Live Trace
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    activeTab === 'json' ? 'bg-brand-accent text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Payload JSON
                </button>
              </div>
            </div>

            {/* Stream Content */}
            {activeTab === 'stream' ? (
              <div className="space-y-3 font-mono">
                {activeScenario.steps.slice(0, visibleStepCount).map((step, sIdx) => {
                  return (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl bg-[#14141A] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 animate-fadeIn"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-gray-500 text-[11px]">[{step.time}]</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {step.stage}
                          </span>
                          <span className="font-bold text-gray-200 text-xs">{step.action}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-sans pl-0 sm:pl-16 leading-relaxed">
                          {step.detail}
                        </p>
                      </div>

                      <div className="self-start sm:self-center shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            step.type === 'success'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : step.type === 'guard'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : step.type === 'tool'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-white/10 text-gray-300 border border-white/15'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {step.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isRunning && visibleStepCount < activeScenario.steps.length && (
                  <div className="flex items-center gap-2 text-brand-accent p-2 animate-pulse text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-accent" />
                    <span>Executing step {visibleStepCount + 1} of {activeScenario.steps.length}...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#14141A] border border-white/5 overflow-x-auto text-xs font-mono text-emerald-400">
                <pre>{JSON.stringify(activeScenario.jsonOutput, null, 2)}</pre>
              </div>
            )}

            {/* Bottom Status bar */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-400 font-sans">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deterministic Zero-Hallucination Boundaries Enforced</span>
              </div>
              <div className="text-gray-500">
                Engineered with Next.js 14, FastAPI Async Microservices, Redis Pub/Sub & Pydantic v2
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
