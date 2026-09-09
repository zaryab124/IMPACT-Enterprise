"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Mail, Sparkles } from "lucide-react";
import { NeuralCanvas } from "@/components/visuals/NeuralCanvas";
import { ImpactEngine3D } from "@/components/visuals/ImpactEngine3D";

export const HeroSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-brand-border bg-[#FAF9F6]">
      {/* 3D Interactive Neural Particle Mesh */}
      <NeuralCanvas />

      {/* Subtle tech grid background with depth */}
      <div className="absolute inset-0 bg-tech-grid opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Positioning Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-border shadow-xs text-xs font-bold text-brand-dark uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span>AI • Agents • Automation • Software • Products</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight text-brand-dark leading-[1.06]">
              TURNING IDEAS INTO <span className="text-brand-accent underline decoration-brand-accent/20 decoration-wavy decoration-2">IMPACT.</span>
            </h1>

            {/* Supporting Headline */}
            <p className="text-xl sm:text-2xl font-semibold text-brand-charcoal leading-snug">
              AI, automation and software engineered to turn ambitious ideas into working products.
            </p>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-brand-muted leading-relaxed max-w-2xl">
              From intelligent agents and automated workflows to complete digital platforms, IMPACT builds technology around real business problems. We design and ship production systems for businesses, startups, and enterprise teams.
            </p>

            {/* Primary CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="/start-a-project"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-base shadow-sm hover:shadow-cardHover transition-all text-center"
              >
                <span>START A PROJECT</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-brand-dark font-semibold text-base shadow-card transition-all text-center"
              >
                EXPLORE OUR WORK
              </Link>
            </div>

            {/* Direct Quick Contact Buttons (WhatsApp & Gmail) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://wa.me/923147893907?text=Hi%20IMPACT%20Enterprise,%20I'd%20like%20to%20discuss%20a%20project"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-xs font-bold text-[#128C7E] transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp: +92 314 7893907</span>
              </a>
              <a
                href="mailto:impactenterprise527@gmail.com?subject=Project%20Inquiry%20-%20IMPACT%20Enterprise"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>impactenterprise527@gmail.com</span>
              </a>
            </div>

            {/* Quick Assurance */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-brand-muted font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Problem-First Engineering</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Enterprise Security & RBAC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                <span>Production Turnkey Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: WebGL 3D IMPACT Engine Sculpture */}
          <div className="lg:col-span-6 w-full mt-4 lg:mt-0">
            <ImpactEngine3D
              currentStage={activeStep}
              onStageChange={(idx) => setActiveStep(idx)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
