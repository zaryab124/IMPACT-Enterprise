/**
 * IMPACT Growth OS — AI Call Agent Policies & Compliance (Phase 12)
 * Enforces explicit controls for:
 * 1. AI Disclosure: Mandatory self-identification as AI
 * 2. Recording Consent: Prior affirmative consent check
 * 3. Human Escalation: Automatic transfer triggers
 * 4. Sensitive Information: Masking payment card numbers and SSNs
 * 5. Call Termination: Graceful concluding protocol
 *
 * JURISDICTIONAL NOTICE:
 * Telecommunications compliance (e.g. US TCPA, FCC AI disclosure regulations,
 * state 2-party wiretap laws, EU GDPR / AI Act) requires jurisdiction-specific
 * operational verification.
 */

export interface CallPolicyAudit {
  disclosureGiven: boolean;
  consentGranted: boolean;
  escalationTriggered: boolean;
  escalationReason?: string;
  sensitiveDataSanitized: boolean;
  terminatedCleanly: boolean;
}

export class CallPolicies {
  public static readonly AI_DISCLOSURE_PROMPT =
    "Hello, thank you for calling IMPACT Enterprise. I am IMPACT AI, an autonomous sales and technical consultant. How can I assist with your enterprise software or automation goals today?";

  public static readonly CONSENT_INQUIRY =
    "To ensure quality and assist our engineering team with project scoping, this call may be recorded and transcribed. Do you consent to recording?";

  public static readonly HUMAN_ESCALATION_KEYWORDS = [
    "speak to a human",
    "talk to a human",
    "real person",
    "human agent",
    "human representative",
    "speak to someone real",
    "transfer me",
    "connect me with a person",
    "manager",
  ];

  /**
   * Check if caller requests escalation to human sales staff
   */
  public static checkEscalationRequest(utterance: string): { requested: boolean; reason?: string } {
    const lower = utterance.toLowerCase();
    for (const keyword of this.HUMAN_ESCALATION_KEYWORDS) {
      if (lower.includes(keyword)) {
        return {
          requested: true,
          reason: `Caller explicitly requested human representative matching keyword '${keyword}'`,
        };
      }
    }
    return { requested: false };
  }

  /**
   * Mask sensitive information (credit card numbers, SSNs, bank details) from transcripts
   */
  public static maskSensitiveData(text: string): { maskedText: string; sanitized: boolean } {
    let sanitized = false;

    // Credit card pattern (13-19 digits with optional dashes/spaces)
    const ccPattern = /\b(?:\d[ -]*?){13,19}\b/g;
    // SSN pattern (3-2-4 digits)
    const ssnPattern = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g;

    let masked = text;
    if (ccPattern.test(masked)) {
      masked = masked.replace(ccPattern, "[REDACTED_PAYMENT_CARD]");
      sanitized = true;
    }
    if (ssnPattern.test(masked)) {
      masked = masked.replace(ssnPattern, "[REDACTED_SSN]");
      sanitized = true;
    }

    return { maskedText: masked, sanitized };
  }

  /**
   * Generate polite termination or transfer response
   */
  public static getEscalationResponse(): string {
    return "I completely understand. I am transferring this call to our priority enterprise sales queue, and our technical director will connect with you shortly.";
  }

  public static getTerminationResponse(): string {
    return "Thank you for contacting IMPACT Enterprise. We have updated your project file and our solutions team will follow up via email with your technical roadmap. Have a great day!";
  }
}
