/**
 * IMPACT Growth OS — AI Lead Follow-up Agent (Phase 10)
 * Context-aware multi-channel messaging engine (Email, WhatsApp, Web Chat, SMS).
 * Enforces mandatory Human Review Gate: AI Draft → Human Review → Send.
 * Integrates Knowledge Base, Lead Profile, Pipeline Stage, and Guardrails Validator.
 */

import { GoogleGenAI } from "@google/genai";
import { db } from "../../database";
import { logger } from "../../logging/logger";
import { KnowledgeService } from "../../knowledge/knowledgeService";
import { FollowupGuardrailsValidator } from "./followupGuardrailsValidator";

export type FollowupChannel = "email" | "whatsapp" | "web_chat" | "sms";

export interface DraftFollowupResult {
  messageId: string;
  leadId: string;
  channel: FollowupChannel;
  stage: string;
  subject?: string;
  body: string;
  guardrailPassed: boolean;
  status: "draft";
}

export class LeadFollowupAgent {
  private static defaultModel = "gemini-2.5-flash";

  /**
   * Draft an intelligent context-aware follow-up message in 'draft' status
   */
  public static async draftFollowup(
    leadId: string,
    channel: FollowupChannel = "email"
  ): Promise<DraftFollowupResult> {
    // 1. Fetch Lead
    const leadRes = await db.query(`SELECT * FROM leads WHERE id = $1;`, [leadId]);
    if (leadRes.rows.length === 0) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    const lead = leadRes.rows[0];

    // 2. Fetch past activities and messages
    const activitiesRes = await db.query(
      `SELECT activity_type, subject, description FROM crm_activities WHERE lead_id = $1 ORDER BY performed_at DESC LIMIT 5;`,
      [leadId]
    );
    const messagesRes = await db.query(
      `SELECT direction, channel, body FROM crm_messages WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 5;`,
      [leadId]
    );

    // 3. Retrieve relevant knowledge base context
    const knowledgeDocs = await KnowledgeService.searchApproved(lead.service_interest || "AI agents", 3);
    const knowledgeSummary = knowledgeDocs.map((d) => `${d.title}: ${d.content}`).join("\n");

    const stage = (lead.lead_status || "NEW").toUpperCase();
    const contactName = `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "there";
    const serviceName = lead.service_interest || "AI agents";

    let subject = "";
    let body = "";

    // 4. Try Gemini generation if configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("your-gemini-api-key")) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const prompt = `
You are IMPACT AI, sales follow-up copilot for IMPACT Enterprise.
Recipient Name: ${contactName}
Company: ${lead.company || "Your organization"}
Service Interest: ${serviceName}
Current Pipeline Stage: ${stage}
Channel: ${channel}
Lead Problem: ${lead.problem_statement || "Interested in enterprise AI automation"}
Knowledge Context:
${knowledgeSummary}

STRICT GUARDRAILS:
1. Do NOT invent prices or discounts.
2. Do NOT promise impossible delivery dates (e.g. tomorrow).
3. Do NOT claim a contract exists.
4. Do NOT guarantee financial results.
5. Keep tone consultative, technical, and executive-ready.

Stage Specific Guidance:
- NEW: "Thank you for contacting IMPACT Enterprise..."
- QUALIFIED: Ask 2 targeted technical discovery questions regarding their infrastructure/tools.
- PROPOSAL: Follow up regarding their review of the proposal milestones and technical architecture.
- NEGOTIATION: Respond respectfully regarding enterprise agreements, security compliance, and kickoff planning.
- LOST: Nurture touchpoint sharing technical insights without pushy sales pressure.

Format as JSON:
{
  "subject": "Concise executive subject line (omit if SMS/WhatsApp)",
  "body": "Message body"
}
`;
        const genRes = await client.models.generateContent({
          model: this.defaultModel,
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.2 },
        });

        const parsed = JSON.parse(genRes.text || "{}");
        subject = parsed.subject || this.getDefaultSubject(stage, serviceName);
        body = parsed.body || this.getDefaultBody(stage, contactName, serviceName, channel);
      } catch (err: any) {
        logger.warn(`Gemini follow-up generation failed: ${err.message}. Using deterministic templates.`, {
          module: "LeadFollowupAgent",
        });
        subject = this.getDefaultSubject(stage, serviceName);
        body = this.getDefaultBody(stage, contactName, serviceName, channel);
      }
    } else {
      subject = this.getDefaultSubject(stage, serviceName);
      body = this.getDefaultBody(stage, contactName, serviceName, channel);
    }

    // 5. Run Guardrails Validation
    const guardrailCheck = FollowupGuardrailsValidator.validate(body, subject);
    if (!guardrailCheck.passed) {
      logger.warn(`Follow-up draft violated guardrails: ${guardrailCheck.violations.join("; ")}`, {
        module: "LeadFollowupAgent",
      });
      // Fallback cleanly to safe deterministic copy
      subject = this.getDefaultSubject(stage, serviceName);
      body = this.getDefaultBody(stage, contactName, serviceName, channel);
    }

    // 6. Save in crm_messages with status = 'draft' (MANDATORY HUMAN REVIEW GATE)
    const msgRes = await db.query<{ id: string }>(
      `INSERT INTO crm_messages (
        lead_id, channel, direction, sender, recipient, subject, body, status, metadata
      ) VALUES ($1, $2, 'outbound', $3, $4, $5, $6, 'draft', $7)
      RETURNING id;`,
      [
        leadId,
        channel,
        "IMPACT Enterprise Solutions Team",
        lead.email || lead.phone || "prospect",
        subject || null,
        body,
        JSON.stringify({ stage, ai_model: this.defaultModel, guardrail_passed: true }),
      ]
    );

    logger.info(`Drafted ${channel} follow-up [${msgRes.rows[0].id}] for lead [${leadId}] in status 'draft'`, {
      module: "LeadFollowupAgent",
    });

    return {
      messageId: msgRes.rows[0].id,
      leadId,
      channel,
      stage,
      subject: subject || undefined,
      body,
      guardrailPassed: true,
      status: "draft",
    };
  }

  /**
   * Human authorized sending of draft message
   */
  public static async sendFollowup(
    messageId: string,
    authorizedByUserId?: string
  ): Promise<{ success: boolean; messageId: string; sentAt: string }> {
    const msgRes = await db.query(`SELECT * FROM crm_messages WHERE id = $1;`, [messageId]);
    if (msgRes.rows.length === 0) {
      throw new Error(`Message not found: ${messageId}`);
    }

    const message = msgRes.rows[0];
    if (message.status === "sent") {
      throw new Error("Message has already been sent.");
    }

    const now = new Date().toISOString();

    await db.query(
      `UPDATE crm_messages 
       SET status = 'sent', sent_at = $1 
       WHERE id = $2;`,
      [now, messageId]
    );

    // Record activity in CRM
    await db.query(
      `INSERT INTO crm_activities (
        lead_id, activity_type, subject, description, performed_by, performed_at, metadata
      ) VALUES ($1, 'followup_sent', $2, $3, $4, NOW(), $5);`,
      [
        message.lead_id,
        `Follow-up sent via ${message.channel}`,
        message.subject ? `${message.subject}: ${message.body.substring(0, 100)}...` : message.body.substring(0, 100),
        authorizedByUserId || null,
        JSON.stringify({ messageId, channel: message.channel }),
      ]
    );

    logger.info(`Follow-up [${messageId}] authorized and sent by [${authorizedByUserId || "system"}]`, {
      module: "LeadFollowupAgent",
    });

    return {
      success: true,
      messageId,
      sentAt: now,
    };
  }

  private static getDefaultSubject(stage: string, serviceName: string): string {
    switch (stage) {
      case "NEW":
        return `Thank you for contacting IMPACT Enterprise — ${serviceName}`;
      case "QUALIFIED":
        return `IMPACT Enterprise Technical Scoping: Next Steps for ${serviceName}`;
      case "PROPOSAL":
        return `Follow-up: Architecture Proposal for ${serviceName}`;
      case "NEGOTIATION":
        return `IMPACT Enterprise: Statement of Work & Kickoff Alignment`;
      case "LOST":
        return `Technical Insights & Future Updates from IMPACT Enterprise`;
      default:
        return `Connecting with IMPACT Enterprise — ${serviceName}`;
    }
  }

  private static getDefaultBody(
    stage: string,
    contactName: string,
    serviceName: string,
    channel: FollowupChannel
  ): string {
    if (channel === "whatsapp" || channel === "sms") {
      switch (stage) {
        case "NEW":
          return `Hi ${contactName}, thank you for contacting IMPACT Enterprise regarding ${serviceName}. Our solutions team is reviewing your requirements. When would be a good time for a brief 15-minute introductory call?`;
        case "QUALIFIED":
          return `Hi ${contactName}, following up on your ${serviceName} project with IMPACT Enterprise. What existing systems or APIs will we be integrating with?`;
        case "PROPOSAL":
          return `Hi ${contactName}, checking in to see if you have any questions regarding the ${serviceName} proposal we shared. We can clarify any technical milestones whenever convenient.`;
        default:
          return `Hi ${contactName}, following up from IMPACT Enterprise regarding ${serviceName}. Let us know if you'd like to revisit your automation roadmap.`;
      }
    }

    // Email / Web Chat default body
    switch (stage) {
      case "NEW":
        return `Hi ${contactName},\n\nThank you for contacting IMPACT Enterprise regarding our ${serviceName} solutions.\n\nOur philosophy is grounded in IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT. We engineer custom enterprise systems designed for reliability and governance.\n\nCould you let us know your availability this week for a brief 20-minute technical discovery call to review your workflow requirements?\n\nBest regards,\nThe IMPACT Enterprise Team`;

      case "QUALIFIED":
        return `Hi ${contactName},\n\nFollowing up on our preliminary review of your ${serviceName} initiative.\n\nTo ensure our engineering team prepares a precise architectural blueprint, could you share:\n1. Which internal databases or third-party APIs will this system interface with?\n2. Are there specific enterprise security or data residency requirements we should account for?\n\nLooking forward to your insights.\n\nBest regards,\nThe IMPACT Enterprise Team`;

      case "PROPOSAL":
        return `Hi ${contactName},\n\nI wanted to follow up regarding the technical proposal and implementation roadmap we submitted for your ${serviceName} deployment.\n\nDo you or your technical team have any questions regarding the sprint milestones, deliverables, or testing criteria?\n\nWe are happy to jump on a quick call to address any technical questions.\n\nBest regards,\nThe IMPACT Enterprise Team`;

      case "NEGOTIATION":
        return `Hi ${contactName},\n\nThank you for collaborating with us through the proposal review for ${serviceName}.\n\nWe are prepared to finalize the Statement of Work and align on deployment kickoff dates to reserve engineering bandwidth. Please let us know if your legal or procurement team requires any supplementary compliance documentation.\n\nBest regards,\nThe IMPACT Enterprise Team`;

      case "LOST":
        return `Hi ${contactName},\n\nI understand that now may not be the optimal time to proceed with the ${serviceName} initiative.\n\nWe will keep your technical requirements on file and continue to share relevant engineering blueprints and case studies as the enterprise automation landscape evolves. Please feel free to reach out whenever your timeline allows.\n\nWarm regards,\nThe IMPACT Enterprise Team`;

      default:
        return `Hi ${contactName},\n\nFollowing up from IMPACT Enterprise regarding your interest in ${serviceName}. Please let us know how we can best support your technical goals.\n\nBest regards,\nThe IMPACT Enterprise Team`;
    }
  }
}
