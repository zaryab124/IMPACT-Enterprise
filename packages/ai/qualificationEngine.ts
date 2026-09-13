import { LeadQualificationState } from "./types";
import { bantEngine } from "../sales/bantEngine";

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/;

export class QualificationEngine {
  /**
   * Extract qualification signals from conversation history and latest message
   */
  public extractSignals(
    currentText: string,
    existingState: Partial<LeadQualificationState> = {}
  ): LeadQualificationState {
    const text = currentText.trim();
    const lower = text.toLowerCase();

    const state: LeadQualificationState = {
      name: existingState.name,
      company: existingState.company,
      industry: existingState.industry,
      phone: existingState.phone,
      email: existingState.email,
      problem: existingState.problem,
      solution: existingState.solution,
      budget: existingState.budget,
      timeline: existingState.timeline,
      decisionAuthority: existingState.decisionAuthority ?? false,
      qualificationScore: 0,
      stage: existingState.stage || "NEW",
      extractedAt: new Date().toISOString(),
    };

    // 1. Email extraction
    const emailMatch = text.match(EMAIL_REGEX);
    if (emailMatch && !state.email) {
      state.email = emailMatch[0].toLowerCase();
    }

    // 2. Phone extraction
    const phoneMatch = text.match(PHONE_REGEX);
    if (phoneMatch && !state.phone && phoneMatch[0].length >= 7) {
      state.phone = phoneMatch[0].trim();
    }

    // 3. Name extraction
    const structuredNameMatch = text.match(/(?:name[:=]\s*)([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
    const naturalNameMatch = text.match(/(?:my name is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    const nameMatch = structuredNameMatch || naturalNameMatch;
    if (nameMatch && !state.name) {
      state.name = nameMatch[1].trim();
    }

    // 4. Company extraction
    const structuredCompanyMatch = text.match(/(?:company[:=]\s*)([A-Za-z0-9\s&]{2,30}?)(?:\||\.|\,|$)/i);
    const naturalCompanyMatch = text.match(/(?:at|from|with|company is|running)\s+([A-Z][A-Za-z0-9\s&]{2,30}?)(?:\.|\,|$|\s+and|\s+we)/i);
    const companyMatch = structuredCompanyMatch || naturalCompanyMatch;
    if (companyMatch && !state.company) {
      state.company = companyMatch[1].trim();
    }

    // 5. Timeline extraction
    if (!state.timeline) {
      if (lower.includes("asap") || lower.includes("immediately") || lower.includes("urgent")) {
        state.timeline = "Immediate (ASAP)";
      } else if (lower.includes("month") || lower.includes("weeks") || lower.includes("quarter")) {
        const timelineSnippet = text.match(/(?:within|in|around)?\s*(\d+\s*(?:weeks?|months?))/i);
        state.timeline = timelineSnippet ? timelineSnippet[0].trim() : "1 to 3 months";
      }
    }

    // 6. Problem identification
    if (!state.problem) {
      if (
        lower.includes("challenge") ||
        lower.includes("problem") ||
        lower.includes("struggling with") ||
        lower.includes("need to automate") ||
        lower.includes("bottleneck") ||
        lower.includes("waste time")
      ) {
        state.problem = text.slice(0, 200);
      }
    }

    // 7. Authority extraction
    if (!state.decisionAuthority) {
      if (
        lower.includes("founder") ||
        lower.includes("ceo") ||
        lower.includes("owner") ||
        lower.includes("director") ||
        lower.includes("head of") ||
        lower.includes("vp") ||
        lower.includes("managing partner")
      ) {
        state.decisionAuthority = true;
      }
    }

    // 8. Budget indicators
    if (!state.budget) {
      const budgetMatch = text.match(/\$\s*(\d[\d,kKmM]*)/);
      if (budgetMatch) {
        state.budget = budgetMatch[0];
      }
    }

    // 9. BANT Composite Score Calculation
    const bant = bantEngine.computeBantScore({
      name: state.name,
      email: state.email,
      phone: state.phone,
      company: state.company,
      text,
      rawBudget: state.budget,
      rawTimeline: state.timeline,
      problem: state.problem,
    });

    state.qualificationScore = bant.compositeScore;

    // 10. Stage progression
    if (state.qualificationScore >= 70) {
      state.stage = "QUALIFIED";
    } else if (state.qualificationScore >= 40 || state.email) {
      state.stage = "CONTACTED";
    } else {
      state.stage = "NEW";
    }

    return state;
  }
}

export const qualificationEngine = new QualificationEngine();
