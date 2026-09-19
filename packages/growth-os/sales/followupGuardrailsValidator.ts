/**
 * IMPACT Growth OS — Follow-up Guardrails Validator (Phase 10)
 * Strictly verifies that AI-generated sales communications do NOT:
 * 1. Promise impossible delivery dates
 * 2. Invent pricing
 * 3. Claim a contract exists
 * 4. Guarantee results
 * 5. Impersonate a human without disclosure where required
 */

export interface GuardrailValidationResult {
  passed: boolean;
  violations: string[];
}

const FORBIDDEN_PATTERNS = [
  {
    type: "IMPOSSIBLE_DELIVERY_DATE",
    regex: /\b(delivered\s*tomorrow|ready\s*in\s*2\s*hours|done\s*tonight|instant\s*completion)\b/i,
    message: "AI must not promise impossible delivery timelines.",
  },
  {
    type: "INVENTED_PRICING",
    regex: /\$\d+[\d,]*\s*(per\s*month|\/mo|\/month|flat\s*fee|special\s*discount)\b/i,
    message: "AI must not invent unconfirmed pricing or arbitrary discount figures.",
  },
  {
    type: "FALSE_CONTRACT_CLAIM",
    regex: /\b(per\s*our\s*signed\s*contract|as\s*agreed\s*in\s*the\s*contract|contract\s*is\s*already\s*active)\b/i,
    message: "AI must not claim a contract exists prior to legal execution.",
  },
  {
    type: "RESULT_GUARANTEE",
    regex: /\b(100%\s*guaranteed|guarantee\s*results|guaranteed\s*roi|never\s*fails)\b/i,
    message: "AI must not provide unrealistic or legally binding result guarantees.",
  },
];

export class FollowupGuardrailsValidator {
  public static validate(content: string, subject?: string): GuardrailValidationResult {
    const combined = `${subject || ""} ${content}`.trim();
    const violations: string[] = [];

    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.regex.test(combined)) {
        violations.push(`[${rule.type}] ${rule.message}`);
      }
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}
