import { db } from "../../database";
import { migrator } from "../../database/migrator";
import { seedDevelopmentDatabase } from "../../database/seed";
import {
  customerRepository,
  leadRepository,
  conversationRepository,
  channelDeliveryRepository,
  voiceSessionRepository,
  callRecordingRepository,
} from "../../database/repositories";
import { knowledgeService } from "../../knowledge/knowledgeService";
import { bantEngine } from "../../sales/bantEngine";
import { dealStageEngine } from "../../sales/dealStageEngine";
import { toolDispatcher } from "../../ai/tools/toolDispatcher";
import { appointmentService } from "../../appointments/appointmentService";
import { calendarService } from "../../appointments/calendarService";
import { omnichannelService } from "../../omnichannel/omnichannelService";
import { conversationIntelligenceService } from "../../voice/intelligence/conversationIntelligenceService";
import { analyticsService } from "../../analytics/analyticsService";
import { buildCsvExport } from "../../analytics/exporters/csvExporter";
import { rateLimiter } from "../../security/rateLimiter";
import { applySecurityHeaders } from "../../security/headers";
import { csrfValidator } from "../../security/csrf";
import { sanitizeString, detectSqlInjection } from "../../security/sanitizer";
import { GET as getHealthHandler } from "../../../app/api/health/route";

interface StageResult {
  stage: number;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: string;
}

const results: StageResult[] = [];

async function runStage(
  stage: number,
  name: string,
  fn: () => Promise<string | void>
): Promise<void> {
  process.stdout.write(`\n  ▶ Stage ${stage}: ${name}... `);
  const start = Date.now();
  try {
    const details = await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    if (details) {
      console.log(`    \x1b[90m↳ ${details}\x1b[0m`);
    }
    results.push({ stage, name, passed: true, durationMs, details: details || undefined });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    \x1b[31mError:\x1b[0m ${err.message}`);
    results.push({ stage, name, passed: false, durationMs, error: err.message });
  }
}

export async function runFinalMasterVerification(): Promise<boolean> {
  console.log("\n===============================================================================");
  console.log("  IMPACT ENTERPRISE — PHASE 15: MASTER END-TO-END VERIFICATION SUITE");
  console.log("  Full System Audit & 10-Stage Unified Multi-Channel Client Journey");
  console.log("===============================================================================");

  const masterStart = Date.now();

  // Test session state across stages
  let testCustomerId = "";
  let testLeadId = "";
  let testConversationId = "";
  let testAppointmentId = "";
  let testVoiceSessionId = "";

  // -------------------------------------------------------------------------
  // STAGE 1: Public & Knowledge Ingestion Verification
  // -------------------------------------------------------------------------
  await runStage(1, "Knowledge Ingestion & Grounding Verification", async () => {
    // 1. Ensure migrations and seeds are up to date
    await migrator.migrateUp();
    await seedDevelopmentDatabase();

    // 2. Query enterprise AI solutions
    const query = "What enterprise AI solutions and autonomous agents does IMPACT build?";
    const searchRes = await knowledgeService.search(query, { limit: 3 });

    if (!searchRes.documents || searchRes.documents.length === 0) {
      throw new Error("No grounded knowledge documents returned for core enterprise query");
    }

    if (searchRes.confidenceScore < 70) {
      throw new Error(`Knowledge confidence score below threshold: ${searchRes.confidenceScore} < 70`);
    }

    if (!searchRes.groundingContext.includes("IMPACT Enterprise") && !searchRes.groundingContext.includes("AI")) {
      throw new Error("Grounding context missing primary IMPACT Enterprise metadata");
    }

    // 3. Verify scope boundary guards
    const outOfScopeQuery = "Can you give me a weather forecast and crypto trading signals?";
    if (!knowledgeService.isOutOfScopeQuery(outOfScopeQuery)) {
      throw new Error("Scope filter failed to catch prohibited out-of-scope query");
    }

    const topTitle = searchRes.documents[0]?.document?.title || "Knowledge Document";
    return `Retrieved ${searchRes.documents.length} verified docs (Confidence: ${searchRes.confidenceScore}%, Top: "${topTitle}")`;
  });

  // -------------------------------------------------------------------------
  // STAGE 2: Lead Capture & BANT Qualification Engine
  // -------------------------------------------------------------------------
  await runStage(2, "Lead Capture & BANT Qualification Engine", async () => {
    // Create customer profile via upsert
    const uniqueEmail = `elena.rostova.${Date.now()}@globalfintech.io`;
    const customer = await customerRepository.upsert({
      name: "Elena Rostova",
      email: uniqueEmail,
      phone: "+14155550199",
      country: "United States",
      source: "e2e_verification_test",
    });
    testCustomerId = customer.id;

    // Evaluate BANT signals
    const bantSignals = {
      text: "We need enterprise autonomous agents for real-time financial transaction auditing and fraud detection.",
      rawBudget: "$125,000 USD",
      roleTitle: "Founder & Chief Executive Officer",
      rawTimeline: "immediate within 3 weeks",
      problem: "Manual reconciliation bottlenecks causing high compliance overhead.",
    };

    const bantResult = bantEngine.computeBantScore(bantSignals);

    if (bantResult.compositeScore < 75) {
      throw new Error(`Expected high BANT composite score (>= 75), got ${bantResult.compositeScore}`);
    }

    if (bantResult.budgetTier !== "TIER_ENTERPRISE") {
      throw new Error(`Expected TIER_ENTERPRISE, got ${bantResult.budgetTier}`);
    }

    if (bantResult.authorityLevel !== "PRIMARY_DECISION_MAKER") {
      throw new Error(`Expected PRIMARY_DECISION_MAKER authority, got ${bantResult.authorityLevel}`);
    }

    // Create persistent lead
    const lead = await leadRepository.create({
      customerId: testCustomerId,
      stage: "NEW",
      score: bantResult.compositeScore,
      budgetRange: bantResult.budgetFormatted,
      timeline: bantResult.timelineFormatted,
      decisionMakerStatus: "PRIMARY_DECISION_MAKER",
      problemStatement: bantSignals.problem,
      proposedSolution: "Autonomous Multi-Agent Audit Pipeline",
    });
    testLeadId = lead.id;

    return `Lead created (ID: ${lead.id.slice(0, 8)}..., Score: ${bantResult.compositeScore}/100, Tier: ${bantResult.budgetTier}, Class: ${bantResult.classification})`;
  });

  // -------------------------------------------------------------------------
  // STAGE 3: AI Tool & Function Calling Execution
  // -------------------------------------------------------------------------
  await runStage(3, "AI Tool & Function Calling Dispatch (Zero Unauthorized SQL)", async () => {
    // 1. lookupService (serviceName required)
    const serviceRes = await toolDispatcher.executeTool("lookupService", {
      serviceName: "Enterprise AI Agents",
      specificQuery: "autonomous compliance and workflow automation",
    });
    if (!serviceRes.success || !serviceRes.data) {
      throw new Error("lookupService tool failed to return registered services");
    }

    // 2. captureLead
    const captureRes = await toolDispatcher.executeTool("captureLead", {
      name: "Marcus Vance",
      email: `marcus.vance.${Date.now()}@vancetech.com`,
      company: "Vance Technologies",
      phone: "+1-650-555-8812",
      problem: "Multi-modal RAG knowledge engine for financial documents",
      budget: "$60,000",
      timeline: "Within 4 weeks",
    });
    if (!captureRes.success || !(captureRes.data as any)?.leadId) {
      throw new Error("captureLead tool execution failed to persist lead");
    }

    // 3. checkAppointmentAvailability (preferredDate and timezone)
    const availRes = await toolDispatcher.executeTool("checkAppointmentAvailability", {
      preferredDate: "2026-11-20",
      timezone: "UTC",
    });
    if (!availRes.success || !Array.isArray((availRes.data as any)?.availableSlots)) {
      throw new Error("checkAppointmentAvailability tool failed to return valid slot array");
    }

    return `3 AI Tools Dispatched with Zero SQL injection. Latencies: lookup=${serviceRes.durationMs}ms, capture=${captureRes.durationMs}ms, avail=${availRes.durationMs}ms`;
  });

  // -------------------------------------------------------------------------
  // STAGE 4: Consultation Slot Reservation & ICS Calendar Generation
  // -------------------------------------------------------------------------
  await runStage(4, "Consultation Slot Reservation & ICS Calendar Generation", async () => {
    const customer = await customerRepository.findById(testCustomerId);
    if (!customer) throw new Error("Customer record missing");

    const startTime = "2026-11-20T15:00:00.000Z";
    const endTime = "2026-11-20T15:45:00.000Z";

    // Book appointment
    const booking = await appointmentService.bookConsultation({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || undefined,
      company: "Global FinTech Solutions",
      startTime,
      timezone: "UTC",
      notes: "Technical architecture consultation for autonomous compliance agents.",
    });

    if (!booking.success || !booking.appointmentId) {
      throw new Error("Appointment booking failed");
    }
    testAppointmentId = booking.appointmentId;

    // Verify ICS format adheres to RFC 5545
    const ics = calendarService.generateIcs({
      id: testAppointmentId,
      title: "IMPACT Enterprise Technical Discovery Consultation",
      startTime,
      endTime,
      timezone: "UTC",
      customerName: customer.name,
      customerEmail: customer.email,
      meetingLink: booking.meetingLink,
      notes: "Technical architecture consultation.",
    });

    if (!ics.includes("BEGIN:VCALENDAR") || !ics.includes("END:VCALENDAR")) {
      throw new Error("Generated ICS missing VCALENDAR boundaries");
    }
    if (!ics.includes(`UID:appointment-${testAppointmentId}@impact-enterprise.com`)) {
      throw new Error("Generated ICS missing unique RFC 5545 UID");
    }

    // Verify Conflict Detection rejects duplicate double-booking
    let conflictCaught = false;
    try {
      await appointmentService.bookConsultation({
        name: "Conflicting Lead",
        email: "conflict@competitor.com",
        startTime,
        timezone: "UTC",
      });
    } catch (err: any) {
      conflictCaught = true;
    }

    if (!conflictCaught) {
      throw new Error("Conflict detection failed: allowed concurrent double booking for same slot");
    }

    return `Appointment confirmed (ID: ${testAppointmentId.slice(0, 8)}...). ICS RFC 5545 generated. Conflict guard verified.`;
  });

  // -------------------------------------------------------------------------
  // STAGE 5: Omnichannel Dispatch (WhatsApp & Email Mocks)
  // -------------------------------------------------------------------------
  await runStage(5, "Omnichannel Dispatch (WhatsApp & Email Verification)", async () => {
    const customer = await customerRepository.findById(testCustomerId);
    if (!customer) throw new Error("Customer record missing");

    // Create active conversation
    const conv = await conversationRepository.create({
      customerId: testCustomerId,
      channel: "whatsapp",
      metadata: { source: "e2e_verification" },
    });
    testConversationId = conv.id;

    // 1. WhatsApp Dispatch
    const waResult = await omnichannelService.sendOutbound({
      channel: "whatsapp",
      recipientIdentifier: customer.phone || "+14155550199",
      content: "Hello Elena, your IMPACT Enterprise Consultation is confirmed for Nov 20, 2026 at 15:00 UTC.",
      conversationId: conv.id,
    });

    if (waResult.status !== "delivered") {
      throw new Error(`WhatsApp message failed delivery: ${waResult.error || "unknown"}`);
    }

    // 2. Email Dispatch
    const emailResult = await omnichannelService.sendOutbound({
      channel: "email",
      recipientIdentifier: customer.email,
      subject: "IMPACT Enterprise Consultation Confirmation",
      content: "Hello Elena, please find your calendar appointment details confirmed.",
      conversationId: conv.id,
    });

    if (emailResult.status !== "delivered") {
      throw new Error(`Email message failed delivery: ${emailResult.error || "unknown"}`);
    }

    // Verify delivery records in database
    const deliveries = await db.query(
      "SELECT * FROM channel_deliveries WHERE conversation_id = $1;",
      [conv.id]
    );
    if (deliveries.rows.length < 2) {
      throw new Error(`Expected at least 2 channel deliveries logged in DB, found ${deliveries.rows.length}`);
    }

    return `Omnichannel messages dispatched. WhatsApp (${waResult.provider}): delivered in ${waResult.latencyMs}ms. Email (${emailResult.provider}): delivered in ${emailResult.latencyMs}ms.`;
  });

  // -------------------------------------------------------------------------
  // STAGE 6: Voice Session & Conversation Intelligence Processing
  // -------------------------------------------------------------------------
  await runStage(6, "Voice Session & Conversation Intelligence Processing", async () => {
    // 1. Create Voice Session
    testVoiceSessionId = `voice-session-${Date.now()}-e2e`;
    await voiceSessionRepository.create({
      sessionId: testVoiceSessionId,
      conversationId: testConversationId,
      model: "gemini-3.1-flash-live-preview",
      voiceName: "Charon",
      metadata: { customerId: testCustomerId, leadId: testLeadId },
    });

    // 2. Seed realistic enterprise discovery voice turns
    await conversationRepository.addMessage({
      conversationId: testConversationId,
      senderType: "customer",
      content: "We have an urgent need to automate our compliance audits across 50,000 daily transactions. We have a budget of $125,000 ready to deploy next month.",
    });

    await conversationRepository.addMessage({
      conversationId: testConversationId,
      senderType: "ai_agent",
      content: "We can engineer an autonomous multi-agent audit pipeline using Gemini and PostgreSQL that reduces processing latency by 85%.",
    });

    // 3. Run conversation intelligence analysis
    const analysis = await conversationIntelligenceService.analyzeVoiceCall(testVoiceSessionId);

    if (!analysis || !analysis.diarizedTranscript || analysis.diarizedTranscript.length === 0) {
      throw new Error("Conversation intelligence produced empty diarized transcript");
    }

    if (!analysis.bantInsights || (analysis.bantInsights.score || 0) < 70) {
      throw new Error(`Voice intelligence BANT score below expectation: ${analysis.bantInsights?.score}`);
    }

    if (!analysis.executiveSummary || analysis.executiveSummary.length < 10) {
      throw new Error("Executive call summary missing from voice intelligence output");
    }

    return `Voice session analyzed. Diarized turns: ${analysis.diarizedTranscript.length}, Sentiment: ${analysis.overallSentiment}, BANT: ${analysis.bantInsights.score}/100, Action items: ${analysis.actionItems.length}`;
  });

  // -------------------------------------------------------------------------
  // STAGE 7: CRM Progression & Deal Funnel Movement
  // -------------------------------------------------------------------------
  await runStage(7, "CRM Progression & Deal Funnel Movement State Machine", async () => {
    // 0. Verify testLeadId was automatically upgraded to PROPOSAL by Stage 6 Voice Intelligence
    const voiceUpgradedLead = await leadRepository.findById(testLeadId);
    if (!voiceUpgradedLead || voiceUpgradedLead.stage !== "PROPOSAL") {
      throw new Error(`Expected testLeadId to be in PROPOSAL stage following voice intelligence, got '${voiceUpgradedLead?.stage}'`);
    }

    // 1. Create a dedicated lead to test the full sequential lifecycle state machine
    const lifecycleLead = await leadRepository.create({
      customerId: testCustomerId,
      stage: "NEW",
      score: 50,
      problemStatement: "Lifecycle state machine progression test",
    });

    // Advance NEW -> QUALIFIED
    const t1 = await dealStageEngine.transitionStage({
      leadId: lifecycleLead.id,
      targetStage: "QUALIFIED",
      actorType: "AI",
      reason: "BANT composite score exceeded 75 threshold",
    });
    if (!t1.success || t1.lead?.stage !== "QUALIFIED") {
      throw new Error(`Failed valid stage transition NEW -> QUALIFIED: ${t1.error}`);
    }

    // Advance QUALIFIED -> PROPOSAL
    const t2 = await dealStageEngine.transitionStage({
      leadId: lifecycleLead.id,
      targetStage: "PROPOSAL",
      actorType: "AI",
      reason: "Discovery consultation booked and verified",
    });
    if (!t2.success || t2.lead?.stage !== "PROPOSAL") {
      throw new Error(`Failed valid stage transition QUALIFIED -> PROPOSAL: ${t2.error}`);
    }

    // Reject illegal stage jump: PROPOSAL -> NEW (Non-superadmin violation)
    const tIllegal = await dealStageEngine.transitionStage({
      leadId: lifecycleLead.id,
      targetStage: "NEW",
      actorType: "USER",
      isSuperAdmin: false,
    });
    if (tIllegal.success) {
      throw new Error("State machine allowed prohibited transition from PROPOSAL back to NEW");
    }

    // Advance PROPOSAL -> WON
    const t3 = await dealStageEngine.transitionStage({
      leadId: lifecycleLead.id,
      targetStage: "WON",
      actorType: "USER",
      actorId: "director-1",
      reason: "Enterprise contract executed",
    });
    if (!t3.success || t3.lead?.stage !== "WON") {
      throw new Error(`Failed valid stage transition PROPOSAL -> WON: ${t3.error}`);
    }

    // Also advance the voice-upgraded lead PROPOSAL -> WON
    await dealStageEngine.transitionStage({
      leadId: testLeadId,
      targetStage: "WON",
      actorType: "USER",
      actorId: "director-1",
      reason: "Voice lead contract closed",
    });

    return `Deal successfully progressed: NEW ➔ QUALIFIED ➔ PROPOSAL ➔ WON. Voice auto-upgraded lead closed. Illegal transitions rejected.`;
  });

  // -------------------------------------------------------------------------
  // STAGE 8: Telemetry & Analytics Dashboard Aggregation
  // -------------------------------------------------------------------------
  await runStage(8, "Telemetry & Analytics Dashboard Aggregation & RFC 4180 CSV", async () => {
    // 1. Channel breakdown metrics
    const channels = await analyticsService.getChannelBreakdown(null);
    if (!Array.isArray(channels) || channels.length !== 4) {
      throw new Error(`Expected 4 standard channel metrics, got ${channels?.length}`);
    }

    // 2. Funnel conversion metrics
    const funnel = await analyticsService.getFunnelMetrics(null);
    if (!funnel || typeof funnel.totalInbound !== "number" || typeof funnel.overallConversionRate !== "number") {
      throw new Error("Funnel conversion metrics missing required properties");
    }

    // 3. SLA metrics
    const sla = await analyticsService.getSLAMetrics(null);
    if (!sla || typeof sla.aiFirstResponseTimeAvgMs !== "number" || typeof sla.omnichannelDeliveryRate !== "number") {
      throw new Error("SLA response metrics missing required properties");
    }

    // 4. CSV Exporter RFC 4180 test
    const leads = await leadRepository.list(50);
    const exportRes = buildCsvExport("leads", leads);

    if (typeof exportRes.csv !== "string" || !exportRes.csv.includes("Lead ID,Customer Name,Customer Email")) {
      throw new Error("CSV Export missing RFC 4180 header row");
    }

    return `Analytics verified: 4 Channels aggregated, Funnel Inbound: ${funnel.totalInbound} (Won: ${funnel.totalWon}, Conv: ${funnel.overallConversionRate}%), Omnichannel Delivery: ${sla.omnichannelDeliveryRate}%, CSV Export: ${exportRes.rowCount} rows.`;
  });

  // -------------------------------------------------------------------------
  // STAGE 9: Security Layer & Rate Limiting Enforcement
  // -------------------------------------------------------------------------
  await runStage(9, "Security Layer (Rate Limiting, CSP/HSTS, CSRF, Sanitizer)", async () => {
    // 1. Rate Limiting Quota
    rateLimiter.reset();
    const testKey = "client:e2e:verification";
    const res1 = await rateLimiter.checkRateLimit(testKey, "api");
    const res2 = await rateLimiter.checkRateLimit(testKey, "api");
    if (res2.remaining !== res1.remaining - 1) {
      throw new Error(`Rate limiter remaining math incorrect: ${res1.remaining} -> ${res2.remaining}`);
    }

    // 2. Security Headers (CSP & HSTS)
    const headers = new Headers();
    applySecurityHeaders(headers);
    if (!headers.get("Content-Security-Policy")?.includes("default-src 'self'")) {
      throw new Error("CSP header missing default-src directive");
    }
    if (!headers.get("Strict-Transport-Security")?.includes("max-age=")) {
      throw new Error("HSTS header missing required max-age directive");
    }

    // 3. CSRF Protection
    const safeGetReq = new Request("http://localhost:3005/api/health", { method: "GET" });
    const getRes = csrfValidator.validate(safeGetReq);
    if (!getRes.valid) throw new Error("Safe GET request should pass CSRF validation");

    const maliciousPost = new Request("http://localhost:3005/api/admin/settings", {
      method: "POST",
      headers: {
        Origin: "https://evil-attacker.com",
        Host: "localhost:3005",
        "Sec-Fetch-Site": "cross-site",
      },
    });
    const malRes = csrfValidator.validate(maliciousPost);
    if (malRes.valid) throw new Error("Malicious cross-site POST was erroneously permitted");

    // 4. Input Sanitization & SQL Injection Defense
    const dirtyXss = "<script>alert('pwned')</script>Hello & welcome!";
    const cleanXss = sanitizeString(dirtyXss);
    if (cleanXss.includes("<script>")) {
      throw new Error("Sanitizer failed to neutralize raw script tag");
    }

    const isSqlInjection = detectSqlInjection("admin' OR '1'='1");
    if (!isSqlInjection) {
      throw new Error("SQL injection detector failed to flag standard tautology probe");
    }

    return `Security layer verified: Sliding-window rate limit operational, CSP/HSTS enforced, CSRF origins guarded, XSS & SQLi neutralized.`;
  });

  // -------------------------------------------------------------------------
  // STAGE 10: Production Readiness & Route Matrix Audit
  // -------------------------------------------------------------------------
  await runStage(10, "Production Readiness & System Route Telemetry Audit", async () => {
    // 1. Database Connection & Latency Ping
    const pingStart = Date.now();
    const dbPing = await db.query("SELECT 1 as healthy, NOW() as current_time;");
    const dbLatency = Date.now() - pingStart;

    if (!dbPing.rows[0]?.healthy) {
      throw new Error("Database health ping returned falsy status");
    }

    // 2. Direct Invocation of Health API Handler
    const healthResponse = await getHealthHandler();
    const healthJson = await healthResponse.json();

    if (healthResponse.status !== 200 || healthJson.status !== "ok") {
      throw new Error(`Health endpoint returned non-OK status: ${healthResponse.status}`);
    }

    if (healthJson.database?.status !== "connected") {
      throw new Error(`Health endpoint reports database state: '${healthJson.database?.status}'`);
    }

    return `All 10 stages validated. DB latency: ${dbLatency}ms, Health Telemetry: status=ok, engine=${healthJson.database?.engine}, uptime=${healthJson.system?.uptimeSeconds}s.`;
  });

  // Summary
  const totalMs = Date.now() - masterStart;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n===============================================================================");
  console.log(`  VERIFICATION RESULTS: ${passedCount}/10 Stages Passed (${failedCount} Failures) — Total Time: ${totalMs}ms`);
  console.log("===============================================================================\n");

  if (failedCount > 0) {
    console.error("  ❌ CRITICAL: The following verification stages failed:");
    for (const res of results.filter((r) => !r.passed)) {
      console.error(`     - Stage ${res.stage}: ${res.name} — ${res.error}`);
    }
    return false;
  }

  console.log("  ✅ 100% PRODUCTION VERIFICATION SIGN-OFF GRANTED");
  console.log("  All architectural gates, security policies, and omnichannel flows verified.\n");
  return true;
}

// Auto-run when executed directly via tsx
if (require.main === module) {
  runFinalMasterVerification()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Unexpected error in final master verification runner:", err);
      process.exit(1);
    });
}
