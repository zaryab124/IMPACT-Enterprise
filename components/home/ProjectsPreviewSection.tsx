import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, UtensilsCrossed, Workflow, Bot, ShieldCheck, CheckCircle2 } from "lucide-react";

export const ProjectsPreviewSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#FAF9F6] border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
              Real-World Deployments
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-dark">
              BUILT FOR THE REAL WORLD.
            </h2>
            <p className="mt-4 text-lg text-brand-muted max-w-2xl">
              A selection of systems, applications and intelligent products built by IMPACT. Designed around complex operational environments and commercial viability.
            </p>
          </div>
          <div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent hover:text-brand-accentHover"
            >
              <span>View All Systems & Case Studies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Featured Project: Restaurant Technology Platform */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-cardHover mb-10 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-accent text-white text-[11px] font-black uppercase tracking-wider">
                  Featured Case Study
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-charcoal text-[11px] font-bold uppercase tracking-wider">
                  Custom Applications • Automation • Order Management
                </span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-brand-dark">
                RESTAURANT TECHNOLOGY PLATFORM
              </h3>

              <p className="text-base text-brand-muted leading-relaxed">
                A complete commercial multi-branch restaurant ecosystem covering digital menus, cryptographic QR-code table ordering, real-time Kitchen Display Systems (KDS), delivery dispatch, and executive financial governance.
              </p>

              {/* Verified Capabilities */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-1">
                  Confirmed System Capabilities:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-brand-charcoal">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    <span>6 Isolated Branches (BR-MAIN, BR-CITY, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    <span>8 RBAC Roles (Owner, Admin, Chef, Rider)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    <span>Cryptographic HMAC QR Table Ordering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    <span>Real-Time WebSockets Kitchen Display</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    <span>Deal Engine with 25% Discount Validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                    <span>Executive P&L & Sentiment Feedback Engine</span>
                  </div>
                </div>
              </div>

              {/* Tech stack badges */}
              <div className="pt-2">
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-brand-dark font-medium">FastAPI</span>
                  <span className="px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-brand-dark font-medium">Next.js 14</span>
                  <span className="px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-brand-dark font-medium">TypeScript</span>
                  <span className="px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-brand-dark font-medium">SQLAlchemy 2</span>
                  <span className="px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-brand-dark font-medium">Redis Pub/Sub</span>
                  <span className="px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-brand-dark font-medium">WebSockets</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/projects/restaurant-technology-platform"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-brand-dark hover:bg-brand-accent text-white font-bold text-sm shadow-sm transition-all"
                >
                  <span>VIEW FULL CASE STUDY & ARCHITECTURE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Flow Visualization */}
            <div className="lg:col-span-6">
              <div className="bg-[#FAF9F6] border border-brand-border rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border text-xs font-bold text-brand-subtle uppercase tracking-wider">
                  <span>Platform Ecosystem Flow</span>
                  <span className="text-brand-accent font-mono">Live Real-Time Cycle</span>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    { step: "01", node: "CUSTOMER", detail: "Scans encrypted QR at dine-in table or opens delivery web portal" },
                    { step: "02", node: "QR MENU", detail: "Selects dishes, builds custom deals with 25% cap validation" },
                    { step: "03", node: "ORDER", detail: "Branch-isolated order created with cryptographic HMAC integrity" },
                    { step: "04", node: "ADMIN", detail: "Store manager real-time order review, branch routing & approvals" },
                    { step: "05", node: "KITCHEN (KDS)", detail: "Real-time Redis WebSocket alert with station timer board" },
                    { step: "06", node: "RIDER", detail: "Automated delivery dispatch with live GPS route status updates" },
                    { step: "07", node: "CUSTOMER", detail: "Final meal delivery with automated receipt and feedback rating" },
                  ].map((flow, idx) => (
                    <div
                      key={flow.step}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-brand-border text-xs"
                    >
                      <span className="w-7 h-7 rounded-md bg-brand-surface text-brand-accent flex items-center justify-center font-mono font-bold flex-shrink-0">
                        {flow.step}
                      </span>
                      <div className="flex-1">
                        <div className="font-bold text-brand-dark tracking-wide uppercase">
                          {flow.node}
                        </div>
                        <div className="text-[11px] text-brand-muted">
                          {flow.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center text-[11px] font-mono text-brand-subtle">
                  ↻ Continuous real-time synchronization between 8 roles & 6 branches
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Real-World Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 2 */}
          <div className="bg-white border border-brand-border rounded-2xl p-7 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-brand-surface border border-brand-border text-[11px] font-bold uppercase text-brand-muted">
                  Automation • CRM
                </span>
                <Workflow className="w-5 h-5 text-brand-accent" />
              </div>
              <h4 className="text-xl font-bold text-brand-dark tracking-tight mb-2">
                Automated Lead Capture & Conversion Engine
              </h4>
              <p className="text-sm text-brand-muted leading-relaxed mb-4">
                Multi-channel inbound lead ingestion with automated enrichment, CRM synchronization, and instant WhatsApp/Email follow-up sequences.
              </p>
              <div className="space-y-1.5 text-xs text-brand-charcoal mb-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Instant multi-channel webhook capture</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>CRM contact creation & pipeline movement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Automated personalized response triggers</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs font-mono text-brand-subtle">Project capabilities demonstrated</span>
              <Link
                href="/solutions/automation"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline uppercase"
              >
                <span>Explore Workflow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-brand-border rounded-2xl p-7 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md bg-brand-surface border border-brand-border text-[11px] font-bold uppercase text-brand-muted">
                  AI Systems • RAG
                </span>
                <Bot className="w-5 h-5 text-brand-accent" />
              </div>
              <h4 className="text-xl font-bold text-brand-dark tracking-tight mb-2">
                Enterprise Knowledge & Autonomous Research Agent
              </h4>
              <p className="text-sm text-brand-muted leading-relaxed mb-4">
                High-precision domain RAG architecture combining semantic vector search, strict citation grounding, and autonomous internal data query tools.
              </p>
              <div className="space-y-1.5 text-xs text-brand-charcoal mb-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Vector embeddings with hybrid re-ranking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Deterministic tool calling with role permissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Grounded source citation with zero hallucination safeguards</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-brand-border flex items-center justify-between">
              <span className="text-xs font-mono text-brand-subtle">Project capabilities demonstrated</span>
              <Link
                href="/solutions/ai-agents"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline uppercase"
              >
                <span>Explore AI Architecture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
