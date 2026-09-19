/**
 * IMPACT Growth OS — AI Lead Qualification Agent (Phase 9)
 * Evaluates inbound prospects across 8 core dimensions using Gemini API or consultative analysis.
 * Generates lead score, qualification status, urgency, recommended next action, and confidence.
 * Provides full human override capabilities and historical audit tracking.
 */

import { GoogleGenAI } from "@google/genai";
import { db } from "../../../database";
import { logger } from "../../../logging/logger";
import { CORE_SERVICES, IMPACT_SERVICES } from "../../constants";

export type QualificationStatus = "UNQUALIFIED" | "POTENTIAL" | "QUALIFIED" | "HIGH_INTENT";
export type QualificationUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface QualificationResult {
  qualificationId: string;
  leadId: string;
  model: string;
  leadScore: number;
  qualificationStatus: QualificationStatus;
  serviceMatch: string;
  urgency: QualificationUrgency;
  recommendedNextAction: string;
  reasoningSummary: string;
  confidence: number;
  timestamp: string;
  isOverridden: boolean;
}

export interface HumanOverrideInput {
  overriddenStatus: QualificationStatus;
  overriddenScore?: number;
  overrideReason: string;
  overriddenBy?: string;
}

export class LeadQualificationAgent {
  private static defaultModel = "gemini-2.5-flash";

  /**
   * Qualifies a lead by evaluating the 8 dimensions and storing history
   */
  public static async qualifyLead(leadId: string): Promise<QualificationResult> {
    // 1. Fetch Lead & Context
    const leadRes = await db.query(
      `SELECT l.*, c.name as company_name, c.industry as company_industry, c.employee_count, c.annual_revenue
       FROM leads l
       LEFT JOIN companies c ON l.company_id = c.id
       WHERE l.id = $1;`,
      [leadId]
    );
    if (leadRes.rows.length === 0) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    const lead = leadRes.rows[0];

    // Fetch communication / activities history
    const activitiesRes = await db.query(
      `SELECT activity_type, subject, description, performed_at 
       FROM crm_activities WHERE lead_id = $1 ORDER BY performed_at ASC LIMIT 10;`,
      [leadId]
    );

    // 2. Prepare Snapshot of 8 Dimensions
    const inputSnapshot = {
      requested_service: lead.service_interest || "AI agents",
      company: lead.company || lead.company_name || "Unknown Company",
      industry: lead.company_industry || "Technology / General Enterprise",
      business_problem: lead.problem_statement || "Interested in enterprise AI automation",
      budget_information: lead.budget_range || "Not voluntarily specified",
      timeline: lead.timeline || "Immediate / Within 30 days",
      company_size: lead.employee_count ? `${lead.employee_count} employees` : "Mid-market / Enterprise",
      communication_history: activitiesRes.rows.map((a) => `${a.activity_type}: ${a.subject}`),
    };

    let evaluation: {
      leadScore: number;
      qualificationStatus: QualificationStatus;
      serviceMatch: string;
      urgency: QualificationUrgency;
      recommendedNextAction: string;
      reasoningSummary: string;
      confidence: number;
      model: string;
    };

    // 3. Try Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("your-gemini-api-key")) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const prompt = `
You are IMPACT AI, elite Technical Sales Lead Qualification Specialist for IMPACT Enterprise.
Analyze this inbound lead across these 8 dimensions:
1. Requested Service: ${inputSnapshot.requested_service}
2. Company: ${inputSnapshot.company}
3. Industry: ${inputSnapshot.industry}
4. Business Problem: ${inputSnapshot.business_problem}
5. Budget Information: ${inputSnapshot.budget_information}
6. Timeline: ${inputSnapshot.timeline}
7. Company Size: ${inputSnapshot.company_size}
8. Communication History: ${JSON.stringify(inputSnapshot.communication_history)}

Available Official Services: ${IMPACT_SERVICES.join(", ")}

Qualification Statuses: UNQUALIFIED, POTENTIAL, QUALIFIED, HIGH_INTENT
Urgency Levels: LOW, MEDIUM, HIGH, CRITICAL

IMPORTANT:
- Score must be integer 0 to 100.
- Do NOT pretend this score is objective truth. Provide explicit reasoning and a confidence score between 0.50 and 0.95.
- Output ONLY valid JSON:
{
  "leadScore": 85,
  "qualificationStatus": "QUALIFIED",
  "serviceMatch": "AI agents",
  "urgency": "HIGH",
  "recommendedNextAction": "Schedule 30-min discovery call to map agent tool definitions and backend APIs.",
  "reasoningSummary": "Clear business problem regarding automated support queues, high organizational readiness, and immediate deployment timeline.",
  "confidence": 0.88
}
`;
        const res = await client.models.generateContent({
          model: this.defaultModel,
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.2 },
        });

        const parsed = JSON.parse(res.text || "{}");
        evaluation = {
          leadScore: Math.min(100, Math.max(0, parseInt(parsed.leadScore, 10) || 75)),
          qualificationStatus: this.validateStatus(parsed.qualificationStatus),
          serviceMatch: this.validateService(parsed.serviceMatch),
          urgency: this.validateUrgency(parsed.urgency),
          recommendedNextAction: parsed.recommendedNextAction || "Schedule initial technical discovery call.",
          reasoningSummary: parsed.reasoningSummary || "Evaluated by AI Qualification Agent based on fit and urgency.",
          confidence: parseFloat(parsed.confidence) || 0.85,
          model: this.defaultModel,
        };
      } catch (err: any) {
        logger.warn(`Gemini qualification fallback triggered: ${err.message}`, { module: "LeadQualificationAgent" });
        evaluation = this.evaluateConsultativeFallback(inputSnapshot);
      }
    } else {
      evaluation = this.evaluateConsultativeFallback(inputSnapshot);
    }

    // 4. Save into lead_qualification_history
    const historyRes = await db.query(
      `INSERT INTO lead_qualification_history (
        lead_id, model, input_snapshot, lead_score, qualification_status,
        service_match, urgency, recommended_next_action, reasoning_summary, confidence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;`,
      [
        leadId,
        evaluation.model,
        JSON.stringify(inputSnapshot),
        evaluation.leadScore,
        evaluation.qualificationStatus,
        evaluation.serviceMatch,
        evaluation.urgency,
        evaluation.recommendedNextAction,
        evaluation.reasoningSummary,
        evaluation.confidence,
      ]
    );

    const record = historyRes.rows[0];

    // 5. Update leads table
    const mappedLeadStatus =
      evaluation.qualificationStatus === "HIGH_INTENT"
        ? "QUALIFIED"
        : evaluation.qualificationStatus === "UNQUALIFIED"
        ? "LOST"
        : "NEW";

    await db.query(
      `UPDATE leads
       SET lead_score = $1,
           score = $1,
           lead_status = $2,
           qualification_urgency = $3,
           recommended_next_action = $4,
           service_interest = $5,
           updated_at = NOW()
       WHERE id = $6;`,
      [
        evaluation.leadScore,
        mappedLeadStatus,
        evaluation.urgency,
        evaluation.recommendedNextAction,
        evaluation.serviceMatch,
        leadId,
      ]
    );

    // 6. Log activity
    await db.query(
      `INSERT INTO crm_activities (
        lead_id, activity_type, subject, description, performed_at, metadata
      ) VALUES ($1, 'ai_qualification_completed', $2, $3, NOW(), $4);`,
      [
        leadId,
        `AI Qualified: ${evaluation.qualificationStatus} (${evaluation.leadScore}/100)`,
        `${evaluation.reasoningSummary}. Next Action: ${evaluation.recommendedNextAction}`,
        JSON.stringify({ evaluation, qualificationId: record.id }),
      ]
    );

    logger.info(`Lead [${leadId}] qualified as ${evaluation.qualificationStatus} (score: ${evaluation.leadScore})`, {
      module: "LeadQualificationAgent",
    });

    return {
      qualificationId: record.id,
      leadId,
      model: evaluation.model,
      leadScore: evaluation.leadScore,
      qualificationStatus: evaluation.qualificationStatus,
      serviceMatch: evaluation.serviceMatch,
      urgency: evaluation.urgency,
      recommendedNextAction: evaluation.recommendedNextAction,
      reasoningSummary: evaluation.reasoningSummary,
      confidence: evaluation.confidence,
      timestamp: record.created_at,
      isOverridden: false,
    };
  }

  /**
   * Human sales override of AI classification
   */
  public static async overrideQualification(
    qualificationId: string,
    override: HumanOverrideInput
  ): Promise<any> {
    const checkRes = await db.query(`SELECT * FROM lead_qualification_history WHERE id = $1;`, [qualificationId]);
    if (checkRes.rows.length === 0) {
      throw new Error(`Qualification record not found: ${qualificationId}`);
    }
    const qual = checkRes.rows[0];

    const newScore = override.overriddenScore !== undefined ? override.overriddenScore : qual.lead_score;

    const updateRes = await db.query(
      `UPDATE lead_qualification_history
       SET is_overridden = TRUE,
           overridden_status = $1,
           overridden_score = $2,
           overridden_by = $3,
           override_reason = $4,
           overridden_at = NOW()
       WHERE id = $5
       RETURNING *;`,
      [
        override.overriddenStatus,
        newScore,
        override.overriddenBy || null,
        override.overrideReason,
        qualificationId,
      ]
    );

    // Update lead record
    const mappedLeadStatus =
      override.overriddenStatus === "HIGH_INTENT"
        ? "QUALIFIED"
        : override.overriddenStatus === "UNQUALIFIED"
        ? "LOST"
        : "NEW";

    await db.query(
      `UPDATE leads
       SET lead_score = $1,
           score = $1,
           lead_status = $2,
           updated_at = NOW()
       WHERE id = $3;`,
      [newScore, mappedLeadStatus, qual.lead_id]
    );

    // Log activity
    await db.query(
      `INSERT INTO crm_activities (
        lead_id, activity_type, subject, description, performed_at, metadata
      ) VALUES ($1, 'lead_qualification_overridden', $2, $3, NOW(), $4);`,
      [
        qual.lead_id,
        `AI Qualification Overridden to ${override.overriddenStatus}`,
        `Sales staff overrode AI assessment. Reason: ${override.overrideReason}`,
        JSON.stringify({ previousStatus: qual.qualification_status, override }),
      ]
    );

    logger.info(`Lead [${qual.lead_id}] qualification overridden to ${override.overriddenStatus}`, {
      module: "LeadQualificationAgent",
    });

    return updateRes.rows[0];
  }

  /**
   * Retrieve historical qualifications for a lead
   */
  public static async getQualificationHistory(leadId: string): Promise<any[]> {
    const res = await db.query(
      `SELECT * FROM lead_qualification_history WHERE lead_id = $1 ORDER BY created_at DESC;`,
      [leadId]
    );
    return res.rows;
  }

  private static evaluateConsultativeFallback(input: any): any {
    let score = 50;
    let urgency: QualificationUrgency = "MEDIUM";
    let status: QualificationStatus = "POTENTIAL";

    const problem = (input.business_problem || "").toLowerCase();
    const timeline = (input.timeline || "").toLowerCase();
    const budget = (input.budget_information || "").toLowerCase();

    // Check Problem Specificity
    if (problem.includes("automated") || problem.includes("agent") || problem.includes("integration") || problem.includes("scale") || problem.includes("invoice")) {
      score += 20;
    }
    // Check Timeline
    if (timeline.includes("immediate") || timeline.includes("30 days") || timeline.includes("now") || timeline.includes("urgent")) {
      score += 15;
      urgency = "HIGH";
    }
    // Check Budget
    if (budget.includes("$") || budget.includes("approved") || budget.includes("allocated") || budget.includes("50k")) {
      score += 15;
    }

    if (score >= 80) {
      status = urgency === "HIGH" ? "HIGH_INTENT" : "QUALIFIED";
    } else if (score >= 60) {
      status = "POTENTIAL";
    } else {
      status = "UNQUALIFIED";
      urgency = "LOW";
    }

    const serviceMatch = this.validateService(input.requested_service);

    return {
      leadScore: score,
      qualificationStatus: status,
      serviceMatch,
      urgency,
      recommendedNextAction:
        status === "HIGH_INTENT"
          ? "Immediate 30-min discovery session with Enterprise Solutions Architect."
          : status === "QUALIFIED"
          ? "Schedule technical scoping call to define integration milestones."
          : "Send technical case studies and qualification questionnaire.",
      reasoningSummary: `Deterministic heuristic analysis based on problem clarity (${score >= 70 ? "High" : "Moderate"}), timeline readiness (${urgency}), and service fit.`,
      confidence: 0.85,
      model: "IMPACT-Consultative-Evaluation-v1",
    };
  }

  private static validateStatus(val?: string): QualificationStatus {
    const valid: QualificationStatus[] = ["UNQUALIFIED", "POTENTIAL", "QUALIFIED", "HIGH_INTENT"];
    const found = valid.find((s) => s === val);
    return found || "POTENTIAL";
  }

  private static validateUrgency(val?: string): QualificationUrgency {
    const valid: QualificationUrgency[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const found = valid.find((u) => u === val);
    return found || "MEDIUM";
  }

  private static validateService(service?: string): string {
    if (!service) return CORE_SERVICES[1].name;
    const match = IMPACT_SERVICES.find((s) => s.toLowerCase() === service.toLowerCase());
    return match || CORE_SERVICES[1].name;
  }
}
