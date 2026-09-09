import React from "react";
import Link from "next/link";
import { Bot, Workflow, Code2, Box, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export const metadata: Metadata = {
  title: "Solutions | IMPACT Technologies",
  description:
    "Explore IMPACT Technologies' core solutions: AI & Intelligent Agents, Business Process Automation, Custom Software, and Digital Products.",
};

export default function SolutionsPage() {
  const solutions = [
    {
      id: "ai-agents",
      title: "AI & Intelligent Agents",
      tagline: "Intelligence That Acts.",
      desc: "Moving beyond passive chat to autonomous systems that understand goals, plan steps, call APIs, and execute complex business actions.",
      icon: Bot,
      href: "/solutions/ai-agents",
      cta: "Explore AI Agents",
      highlights: [
        "Customer-service & support agents",
        "Voice & telephone call agents",
        "Autonomous sales & lead qualification",
        "Deep research & internal document intelligence",
      ],
    },
    {
      id: "automation",
      title: "Business Process Automation",
      tagline: "Automate The Work. Amplify The Business.",
      desc: "Replacing repetitive manual workflows with resilient event-driven automations connecting your leads, CRMs, databases, and teams.",
      icon: Workflow,
      href: "/solutions/automation",
      cta: "Explore Automation",
      highlights: [
        "Lead capture to conversion pipelines",
        "CRM & operational data sync",
        "Automated notifications & follow-ups",
        "AI-powered exception handling & validation",
      ],
    },
    {
      id: "software",
      title: "Software & Applications",
      tagline: "From Concept to Application.",
      desc: "Robust full-stack digital software engineered with modern frameworks, high-throughput APIs, and role-based administrative portals.",
      icon: Code2,
      href: "/solutions/software",
      cta: "Explore Software & Apps",
      highlights: [
        "Next.js & React custom web apps",
        "Cross-platform mobile applications",
        "Multi-role dashboards & administrative portals",
        "FastAPI & PostgreSQL backend architecture",
      ],
    },
    {
      id: "products",
      title: "Proprietary Products & MVPs",
      tagline: "We Don't Just Build For Others. We Build Products Too.",
      desc: "Partnering with ambitious founders and organizations to architect, build, and monetize custom digital platforms and SaaS products.",
      icon: Box,
      href: "/products",
      cta: "Explore Products",
      highlights: [
        "Zero-to-one rapid MVP development",
        "Multi-tenant SaaS architectures",
        "AI-first digital tools",
        "Commercial monetization & scaling roadmaps",
      ],
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Solutions Matrix
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark">
            TECHNOLOGY DESIGNED AROUND YOUR BUSINESS.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            We do not believe in shoehorning off-the-shelf templates into unique business problems. We engineer intelligent systems, automations, and custom software tailored to how your operations actually function.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {solutions.map((sol) => {
            const Icon = sol.icon;
            return (
              <div
                key={sol.id}
                className="bg-white border border-brand-border rounded-3xl p-8 sm:p-10 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border text-brand-accent">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-subtle uppercase">
                      Pillar
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight mb-2">
                    {sol.title}
                  </h2>
                  <div className="text-xs font-bold text-brand-accent uppercase tracking-wider mb-4">
                    {sol.tagline}
                  </div>
                  <p className="text-sm sm:text-base text-brand-muted leading-relaxed mb-6">
                    {sol.desc}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-brand-border mb-8">
                    {sol.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-brand-charcoal">
                        <CheckCircle2 className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                  <Link
                    href={sol.href}
                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-accent hover:text-brand-accentHover uppercase tracking-wider"
                  >
                    <span>{sol.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/start-a-project"
                    className="text-xs font-semibold text-brand-muted hover:text-brand-dark"
                  >
                    Start Project →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Universal Final Conversion CTA */}
        <div className="mt-16">
          <FinalCtaBanner customSubtitle="Let's determine the ideal combination of AI, automation, and software engineering for your business." />
        </div>
      </div>
    </div>
  );
}
