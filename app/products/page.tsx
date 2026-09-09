import React from "react";
import Link from "next/link";
import { Box, ArrowRight, Sparkles, Layers, ShieldCheck, CheckCircle2, Rocket, Code2, Users } from "lucide-react";
import { Metadata } from "next";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export const metadata: Metadata = {
  title: "Products & Product Studio | IMPACT Technologies",
  description:
    "We don't just build for others. We build products too. Proprietary digital products, multi-tenant SaaS, and founder co-development.",
};

export default function ProductsPage() {
  const productCategories = [
    {
      category: "AI PRODUCTS",
      title: "Intelligent Reasoning & Agent Systems",
      desc: "Domain-specific AI products engineered to execute specialized analysis, multi-modal processing, and autonomous workflows in high-value industries.",
      status: "Studio Incubation & Client Co-Builds",
      icon: Sparkles,
      capabilities: ["Autonomous research suites", "Voice dispatch bots", "Document intelligence tools"],
    },
    {
      category: "BUSINESS PLATFORMS",
      title: "Commercial Restaurant Technology Platform",
      desc: "Our flagship restaurant management ecosystem featuring cryptographic HMAC QR table ordering, real-time Kitchen Display Systems (KDS), and 6 isolated branches.",
      status: "Production Ready Architecture",
      icon: Layers,
      capabilities: ["Dine-in QR ordering", "Multi-branch admin", "Real-time kitchen board"],
      link: "/projects/restaurant-technology-platform",
      linkText: "View Featured Case Study",
    },
    {
      category: "SAAS PRODUCTS",
      title: "Multi-Tenant Cloud Platforms",
      desc: "Software-as-a-service engines built with tenant data isolation, automated billing, role hierarchies, and modular API integrations.",
      status: "Architecture & Co-Founding",
      icon: Rocket,
      capabilities: ["Tenant-scoped databases", "Usage metering & billing", "Modular plug-and-play APIs"],
    },
    {
      category: "AUTOMATION PRODUCTS",
      title: "Inbound Pipeline & CRM Converters",
      desc: "Plug-and-play lead acceleration utilities that hook directly into marketing forms, qualify leads in sub-second intervals, and trigger multi-channel follow-ups.",
      status: "Production Ready Engine",
      icon: Code2,
      capabilities: ["Webhook capture engines", "Dynamic lead scoring", "Automated WhatsApp sync"],
    },
    {
      category: "DIGITAL TOOLS",
      title: "Operational Dashboards & Portals",
      desc: "Lightweight, purpose-built business utilities designed to solve acute operational frictions like inventory tracking, staff dispatch, and financial reporting.",
      status: "Turnkey Implementation",
      icon: Box,
      capabilities: ["Role-based access", "Instant CSV/PDF exports", "Live WebSocket status boards"],
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Box className="w-4 h-4" />
            Product Studio & Ventures
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark">
            WE DON&apos;T JUST BUILD FOR OTHERS. <br />
            <span className="text-brand-accent">WE BUILD PRODUCTS TOO.</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            IMPACT operates at the intersection of an engineering company and a product studio. We create our own proprietary digital platforms, and we partner with ambitious founders to architect and ship theirs from scratch.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>DISCUSS A PRODUCT IDEA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/projects/restaurant-technology-platform"
              className="inline-flex items-center px-6 py-3.5 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-brand-dark font-semibold text-sm transition-all shadow-xs"
            >
              SEE RESTAURANT PLATFORM
            </Link>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {productCategories.map((prod, idx) => {
            const Icon = prod.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-brand-border rounded-3xl p-8 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-wider">
                      {prod.category}
                    </span>
                    <div className="p-2.5 rounded-xl bg-brand-surface text-brand-dark border border-brand-border">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-brand-dark tracking-tight mb-3">
                    {prod.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed mb-6">
                    {prod.desc}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-brand-border mb-6">
                    {prod.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-xs font-medium text-brand-charcoal">
                        <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border">
                  {prod.link ? (
                    <Link
                      href={prod.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline uppercase tracking-wide"
                    >
                      <span>{prod.linkText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-semibold text-brand-subtle">
                        {prod.status}
                      </span>
                      <Link
                        href="/start-a-project"
                        className="text-xs font-bold text-brand-accent hover:underline"
                      >
                        Co-Build →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* How We Partner with Founders */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-card">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-1">
              Founder Co-Development Model
            </div>
            <h2 className="text-3xl font-black text-brand-dark mb-4">
              Building for Founders with Non-Technical Backgrounds
            </h2>
            <p className="text-base text-brand-muted leading-relaxed mb-6">
              You do not need to know how to write code or configure Kubernetes clusters. If you understand a market opportunity, an industry workflow, or an acute customer pain point, IMPACT acts as your full-stack CTO and engineering squad to turn it into an enterprise-grade digital product.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-brand-dark">
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <span className="block font-black text-brand-accent text-base mb-1">01</span>
                Clear architectural scoping without technical jargon.
              </div>
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <span className="block font-black text-brand-accent text-base mb-1">02</span>
                Production-ready code and IP owned 100% by you.
              </div>
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border">
                <span className="block font-black text-brand-accent text-base mb-1">03</span>
                Rapid path from validated wireframe to paying users.
              </div>
            </div>
          </div>
        </div>

        {/* Universal Final Conversion CTA */}
        <div className="mt-16">
          <FinalCtaBanner customSubtitle="Have a proprietary software product or SaaS vision? Let's co-build and engineer it for commercial scale." />
        </div>
      </div>
    </div>
  );
}
