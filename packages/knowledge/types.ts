export type KnowledgeCategory =
  | "COMPANY"
  | "SERVICES"
  | "SERVICE_DESCRIPTIONS"
  | "TARGET_INDUSTRIES"
  | "TARGET_CUSTOMERS"
  | "FAQS"
  | "TEAM"
  | "PROJECTS"
  | "CASE_STUDIES"
  | "BRAND_GUIDELINES"
  | "CONTACT_INFORMATION"
  | "SALES_POLICIES"
  | "PRICING_RULES"
  | "APPROVED_CLAIMS"
  | "RESTRICTED_CLAIMS"
  // Backwards compatibility aliases
  | "LEADERSHIP"
  | "POLICIES"
  | "CONTACT"
  | "FAQ"
  | "TECHNICAL";

export type KnowledgeReviewStatus = "APPROVED" | "UNDER_REVIEW" | "ARCHIVED";

export interface KnowledgeDocument {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  source: string; // Source / reference document or authority
  version: number;
  metadata: {
    tags: string[];
    summary: string;
    targetAudience?: string;
    timeline?: string;
    keyPoints?: string[];
    reviewNotes?: string;
    [key: string]: any;
  };
  reviewStatus?: KnowledgeReviewStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchOptions {
  category?: KnowledgeCategory;
  limit?: number;
  minScore?: number;
  includeArchived?: boolean;
}

export interface ScoredKnowledgeDocument {
  document: KnowledgeDocument;
  score: number;
  matchedTerms: string[];
  relevanceExplanation: string;
}

export interface KnowledgeQueryResult {
  query: string;
  isOutOfScope: boolean;
  isRestrictedTopic?: boolean;
  confidenceScore: number;
  documents: ScoredKnowledgeDocument[];
  groundingContext: string;
  guardrailMessage?: string;
}
