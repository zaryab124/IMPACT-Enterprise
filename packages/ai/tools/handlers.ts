import {
  BookAppointmentArgs,
  CaptureLeadArgs,
  CheckAppointmentAvailabilityArgs,
  LookupServiceArgs,
  QueryCaseStudyArgs,
  ToolExecutionContext,
  TriggerHumanHandoffArgs,
} from "./types";
import {
  bookAppointmentSchema,
  captureLeadSchema,
  checkAppointmentAvailabilitySchema,
  lookupServiceSchema,
  queryCaseStudySchema,
  triggerHumanHandoffSchema,
} from "./schemas";
import { customerRepository } from "../../database/repositories/customerRepository";
import { leadRepository } from "../../database/repositories/leadRepository";
import { conversationRepository } from "../../database/repositories/conversationRepository";
import { knowledgeService } from "../../knowledge/knowledgeService";
import { appointmentService } from "../../appointments/appointmentService";
import { bantEngine } from "../../sales/bantEngine";
import { dealStageEngine } from "../../sales/dealStageEngine";
import { logger } from "../../logging/logger";

export const toolHandlers = {
  /**
   * Tool: captureLead
   */
  async captureLead(rawArgs: unknown, context: ToolExecutionContext = {}) {
    const args = captureLeadSchema.parse(rawArgs) as CaptureLeadArgs;

    // 1. Persist/update customer record
    const customer = await customerRepository.upsert({
      name: args.name,
      email: args.email,
      phone: args.phone,
      source: context.channel || "website_chat",
    });

    // 2. Compute BANT score
    const bant = bantEngine.computeBantScore({
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      problem: args.problem,
      rawBudget: args.budget,
      rawTimeline: args.timeline,
    });

    // 3. Create or update Lead record
    const existingLeads = await leadRepository.findByCustomerId(customer.id);
    let leadId: string;
    let initialStage: any = "NEW";

    if (existingLeads.length === 0) {
      const newLead = await leadRepository.create({
        customerId: customer.id,
        conversationId: context.conversationId,
        problemStatement: args.problem || "Initial inquiry via AI tool",
        proposedSolution: args.problem ? `Scoped solution for: ${args.problem}` : "AI & Software Scoping",
        budgetRange: bant.budgetFormatted,
        timeline: bant.timelineFormatted,
        decisionMakerStatus: bant.authorityLevel,
        stage: "NEW",
        score: bant.compositeScore,
      });
      leadId = newLead.id;
    } else {
      leadId = existingLeads[0].id;
      initialStage = existingLeads[0].stage;
    }

    // 4. Record BANT score
    await leadRepository.recordScore({
      leadId,
      fitScore: bant.needScore,
      clarityScore: args.problem ? 85 : 45,
      timelineScore: bant.timelineScore,
      budgetScore: bant.budgetScore,
      authorityScore: bant.authorityScore,
      reasoning: bant.reasoning,
    });

    // 5. Evaluate and execute deal stage progression
    let finalStage = initialStage;
    const auto = dealStageEngine.evaluateAutoAdvancement(initialStage, bant, true);
    if (auto.shouldAdvance && auto.nextStage) {
      await dealStageEngine.transitionStage({
        leadId,
        targetStage: auto.nextStage,
        actorType: "AI",
        actorId: "captureLeadTool",
        reason: auto.reason,
      });
      finalStage = auto.nextStage;
    }

    logger.info(`Lead captured via tool: ID=${leadId}, Customer=${customer.email}, Score=${bant.compositeScore}, Stage=${finalStage}`, {
      module: "ToolHandlers",
    });

    return {
      success: true,
      customerId: customer.id,
      leadId,
      dealStage: finalStage,
      bantScore: bant.compositeScore,
      classification: bant.classification,
      budgetTier: bant.budgetTier,
      authorityLevel: bant.authorityLevel,
      summary: `Lead profile for ${args.name} synchronized with CRM. Deal stage advanced to ${finalStage} (BANT score: ${bant.compositeScore}/100).`,
    };
  },

  /**
   * Tool: lookupService
   */
  async lookupService(rawArgs: unknown) {
    const args = lookupServiceSchema.parse(rawArgs) as LookupServiceArgs;
    const query = args.specificQuery ? `${args.serviceName} ${args.specificQuery}` : args.serviceName;

    const results = await knowledgeService.search(query, {
      category: "SERVICES",
      limit: 3,
    });

    const matches = results.documents.map((r) => ({
      title: r.document.title,
      summary: r.document.metadata?.summary || r.document.content.slice(0, 160),
      keyFacts: r.document.metadata?.keyPoints?.slice(0, 4) || [],
      score: r.score,
    }));

    return {
      success: true,
      query,
      totalMatches: matches.length,
      matches,
      citations: results.documents.map((r) => r.document.title),
    };
  },

  /**
   * Tool: queryCaseStudy
   */
  async queryCaseStudy(rawArgs: unknown) {
    const args = queryCaseStudySchema.parse(rawArgs) as QueryCaseStudyArgs;
    const query = args.slug === "all" ? "case study" : `case study ${args.slug.replace(/-/g, " ")}`;

    const results = await knowledgeService.search(query, {
      category: "CASE_STUDIES",
      limit: args.slug === "all" ? 4 : 2,
    });

    const caseStudies = results.documents.map((r) => {
      const facts = r.document.metadata?.keyPoints || [];
      return {
        title: r.document.title,
        summary: r.document.metadata?.summary || r.document.content.slice(0, 160),
        metrics: facts.filter((f: string) => f.includes("%") || f.includes("ms") || f.includes("$") || f.includes("x")),
        facts,
      };
    });

    return {
      success: true,
      slug: args.slug,
      caseStudies,
      citations: results.documents.map((r) => r.document.title),
    };
  },

  /**
   * Tool: checkAppointmentAvailability
   */
  async checkAppointmentAvailability(rawArgs: unknown) {
    const args = checkAppointmentAvailabilitySchema.parse(rawArgs || {}) as CheckAppointmentAvailabilityArgs;

    const targetDate = args.preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
    const tz = args.timezone || "UTC";

    const slotResult = await appointmentService.getAvailableSlots(targetDate, tz);

    const availableSlots = slotResult.availableSlots.map((s) => ({
      time: s.timeFormatted,
      iso: s.startTime,
    }));

    return {
      success: true,
      targetDate,
      timezone: tz,
      availableSlots,
      durationMinutes: 45,
      consultant: "IMPACT Enterprise Engineering Director",
      notice: "Slots are reserved temporarily. Final booking will be confirmed via calendar invitation upon selection.",
    };
  },

  /**
   * Tool: bookAppointment
   */
  async bookAppointment(rawArgs: unknown, context: ToolExecutionContext = {}) {
    const args = bookAppointmentSchema.parse(rawArgs) as BookAppointmentArgs;

    const booking = await appointmentService.bookConsultation({
      name: args.name,
      email: args.email,
      phone: args.phone,
      startTime: args.startTime,
      timezone: args.timezone,
      notes: args.notes,
      conversationId: context.conversationId,
    });

    return {
      success: true,
      appointmentId: booking.appointmentId,
      customerId: booking.customerId,
      startTime: booking.startTime,
      meetingLink: booking.meetingLink,
      googleCalendarUrl: booking.calendarLinks.googleCalendarUrl,
      icsDownloadUrl: booking.calendarLinks.icsDownloadUrl,
      confirmationMessage: booking.confirmationMessage,
    };
  },

  /**
   * Tool: triggerHumanHandoff
   */
  async triggerHumanHandoff(rawArgs: unknown, context: ToolExecutionContext = {}) {
    const args = triggerHumanHandoffSchema.parse(rawArgs) as TriggerHumanHandoffArgs;

    if (context.conversationId) {
      await conversationRepository.updateStatus(context.conversationId, "human_handoff_requested");
    }

    logger.info(`Human handoff triggered via tool: reason="${args.reason}", conversationId=${context.conversationId || "N/A"}`, {
      module: "ToolHandlers",
    });

    return {
      success: true,
      status: "human_handoff_requested",
      escalationReason: args.reason,
      directChannels: {
        whatsapp: "https://wa.me/96181221829?text=Hello%20IMPACT%20HQ%2C%20I%20would%20like%20to%20connect%20with%20a%20human%20director.",
        phone: "+961 81 221 829",
        email: "inquiry@impact-enterprise.com",
      },
      message: "Human specialist escalation active. Our team is available directly via WhatsApp (+961 81 221 829) or scheduled callback.",
    };
  },
};
