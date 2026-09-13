import { DealStage, BantBreakdown } from "./types";
import { leadRepository, LeadRecord } from "../database/repositories/leadRepository";
import { logger } from "../logging/logger";

export class DealStageEngine {
  // Allowed transitions state machine map
  private readonly ALLOWED_TRANSITIONS: Record<DealStage, DealStage[]> = {
    NEW: ["CONTACTED", "QUALIFIED", "NURTURE", "LOST"],
    CONTACTED: ["QUALIFIED", "PROPOSAL", "NURTURE", "LOST"],
    QUALIFIED: ["PROPOSAL", "NEGOTIATION", "NURTURE", "LOST"],
    PROPOSAL: ["NEGOTIATION", "WON", "LOST", "NURTURE"],
    NEGOTIATION: ["WON", "LOST", "PROPOSAL"],
    WON: ["NURTURE"], // Post-sale expansion or nurture
    LOST: ["NEW", "CONTACTED", "NURTURE"], // Re-engagement
    NURTURE: ["NEW", "CONTACTED", "QUALIFIED"], // Revived deal
  };

  /**
   * Validate whether a requested stage transition is structurally permitted
   */
  public canTransition(currentStage: DealStage, targetStage: DealStage, isSuperAdmin = false): boolean {
    if (currentStage === targetStage) return true;
    if (isSuperAdmin) return true; // Super admins can override stage transitions
    const allowed = this.ALLOWED_TRANSITIONS[currentStage] || [];
    return allowed.includes(targetStage);
  }

  /**
   * Execute stage update with validation and audit logging
   */
  public async transitionStage(params: {
    leadId: string;
    targetStage: DealStage;
    actorType?: "USER" | "AI" | "SYSTEM";
    actorId?: string;
    isSuperAdmin?: boolean;
    reason?: string;
  }): Promise<{ success: boolean; lead: LeadRecord | null; error?: string }> {
    const { leadId, targetStage, actorType = "SYSTEM", actorId = "system", isSuperAdmin = false, reason } = params;

    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      return { success: false, lead: null, error: `Lead not found with ID ${leadId}` };
    }

    const currentStage = lead.stage as DealStage;
    if (!this.canTransition(currentStage, targetStage, isSuperAdmin)) {
      const allowed = this.ALLOWED_TRANSITIONS[currentStage]?.join(", ") || "none";
      return {
        success: false,
        lead,
        error: `Invalid stage transition from '${currentStage}' to '${targetStage}'. Allowed next stages: [${allowed}].`,
      };
    }

    const updated = await leadRepository.updateStage(leadId, targetStage, actorType, actorId);
    logger.info(
      `Lead ${leadId} transitioned from ${currentStage} to ${targetStage} by ${actorType}:${actorId}${reason ? ` (${reason})` : ""}`,
      { module: "DealStageEngine" }
    );

    return { success: true, lead: updated };
  }

  /**
   * Determine if BANT signals warrant automatic progression of deal stage
   */
  public evaluateAutoAdvancement(
    currentStage: DealStage,
    bant: BantBreakdown,
    hasContactInfo: boolean
  ): { shouldAdvance: boolean; nextStage?: DealStage; reason?: string } {
    // 1. Unqualified or Cold Leads
    if (bant.classification === "COLD") {
      if (currentStage === "NEW") {
        return { shouldAdvance: false };
      }
    }

    // 2. NEW -> CONTACTED
    if (currentStage === "NEW" && hasContactInfo) {
      return {
        shouldAdvance: true,
        nextStage: "CONTACTED",
        reason: "Valid prospect contact details verified in conversation",
      };
    }

    // 3. CONTACTED -> QUALIFIED
    if (
      (currentStage === "CONTACTED" || currentStage === "NEW") &&
      bant.compositeScore >= 60 &&
      bant.needScore >= 50
    ) {
      return {
        shouldAdvance: true,
        nextStage: "QUALIFIED",
        reason: `BANT score reached ${bant.compositeScore}/100 with confirmed technical need alignment`,
      };
    }

    // 4. QUALIFIED -> PROPOSAL
    if (
      (currentStage === "QUALIFIED" || currentStage === "CONTACTED") &&
      (bant.classification === "PROPOSAL_READY" || (bant.compositeScore >= 75 && bant.authorityScore >= 60))
    ) {
      return {
        shouldAdvance: true,
        nextStage: "PROPOSAL",
        reason: `High qualification score (${bant.compositeScore}/100) and verified decision stakeholder ready for engineering scope`,
      };
    }

    return { shouldAdvance: false };
  }
}

export const dealStageEngine = new DealStageEngine();
