/**
 * IMPACT Growth OS — Phase 10 AI Lead Follow-up Agent Test Suite
 * Tests stage-specific drafting (NEW, QUALIFIED, PROPOSAL, NEGOTIATION, LOST),
 * multi-channel generation (Email, WhatsApp), guardrail enforcement,
 * and the mandatory Human Review Gate (Draft → Review → Send).
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { LeadIntakeService } from "../crm/services/leadIntakeService";
import { FollowupGuardrailsValidator } from "../sales/followupGuardrailsValidator";
import { LeadFollowupAgent } from "../sales/leadFollowupAgent";

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
  console.log("  IMPACT GROWTH OS — PHASE 10 AI LEAD FOLLOW-UP AGENT");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Test 1: Guardrails Validator
  await runTest("Follow-up Guardrails: Blocks Promises, Pricing & Guarantees", async () => {
    const violatingDraft =
      "We will have this delivered tomorrow for a flat rate of $999 per month with 100% guaranteed results per our signed contract.";
    const check = FollowupGuardrailsValidator.validate(violatingDraft);
    if (check.passed) {
      throw new Error("Guardrails validator should have failed for violating draft");
    }
    if (check.violations.length < 3) {
      throw new Error(`Expected at least 3 violations, got ${check.violations.length}`);
    }
  });

  // Setup lead for stage testing
  const intakeRes = await LeadIntakeService.ingestLead({
    first_name: "Gabriel",
    last_name: "Mercer",
    email: "gabriel@mercer-capital.com",
    phone: "+1-212-555-0199",
    whatsapp: "+1-212-555-0199",
    company: "Mercer Capital Partners",
    service_interest: "AI automation",
    problem_statement: "Evaluating invoice processing and reconciliation automation across 12 portfolio companies.",
    source: "website",
  });
  const leadId = intakeRes.leadId;

  // Test 2: Draft for NEW Stage (Email)
  let draftedMessageId = "";
  await runTest("Follow-up Drafting: NEW Stage Email Welcome", async () => {
    await db.query(`UPDATE leads SET lead_status = 'NEW' WHERE id = $1;`, [leadId]);
    const draft = await LeadFollowupAgent.draftFollowup(leadId, "email");

    if (draft.status !== "draft") {
      throw new Error(`Expected status 'draft', got '${draft.status}'`);
    }
    if (!draft.body.includes("Thank you for contacting IMPACT Enterprise")) {
      throw new Error("Expected NEW stage draft to thank contact for reaching out");
    }
    draftedMessageId = draft.messageId;
  });

  // Test 3: Draft for QUALIFIED Stage (WhatsApp Discovery)
  await runTest("Follow-up Drafting: QUALIFIED Stage WhatsApp Discovery", async () => {
    await db.query(`UPDATE leads SET lead_status = 'QUALIFIED' WHERE id = $1;`, [leadId]);
    const draft = await LeadFollowupAgent.draftFollowup(leadId, "whatsapp");

    if (draft.status !== "draft" || draft.channel !== "whatsapp") {
      throw new Error("Expected draft with whatsapp channel");
    }
    if (!draft.body.includes("systems or APIs")) {
      throw new Error("Expected discovery question regarding systems or APIs");
    }
  });

  // Test 4: Draft for PROPOSAL Stage
  await runTest("Follow-up Drafting: PROPOSAL Stage Follow-up", async () => {
    await db.query(`UPDATE leads SET lead_status = 'PROPOSAL' WHERE id = $1;`, [leadId]);
    const draft = await LeadFollowupAgent.draftFollowup(leadId, "email");
    if (!draft.body.toLowerCase().includes("proposal")) {
      throw new Error("Expected PROPOSAL stage follow-up to mention proposal");
    }
  });

  // Test 5: Draft for NEGOTIATION Stage
  await runTest("Follow-up Drafting: NEGOTIATION Stage Alignment", async () => {
    await db.query(`UPDATE leads SET lead_status = 'NEGOTIATION' WHERE id = $1;`, [leadId]);
    const draft = await LeadFollowupAgent.draftFollowup(leadId, "email");
    if (!draft.body.toLowerCase().includes("statement of work") && !draft.body.toLowerCase().includes("kickoff")) {
      throw new Error("Expected NEGOTIATION stage draft to address SOW or kickoff");
    }
  });

  // Test 6: Draft for LOST Stage (Nurture)
  await runTest("Follow-up Drafting: LOST Stage Nurture Touchpoint", async () => {
    await db.query(`UPDATE leads SET lead_status = 'LOST' WHERE id = $1;`, [leadId]);
    const draft = await LeadFollowupAgent.draftFollowup(leadId, "email");
    if (!draft.body.toLowerCase().includes("not may not be") && !draft.body.toLowerCase().includes("blueprints") && !draft.body.toLowerCase().includes("future")) {
      throw new Error("Expected LOST stage draft to offer technical nurture without pressure");
    }
  });

  // Test 7: Human Review Gate (Authorize and Send)
  await runTest("Human Review Gate: Authorize and Send Draft Follow-up", async () => {
    // Verify initial message is draft in DB
    const initialCheck = await db.query(`SELECT status FROM crm_messages WHERE id = $1;`, [draftedMessageId]);
    if (initialCheck.rows[0].status !== "draft") {
      throw new Error("Message should be in 'draft' status before human review");
    }

    // Authorize send
    const sendResult = await LeadFollowupAgent.sendFollowup(draftedMessageId);
    if (!sendResult.success || !sendResult.sentAt) {
      throw new Error("Failed to send authorized follow-up");
    }

    // Verify status is now 'sent'
    const updatedCheck = await db.query(`SELECT status, sent_at FROM crm_messages WHERE id = $1;`, [draftedMessageId]);
    if (updatedCheck.rows[0].status !== "sent" || !updatedCheck.rows[0].sent_at) {
      throw new Error("Message status was not updated to 'sent' in database");
    }

    // Verify activity logged in crm_activities
    const activityCheck = await db.query(
      `SELECT * FROM crm_activities WHERE lead_id = $1 AND activity_type = 'followup_sent';`,
      [leadId]
    );
    if (activityCheck.rows.length === 0) {
      throw new Error("followup_sent activity was not logged in CRM");
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 10 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running Phase 10 tests:", err);
  process.exit(1);
});
