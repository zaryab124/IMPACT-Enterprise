/**
 * IMPACT Growth OS — AI Call Agent CRM Orchestrator (Phase 12)
 * Full inbound voice call integration pipeline:
 * Incoming call → Caller Lookup/Create Lead → CRM Context Injection →
 * Conversation Processing → Transcript & Masking → Summary & Qualification →
 * Next Action → CRM Call & Activity Persistence.
 */

import { db } from "../../database";
import { logger } from "../../logging/logger";
import { CORE_SERVICES, IMPACT_SERVICES } from "../constants";
import { LeadDeduplicationService } from "../crm/services/leadDeduplicationService";
import { LeadIntakeService } from "../crm/services/leadIntakeService";
import { LeadQualificationAgent } from "../crm/services/leadQualificationAgent";
import { CallPolicies } from "./callPolicies";

export interface CallTurn {
  speaker: "agent" | "caller";
  text: string;
  timestamp?: string;
}

export interface InboundCallEvent {
  callerPhone: string;
  callerName?: string;
  companyName?: string;
  turns: CallTurn[];
  durationSeconds: number;
  consentGranted?: boolean;
}

export interface CallProcessingResult {
  callId: string;
  leadId: string;
  durationSeconds: number;
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  serviceInterest: string;
  qualification: {
    status: string;
    urgency: string;
    score: number;
  };
  nextAction: string;
  transcriptTurns: CallTurn[];
  recordingConsent: boolean;
  disclosureGiven: boolean;
  escalationRequested: boolean;
  escalationReason?: string;
}

export class CallOrchestrator {
  /**
   * Process complete inbound call session through CRM voice pipeline
   */
  public static async processCall(event: InboundCallEvent): Promise<CallProcessingResult> {
    const cleanPhone = LeadDeduplicationService.normalizePhone(event.callerPhone);

    // 1. Caller Identification & Lead Resolution
    let leadId: string;
    const match = await LeadDeduplicationService.findMatch({ phone: cleanPhone });

    if (match.matchFound && match.existingLeadId) {
      leadId = match.existingLeadId;
      logger.info(`Matched caller [${cleanPhone}] to existing lead [${leadId}]`, { module: "CallOrchestrator" });
    } else {
      // Auto-create lead in CRM
      const intakeRes = await LeadIntakeService.ingestLead({
        phone: cleanPhone,
        first_name: event.callerName ? event.callerName.split(" ")[0] : "Voice",
        last_name: event.callerName && event.callerName.includes(" ") ? event.callerName.split(" ").slice(1).join(" ") : "Caller",
        company: event.companyName || "Inbound Voice Inquiry",
        source: "contact_form",
        service_interest: "Call agents",
        problem_statement: "Inbound voice consultation call processed by IMPACT AI Call Agent.",
      });
      leadId = intakeRes.leadId;
      logger.info(`Auto-created lead [${leadId}] for new caller [${cleanPhone}]`, { module: "CallOrchestrator" });
    }

    // 2. Fetch Lead & Prior CRM Context
    const leadRes = await db.query(`SELECT * FROM leads WHERE id = $1;`, [leadId]);
    const lead = leadRes.rows[0];

    // 3. Evaluate Turns & Policy Compliance
    let disclosureGiven = false;
    let escalationRequested = false;
    let escalationReason: string | undefined = undefined;
    const sanitizedTurns: CallTurn[] = [];

    for (const turn of event.turns) {
      // Check disclosure
      if (turn.speaker === "agent" && (turn.text.includes("IMPACT AI") || turn.text.includes("artificial intelligence") || turn.text.includes("virtual consultant"))) {
        disclosureGiven = true;
      }

      // Check caller escalation
      if (turn.speaker === "caller") {
        const esc = CallPolicies.checkEscalationRequest(turn.text);
        if (esc.requested) {
          escalationRequested = true;
          escalationReason = esc.reason;
        }
      }

      // Sensitive Data Sanitization
      const { maskedText } = CallPolicies.maskSensitiveData(turn.text);
      sanitizedTurns.push({
        speaker: turn.speaker,
        text: maskedText,
        timestamp: turn.timestamp || new Date().toISOString(),
      });
    }

    const consentGranted = event.consentGranted !== undefined ? event.consentGranted : true;

    // 4. Summarization & Intelligence Analysis
    const fullTranscript = sanitizedTurns.map((t) => `${t.speaker}: ${t.text}`).join("\n");
    const serviceInterest = this.extractServiceInterest(fullTranscript, lead.service_interest);
    const sentiment = this.calculateSentiment(fullTranscript);

    // Call Qualification
    const isHighIntent = fullTranscript.toLowerCase().includes("budget") || fullTranscript.toLowerCase().includes("urgent") || fullTranscript.toLowerCase().includes("immediately") || fullTranscript.toLowerCase().includes("contract");
    const qualification = {
      status: isHighIntent ? "HIGH_INTENT" : "QUALIFIED",
      urgency: isHighIntent ? "HIGH" : "MEDIUM",
      score: isHighIntent ? 88 : 74,
    };

    const summary = `Inbound voice call with ${lead.first_name || "caller"} (${lead.company || cleanPhone}). Discussed enterprise requirements for ${serviceInterest}. ${escalationRequested ? `Caller requested human transfer: ${escalationReason}.` : "AI answered technical questions and qualified project readiness."}`;
    const nextAction = escalationRequested
      ? "Immediate callback required: Caller escalated from AI voice agent to human representative."
      : `Send technical scoping summary for ${serviceInterest} and schedule architectural review.`;

    const startedAt = new Date(Date.now() - event.durationSeconds * 1000).toISOString();

    // 5. Save in crm_calls Table
    const callRes = await db.query<{ id: string }>(
      `INSERT INTO crm_calls (
        lead_id,
        call_type,
        status,
        phone_number,
        duration_seconds,
        summary,
        sentiment,
        service_interest,
        qualification,
        next_action,
        recording_consent,
        disclosure_given,
        escalation_requested,
        escalation_reason,
        transcript_turns,
        started_at,
        ended_at
      ) VALUES (
        $1, 'inbound', 'completed', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()
      ) RETURNING id;`,
      [
        leadId,
        cleanPhone,
        event.durationSeconds,
        summary,
        sentiment,
        serviceInterest,
        JSON.stringify(qualification),
        nextAction,
        consentGranted,
        disclosureGiven,
        escalationRequested,
        escalationReason || null,
        JSON.stringify(sanitizedTurns),
        startedAt,
      ]
    );

    const callId = callRes.rows[0].id;

    // 6. Log Activity in CRM
    await db.query(
      `INSERT INTO crm_activities (
        lead_id, activity_type, subject, description, performed_at, metadata
      ) VALUES ($1, 'ai_call_completed', $2, $3, NOW(), $4);`,
      [
        leadId,
        `Inbound AI Voice Call (${event.durationSeconds}s) — ${serviceInterest}`,
        summary,
        JSON.stringify({
          callId,
          durationSeconds: event.durationSeconds,
          sentiment,
          qualification,
          escalationRequested,
        }),
      ]
    );

    // 7. Update Lead recommended next action and score
    await db.query(
      `UPDATE leads
       SET lead_score = GREATEST(lead_score, $1),
           recommended_next_action = $2,
           last_contacted = NOW(),
           updated_at = NOW()
       WHERE id = $3;`,
      [qualification.score, nextAction, leadId]
    );

    logger.info(`Processed AI call [${callId}] for lead [${leadId}] (${event.durationSeconds}s)`, {
      module: "CallOrchestrator",
      serviceInterest,
      sentiment,
    });

    return {
      callId,
      leadId,
      durationSeconds: event.durationSeconds,
      summary,
      sentiment,
      serviceInterest,
      qualification,
      nextAction,
      transcriptTurns: sanitizedTurns,
      recordingConsent: consentGranted,
      disclosureGiven,
      escalationRequested,
      escalationReason,
    };
  }

  private static extractServiceInterest(transcript: string, fallback?: string): string {
    const lower = transcript.toLowerCase();
    for (const service of CORE_SERVICES) {
      if (lower.includes(service.name.toLowerCase())) {
        return service.name;
      }
    }
    return fallback || CORE_SERVICES[5].name; // Default: Call agents
  }

  private static calculateSentiment(transcript: string): "positive" | "neutral" | "negative" {
    const lower = transcript.toLowerCase();
    if (
      lower.includes("great") ||
      lower.includes("excited") ||
      lower.includes("excellent") ||
      lower.includes("perfect") ||
      lower.includes("interested") ||
      lower.includes("priority") ||
      lower.includes("impressed")
    ) {
      return "positive";
    }
    if (lower.includes("angry") || lower.includes("frustrated") || lower.includes("terrible") || lower.includes("poor") || lower.includes("unhappy")) {
      return "negative";
    }
    return "neutral";
  }
}
