/**
 * IMPACT Growth OS — Phase 9 Lead Qualification Agent Test Suite
 * Tests AI evaluation of 8 dimensions, scoring, 4 status tiers,
 * human override workflow, and historical audit trail.
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { LeadIntakeService } from "../crm/services/leadIntakeService";
import { LeadQualificationAgent } from "../crm/services/leadQualificationAgent";

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
  console.log("  IMPACT GROWTH OS — PHASE 9 AI LEAD QUALIFICATION");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Test 1: Qualify High-Intent Lead
  let highIntentLeadId = "";
  let highIntentQual: any;
  await runTest("AI Qualification: High-Intent Lead with Urgent Needs", async () => {
    const leadRes = await LeadIntakeService.ingestLead({
      first_name: "Alexander",
      last_name: "Wright",
      email: "alexander@apex-fintech.io",
      company: "Apex Financial Technologies",
      service_interest: "AI agents",
      problem_statement: "Deploying autonomous AI agents to automate regulatory reporting and portfolio audits.",
      timeline: "Immediate deployment within 30 days",
      budget_range: "$50,000 - $100,000 approved budget",
      source: "website",
    });
    highIntentLeadId = leadRes.leadId;

    highIntentQual = await LeadQualificationAgent.qualifyLead(highIntentLeadId);
    if (!highIntentQual.qualificationId) {
      throw new Error("Failed to return qualificationId");
    }
    if (highIntentQual.leadScore < 70) {
      throw new Error(`Expected score >= 70 for high-intent lead, got ${highIntentQual.leadScore}`);
    }
    if (highIntentQual.qualificationStatus !== "HIGH_INTENT" && highIntentQual.qualificationStatus !== "QUALIFIED") {
      throw new Error(`Expected HIGH_INTENT or QUALIFIED, got ${highIntentQual.qualificationStatus}`);
    }
    if (highIntentQual.urgency !== "HIGH" && highIntentQual.urgency !== "CRITICAL") {
      throw new Error(`Expected urgency HIGH or CRITICAL, got ${highIntentQual.urgency}`);
    }
    if (!highIntentQual.reasoningSummary || !highIntentQual.recommendedNextAction) {
      throw new Error("Missing reasoningSummary or recommendedNextAction");
    }
  });

  // Test 2: Qualify Low-Intent / Unqualified Lead
  await runTest("AI Qualification: Unqualified Lead with Vague Intent", async () => {
    const leadRes = await LeadIntakeService.ingestLead({
      first_name: "Student",
      email: "curious@university.edu",
      company: "Independent",
      service_interest: "Software development",
      problem_statement: "Just asking general questions about AI.",
      timeline: "Someday in 2 years",
      budget_range: "No budget",
      source: "social_media",
    });

    const qual = await LeadQualificationAgent.qualifyLead(leadRes.leadId);
    if (qual.leadScore > 65) {
      throw new Error(`Expected low score for unqualified lead, got ${qual.leadScore}`);
    }
    if (qual.qualificationStatus !== "UNQUALIFIED" && qual.qualificationStatus !== "POTENTIAL") {
      throw new Error(`Expected UNQUALIFIED or POTENTIAL, got ${qual.qualificationStatus}`);
    }
  });

  // Test 3: Historical Audit Storage
  await runTest("AI Qualification: Historical Record and Metadata Stored", async () => {
    const history = await LeadQualificationAgent.getQualificationHistory(highIntentLeadId);
    if (history.length === 0) {
      throw new Error("Expected at least one historical qualification record");
    }
    const record = history[0];
    if (!record.model || !record.input_snapshot || !record.confidence) {
      throw new Error("Historical record missing model, input_snapshot, or confidence");
    }
  });

  // Test 4: Human Sales Staff Override
  await runTest("AI Qualification: Human Sales Staff Override Workflow", async () => {
    const override = await LeadQualificationAgent.overrideQualification(
      highIntentQual.qualificationId,
      {
        overriddenStatus: "HIGH_INTENT",
        overriddenScore: 98,
        overrideReason: "Direct C-suite sponsor confirmed budget during emergency phone call.",
        overriddenBy: undefined,
      }
    );

    if (!override.is_overridden) {
      throw new Error("Expected is_overridden to be TRUE");
    }
    if (override.overridden_status !== "HIGH_INTENT" || override.overridden_score !== 98) {
      throw new Error("Overridden status or score mismatch");
    }

    // Verify leads table updated
    const leadCheck = await db.query(`SELECT lead_score, lead_status FROM leads WHERE id = $1;`, [highIntentLeadId]);
    if (leadCheck.rows[0].lead_score !== 98) {
      throw new Error(`Expected lead_score 98 in leads table, got ${leadCheck.rows[0].lead_score}`);
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 9 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running Phase 9 tests:", err);
  process.exit(1);
});
