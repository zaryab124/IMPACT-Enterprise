/**
 * IMPACT Growth OS — Brand Consistency Checker
 * Enforces strict adherence to the 9 official IMPACT services,
 * brand positioning (IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT),
 * and negative boundaries (never invent clients, fake metrics, prices, guarantees).
 */

import { CORE_SERVICES, IMPACT_SERVICES } from "../constants";
import { BrandCheckResult } from "./types";

// Forbidden terms that violate anti-hallucination policies
const FORBIDDEN_CLAIMS = [
  /\bguaranteed\b/i,
  /\bguarantee\b/i,
  /\b100%\s*roi\b/i,
  /\b1000%\b/i,
  /\$\d+[\d,]*\s*(per\s*month|\/mo|\/month|flat\s*rate)\b/i,
  /\bfortune\s*500\s*clients\b/i,
  /\bofficial\s*partner\s*of\s*(google|microsoft|openai)\b/i,
  /\bcertified\s*by\s*iso\b/i,
  /\bwe\s*never\s*fail\b/i,
  /\brisk-free\b/i,
];

// Hallucinated customer company names that are not real
const SUSPICIOUS_CLIENT_PATTERNS = [
  /\bclient:\s*[A-Z][a-zA-Z0-9\s]+Corp\b/i,
  /\bcase\s*study:\s*(Nike|Apple|Tesla|Amazon|Google)\b/i,
];

export class BrandConsistencyChecker {
  /**
   * Run comprehensive brand check on proposed content
   */
  public static check(
    content: string,
    targetService?: string,
    hook?: string,
    cta?: string
  ): BrandCheckResult {
    const combinedText = `${hook || ""} ${content} ${cta || ""}`.trim();
    const flags: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // 1. Identify matched official service
    let serviceMatched: string | null = null;
    for (const service of CORE_SERVICES) {
      const lowerName = service.name.toLowerCase();
      if (
        combinedText.toLowerCase().includes(lowerName) ||
        (targetService && targetService.toLowerCase() === lowerName)
      ) {
        serviceMatched = service.name;
        break;
      }
    }

    if (!serviceMatched && targetService) {
      // Check if targetService is in list
      const matched = IMPACT_SERVICES.find(
        (s) => s.toLowerCase() === targetService.toLowerCase()
      );
      if (matched) {
        serviceMatched = matched;
      }
    }

    if (!serviceMatched) {
      score -= 25;
      flags.push("Service grounding warning: Content does not explicitly reference one of the 9 official IMPACT services.");
      suggestions.push(`Anchor your post to one of: ${IMPACT_SERVICES.join(", ")}.`);
    }

    // 2. Check for forbidden negative boundary claims
    for (const pattern of FORBIDDEN_CLAIMS) {
      if (pattern.test(combinedText)) {
        score -= 30;
        flags.push(`Negative boundary violation: Detected prohibited term matching ${pattern.toString()}`);
        suggestions.push("Remove unrealistic guarantees, unverified price points, or non-existent partner certifications.");
      }
    }

    // 3. Check for fake client names
    for (const pattern of SUSPICIOUS_CLIENT_PATTERNS) {
      if (pattern.test(combinedText)) {
        score -= 40;
        flags.push("Anti-hallucination violation: Unverified client or case study named.");
        suggestions.push("Focus on enterprise architecture, methodology, and problem-solution frameworks rather than unverified client names.");
      }
    }

    // 4. Tone & Positioning Check
    const hasPositioningElement =
      /intelligence|automation|software|agents|engineering|architecture|enterprise/i.test(combinedText);
    if (!hasPositioningElement) {
      score -= 15;
      flags.push("Brand positioning weak: Lacks engineering or intelligence depth.");
      suggestions.push("Align phrasing with IMPACT's core: IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT.");
    }

    // Ensure score is bounded between 0 and 100
    const finalScore = Math.max(0, Math.min(100, score));
    const passed = finalScore >= 70 && !flags.some((f) => f.includes("Anti-hallucination violation"));

    return {
      passed,
      score: finalScore,
      serviceMatched,
      flags,
      suggestions,
      checkedAt: new Date().toISOString(),
    };
  }
}
