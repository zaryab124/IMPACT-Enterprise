export type KnowledgeCategory =
  | "SERVICES"
  | "CASE_STUDIES"
  | "LEADERSHIP"
  | "POLICIES"
  | "CONTACT"
  | "FAQ"
  | "TECHNICAL";

export interface KnowledgeDocument {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  source: string;
  version: number;
  metadata: {
    tags: string[];
    summary: string;
    targetAudience?: string;
    timeline?: string;
    keyPoints?: string[];
    [key: string]: any;
  };
  isActive: boolean;
}

export interface SearchOptions {
  category?: KnowledgeCategory;
  limit?: number;
  minScore?: number;
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
  confidenceScore: number;
  documents: ScoredKnowledgeDocument[];
  groundingContext: string;
  guardrailMessage?: string;
}
