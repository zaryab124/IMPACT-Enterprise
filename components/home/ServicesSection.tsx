import React from "react";
import Link from "next/link";
import { Cpu, Bot, Workflow, Code2, Box, Network, ArrowRight, Check } from "lucide-react";

export const ServicesSection: React.FC = () => {
  const services = [
    {
      id: "ai-engineering",
      title: "AI ENGINEERING",
      icon: Cpu,
      desc: "Custom intelligent systems engineered to ingest data, reason over complex context, and generate structured outcomes.",
      features: [
        "AI models & fine-tuning",
        "LLM applications & prompt architecture",
        "RAG systems (Retrieval-Augmented Generation)",
        "Computer vision & visual inspection",
        "Predictive AI & classification",
        "Secure enterprise AI integrations",
      ],
      href: "/solutions/ai-agents",
      cta: "Learn More About AI Systems",
    },
    {
      id: "ai-agents",
      title: "AI AGENTS",
      icon: Bot,
      desc: "Autonomous agents that do not just chat—they understand objectives, formulate plans, execute multi-step tool calls, and complete work.",
      features: [
        "Chat & voice conversational agents",
        "Outbound & inbound call agents",
        "Lead qualification & sales agents",
        "24/7 customer-service intelligence",
        "Autonomous market & data research agents",
        "Internal operational task agents",
      ],
      href: "/solutions/ai-agents",
      cta: "Build an AI Agent",
    },
    {
      id: "business-automation",
      title: "BUSINESS AUTOMATION",
      icon: Workflow,
      desc: "Redesigning workflows around intelligence so your team focuses on high-leverage growth while systems handle repetitive logic.",
      features: [
        "End-to-end lead conversion automation",
        "Real-time CRM & pipeline synchronization",
        "Intelligent email & WhatsApp follow-ups",
        "Automated operational data pipelines",
        "Event-driven customer notifications",
        "AI-powered exception handling",
      ],
      href: "/solutions/automation",
      cta: "Automate My Workflow",
    },
    {
      id: "application-development",
      title: "APPLICATION DEVELOPMENT",
      icon: Code2,
      desc: "Production-grade digital software built with modern frontends, high-performance backends, and multi-role administrative portals.",
      features: [
        "Custom web applications (Next.js / React)",
        "Cross-platform mobile applications",
        "Multi-tenant SaaS architectures",
        "Executive & branch admin portals",
        "Self-service customer portals",
        "Mission-critical enterprise software",
      ],
      href: "/solutions/software",
      cta: "Build My Application",
    },
    {
      id: "product-development",
      title: "PRODUCT DEVELOPMENT",
      icon: Box,
      desc: "From zero to production launch. We build scalable proprietary digital products for founders and collaborate as engineering partners.",
      features: [
        "Rapid high-fidelity MVPs",
        "Scalable SaaS product architecture",
        "AI-first digital tools & utilities",
        "Commercial monetization setups",
        "User role & access hierarchy",
        "Long-term product evolution",
      ],
      href: "/products",
      cta: "Explore Products",
    },
    {
      id: "integrations",
      title: "INTEGRATIONS",
      icon: Network,
      desc: "Connecting disjointed systems into a unified, secure real-time ecosystem across cloud providers, APIs, and commercial tools.",
      features: [
        "Custom REST & WebSocket APIs",
        "Relational & vector database schemas",
        "Cloud deployments (AWS, GCP, Render)",
        "Stripe & payment gateway automation",
        "HubSpot, Salesforce & custom CRMs",
        "Third-party communication hooks",
      ],
      href: "/solutions/software",
      cta: "Explore Integrations",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#FAF9F6] border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            Capabilities & Solutions
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-dark">
            WHAT WE BUILD
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            Technology designed around your business—not the other way around.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="flex flex-col justify-between p-7 sm:p-8 rounded-2xl bg-white border border-brand-border hover:border-brand-accent/40 shadow-card hover:shadow-cardHover transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-brand-surface border border-brand-border text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-brand-subtle uppercase tracking-wider">
                      Module
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-dark tracking-tight mb-2.5">
                    {service.title}
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed mb-6">
                    {service.desc}
                  </p>

                  <div className="space-y-2 border-t border-brand-border pt-4 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-brand-charcoal">
                        <Check className="w-3.5 h-3.5 text-brand-teal mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border">
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-brand-accent group-hover:text-brand-accentHover tracking-wide uppercase"
                  >
                    <span>{service.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
