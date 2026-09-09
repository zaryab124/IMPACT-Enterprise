import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { ClientJourneySelector } from "@/components/home/ClientJourneySelector";
import { IdeaBuilder } from "@/components/conversion/IdeaBuilder";
import { TrustBar } from "@/components/home/TrustBar";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ImpactMethodSection } from "@/components/home/ImpactMethodSection";
import { ProjectsPreviewSection } from "@/components/home/ProjectsPreviewSection";
import { CapabilitiesTrustSection } from "@/components/trust/CapabilitiesTrustSection";
import { FinalCtaBanner } from "@/components/conversion/FinalCtaBanner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Client Journey Entry Points (5 Situations) */}
      <ClientJourneySelector />

      {/* 3. Interactive Idea Builder (What are you trying to achieve?) */}
      <IdeaBuilder />

      {/* 4. Trust & Capability Bar */}
      <TrustBar />

      {/* 5. Services Section (What We Build) */}
      <ServicesSection />

      {/* 6. The IMPACT Method (I-M-P-A-C-T) */}
      <ImpactMethodSection />

      {/* 7. Projects & Featured Case Study Preview */}
      <ProjectsPreviewSection />

      {/* 8. Capabilities & Technical Assurance (Evidence-based trust without fake proof) */}
      <CapabilitiesTrustSection />

      {/* 9. Universal Final Conversion CTA */}
      <FinalCtaBanner />
    </div>
  );
}
