import { conversationRepository } from "../database/repositories/conversationRepository";
import { customerRepository } from "../database/repositories/customerRepository";
import { leadRepository } from "../database/repositories/leadRepository";
import { geminiClient } from "./geminiClient";
import { promptService } from "./promptService";
import { qualificationEngine } from "./qualificationEngine";
import { ChatMessage, ConversationTurnResult, LeadQualificationState, ToolCall, ToolResult } from "./types";
import { toolDispatcher } from "./tools/toolDispatcher";
import { bantEngine } from "../sales/bantEngine";
import { dealStageEngine } from "../sales/dealStageEngine";
import { db } from "../database";
import { logger } from "../logging/logger";

export class ConversationService {
  /**
   * Get an existing conversation or create a new one
   */
  public async getOrCreateConversation(
    conversationId?: string,
    customerId?: string,
    channel = "website_chat"
  ): Promise<{ id: string; customerId: string }> {
    if (conversationId) {
      const existing = await conversationRepository.findById(conversationId);
      if (existing) {
        return { id: existing.id, customerId: existing.customer_id };
      }
    }

    // If no customer ID provided, create an anonymous/provisional customer
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const anonEmail = `visitor-${Date.now().toString(36)}@impact-visitor.internal`;
      const customer = await customerRepository.upsert({
        name: "Website Visitor",
        email: anonEmail,
        source: channel,
      });
      resolvedCustomerId = customer.id;
    }

    const conversation = await conversationRepository.create({
      customerId: resolvedCustomerId,
      channel,
      metadata: { initiatedAt: new Date().toISOString() },
    });

    // Create an agent_session record in database
    await db.query(
      `INSERT INTO agent_sessions (conversation_id, agent_type, status)
       VALUES ($1, 'IMPACT_SALES_AGENT', 'active');`,
      [conversation.id]
    );

    return { id: conversation.id, customerId: resolvedCustomerId };
  }

  /**
   * Process incoming user message and generate grounded AI response
   */
  public async processMessage(params: {
    conversationId?: string;
    userMessage: string;
    customerId?: string;
    channel?: string;
  }): Promise<ConversationTurnResult> {
    const { userMessage, channel = "website_chat" } = params;
    const { id: conversationId, customerId } = await this.getOrCreateConversation(
      params.conversationId,
      params.customerId,
      channel
    );

    logger.info(`Processing message in conversation ${conversationId}: "${userMessage.slice(0, 50)}..."`, {
      module: "ConversationService",
    });

    // 1. Persist user message in DB
    const userMsgRecord = await conversationRepository.addMessage({
      conversationId,
      senderType: "customer",
      content: userMessage,
    });

    // 2. Fetch recent conversation history (last 10 turns)
    const dbMessages = await conversationRepository.getMessages(conversationId, 10);
    const history: ChatMessage[] = dbMessages.map((m) => ({
      id: m.id,
      role: m.sender_type === "customer" ? "user" : "model",
      content: m.content,
      timestamp: m.created_at,
    }));

    // 3. Build system instruction with dynamic knowledge grounding
    const { instruction, citations, isOutOfScope } = await promptService.buildSystemInstruction(userMessage);

    // 4. Call Gemini Engine
    const aiResponse = await geminiClient.generateContent(history, {
      systemInstruction: instruction,
      temperature: 0.2,
    });

    // 5. Dispatch any triggered AI Tools
    const toolResults: ToolResult[] = [];
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      for (const call of aiResponse.toolCalls) {
        const execResult = await toolDispatcher.executeTool(call.name, call.args, {
          conversationId,
          customerId,
          channel,
        });
        toolResults.push({
          toolCallId: call.id,
          name: call.name,
          result: execResult,
        });

        // Supplement citations if tool returned citations
        if (execResult.success && execResult.data) {
          const d = execResult.data as any;
          if (Array.isArray(d.citations)) {
            for (const cit of d.citations) {
              if (!citations.includes(cit)) {
                citations.push(cit);
              }
            }
          }
        }
      }
    }

    // 6. Synthesize reply if needed
    let finalContent = aiResponse.content;
    if (!finalContent || finalContent.trim().length === 0) {
      if (toolResults.length > 0) {
        const summaries: string[] = [];
        for (const tr of toolResults) {
          const res = tr.result as any;
          if (tr.name === "captureLead" && res.success) {
            summaries.push(res.data?.summary || "Your requirements have been recorded in our CRM.");
          } else if (tr.name === "lookupService" && res.success) {
            const matches = res.data?.matches || [];
            if (matches.length > 0) {
              summaries.push("Here are the verified capabilities from our catalog:\n" + matches.map((m: any) => `• **${m.title}**: ${m.summary}`).join("\n"));
            }
          } else if (tr.name === "queryCaseStudy" && res.success) {
            const studies = res.data?.caseStudies || [];
            if (studies.length > 0) {
              summaries.push("Here is verified case study data from our portfolio:\n" + studies.map((s: any) => `• **${s.title}**: ${s.summary}`).join("\n"));
            }
          } else if (tr.name === "checkAppointmentAvailability" && res.success) {
            const slots = res.data?.availableSlots || [];
            summaries.push(`Available consultation times on ${res.data?.targetDate} (${res.data?.timezone}):\n` + slots.map((s: any) => `• ${s.time}`).join("\n"));
          } else if (tr.name === "bookAppointment" && res.success) {
            summaries.push(`Your technical discovery consultation has been confirmed!\n• **Start Time**: ${new Date(res.data?.startTime).toUTCString()}\n• **Meeting Room**: ${res.data?.meetingLink}\n• [Add to Google Calendar](${res.data?.googleCalendarUrl})\n• [Download .ICS Invite](${res.data?.icsDownloadUrl})`);
          } else if (tr.name === "triggerHumanHandoff" && res.success) {
            summaries.push(res.data?.message || "I have escalated your conversation to an engineering director.");
          }
        }
        finalContent = (aiResponse.isMock ? "[DEVELOPMENT MOCK: Gemini AI Engine]\n" : "") + summaries.join("\n\n");
      } else {
        finalContent = "I received your request. How may I assist you with your software and AI initiatives?";
      }
    }

    // 7. Persist AI response message in DB with tool calls and results
    const aiMsgRecord = await conversationRepository.addMessage({
      conversationId,
      senderType: "ai_agent",
      content: finalContent,
      toolCalls: aiResponse.toolCalls && aiResponse.toolCalls.length > 0 ? aiResponse.toolCalls : undefined,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
    });

    // Record agent action in DB
    const sessionRes = await db.query(
      "SELECT id FROM agent_sessions WHERE conversation_id = $1 ORDER BY started_at DESC LIMIT 1;",
      [conversationId]
    );
    let sessionId = sessionRes.rows[0]?.id;
    if (!sessionId) {
      const newSession = await db.query(
        `INSERT INTO agent_sessions (conversation_id, agent_type, status)
         VALUES ($1, 'IMPACT_SALES_AGENT', 'active')
         RETURNING id;`,
        [conversationId]
      );
      sessionId = newSession.rows[0]?.id;
    }

    if (sessionId) {
      await db.query(
        `INSERT INTO agent_actions (session_id, tool_name, input_arguments, execution_result, execution_duration_ms, is_success)
         VALUES ($1, 'generate_sales_response', $2, $3, $4, TRUE);`,
        [
          sessionId,
          JSON.stringify({ query: userMessage, toolCalls: aiResponse.toolCalls }),
          JSON.stringify({ citations, isMock: aiResponse.isMock, toolResultsCount: toolResults.length }),
          120,
        ]
      );
    }

    // 6. Run qualification engine over all conversation messages
    const fullConversationText = dbMessages.map((m) => m.content).join("\n") + "\n" + userMessage;
    const qualification = qualificationEngine.extractSignals(fullConversationText);

    // 7. If contact info extracted, update customer, sync lead, record BANT breakdown & progress deal stage
    if (qualification.email && qualification.email !== "visitor@impact-visitor.internal") {
      try {
        const updatedCustomer = await customerRepository.upsert({
          name: qualification.name || "Enterprise Lead",
          email: qualification.email,
          phone: qualification.phone,
          source: channel,
        });

        // Compute comprehensive BANT score
        const bant = bantEngine.computeBantScore({
          name: qualification.name,
          email: qualification.email,
          phone: qualification.phone,
          company: qualification.company,
          text: fullConversationText,
          rawBudget: qualification.budget,
          rawTimeline: qualification.timeline,
          problem: qualification.problem,
        });

        // Create or update lead
        let leadId: string;
        const existingLeads = await leadRepository.findByCustomerId(updatedCustomer.id);
        if (existingLeads.length === 0) {
          const newLead = await leadRepository.create({
            customerId: updatedCustomer.id,
            conversationId,
            proposedSolution: qualification.solution || "AI & Software Scoping",
            problemStatement: qualification.problem || "Initial inquiry",
            budgetRange: bant.budgetFormatted,
            timeline: bant.timelineFormatted,
            decisionMakerStatus: bant.authorityLevel,
            stage: "NEW",
            score: bant.compositeScore,
          });
          leadId = newLead.id;
        } else {
          leadId = existingLeads[0].id;
        }

        // Record BANT score breakdown in database
        await leadRepository.recordScore({
          leadId,
          fitScore: bant.needScore,
          clarityScore: qualification.problem ? 80 : 40,
          timelineScore: bant.timelineScore,
          budgetScore: bant.budgetScore,
          authorityScore: bant.authorityScore,
          reasoning: bant.reasoning,
        });

        // Evaluate deal stage advancement
        const currentLead = await leadRepository.findById(leadId);
        if (currentLead) {
          const auto = dealStageEngine.evaluateAutoAdvancement(
            currentLead.stage as any,
            bant,
            true
          );
          if (auto.shouldAdvance && auto.nextStage) {
            await dealStageEngine.transitionStage({
              leadId,
              targetStage: auto.nextStage,
              actorType: "AI",
              actorId: "BantEngine",
              reason: auto.reason,
            });
            qualification.stage = auto.nextStage;
          }
        }
      } catch (err: any) {
        logger.warn(`Failed to auto-sync lead in qualification: ${err.message}`, { module: "ConversationService" });
      }
    }

    // 8. Human handoff escalation detection
    if (
      userMessage.includes("[HUMAN HANDOFF REQUESTED]") ||
      userMessage.toLowerCase().includes("speak with a human") ||
      userMessage.toLowerCase().includes("talk to a human") ||
      userMessage.toLowerCase().includes("human agent") ||
      userMessage.toLowerCase().includes("escalate to human")
    ) {
      await conversationRepository.updateStatus(conversationId, "human_handoff_requested");
      logger.info(`Conversation ${conversationId} status escalated to 'human_handoff_requested'`, {
        module: "ConversationService",
      });
    }

    return {
      conversationId,
      messageId: aiMsgRecord.id,
      userMessage,
      reply: finalContent,
      isMock: aiResponse.isMock,
      citations,
      qualification,
      toolCalls: aiResponse.toolCalls && aiResponse.toolCalls.length > 0 ? aiResponse.toolCalls : undefined,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieve conversation history
   */
  public async getHistory(conversationId: string): Promise<ChatMessage[]> {
    const records = await conversationRepository.getMessages(conversationId);
    return records.map((r) => ({
      id: r.id,
      role: r.sender_type === "customer" ? "user" : "model",
      content: r.content,
      timestamp: r.created_at,
    }));
  }
}

export const conversationService = new ConversationService();
