import { BantBreakdown, ProposalScope } from "./types";
import { LeadRecord } from "../database/repositories/leadRepository";
import { CustomerRecord } from "../database/repositories/customerRepository";

export class ProposalEngine {
  /**
   * Determine whether a lead satisfies all criteria for engineering proposal generation
   */
  public isProposalReady(lead: LeadRecord, bant: BantBreakdown, customer?: CustomerRecord | null): {
    ready: boolean;
    missingCriteria: string[];
  } {
    const missing: string[] = [];

    if (bant.compositeScore < 70) {
      missing.push(`BANT composite score (${bant.compositeScore}/100) is below the minimum proposal threshold of 70.`);
    }

    if (!customer?.email || customer.email.includes("@impact-visitor.internal")) {
      missing.push("Verified business email address is required.");
    }

    if (!lead.problem_statement && !lead.proposed_solution && bant.needScore < 40) {
      missing.push("Defined problem statement or clear capability alignment is required.");
    }

    if (bant.authorityScore < 50) {
      missing.push("Verified executive authority or technical evaluator involvement required.");
    }

    return {
      ready: missing.length === 0,
      missingCriteria: missing,
    };
  }

  /**
   * Generate preliminary engineering scope specification
   */
  public generateScope(
    lead: LeadRecord,
    bant: BantBreakdown,
    customer?: CustomerRecord | null
  ): ProposalScope {
    const clientName = customer?.name || "Enterprise Partner";
    const clientCompany = customer?.country ? `${clientName} (${customer.country})` : clientName;

    // Detect technical focus based on need alignments
    const isVoice = bant.needAlignment.some((a) => a.toLowerCase().includes("voice"));
    const isAgent = bant.needAlignment.some((a) => a.toLowerCase().includes("agent"));
    const isAutomation = bant.needAlignment.some((a) => a.toLowerCase().includes("automation"));
    const isPlatform = bant.needAlignment.some((a) => a.toLowerCase().includes("cloud") || a.toLowerCase().includes("platform"));

    let architecture = "Modular Full-Stack AI & Cloud Solution";
    const deliverables: string[] = [];
    const techStack: string[] = ["TypeScript", "PostgreSQL", "Node.js"];

    if (isVoice) {
      architecture = "Real-Time Bidirectional Voice AI Agent Architecture (Gemini Live API & WebSockets)";
      deliverables.push("Sub-400ms low-latency bidirectional voice pipeline with interruption handling");
      deliverables.push("Natural voice activity detection (VAD) and conversational state machine");
      deliverables.push("Automated call transcript persistence and lead CRM synchronization");
      techStack.push("Gemini Live API", "@google/genai", "WebSockets / WebRTC");
    } else if (isAgent || (!isAutomation && !isPlatform)) {
      architecture = "Autonomous Conversational Sales & Knowledge Grounded Agent System";
      deliverables.push("Multi-turn conversational engine with dynamic knowledge base retrieval");
      deliverables.push("Algorithmic BANT lead scoring and automated sales qualification reasoning");
      deliverables.push("Seamless human-in-the-loop escalation via WhatsApp and telephone");
      techStack.push("Gemini 2.5 Flash", "Vector & BM25 Knowledge Engine", "Next.js 14");
    }

    if (isAutomation) {
      deliverables.push("Enterprise workflow automation engine with bidirectional CRM integration");
      deliverables.push("Transactional audit logging and HMAC secure webhook processing");
      techStack.push("FastAPI / Node.js Engine", "Redis Event Queues");
    }

    if (isPlatform) {
      deliverables.push("Custom high-performance cloud application and administrative telemetry dashboard");
      deliverables.push("Enterprise Role-Based Access Control (RBAC) and data isolation");
      techStack.push("Next.js 14 App Router", "Tailwind CSS");
    }

    // Default deliverables if none added
    if (deliverables.length === 0) {
      deliverables.push("Core enterprise AI architecture and automated sales workflow");
      deliverables.push("PostgreSQL relational CRM schema and secure API integration");
    }

    return {
      leadId: lead.id,
      title: `IMPACT Enterprise Scope: ${clientCompany}`,
      clientName,
      clientCompany,
      problemSummary: lead.problem_statement || bant.needSummary || "Automated customer acquisition and AI engineering requirements.",
      proposedArchitecture: architecture,
      coreDeliverables: deliverables,
      recommendedTechStack: techStack,
      estimatedTimelineWeeks: bant.timelineUrgency === "IMMEDIATE" ? "2 to 4 weeks" : "4 to 6 weeks",
      investmentTier: bant.budgetFormatted,
      nextSteps: [
        "Architecture & Specification Alignment Call with Engineering Directors",
        "Milestone Delivery Roadmap & Fixed-Scope Proposal Finalization",
        "Master Services Agreement (MSA) & Sprint 1 Kickoff",
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

export const proposalEngine = new ProposalEngine();
