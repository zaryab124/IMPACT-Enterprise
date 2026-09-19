/**
 * IMPACT Growth OS — Phase 12 AI Call Agent CRM Integration Test Suite
 * Tests end-to-end voice call pipeline:
 * - Caller lookup / auto-create lead
 * - AI disclosure & consent controls
 * - Escalation to human agent
 * - Sensitive information masking (PCI/PII)
 * - Summarization, sentiment & qualification
 * - CRM calls & activity logging
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { LeadIntakeService } from "../crm/services/leadIntakeService";
import { CallPolicies } from "../voice/callPolicies";
import { CallOrchestrator } from "../voice/callOrchestrator";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  process.stdout.write(`  ▶ Running test: ${name}... `);
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`PASS (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, error: err.message, durationMs });
    console.log(`FAIL (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
  }
}

async function main() {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 12 AI CALL AGENT INTEGRATION");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Test 1: Policy Controls - Sensitive Data Masking & Escalation Keyword Detection
  await runTest("Call Policies: Sensitive Data Masking & Escalation Detection", async () => {
    // 1. Sensitive data masking
    const rawUtterance = "My card number is 4111 2222 3333 4444 and my SSN is 000-12-3456.";
    const { maskedText, sanitized } = CallPolicies.maskSensitiveData(rawUtterance);
    if (!sanitized) throw new Error("Expected sanitization flag to be true");
    if (maskedText.includes("4111") || maskedText.includes("000-12")) {
      throw new Error("Sensitive card or SSN was not masked");
    }

    // 2. Escalation request
    const esc1 = CallPolicies.checkEscalationRequest("Can I talk to a real person please?");
    if (!esc1.requested) throw new Error("Expected escalation for 'talk to a real person'");

    const esc2 = CallPolicies.checkEscalationRequest("Tell me about your Call agents.");
    if (esc2.requested) throw new Error("Standard query should not trigger escalation");
  });

  // Test 2: Standard Inbound Call with Existing Lead
  let existingLeadId = "";
  await runTest("Inbound Call: Matches Existing Lead by Phone & Logs Telemetry", async () => {
    // Pre-create lead
    const lead = await LeadIntakeService.ingestLead({
      first_name: "Victoria",
      last_name: "Sterling",
      phone: "+1-312-555-0149",
      email: "v.sterling@apex-insurance.com",
      company: "Apex Insurance Group",
      service_interest: "Call agents",
      source: "website",
    });
    existingLeadId = lead.leadId;

    const callResult = await CallOrchestrator.processCall({
      callerPhone: "+1-312-555-0149",
      callerName: "Victoria Sterling",
      durationSeconds: 145,
      consentGranted: true,
      turns: [
        { speaker: "agent", text: CallPolicies.AI_DISCLOSURE_PROMPT },
        { speaker: "caller", text: "Yes I consent. We want to deploy Call agents to automate our claims first-notice-of-loss." },
        { speaker: "agent", text: "IMPACT Call agents support sub-500ms latency and post-call CRM logging. What is your call volume?" },
        { speaker: "caller", text: "We handle about 5,000 calls a day. This is a top priority with allocated budget." },
      ],
    });

    if (callResult.leadId !== existingLeadId) {
      throw new Error(`Expected call to link to existing lead ${existingLeadId}, got ${callResult.leadId}`);
    }
    if (!callResult.disclosureGiven || !callResult.recordingConsent) {
      throw new Error("Disclosure or recording consent flag missing");
    }
    if (callResult.serviceInterest !== "Call agents") {
      throw new Error(`Expected serviceInterest 'Call agents', got '${callResult.serviceInterest}'`);
    }
    if (callResult.sentiment !== "positive") {
      throw new Error(`Expected positive sentiment, got '${callResult.sentiment}'`);
    }

    // Verify DB call record
    const callDb = await db.query(`SELECT * FROM crm_calls WHERE id = $1;`, [callResult.callId]);
    if (callDb.rows.length === 0) {
      throw new Error("Call record was not found in crm_calls database");
    }
    if (callDb.rows[0].lead_id !== existingLeadId) {
      throw new Error("Database crm_calls lead_id does not match");
    }

    // Verify CRM activity logged
    const activityDb = await db.query(
      `SELECT * FROM crm_activities WHERE lead_id = $1 AND activity_type = 'ai_call_completed';`,
      [existingLeadId]
    );
    if (activityDb.rows.length === 0) {
      throw new Error("ai_call_completed activity was not logged in CRM");
    }
  });

  // Test 3: Inbound Call from New Unknown Caller (Auto-creates Lead)
  await runTest("Inbound Call: New Caller Auto-Creates Lead in CRM", async () => {
    const newPhone = "+1-650-555-0988";
    const callResult = await CallOrchestrator.processCall({
      callerPhone: newPhone,
      callerName: "David Chen",
      companyName: "Chen Logistics",
      durationSeconds: 90,
      turns: [
        { speaker: "agent", text: "Hello, I am IMPACT AI virtual consultant." },
        { speaker: "caller", text: "Hi, I need help setting up Business automation for my warehouse." },
        { speaker: "agent", text: "IMPACT Enterprise specializes in end-to-end business automation." },
      ],
    });

    if (!callResult.leadId) {
      throw new Error("Expected new lead ID to be created");
    }

    // Verify lead exists in CRM
    const newLeadDb = await db.query(`SELECT * FROM leads WHERE id = $1;`, [callResult.leadId]);
    if (newLeadDb.rows.length === 0) {
      throw new Error("Auto-created lead not found in database");
    }
    if (newLeadDb.rows[0].phone !== "+16505550988") {
      throw new Error(`Lead phone mismatch: expected '+16505550988', got '${newLeadDb.rows[0].phone}'`);
    }
  });

  // Test 4: Inbound Call Escalation to Human
  await runTest("Inbound Call: Escalation Request Flags Human Queue", async () => {
    const callResult = await CallOrchestrator.processCall({
      callerPhone: "+1-312-555-0149",
      durationSeconds: 45,
      turns: [
        { speaker: "agent", text: "Hello, I am IMPACT AI." },
        { speaker: "caller", text: "I have an urgent enterprise contract issue, please transfer me to a human agent right now." },
        { speaker: "agent", text: CallPolicies.getEscalationResponse() },
      ],
    });

    if (!callResult.escalationRequested) {
      throw new Error("Expected escalationRequested to be true");
    }
    if (!callResult.nextAction.includes("Immediate callback required")) {
      throw new Error("Expected nextAction to prioritize immediate human callback");
    }

    // Verify DB record has escalation flags
    const callDb = await db.query(`SELECT escalation_requested, escalation_reason FROM crm_calls WHERE id = $1;`, [callResult.callId]);
    if (!callDb.rows[0].escalation_requested) {
      throw new Error("Database record missing escalation_requested flag");
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 12 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running Phase 12 tests:", err);
  process.exit(1);
});
