import {
  AuthorityLevel,
  BantBreakdown,
  BudgetTier,
  TimelineUrgency,
} from "./types";

export interface RawLeadSignals {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  text?: string;
  rawBudget?: string;
  rawTimeline?: string;
  problem?: string;
  roleTitle?: string;
}

export class BantEngine {
  /**
   * Evaluate Budget (0 - 100) and identify budget tier
   */
  public evaluateBudget(text = "", rawBudget?: string): {
    score: number;
    tier: BudgetTier;
    formatted: string;
  } {
    const combined = `${text} ${rawBudget || ""}`.toLowerCase();

    // 1. Try numerical dollar extraction ($15k, $50,000, 20k USD)
    const dollarMatch = combined.match(/\$\s*(\d[\d,\.]*)\s*([km])?/i) ||
      combined.match(/(\d[\d,\.]*)\s*([km])?\s*(?:usd|dollars)/i);

    if (dollarMatch) {
      const baseNum = parseFloat(dollarMatch[1].replace(/,/g, ""));
      const multiplier = dollarMatch[2]?.toLowerCase();

      let value = baseNum;
      if (multiplier === "k") value *= 1000;
      else if (multiplier === "m") value *= 1000000;
      else if (baseNum < 500 && !multiplier) {
        // e.g. "$50k" written as "$50" in context
        value *= 1000;
      }

      if (value >= 50000) {
        return { score: 100, tier: "TIER_ENTERPRISE", formatted: `$${value.toLocaleString()}+ (Enterprise)` };
      } else if (value >= 25000) {
        return { score: 85, tier: "TIER_GROWTH", formatted: `$${value.toLocaleString()} (Growth)` };
      } else if (value >= 10000) {
        return { score: 70, tier: "TIER_CORE", formatted: `$${value.toLocaleString()} (Core Impact Tier)` };
      } else {
        return { score: 30, tier: "TIER_BELOW_MINIMUM", formatted: `$${value.toLocaleString()} (Below Core Threshold)` };
      }
    }

    // 2. Qualitative indicators
    if (
      combined.includes("enterprise") ||
      combined.includes("well funded") ||
      combined.includes("series a") ||
      combined.includes("series b") ||
      combined.includes("venture backed") ||
      combined.includes("budget is flexible") ||
      combined.includes("flexible budget")
    ) {
      return { score: 90, tier: "TIER_GROWTH", formatted: "Flexible / Well-Funded Enterprise Budget" };
    }

    if (combined.includes("small budget") || combined.includes("no budget") || combined.includes("shoestring") || combined.includes("free")) {
      return { score: 15, tier: "TIER_BELOW_MINIMUM", formatted: "Limited / Sub-Threshold Budget" };
    }

    return { score: 25, tier: "UNKNOWN", formatted: "Unspecified Budget" };
  }

  /**
   * Evaluate Authority (0 - 100) and classify stakeholder level
   */
  public evaluateAuthority(text = "", roleTitle?: string): {
    score: number;
    level: AuthorityLevel;
    title?: string;
  } {
    const combined = `${text} ${roleTitle || ""}`.toLowerCase();

    // Primary Decision Makers
    if (
      combined.includes("ceo") ||
      combined.includes("chief executive") ||
      combined.includes("founder") ||
      combined.includes("co-founder") ||
      combined.includes("owner") ||
      combined.includes("managing partner") ||
      combined.includes("president")
    ) {
      const title = combined.includes("ceo") ? "CEO" : combined.includes("founder") ? "Founder" : "Executive Decision Maker";
      return { score: 100, level: "PRIMARY_DECISION_MAKER", title };
    }

    // Influencers & Functional Executives
    if (
      combined.includes("cto") ||
      combined.includes("chief technology") ||
      combined.includes("vp") ||
      combined.includes("vice president") ||
      combined.includes("head of") ||
      combined.includes("director")
    ) {
      const title = combined.includes("cto") ? "CTO" : combined.includes("vp") ? "Vice President" : "Director";
      return { score: 80, level: "INFLUENCER_EVALUATOR", title };
    }

    // Technical Stakeholders
    if (
      combined.includes("architect") ||
      combined.includes("engineer") ||
      combined.includes("lead developer") ||
      combined.includes("tech lead") ||
      combined.includes("product manager")
    ) {
      return { score: 60, level: "TECHNICAL_STAKEHOLDER", title: "Technical Evaluator" };
    }

    // Gatekeepers / Non-Decision Roles
    if (
      combined.includes("assistant") ||
      combined.includes("intern") ||
      combined.includes("student") ||
      combined.includes("coordinator")
    ) {
      return { score: 30, level: "GATEKEEPER", title: "Non-Decision Stakeholder" };
    }

    return { score: 20, level: "UNKNOWN", title: "Unverified Authority" };
  }

  /**
   * Evaluate Need & Capabilities Fit (0 - 100)
   */
  public evaluateNeed(text = "", problem?: string): {
    score: number;
    alignments: string[];
    summary: string;
  } {
    const combined = `${text} ${problem || ""}`.toLowerCase();
    const alignments: string[] = [];

    // Service Alignment Vectors
    if (combined.includes("voice") || combined.includes("phone") || combined.includes("calling") || combined.includes("call center") || combined.includes("gemini live")) {
      alignments.push("AI Voice & Real-Time Agent Systems");
    }
    if (combined.includes("chat") || combined.includes("customer service") || combined.includes("sales agent") || combined.includes("qualification agent")) {
      alignments.push("Autonomous Sales & Customer Service Agents");
    }
    if (combined.includes("automation") || combined.includes("crm") || combined.includes("hubspot") || combined.includes("dispatch") || combined.includes("workflow")) {
      alignments.push("Enterprise Workflow & CRM Automation");
    }
    if (combined.includes("platform") || combined.includes("custom app") || combined.includes("saas") || combined.includes("software") || combined.includes("cloud")) {
      alignments.push("Custom Digital Systems & Cloud Platforms");
    }

    // Pain Urgency Assessment
    const isUrgentPain =
      combined.includes("struggling") ||
      combined.includes("losing") ||
      combined.includes("bottleneck") ||
      combined.includes("waste time") ||
      combined.includes("manual error") ||
      combined.includes("failing") ||
      combined.includes("critical problem");

    let score = 25; // baseline
    if (alignments.length >= 2) score += 40;
    else if (alignments.length === 1) score += 25;

    if (problem && problem.trim().length > 15) score += 15;
    if (isUrgentPain) score += 20;

    const finalScore = Math.min(100, score);
    const summary = problem
      ? problem.slice(0, 160)
      : alignments.length > 0
      ? `Interest in ${alignments.join(" & ")}`
      : "General architectural inquiry";

    return { score: finalScore, alignments, summary };
  }

  /**
   * Evaluate Timeline Urgency (0 - 100)
   */
  public evaluateTimeline(text = "", rawTimeline?: string): {
    score: number;
    urgency: TimelineUrgency;
    formatted: string;
  } {
    const combined = `${text} ${rawTimeline || ""}`.toLowerCase();

    // Numerical week matching
    const weeksMatch = combined.match(/(\d+)\s*weeks?/i);
    if (weeksMatch) {
      const num = parseInt(weeksMatch[1], 10);
      if (num <= 2) return { score: 100, urgency: "IMMEDIATE", formatted: `Immediate (${num} weeks)` };
      if (num <= 4) return { score: 85, urgency: "FAST", formatted: `Fast-Track (${num} weeks)` };
      if (num <= 12) return { score: 70, urgency: "NORMAL", formatted: `Standard (${num} weeks)` };
      return { score: 40, urgency: "FUTURE", formatted: `Future Planning (${num} weeks)` };
    }

    // Numerical month matching
    const monthsMatch = combined.match(/(\d+)\s*months?/i);
    if (monthsMatch) {
      const num = parseInt(monthsMatch[1], 10);
      if (num <= 1) return { score: 85, urgency: "FAST", formatted: `Fast-Track (${num} month)` };
      if (num <= 3) return { score: 70, urgency: "NORMAL", formatted: `Standard (${num} months)` };
      return { score: 40, urgency: "FUTURE", formatted: `Future Planning (${num} months)` };
    }

    if (
      combined.includes("asap") ||
      combined.includes("immediately") ||
      combined.includes("urgent") ||
      combined.includes("this week") ||
      combined.includes("next week") ||
      combined.includes("< 2 weeks")
    ) {
      return { score: 100, urgency: "IMMEDIATE", formatted: "Immediate (Under 2 weeks)" };
    }

    if (
      combined.includes("month") ||
      combined.includes("4 weeks") ||
      combined.includes("30 days") ||
      combined.includes("fast")
    ) {
      return { score: 85, urgency: "FAST", formatted: "Fast-Track (Within 1 month)" };
    }

    if (
      combined.includes("quarter") ||
      combined.includes("1 to 3") ||
      combined.includes("2 to 3") ||
      combined.includes("normal") ||
      combined.includes("q1") ||
      combined.includes("q2") ||
      combined.includes("q3") ||
      combined.includes("q4")
    ) {
      return { score: 70, urgency: "NORMAL", formatted: "Standard (1 to 3 months)" };
    }

    if (combined.includes("6 months") || combined.includes("next year") || combined.includes("future")) {
      return { score: 40, urgency: "FUTURE", formatted: "Future Planning (3 to 6+ months)" };
    }

    return { score: 20, urgency: "INDEFINITE", formatted: "Exploratory / Unscheduled" };
  }

  /**
   * Calculate full composite BANT score and classification
   */
  public computeBantScore(signals: RawLeadSignals): BantBreakdown {
    const fullText = `${signals.text || ""} ${signals.problem || ""}`;

    const budget = this.evaluateBudget(fullText, signals.rawBudget);
    const authority = this.evaluateAuthority(fullText, signals.roleTitle);
    const need = this.evaluateNeed(fullText, signals.problem);
    const timeline = this.evaluateTimeline(fullText, signals.rawTimeline);

    // Weighted Formula: Need (30%), Budget (25%), Authority (25%), Timeline (20%)
    const compositeScore = Math.round(
      need.score * 0.3 +
      budget.score * 0.25 +
      authority.score * 0.25 +
      timeline.score * 0.2
    );

    let classification: "COLD" | "WARM" | "HOT_QUALIFIED" | "PROPOSAL_READY";
    if (compositeScore >= 85) {
      classification = "PROPOSAL_READY";
    } else if (compositeScore >= 70) {
      classification = "HOT_QUALIFIED";
    } else if (compositeScore >= 40) {
      classification = "WARM";
    } else {
      classification = "COLD";
    }

    const reasoning = `BANT Score: ${compositeScore}/100. Need: ${need.score}/100 (${need.alignments.join(", ") || "General"}). Budget: ${budget.score}/100 (${budget.formatted}). Authority: ${authority.score}/100 (${authority.level}). Timeline: ${timeline.score}/100 (${timeline.formatted}).`;

    return {
      budgetScore: budget.score,
      budgetTier: budget.tier,
      budgetFormatted: budget.formatted,
      authorityScore: authority.score,
      authorityLevel: authority.level,
      authorityTitle: authority.title,
      needScore: need.score,
      needAlignment: need.alignments,
      needSummary: need.summary,
      timelineScore: timeline.score,
      timelineUrgency: timeline.urgency,
      timelineFormatted: timeline.formatted,
      compositeScore,
      classification,
      reasoning,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

export const bantEngine = new BantEngine();
