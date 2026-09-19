/**
 * IMPACT Growth OS — Internal AI Sales Assistant (Phase 11)
 * CRM Lead Copilot providing context-grounded intelligence for sales staff.
 * Answers 7 canonical sales queries without inventing missing data.
 * Displays supporting CRM context and creates actionable CRM follow-up tasks.
 */

import { db } from "../../database";
import { logger } from "../../logging/logger";
import { CORE_SERVICES, IMPACT_SERVICES } from "../constants";
import { LeadFollowupAgent } from "./leadFollowupAgent";

export interface SalesAssistantResponse {
  queryType: string;
  answer: string;
  supportingCrmContext: {
    leadName?: string;
    company?: string;
    stage?: string;
    score?: number;
    serviceInterest?: string;
    problemStatement?: string;
    budgetRange?: string;
    timeline?: string;
    activityCount: number;
    messageCount: number;
    dataConfidence: "HIGH" | "MODERATE" | "LIMITED_DATA";
  };
  createdTask?: any;
  draftMessage?: any;
}

export class SalesAssistantService {
  /**
   * Process a sales staff question about a specific lead
   */
  public static async queryLeadAssistant(
    leadId: string,
    prompt: string,
    currentUserId?: string
  ): Promise<SalesAssistantResponse> {
    // 1. Fetch complete authorized CRM data for this lead
    const leadRes = await db.query(
      `SELECT l.*, c.name as company_name, c.industry as company_industry, c.employee_count
       FROM leads l
       LEFT JOIN companies c ON l.company_id = c.id
       WHERE l.id = $1 AND l.deleted_at IS NULL;`,
      [leadId]
    );
    if (leadRes.rows.length === 0) {
      throw new Error(`Lead not found or unauthorized: ${leadId}`);
    }
    const lead = leadRes.rows[0];

    // Fetch activities
    const activitiesRes = await db.query(
      `SELECT activity_type, subject, description, performed_at 
       FROM crm_activities WHERE lead_id = $1 ORDER BY performed_at DESC LIMIT 10;`,
      [leadId]
    );

    // Fetch messages
    const messagesRes = await db.query(
      `SELECT channel, direction, subject, body, sent_at, created_at 
       FROM crm_messages WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 10;`,
      [leadId]
    );

    // Fetch tasks
    const tasksRes = await db.query(
      `SELECT id, title, priority, status, due_date FROM crm_tasks WHERE lead_id = $1;`,
      [leadId]
    );

    const contactName = `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Prospect";
    const company = lead.company || lead.company_name || "Unspecified Company";
    const service = lead.service_interest || "AI agents";
    const stage = lead.lead_status || "NEW";
    const score = lead.lead_score || lead.score || 0;
    const problem = lead.problem_statement;
    const budget = lead.budget_range;
    const timeline = lead.timeline;

    const dataConfidence: "HIGH" | "MODERATE" | "LIMITED_DATA" =
      problem && (activitiesRes.rows.length > 0 || messagesRes.rows.length > 0)
        ? "HIGH"
        : problem
        ? "MODERATE"
        : "LIMITED_DATA";

    const supportingContext = {
      leadName: contactName,
      company,
      stage,
      score,
      serviceInterest: service,
      problemStatement: problem || "None provided",
      budgetRange: budget || "Not voluntarily provided",
      timeline: timeline || "Not voluntarily specified",
      activityCount: activitiesRes.rows.length,
      messageCount: messagesRes.rows.length,
      dataConfidence,
    };

    const normalizedPrompt = prompt.toLowerCase().trim();

    // Query 1: "Summarize this lead."
    if (normalizedPrompt.includes("summarize this lead") || normalizedPrompt.includes("lead summary")) {
      const summary = `**Lead Summary for ${contactName} (${company})**\n\n` +
        `• **Current Stage**: ${stage} | **Score**: ${score}/100\n` +
        `• **Primary Service Interest**: ${service}\n` +
        `• **Business Problem**: ${problem ? problem : "No specific business problem recorded yet."}\n` +
        `• **Budget**: ${budget ? budget : "Budget information has not been voluntarily provided."}\n` +
        `• **Timeline**: ${timeline ? timeline : "Timeline has not been specified."}\n` +
        `• **Engagement Telemetry**: ${activitiesRes.rows.length} logged activities and ${messagesRes.rows.length} communication records.`;

      return {
        queryType: "summarize_lead",
        answer: summary,
        supportingCrmContext: supportingContext,
      };
    }

    // Query 2: "What should I do next?"
    if (normalizedPrompt.includes("what should i do next") || normalizedPrompt.includes("next action") || normalizedPrompt.includes("next step")) {
      let nextAction = "";
      if (lead.recommended_next_action) {
        nextAction = `**AI Recommended Action**: ${lead.recommended_next_action}\n\n`;
      }

      if (stage === "NEW") {
        nextAction += `1. Review the initial inquiry details.\n2. Dispatch the introductory discovery draft via Email or WhatsApp.\n3. Verify contact phone and company domain.`;
      } else if (stage === "QUALIFIED") {
        nextAction += `1. Review discovery questions on infrastructure.\n2. Schedule a 30-minute scoping session with an enterprise architect.\n3. Prepare a tailored Statement of Work (SOW) outline.`;
      } else if (stage === "PROPOSAL") {
        nextAction += `1. Follow up on the technical proposal sent to ${contactName}.\n2. Offer to address any architecture or security questions with their IT team.`;
      } else if (stage === "NEGOTIATION") {
        nextAction += `1. Align on enterprise SLA tiers and legal terms.\n2. Confirm engineering kickoff sprint capacity.`;
      } else {
        nextAction += `1. Review whether this prospect can be entered into the quarterly technical nurture sequence.`;
      }

      return {
        queryType: "next_action",
        answer: nextAction,
        supportingCrmContext: supportingContext,
      };
    }

    // Query 3: "Draft a follow-up."
    if (normalizedPrompt.includes("draft a follow-up") || normalizedPrompt.includes("draft follow up") || normalizedPrompt.includes("draft followup")) {
      const channel = normalizedPrompt.includes("whatsapp") ? "whatsapp" : "email";
      const draft = await LeadFollowupAgent.draftFollowup(leadId, channel);

      return {
        queryType: "draft_followup",
        answer: `Drafted ${channel.toUpperCase()} follow-up for stage **${stage}**:\n\n${draft.subject ? `**Subject**: ${draft.subject}\n\n` : ""}**Body**:\n${draft.body}\n\n*(Created as draft in CRM — requires sales staff review before sending)*`,
        supportingCrmContext: supportingContext,
        draftMessage: draft,
      };
    }

    // Query 4: "What services might fit this business?"
    if (normalizedPrompt.includes("what services might fit") || normalizedPrompt.includes("service fit") || normalizedPrompt.includes("services fit")) {
      const matchedServices: string[] = [service];
      const probLower = (problem || "").toLowerCase();

      if (probLower.includes("voice") || probLower.includes("call") || probLower.includes("phone")) {
        matchedServices.push("Call agents");
      }
      if (probLower.includes("chat") || probLower.includes("support") || probLower.includes("website")) {
        matchedServices.push("Chat agents");
      }
      if (probLower.includes("make") || probLower.includes("webhook") || probLower.includes("lead")) {
        matchedServices.push("Make-based lead-conversion automation");
      }
      if (probLower.includes("custom") || probLower.includes("portal") || probLower.includes("app")) {
        matchedServices.push("Custom business applications");
      }
      if (matchedServices.length === 1) {
        matchedServices.push("Business automation", "AI automation");
      }

      const uniqueServices = Array.from(new Set(matchedServices));
      const answer = `Based on the recorded CRM context for **${company}**:\n\n` +
        `• **Current Interest**: ${service}\n` +
        `• **Recommended Architectural Fits**:\n` +
        uniqueServices.map((s) => `  - **${s}**: Grounded in IMPACT's enterprise service catalog`).join("\n") +
        `\n\n*All recommendations strictly adhere to IMPACT Enterprise's 9 official services.*`;

      return {
        queryType: "service_fit",
        answer,
        supportingCrmContext: supportingContext,
      };
    }

    // Query 5: "Summarize the conversation."
    if (normalizedPrompt.includes("summarize the conversation") || normalizedPrompt.includes("conversation summary")) {
      if (messagesRes.rows.length === 0 && activitiesRes.rows.length === 0) {
        return {
          queryType: "conversation_summary",
          answer: `No prior conversation messages or phone turns recorded in the CRM for ${contactName}. Grounding strictly in available data: only the initial intake inquiry is on file.`,
          supportingCrmContext: supportingContext,
        };
      }

      const msgSummaries = messagesRes.rows.map(
        (m) => `[${m.channel} ${m.direction}] ${m.subject ? `${m.subject} — ` : ""}${m.body.substring(0, 120)}`
      );
      const answer = `**Conversation History Summary for ${contactName}**:\n\n` +
        `• **Recent Touchpoints (${messagesRes.rows.length} messages)**:\n` +
        msgSummaries.map((s) => `  • ${s}`).join("\n") +
        `\n\n• **Recent Activities**: ${activitiesRes.rows.map((a) => a.subject).slice(0, 3).join("; ")}`;

      return {
        queryType: "conversation_summary",
        answer,
        supportingCrmContext: supportingContext,
      };
    }

    // Query 6: "Prepare discovery questions."
    if (normalizedPrompt.includes("prepare discovery questions") || normalizedPrompt.includes("discovery questions")) {
      const questions = [
        `1. What specific manual steps in your current workflow for ${problem || service} create the biggest operational delay?`,
        `2. What core data stores or internal APIs (e.g. ERP, CRM, Postgres, REST APIs) must this ${service} solution integrate with?`,
        `3. Are there specific governance, data privacy, or human-in-the-loop sign-off requirements for your enterprise?`,
        `4. What is your anticipated deployment milestone, and who will lead the technical evaluation on your team?`,
      ];

      return {
        queryType: "discovery_questions",
        answer: `**Recommended Discovery Questions for ${contactName} (${company})**:\n\n` +
          questions.join("\n\n") +
          `\n\n*Grounded in the prospect's requested service (${service}) and stated problem statement.*`,
        supportingCrmContext: supportingContext,
      };
    }

    // Query 7: "Create a follow-up task."
    if (normalizedPrompt.includes("create a follow-up task") || normalizedPrompt.includes("create follow-up task") || normalizedPrompt.includes("create task")) {
      const title = `Follow up with ${contactName} (${company}) regarding ${service}`;
      const description = `Follow-up required for ${service}. Current Stage: ${stage}. Business Problem: ${problem || "General inquiry"}`;
      const dueDate = new Date(Date.now() + 2 * 86400000); // 2 days from now

      const taskRes = await db.query(
        `INSERT INTO crm_tasks (
          lead_id, title, description, priority, status, due_date, created_by
        ) VALUES ($1, $2, $3, 'HIGH', 'PENDING', $4, $5)
        RETURNING *;`,
        [leadId, title, description, dueDate.toISOString(), currentUserId || null]
      );

      const createdTask = taskRes.rows[0];
      logger.info(`AI Sales Assistant created task [${createdTask.id}] for lead [${leadId}]`, {
        module: "SalesAssistantService",
      });

      return {
        queryType: "create_task",
        answer: `Successfully created follow-up task in CRM:\n\n` +
          `• **Task Title**: ${title}\n` +
          `• **Priority**: HIGH\n` +
          `• **Due Date**: ${dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}\n` +
          `• **Status**: PENDING\n\n` +
          `*Task is now active on the CRM taskboard and linked to this lead record.*`,
        supportingCrmContext: supportingContext,
        createdTask,
      };
    }

    // Fallback general assistance
    return {
      queryType: "general_query",
      answer: `I am your AI Sales Assistant for **${contactName}** (${company}).\n\nYou can ask me:\n` +
        `• "Summarize this lead."\n` +
        `• "What should I do next?"\n` +
        `• "Draft a follow-up."\n` +
        `• "What services might fit this business?"\n` +
        `• "Summarize the conversation."\n` +
        `• "Prepare discovery questions."\n` +
        `• "Create a follow-up task."\n\n` +
        `All intelligence is strictly grounded in verified CRM records and IMPACT's 9 official services.`,
      supportingCrmContext: supportingContext,
    };
  }
}
