import { APPROVED_KNOWLEDGE_DOCUMENTS } from "./data/approvedKnowledge";
import {
  KnowledgeCategory,
  KnowledgeDocument,
  KnowledgeQueryResult,
  ScoredKnowledgeDocument,
  SearchOptions,
} from "./types";
import { db } from "../database";
import { logger } from "../logging/logger";

const STOP_WORDS = new Set([
  "a", "about", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the", "to",
  "was", "were", "will", "with", "what", "how", "can", "you", "tell", "me",
  "i", "we", "our", "your", "do", "does", "any", "some", "my"
]);

// Out-of-scope triggers
const OUT_OF_SCOPE_PATTERNS = [
  /\b(weather|temperature|forecast|rain|sunny)\b/i,
  /\b(doctor|medicine|headache|symptom|prescription|disease|medical|cure)\b/i,
  /\b(crypto|bitcoin|ethereum|doge|token|airdrop|pump|trading signal)\b/i,
  /\b(recipe|cooking|bake|cake|ingredient|dinner menu)\b/i,
  /\b(horoscope|astrology|zodiac|fortune)\b/i,
  /\b(politics|election|president|prime minister|vote)\b/i,
  /\b(joke|riddle|funny story|poem)\b/i,
];

// Price-intent patterns
const PRICING_PATTERNS = [
  /\b(price|pricing|cost|how much|fee|rate|charge|quote|budget|discount|expensive|cheap)\b/i,
];

export class KnowledgeService {
  private inMemoryDocs: KnowledgeDocument[] = APPROVED_KNOWLEDGE_DOCUMENTS;

  /**
   * Tokenize and normalize query text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
  }

  /**
   * Check if a query is completely out of scope for IMPACT Enterprise
   */
  public isOutOfScopeQuery(query: string): boolean {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return true;

    // Check against prohibited topics
    for (const pattern of OUT_OF_SCOPE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Hybrid search across approved knowledge base
   */
  public async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<KnowledgeQueryResult> {
    const limit = options.limit || 5;
    const minScore = options.minScore || 10;
    const category = options.category;

    // 1. Guardrail: Check out-of-scope boundary
    if (this.isOutOfScopeQuery(query)) {
      logger.info(`Out-of-scope knowledge query detected: "${query}"`, { module: "KnowledgeService" });
      return {
        query,
        isOutOfScope: true,
        confidenceScore: 0,
        documents: [],
        groundingContext: "",
        guardrailMessage:
          "I am specialized exclusively as the AI Sales & Technical Consultant for IMPACT Enterprise. I cannot assist with general, medical, financial trading, or unrelated topics. However, I can provide full details on our AI agents, workflow automations, custom software, or help you schedule an engineering discovery consultation.",
      };
    }

    const tokens = this.tokenize(query);
    const isPricingQuery = PRICING_PATTERNS.some((p) => p.test(query));

    // 2. Fetch candidates from in-memory verified corpus (or DB if synced)
    let candidates = this.inMemoryDocs.filter((doc) => doc.isActive);
    if (category) {
      candidates = candidates.filter((doc) => doc.category === category);
    }

    // 3. Score candidates with weighted keyword and semantic factors
    const scoredDocs: ScoredKnowledgeDocument[] = [];

    for (const doc of candidates) {
      let score = 0;
      const matchedTerms = new Set<string>();
      const docText = `${doc.title} ${doc.content} ${doc.metadata.tags.join(" ")}`.toLowerCase();

      // Check tokens
      for (const token of tokens) {
        if (doc.title.toLowerCase().includes(token)) {
          score += 25; // Title match high priority
          matchedTerms.add(token);
        }
        if (doc.metadata.tags.some((tag) => tag.toLowerCase().includes(token))) {
          score += 15; // Tag match
          matchedTerms.add(token);
        }
        if (doc.content.toLowerCase().includes(token)) {
          score += 8; // Content match
          matchedTerms.add(token);
        }
      }

      // If user asks about price, boost pricing policy
      if (isPricingQuery && doc.id === "policy-pricing-scoping") {
        score += 50;
        matchedTerms.add("pricing");
      }

      // If user asks about case study or restaurant, boost case study
      if (query.toLowerCase().includes("restaurant") && doc.id === "cs-restaurant-platform") {
        score += 40;
        matchedTerms.add("restaurant");
      }

      // If user asks about leadership or founder
      if (
        (query.toLowerCase().includes("who") || query.toLowerCase().includes("founder") || query.toLowerCase().includes("team") || query.toLowerCase().includes("ceo")) &&
        doc.id === "lead-team"
      ) {
        score += 35;
        matchedTerms.add("leadership");
      }

      // Category match boost
      if (category && doc.category === category) {
        score += 10;
      }

      if (score >= minScore) {
        scoredDocs.push({
          document: doc,
          score,
          matchedTerms: Array.from(matchedTerms),
          relevanceExplanation: `Matched terms: [${Array.from(matchedTerms).join(", ")}] with score ${score}`,
        });
      }
    }

    // Sort by score descending
    scoredDocs.sort((a, b) => b.score - a.score);
    const topResults = scoredDocs.slice(0, limit);

    // Calculate confidence score (0 to 100)
    let confidenceScore = 0;
    if (topResults.length > 0) {
      const topScore = topResults[0].score;
      confidenceScore = Math.min(100, Math.round((topScore / 60) * 100));
    }

    // Build grounding context block
    let groundingContext = "";
    if (topResults.length > 0) {
      groundingContext = topResults
        .map(
          (res, idx) =>
            `[GROUNDING DOCUMENT ${idx + 1}: ${res.document.title}]\n` +
            `Category: ${res.document.category} | Source: ${res.document.source}\n` +
            `Verified Content:\n${res.document.content}\n` +
            `Summary: ${res.document.metadata.summary}\n` +
            `Key Points: ${res.document.metadata.keyPoints ? res.document.metadata.keyPoints.join("; ") : "N/A"}\n`
        )
        .join("\n--------------------------------------------------\n\n");
    }

    return {
      query,
      isOutOfScope: false,
      confidenceScore,
      documents: topResults,
      groundingContext,
    };
  }

  /**
   * Get single document by ID
   */
  public async getDocumentById(id: string): Promise<KnowledgeDocument | null> {
    const found = this.inMemoryDocs.find((doc) => doc.id === id);
    return found || null;
  }

  /**
   * List all documents
   */
  public async listDocuments(category?: KnowledgeCategory): Promise<KnowledgeDocument[]> {
    if (category) {
      return this.inMemoryDocs.filter((doc) => doc.category === category && doc.isActive);
    }
    return this.inMemoryDocs.filter((doc) => doc.isActive);
  }

  /**
   * Sync in-memory approved knowledge into the database knowledge_documents table
   */
  public async seedKnowledgeTable(): Promise<number> {
    let synced = 0;
    for (const doc of this.inMemoryDocs) {
      await db.query(
        `INSERT INTO knowledge_documents (category, title, content, source, version, metadata, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING;`,
        [
          doc.category,
          doc.title,
          doc.content,
          doc.source,
          doc.version,
          JSON.stringify(doc.metadata),
          doc.isActive,
        ]
      );
      synced++;
    }
    logger.info(`Synced ${synced} knowledge documents to database`, { module: "KnowledgeService" });
    return synced;
  }
}

export const knowledgeService = new KnowledgeService();
