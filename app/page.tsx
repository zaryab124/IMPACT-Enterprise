import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { AgentExecutionConsole } from "@/components/home/AgentExecutionConsole";
import { AiAgentWorkflow } from "@/components/home/AiAgentWorkflow";
import { ClientJourneySelector } from "@/components/home/ClientJourneySelector";
import { IdeaBuilder } from "@/components/conversion/IdeaBuilder";
import { TrustBar } from "@/components/home/TrustBar";
import { ServicesSection } from "@/components/home/ServicesSection";
import { AutomationWorkflow } from "@/components/home/AutomationWorkflow";
import { Applications3DShowcase } from "@/components/home/Applications3DShowcase";
import { ImpactMethodSection } from "@/components/home/ImpactMethodSection";
import { ProjectsPreviewSection } from "@/components/home/ProjectsPreviewSection";
import { CapabilitiesTrustSection } from "@/components/trust/CapabilitiesTrustSection";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section (With 3D Three.js ImpactEngine3D & Neural Canvas) */}
      <HeroSection />

      {/* 2. Realtime Autonomous Agent Execution Stream & AI Workbench */}
      <AgentExecutionConsole />

      {/* 3. AI Agent Workflow Visualization (7-Step USER → AI AGENT → TOOLS → DATA → DECISION → ACTION → RESULT) */}
      <AiAgentWorkflow />

      {/* 4. Client Journey Entry Points (5 Situations) */}
      <ClientJourneySelector />

      {/* 5. Interactive Idea Builder (What are you trying to achieve?) */}
      <IdeaBuilder />

      {/* 6. Trust & Capability Bar */}
      <TrustBar />

      {/* 7. Services Section (What We Build — 6 Interactive Modules) */}
      <ServicesSection />

      {/* 8. Automation Pipeline Visualization (6-Step LEAD → QUALIFICATION → CRM → FOLLOW-UP → SALES → CONVERSION) */}
      <AutomationWorkflow />

      {/* 9. Applications 3D Showcase (Floating Realistic App Windows) */}
      <Applications3DShowcase />

      {/* 10. The IMPACT Method (I-M-P-A-C-T) */}
      <ImpactMethodSection />

      {/* 11. Projects & Featured Case Study (Restaurant Technology Platform) */}
      <ProjectsPreviewSection />

      {/* 12. Capabilities & Technical Assurance (Problem-First, Security, RBAC) */}
      <CapabilitiesTrustSection />

      {/* 13. Universal Final Conversion CTA Banner */}
      <FinalCtaBanner />
    </div>
  );
}
