/**
 * IMPACT Growth OS — Phase 11 Internal AI Sales Assistant Test Suite
 * Validates the 7 canonical salesperson queries, supporting CRM context injection,
 * zero hallucination of missing data, and task creation in crm_tasks.
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { LeadIntakeService } from "../crm/services/leadIntakeService";
import { SalesAssistantService } from "../sales/salesAssistantService";

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
  console.log("  IMPACT GROWTH OS — PHASE 11 AI SALES ASSISTANT");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Create test lead with specific business problem
  const intakeRes = await LeadIntakeService.ingestLead({
    first_name: "Jonathan",
    last_name: "Sterling",
    email: "j.sterling@sterling-biotech.com",
    company: "Sterling Biotech",
    service_interest: "AI models",
    problem_statement: "Fine-tuning proprietary biomedical language models for clinical trial documentation.",
    timeline: "Within 60 days",
    budget_range: "$75,000",
    source: "website",
  });
  const leadId = intakeRes.leadId;

  // Test 1: "Summarize this lead."
  await runTest("AI Sales Assistant: 'Summarize this lead.'", async () => {
    const res = await SalesAssistantService.queryLeadAssistant(leadId, "Summarize this lead.");
    if (res.queryType !== "summarize_lead") {
      throw new Error(`Expected queryType 'summarize_lead', got '${res.queryType}'`);
    }
    if (!res.answer.includes("Jonathan Sterling") || !res.answer.includes("Sterling Biotech")) {
      throw new Error("Summary missing contact or company name");
    }
    if (!res.supportingCrmContext?.problemStatement?.includes("clinical trial")) {
      throw new Error("Supporting context missing problem statement");
    }
  });

  // Test 2: "What should I do next?"
  await runTest("AI Sales Assistant: 'What should I do next?'", async () => {
    const res = await SalesAssistantService.queryLeadAssistant(leadId, "What should I do next?");
    if (res.queryType !== "next_action") {
      throw new Error(`Expected queryType 'next_action', got '${res.queryType}'`);
    }
    if (!res.answer.includes("Review") || !res.answer.includes("discovery")) {
      throw new Error("Next action answer missing structured recommendation");
    }
  });

  // Test 3: "Draft a follow-up."
  await runTest("AI Sales Assistant: 'Draft a follow-up.'", async () => {
    const res = await SalesAssistantService.queryLeadAssistant(leadId, "Draft a follow-up.");
    if (res.queryType !== "draft_followup") {
      throw new Error(`Expected queryType 'draft_followup', got '${res.queryType}'`);
    }
    if (!res.draftMessage || res.draftMessage.status !== "draft") {
      throw new Error("Expected drafted message in 'draft' status");
    }
  });

  // Test 4: "What services might fit this business?"
  await runTest("AI Sales Assistant: 'What services might fit this business?'", async () => {
    const res = await SalesAssistantService.queryLeadAssistant(leadId, "What services might fit this business?");
    if (res.queryType !== "service_fit") {
      throw new Error(`Expected queryType 'service_fit', got '${res.queryType}'`);
    }
    if (!res.answer.includes("AI models")) {
      throw new Error("Expected recommended service fit to include AI models");
    }
  });

  // Test 5: "Summarize the conversation." (Zero hallucination when empty)
  await runTest("AI Sales Assistant: 'Summarize the conversation.' (Zero Hallucination)", async () => {
    const res = await SalesAssistantService.queryLeadAssistant(leadId, "Summarize the conversation.");
    if (res.queryType !== "conversation_summary") {
      throw new Error(`Expected queryType 'conversation_summary', got '${res.queryType}'`);
    }
    // Since this lead has only just been created without chat turns:
    if (!res.answer.includes("only the initial intake inquiry") && !res.answer.includes("Conversation History Summary")) {
      throw new Error("Expected honest statement of available records");
    }
  });

  // Test 6: "Prepare discovery questions."
  await runTest("AI Sales Assistant: 'Prepare discovery questions.'", async () => {
    const res = await SalesAssistantService.queryLeadAssistant(leadId, "Prepare discovery questions.");
    if (res.queryType !== "discovery_questions") {
      throw new Error(`Expected queryType 'discovery_questions', got '${res.queryType}'`);
    }
    if (!res.answer.includes("1.") || !res.answer.includes("2.")) {
      throw new Error("Expected numbered discovery questions");
    }
  });

  // Test 7: "Create a follow-up task."
  await runTest("AI Sales Assistant: 'Create a follow-up task.' (CRM Task Execution)", async () => {
    const res = await SalesAssistantService.queryLeadAssistant(leadId, "Create a follow-up task.");
    if (res.queryType !== "create_task" || !res.createdTask) {
      throw new Error("Expected task to be created");
    }

    // Verify task exists in crm_tasks table
    const dbTask = await db.query(`SELECT * FROM crm_tasks WHERE id = $1;`, [res.createdTask.id]);
    if (dbTask.rows.length === 0) {
      throw new Error("Task record was not found in crm_tasks database table");
    }
    if (dbTask.rows[0].lead_id !== leadId) {
      throw new Error("Task is not linked to lead ID");
    }
    if (dbTask.rows[0].status !== "PENDING") {
      throw new Error("Created task should have status PENDING");
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 11 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running Phase 11 tests:", err);
  process.exit(1);
});
