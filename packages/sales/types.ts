export type AuthorityLevel =
  | "PRIMARY_DECISION_MAKER"
  | "INFLUENCER_EVALUATOR"
  | "TECHNICAL_STAKEHOLDER"
  | "GATEKEEPER"
  | "UNKNOWN";

export type BudgetTier =
  | "TIER_ENTERPRISE"     // $50k+
  | "TIER_GROWTH"         // $25k - $50k
  | "TIER_CORE"           // $10k - $25k
  | "TIER_BELOW_MINIMUM"  // <$10k
  | "UNKNOWN";

export type TimelineUrgency =
  | "IMMEDIATE"  // < 2 weeks
  | "FAST"       // ~ 1 month
  | "NORMAL"     // 1 - 3 months
  | "FUTURE"     // 3 - 6+ months
  | "INDEFINITE";

export type DealStage =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "NURTURE";

export interface BantBreakdown {
  budgetScore: number;       // 0 - 100
  budgetTier: BudgetTier;
  budgetFormatted: string;
  authorityScore: number;    // 0 - 100
  authorityLevel: AuthorityLevel;
  authorityTitle?: string;
  needScore: number;         // 0 - 100
  needAlignment: string[];
  needSummary: string;
  timelineScore: number;     // 0 - 100
  timelineUrgency: TimelineUrgency;
  timelineFormatted: string;
  compositeScore: number;    // 0 - 100
  classification: "COLD" | "WARM" | "HOT_QUALIFIED" | "PROPOSAL_READY";
  reasoning: string;
  evaluatedAt: string;
}

export interface ProposalScope {
  leadId: string;
  title: string;
  clientName: string;
  clientCompany?: string;
  problemSummary: string;
  proposedArchitecture: string;
  coreDeliverables: string[];
  recommendedTechStack: string[];
  estimatedTimelineWeeks: string;
  investmentTier: string;
  nextSteps: string[];
  generatedAt: string;
}
