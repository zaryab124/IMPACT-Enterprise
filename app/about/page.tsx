import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Users, Target, Rocket, Lightbulb, Compass, Award, Phone, MessageCircle } from "lucide-react";
import { Metadata } from "next";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export const metadata: Metadata = {
  title: "About Us & Leadership | IMPACT Technologies",
  description:
    "Why IMPACT exists. Turning Ideas Into Impact. Combining intelligence, automation, and software engineering to bridge the gap between concepts and real-world technology.",
};

export default function AboutPage() {
  const leadership = [
    {
      name: "MUHAMMAD ZARYAB HASSAN",
      role: "CEO",
      initials: "ZH",
      focusAreas: ["Vision", "Strategy", "AI Systems", "Client Partnerships"],
      desc: "Directs company vision, strategic technology positioning, client partnerships, and intelligent system innovation.",
    },
    {
      name: "MAHAD AZIZ",
      role: "CGO",
      initials: "MA",
      focusAreas: ["Growth Strategy", "Market Expansion", "Solutions", "Operations"],
      desc: "Leads commercial growth, enterprise partnerships, strategic distribution, and market expansion.",
    },
    {
      name: "MUHAMMAD ISMAIL",
      role: "CFO",
      initials: "MI",
      focusAreas: ["Finance", "Commercial Strategy", "Capital Allocation", "Operations"],
      desc: "Oversees financial strategy, capital efficiency, operational governance, and commercial planning.",
    },
    {
      name: "M. ANSAR ABBAS JAFRI",
      role: "BRANCH MANAGER",
      initials: "AJ",
      phone: "+92 333 6457747",
      focusAreas: ["Branch Operations", "Client Relations", "Project Delivery", "Regional Support"],
      desc: "Manages regional branch operations, on-ground client relationships, deployment coordination, and local project execution.",
    },
  ];

  const pillars = [
    {
      num: "01",
      title: "PROBLEM-FIRST",
      desc: "We start with the business problem — not the technology.",
    },
    {
      num: "02",
      title: "INTELLIGENCE-FIRST",
      desc: "We identify where AI can create meaningful value.",
    },
    {
      num: "03",
      title: "AUTOMATION-FIRST",
      desc: "We remove unnecessary manual processes.",
    },
    {
      num: "04",
      title: "PRODUCT-MINDED",
      desc: "We build usable products, not isolated prototypes.",
    },
    {
      num: "05",
      title: "SCALABLE ENGINEERING",
      desc: "We design systems that can evolve with the business.",
    },
    {
      num: "06",
      title: "REAL-WORLD IMPACT",
      desc: "Success means measurable improvement — not simply a successful demo.",
    },
  ];

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header: Why IMPACT Exists */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            Company Purpose
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark">
            WHY IMPACT EXISTS.
          </h1>
          <div className="mt-6 space-y-4 text-lg sm:text-xl font-medium text-brand-charcoal leading-relaxed">
            <p className="text-2xl font-bold text-brand-dark">
              The world has no shortage of ideas.
            </p>
            <p>
              The challenge is turning those ideas into systems that actually work.
            </p>
            <p className="text-brand-accent font-bold">
              IMPACT exists to bridge that gap.
            </p>
            <p className="text-base sm:text-lg text-brand-muted font-normal">
              We combine intelligence, automation and software engineering to transform ideas and business problems into real-world technology.
            </p>
          </div>
        </div>

        {/* The Philosophy Transformation Flow */}
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-card mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">
            The Core Philosophy
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-6">
            From Concept to Measurable Outcome
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { step: "1", name: "IDEA", desc: "Raw concept & commercial objective" },
              { step: "2", name: "INTELLIGENCE", desc: "AI models, LLMs, and reasoning" },
              { step: "3", name: "AUTOMATION", desc: "Removing human friction points" },
              { step: "4", name: "PRODUCT", desc: "Production-grade, scalable software" },
              { step: "5", name: "IMPACT", desc: "Measurable commercial transformation" },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-brand-accent">
                    0{item.step}
                  </span>
                  <div className="text-base font-black text-brand-dark uppercase mt-1">
                    {item.name}
                  </div>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center text-xs font-mono text-brand-muted">
            IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT
          </div>
        </div>

        {/* 6 Guiding Pillars */}
        <div className="mb-16">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-1">
              Guiding Principles
            </div>
            <h2 className="text-3xl font-bold text-brand-dark">
              How We Think & Operate
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pil) => (
              <div
                key={pil.num}
                className="bg-white border border-brand-border rounded-2xl p-7 shadow-card hover:shadow-cardHover transition-all"
              >
                <span className="text-xs font-mono font-black text-brand-accent">
                  {pil.num}
                </span>
                <h3 className="text-lg font-bold text-brand-dark uppercase tracking-tight mt-2 mb-2">
                  {pil.title}
                </h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  {pil.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Section */}
        <div id="leadership" className="mb-16">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-1">
              Executive Leadership
            </div>
            <h2 className="text-3xl font-bold text-brand-dark">
              The Team Behind IMPACT
            </h2>
            <p className="text-base text-brand-muted mt-2">
              Technology, commercial strategy, and engineering leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((member) => (
              <div
                key={member.name}
                className="bg-white border border-brand-border rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border text-brand-dark flex items-center justify-center font-black text-xl mb-5 shadow-xs">
                    {member.initials}
                  </div>

                  <h3 className="text-xl font-black text-brand-dark tracking-tight">
                    {member.name}
                  </h3>
                  <div className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-3">
                    {member.role}
                  </div>

                  {member.phone && (
                    <div className="mb-4 flex flex-wrap items-center gap-1.5">
                      <a
                        href={`tel:${member.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold transition-colors"
                        title="Call Branch Manager"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{member.phone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=Hello%20M.%20Ansar%20Abbas%20Jafri,%20I%20would%20like%20to%20connect%20regarding%20IMPACT%20Enterprise.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#128C7E] transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      </a>
                    </div>
                  )}

                  <p className="text-xs text-brand-muted leading-relaxed mb-6">
                    {member.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-subtle mb-2">
                    Areas of Responsibility
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs font-medium text-brand-charcoal">
                    {member.focusAreas.map((area, aIdx) => (
                      <span
                        key={aIdx}
                        className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-[11px]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Universal Final Conversion CTA */}
        <div className="mt-16">
          <FinalCtaBanner customSubtitle="Bring your ideas to IMPACT. We will engineer the intelligence, automation, and software to make them real." />
        </div>
      </div>
    </div>
  );
}
