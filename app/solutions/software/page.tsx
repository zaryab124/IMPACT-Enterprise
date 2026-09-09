import React from "react";
import Link from "next/link";
import { Code2, ArrowRight, CheckCircle2, Layout, Smartphone, Cloud, ShieldCheck, Database, Key, Server, Laptop } from "lucide-react";
import { Metadata } from "next";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export const metadata: Metadata = {
  title: "Custom Software & Applications | IMPACT Technologies",
  description:
    "From concept to application. Custom web applications, mobile platforms, multi-tenant SaaS, administrative portals, and enterprise systems.",
};

export default function SoftwarePage() {
  const applicationCategories = [
    {
      title: "Custom Web Applications",
      desc: "High-performance responsive web applications built with Next.js 14, React, and TypeScript. Optimized for speed, accessibility, and Core Web Vitals.",
      icon: Laptop,
      features: ["Next.js App Router", "Server-Side Rendering (SSR)", "Fluid Responsive UI"],
    },
    {
      title: "Cross-Platform Mobile Apps",
      desc: "Native-quality iOS and Android applications developed for high user engagement, offline data persistence, and seamless push notifications.",
      icon: Smartphone,
      features: ["iOS & Android Support", "Real-Time Push Alerts", "Secure Biometric Auth"],
    },
    {
      title: "Multi-Tenant SaaS Platforms",
      desc: "Complete software-as-a-service architectures with tenant isolation, automated billing, seat management, and subscription tier enforcement.",
      icon: Cloud,
      features: ["Tenant Isolation", "Stripe Subscription Billing", "Usage Metering"],
    },
    {
      title: "Executive & Admin Portals",
      desc: "Granular command centers giving business owners, operational managers, and staff role-based dashboards, audit logs, and actionable metrics.",
      icon: Layout,
      features: ["Role-Based Access Control (RBAC)", "Live Activity Streams", "Exportable Financial Reports"],
    },
    {
      title: "Self-Service Customer Portals",
      desc: "Secure client-facing interfaces where users manage orders, view account histories, submit tickets, and access digital products autonomously.",
      icon: Key,
      features: ["Secure JWT / OAuth Authentication", "Self-Service Workflows", "Instant Order Tracking"],
    },
    {
      title: "High-Throughput APIs & Microservices",
      desc: "Asynchronous backend architectures built with FastAPI and Node.js. Designed for high concurrency, low latency, and rock-solid uptime.",
      icon: Server,
      features: ["FastAPI / Python 3", "WebSocket Real-Time Channels", "OpenAPI Automated Documentation"],
    },
    {
      title: "Database Systems & Schemas",
      desc: "PostgreSQL, SQLAlchemy, Redis caching, and vector databases architected for zero-data-loss ACID transactions and complex relational queries.",
      icon: Database,
      features: ["PostgreSQL & Redis Pub/Sub", "Relational Integrity", "Automated Backups & Migration"],
    },
    {
      title: "Mission-Critical Enterprise Systems",
      desc: "Tailored enterprise solutions that comply with corporate governance, strict security audits, and multi-department approval chains.",
      icon: ShieldCheck,
      features: ["End-to-End Encryption", "Strict Audit Logging", "Enterprise SLA Standards"],
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Code2 className="w-4 h-4" />
            Software & Systems Engineering
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark">
            FROM CONCEPT TO <br />
            <span className="text-brand-accent">APPLICATION.</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            Whether it is a focused internal business tool or a complete multi-role commercial platform, IMPACT engineers the technology behind the product. Clean code, type-safe architecture, and zero bloat.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all"
            >
              <span>BUILD MY APPLICATION</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/projects/restaurant-technology-platform"
              className="inline-flex items-center px-6 py-3.5 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-brand-dark font-semibold text-sm transition-all shadow-xs"
            >
              SEE RESTAURANT PLATFORM CASE STUDY
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {applicationCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-brand-border rounded-2xl p-6 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 rounded-xl bg-brand-surface border border-brand-border text-brand-accent w-fit mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-brand-muted leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-brand-border">
                  {cat.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-[11px] font-medium text-brand-charcoal">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Universal Final Conversion CTA */}
        <div className="mt-16">
          <FinalCtaBanner customSubtitle="From clean responsive frontends to high-concurrency FastAPI backends, IMPACT engineers the technology behind your product." />
        </div>
      </div>
    </div>
  );
}
