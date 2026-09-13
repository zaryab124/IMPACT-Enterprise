import { allToolDeclarations } from "../tools/schemas";
import { toolDispatcher } from "../tools/toolDispatcher";
import { conversationService } from "../conversationService";
import { db } from "../../database";
import { seedDevelopmentDatabase } from "../../database/seed";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`  ▶ Running test: ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    results.push({ name, passed: true, durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
    results.push({ name, passed: false, error: err.message, durationMs });
  }
}

export async function runAllToolTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 8 AI TOOLS & FUNCTION CALLING");
  console.log("=======================================================\n");

  // Ensure DB is initialized and seeded
  await runTest("Database & System Readiness Check", async () => {
    await seedDevelopmentDatabase();
    const tablesRes = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    const tableNames = tablesRes.rows.map((r: any) => r.table_name);
    if (!tableNames.includes("agent_actions") || !tableNames.includes("agent_sessions")) {
      throw new Error("Missing agent_actions or agent_sessions tables in database");
    }
  });

  // 1. Tool Declarations & Schema Definitions Integrity
  await runTest("Tool Declarations & Schema Definitions Integrity", async () => {
    if (!allToolDeclarations || allToolDeclarations.length < 5) {
      throw new Error(`Expected at least 5 tool declarations, got ${allToolDeclarations?.length}`);
    }

    const expectedTools = [
      "captureLead",
      "lookupService",
      "queryCaseStudy",
      "checkAppointmentAvailability",
      "triggerHumanHandoff",
      "bookAppointment",
    ];

    for (const toolName of expectedTools) {
      const decl = allToolDeclarations.find((d) => d.name === toolName);
      if (!decl) {
        throw new Error(`Missing function declaration for tool: ${toolName}`);
      }
      if (!decl.parameters || !decl.parameters.properties) {
        throw new Error(`Tool declaration ${toolName} missing parameter properties`);
      }
    }
  });

  // 2. Schema Validation & Rejection of Malformed Inputs
  await runTest("Schema Validation & Rejection of Malformed Inputs", async () => {
    // A. captureLead without email
    const leadRes = await toolDispatcher.executeTool("captureLead", { name: "A" });
    if (leadRes.success) {
      throw new Error("captureLead should fail when email is missing and name is too short");
    }

    // B. lookupService without serviceName
    const svcRes = await toolDispatcher.executeTool("lookupService", {});
    if (svcRes.success) {
      throw new Error("lookupService should fail when serviceName is missing");
    }

    // C. queryCaseStudy with invalid slug
    const caseRes = await toolDispatcher.executeTool("queryCaseStudy", { slug: "invalid-slug" });
    if (caseRes.success) {
      throw new Error("queryCaseStudy should fail when slug is not one of allowed enum values");
    }

    // D. checkAppointmentAvailability with invalid date format
    const apptRes = await toolDispatcher.executeTool("checkAppointmentAvailability", { preferredDate: "tomorrow" });
    if (apptRes.success) {
      throw new Error("checkAppointmentAvailability should fail with non-YYYY-MM-DD date");
    }

    // E. triggerHumanHandoff with empty reason
    const handoffRes = await toolDispatcher.executeTool("triggerHumanHandoff", { reason: "hi" });
    if (handoffRes.success) {
      throw new Error("triggerHumanHandoff should fail when reason < 3 characters");
    }
  });

  // 3. lookupService Tool Execution & Citations
  await runTest("lookupService Tool Execution & Citation Retrieval", async () => {
    const res = await toolDispatcher.executeTool("lookupService", {
      serviceName: "AI Agents",
      specificQuery: "autonomous workflows and voice streaming",
    });

    if (!res.success) {
      throw new Error(`lookupService failed: ${res.error}`);
    }

    const data = res.data as any;
    if (!data.matches || data.matches.length === 0) {
      throw new Error("lookupService returned zero catalog matches");
    }
    if (!data.citations || data.citations.length === 0) {
      throw new Error("lookupService returned zero citations");
    }
    if (!data.matches[0].title || !data.matches[0].summary) {
      throw new Error("lookupService matches missing title or summary");
    }
  });

  // 4. queryCaseStudy Tool Execution & Metrics Extraction
  await runTest("queryCaseStudy Tool Execution & Metrics Extraction", async () => {
    const res = await toolDispatcher.executeTool("queryCaseStudy", {
      slug: "restaurant-technology-platform",
    });

    if (!res.success) {
      throw new Error(`queryCaseStudy failed: ${res.error}`);
    }

    const data = res.data as any;
    if (!data.caseStudies || data.caseStudies.length === 0) {
      throw new Error("queryCaseStudy returned zero case studies");
    }
    const study = data.caseStudies[0];
    if (!study.title.toLowerCase().includes("restaurant")) {
      throw new Error(`Unexpected case study title: ${study.title}`);
    }
    if (!Array.isArray(study.facts) || study.facts.length === 0) {
      throw new Error("queryCaseStudy missing verified facts");
    }
  });

  // 5. checkAppointmentAvailability Tool Execution
  await runTest("checkAppointmentAvailability Tool Execution & Slot Generation", async () => {
    const res = await toolDispatcher.executeTool("checkAppointmentAvailability", {
      preferredDate: "2026-10-15",
      timezone: "America/New_York",
    });

    if (!res.success) {
      throw new Error(`checkAppointmentAvailability failed: ${res.error}`);
    }

    const data = res.data as any;
    if (data.targetDate !== "2026-10-15") {
      throw new Error(`Expected targetDate '2026-10-15', got '${data.targetDate}'`);
    }
    if (data.timezone !== "America/New_York") {
      throw new Error(`Expected timezone 'America/New_York', got '${data.timezone}'`);
    }
    if (!Array.isArray(data.availableSlots) || data.availableSlots.length === 0) {
      throw new Error(`Expected non-empty availableSlots, got ${data.availableSlots?.length}`);
    }
    if (!data.notice.includes("calendar invitation")) {
      throw new Error("Missing anti-hallucination booking disclaimer notice");
    }
  });

  // 6. triggerHumanHandoff Tool Execution & Status Escalation
  await runTest("triggerHumanHandoff Tool Execution & Channel Direct Link", async () => {
    // Create conversation to test handoff status update
    const convRes = await conversationService.getOrCreateConversation(undefined, undefined, "website_chat");
    const conversationId = convRes.id;

    const res = await toolDispatcher.executeTool(
      "triggerHumanHandoff",
      {
        reason: "Customer requires custom SLA contract and on-premise deployment",
        preferredChannel: "whatsapp",
      },
      { conversationId }
    );

    if (!res.success) {
      throw new Error(`triggerHumanHandoff failed: ${res.error}`);
    }

    const data = res.data as any;
    if (data.status !== "human_handoff_requested") {
      throw new Error(`Expected status 'human_handoff_requested', got '${data.status}'`);
    }
    if (!data.directChannels.whatsapp.includes("wa.me")) {
      throw new Error("Missing direct WhatsApp headquarters link");
    }

    // Verify conversation record in DB updated
    const dbConv = await db.query("SELECT status FROM conversations WHERE id = $1;", [conversationId]);
    if (dbConv.rows[0]?.status !== "human_handoff_requested") {
      throw new Error(`Database conversation status not updated: ${dbConv.rows[0]?.status}`);
    }
  });

  // 7. captureLead Tool Execution, BANT Scoring & Deal Stage Advancement
  await runTest("captureLead Tool Execution, CRM Sync & Deal Stage Progression", async () => {
    const convRes = await conversationService.getOrCreateConversation(undefined, undefined, "website_chat");
    const conversationId = convRes.id;

    const res = await toolDispatcher.executeTool(
      "captureLead",
      {
        name: "Elena Rostova",
        email: "elena@vanguard-logistics.com",
        company: "Vanguard Global Logistics",
        problem: "I am Elena Rostova, VP of Operations at Vanguard Global Logistics. Automating international customs manifest validation and freight tracking within 1 month.",
        budget: "$65,000",
        timeline: "1 month",
      },
      { conversationId }
    );

    if (!res.success) {
      throw new Error(`captureLead failed: ${res.error}`);
    }

    const data = res.data as any;
    if (!data.customerId || !data.leadId) {
      throw new Error("captureLead did not return customerId or leadId");
    }
    if (data.bantScore < 70) {
      throw new Error(`Expected BANT score >= 70 for enterprise lead, got ${data.bantScore}`);
    }
    if (data.dealStage !== "CONTACTED" && data.dealStage !== "QUALIFIED") {
      throw new Error(`Expected dealStage 'CONTACTED' or 'QUALIFIED', got '${data.dealStage}'`);
    }

    // Verify customer in DB
    const custRes = await db.query("SELECT * FROM customers WHERE email = $1;", ["elena@vanguard-logistics.com"]);
    if (custRes.rows.length === 0) {
      throw new Error("Customer record not found in PostgreSQL");
    }

    // Verify lead score breakdown in DB
    const scoreRes = await db.query("SELECT * FROM lead_scores WHERE lead_id = $1;", [data.leadId]);
    if (scoreRes.rows.length === 0) {
      throw new Error("Lead score breakdown record not found in PostgreSQL");
    }
  });

  // 8. SQL Injection Security Quarantine Gate
  await runTest("SQL Injection Security Quarantine Gate (Zero Direct SQL)", async () => {
    // Attempt SQL injection via tool parameters
    const maliciousPayloads = [
      { tool: "lookupService", args: { serviceName: "'; DROP TABLE users; --" } },
      { tool: "captureLead", args: { name: "Hacker'; DROP TABLE leads; --", email: "hacker@evil.com" } },
      { tool: "triggerHumanHandoff", args: { reason: "'; UPDATE users SET is_active = FALSE; --" } },
    ];

    for (const testCase of maliciousPayloads) {
      const res = await toolDispatcher.executeTool(testCase.tool, testCase.args);
      // It should either complete safely (parameterized query) or return an error cleanly
      if (res.success === false && !res.error) {
        throw new Error(`Tool ${testCase.tool} crashed unexpectedly`);
      }
    }

    // Verify all core tables remain intact and accessible
    const checkRes = await db.query("SELECT COUNT(*) FROM users;");
    if (parseInt(checkRes.rows[0].count, 10) === 0) {
      throw new Error("Users table was corrupted or emptied by injection payload");
    }

    const checkLeads = await db.query("SELECT COUNT(*) FROM leads;");
    if (checkLeads.rows.length === 0) {
      throw new Error("Leads table was dropped by injection payload");
    }
  });

  // 9. Database Telemetry Audit in agent_actions
  await runTest("PostgreSQL Telemetry Audit in agent_actions Table", async () => {
    const actionsRes = await db.query(
      `SELECT tool_name, is_success, execution_duration_ms, created_at
       FROM agent_actions
       ORDER BY created_at DESC
       LIMIT 10;`
    );

    if (actionsRes.rows.length === 0) {
      throw new Error("No telemetry records found in agent_actions table");
    }

    const toolNames = actionsRes.rows.map((r: any) => r.tool_name);
    const expected = ["captureLead", "lookupService", "queryCaseStudy", "checkAppointmentAvailability", "triggerHumanHandoff"];
    
    // Check that at least some of our executed tools are recorded
    const foundAny = expected.some((t) => toolNames.includes(t));
    if (!foundAny) {
      throw new Error(`Expected at least one of ${expected.join(", ")} in agent_actions, found: ${toolNames.join(", ")}`);
    }

    for (const row of actionsRes.rows) {
      if (typeof row.execution_duration_ms !== "number") {
        throw new Error("execution_duration_ms must be an integer duration");
      }
    }
  });

  // 10. End-to-End Conversation Turn with Tool Execution & Persistence
  await runTest("End-to-End Conversation Turn with Tool Execution & Persistence", async () => {
    // 1. Send message that triggers checkAppointmentAvailability tool
    const turnResult = await conversationService.processMessage({
      userMessage: "Can I check appointment availability for consultation on 2026-11-10?",
      channel: "website_chat",
    });

    if (!turnResult.reply || turnResult.reply.length < 10) {
      throw new Error("Empty reply from conversationService");
    }
    if (!turnResult.toolCalls || turnResult.toolCalls.length === 0) {
      throw new Error("Expected toolCalls in ConversationTurnResult");
    }
    if (!turnResult.toolResults || turnResult.toolResults.length === 0) {
      throw new Error("Expected toolResults in ConversationTurnResult");
    }

    const matchedCall = turnResult.toolCalls.find((c) => c.name === "checkAppointmentAvailability");
    if (!matchedCall) {
      throw new Error(`Expected checkAppointmentAvailability tool call, got: ${turnResult.toolCalls.map((c) => c.name).join(", ")}`);
    }

    // 2. Verify messages table in DB persisted tool_calls and tool_results
    const dbMsgRes = await db.query(
      "SELECT tool_calls, tool_results FROM messages WHERE id = $1;",
      [turnResult.messageId]
    );

    if (dbMsgRes.rows.length === 0) {
      throw new Error(`Message ID ${turnResult.messageId} not found in database`);
    }

    const row = dbMsgRes.rows[0];
    if (!row.tool_calls) {
      throw new Error("tool_calls column in messages table is null");
    }
    if (!row.tool_results) {
      throw new Error("tool_results column in messages table is null");
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Test Results: ${passedCount} passed, ${failedCount} failed (${results.length} total)`);

  if (failedCount > 0) {
    console.error("\nFailed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(`  ✖ ${r.name}: ${r.error}`));
    return false;
  }

  console.log("\x1b[32mAll Phase 8 AI Tool tests passed successfully!\x1b[0m\n");
  return true;
}

if (require.main === module) {
  runAllToolTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Test execution fatal crash:", err);
      process.exit(1);
    });
}
