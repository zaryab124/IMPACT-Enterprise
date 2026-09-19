/**
 * IMPACT Growth OS — Phase 15 Automation Engine Tests
 * Tests each of the 7 canonical event automations:
 * 1. NEW_LEAD → assign owner → calculate AI qualification → create follow-up task
 * 2. APPROVED_CONTENT → schedule publishing
 * 3. PUBLISHED_CONTENT → record publication
 * 4. FOLLOW_UP_DUE → notify salesperson
 * 5. LEAD_INACTIVE → create follow-up recommendation
 * 6. DEAL_WON → create onboarding task
 * 7. DEAL_LOST → optionally enter nurture workflow
 * Plus: Loop prevention safeguard & rule enable/disable toggle.
 */

import { db } from "../../database";
import { AutomationEngine } from "../automation/automationEngine";
import { LeadIntakeService } from "../crm/services/leadIntakeService";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
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

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

export async function runAutomationEngineTests() {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 15 AUTOMATION ENGINE TESTS");
  console.log("=======================================================\n");

  await db.query("SELECT 1;");
  await AutomationEngine.initializeDefaultRules();

  // Test 1: NEW_LEAD Automation Pipeline
  await test("Event NEW_LEAD: Assign Owner → Calculate AI Qualify → Create Task", async () => {
    const intake = await LeadIntakeService.ingestLead({
      first_name: "Marcus",
      last_name: "Brody",
      email: "m.brody@museum-archaeology.org",
      company: "Museum of Antiquities",
      source: "website",
      service_interest: "AI agents",
      problem_statement: "Need cataloging agents with high precision and automated verification.",
      budget_range: "$30,000 - $60,000",
      timeline: "Immediate",
    });

    const leadId = intake.leadId;

    const logs = await AutomationEngine.triggerEvent(
      "NEW_LEAD",
      "lead",
      leadId,
      { source: "website", _force: true }
    );

    assert(logs.length > 0, "At least one automation rule must fire");
    const successLog = logs.find((l) => l.status === "SUCCESS");
    assert(Boolean(successLog), "Rule execution must succeed");
    assert(successLog?.actions_executed.includes("ASSIGN_OWNER") === true, "Owner assigned");
    assert(successLog?.actions_executed.includes("CALCULATE_AI_QUALIFICATION") === true, "AI qualification calculated");
    assert(successLog?.actions_executed.includes("CREATE_TASK") === true, "Task created");

    // Verify task in DB
    const tasksRes = await db.query(`SELECT * FROM crm_tasks WHERE lead_id = $1`, [leadId]);
    assert(tasksRes.rows.length >= 1, "CRM task must be persisted in database");
  });

  // Test 2: APPROVED_CONTENT Automation Pipeline
  await test("Event APPROVED_CONTENT: Automatically Schedules Publishing", async () => {
    const postRes = await db.query(
      `INSERT INTO content_posts (
        title, content, platform, format, objective, service, status, created_at, updated_at
      ) VALUES ('Automation Post', 'Automation post copy', 'linkedin', 'post', 'SHOW_EXPERTISE', 'AI automation', 'APPROVED', NOW(), NOW())
      RETURNING *;`
    );
    const postId = postRes.rows[0].id;

    const logs = await AutomationEngine.triggerEvent(
      "APPROVED_CONTENT",
      "post",
      postId,
      { status: "APPROVED", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Rule execution must succeed");

    // Verify post status updated to SCHEDULED
    const updatedPost = await db.query(`SELECT status, scheduled_at FROM content_posts WHERE id = $1`, [postId]);
    assert(updatedPost.rows[0].status === "SCHEDULED", "Post must transition to SCHEDULED");
    assert(Boolean(updatedPost.rows[0].scheduled_at), "Scheduled timestamp must be set");
  });

  // Test 3: PUBLISHED_CONTENT Automation Pipeline
  await test("Event PUBLISHED_CONTENT: Records Publication & Log Entry", async () => {
    const postRes = await db.query(
      `INSERT INTO content_posts (
        title, content, platform, format, objective, service, status, created_at, updated_at
      ) VALUES ('Chat Agent Case Study', 'Chat agent case study', 'linkedin', 'post', 'DRIVE_INQUIRIES', 'Chat agents', 'SCHEDULED', NOW(), NOW())
      RETURNING *;`
    );
    const postId = postRes.rows[0].id;

    const logs = await AutomationEngine.triggerEvent(
      "PUBLISHED_CONTENT",
      "post",
      postId,
      { status: "PUBLISHED", platform: "linkedin", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Rule execution must succeed");

    // Verify publication log created
    const pubLog = await db.query(`SELECT * FROM content_publish_logs WHERE post_id = $1`, [postId]);
    assert(pubLog.rows.length >= 1, "Publish log must be persisted");
  });

  // Test 4: FOLLOW_UP_DUE Automation Pipeline
  await test("Event FOLLOW_UP_DUE: Triggers Salesperson SLA Notification", async () => {
    const leadRes = await db.query(`SELECT id FROM leads LIMIT 1`);
    const leadId = leadRes.rows[0].id;

    const logs = await AutomationEngine.triggerEvent(
      "FOLLOW_UP_DUE",
      "lead",
      leadId,
      { is_overdue: true, _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Rule execution must succeed");

    // Verify SLA notification activity in DB
    const actRes = await db.query(
      `SELECT * FROM crm_activities WHERE lead_id = $1 AND activity_type = 'follow_up_overdue_alert'`,
      [leadId]
    );
    assert(actRes.rows.length >= 1, "Overdue SLA activity must be logged");
  });

  // Test 5: LEAD_INACTIVE Automation Pipeline
  await test("Event LEAD_INACTIVE: Generates Cadence Recommendation & Task", async () => {
    const leadRes = await db.query(`SELECT id FROM leads LIMIT 1`);
    const leadId = leadRes.rows[0].id;

    const logs = await AutomationEngine.triggerEvent(
      "LEAD_INACTIVE",
      "lead",
      leadId,
      { days_since_contact: 21, _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Rule execution must succeed");

    // Verify recommendation activity
    const actRes = await db.query(
      `SELECT * FROM crm_activities WHERE lead_id = $1 AND activity_type = 'lead_reengagement_recommended'`,
      [leadId]
    );
    assert(actRes.rows.length >= 1, "Re-engagement recommendation activity logged");
  });

  // Test 6: DEAL_WON Automation Pipeline
  await test("Event DEAL_WON: Creates Client Onboarding Kickoff Task", async () => {
    const pipelinesRes = await db.query("SELECT id FROM crm_pipelines LIMIT 1");
    const stagesRes = await db.query("SELECT id FROM crm_pipeline_stages LIMIT 1");

    const dealRes = await db.query(
      `INSERT INTO crm_deals (
        title, pipeline_id, stage_id, amount, status
      ) VALUES ('Enterprise Pilot Package', $1, $2, 45000, 'won')
      RETURNING *;`,
      [pipelinesRes.rows[0].id, stagesRes.rows[0].id]
    );
    const dealId = dealRes.rows[0].id;

    const logs = await AutomationEngine.triggerEvent(
      "DEAL_WON",
      "deal",
      dealId,
      { status: "won", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Rule execution must succeed");

    // Verify onboarding task
    const taskRes = await db.query(
      `SELECT * FROM crm_tasks WHERE deal_id = $1 AND priority = 'urgent'`,
      [dealId]
    );
    assert(taskRes.rows.length >= 1, "Client onboarding task must be created");
  });

  // Test 7: DEAL_LOST Automation Pipeline
  await test("Event DEAL_LOST: Schedules Nurture Workflow Activity", async () => {
    const pipelinesRes = await db.query("SELECT id FROM crm_pipelines LIMIT 1");
    const stagesRes = await db.query("SELECT id FROM crm_pipeline_stages LIMIT 1");

    const dealRes = await db.query(
      `INSERT INTO crm_deals (
        title, pipeline_id, stage_id, amount, status
      ) VALUES ('Postponed AI Initiative', $1, $2, 20000, 'lost')
      RETURNING *;`,
      [pipelinesRes.rows[0].id, stagesRes.rows[0].id]
    );
    const dealId = dealRes.rows[0].id;

    const logs = await AutomationEngine.triggerEvent(
      "DEAL_LOST",
      "deal",
      dealId,
      { status: "lost", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Rule execution must succeed");

    // Verify nurture activity
    const actRes = await db.query(
      `SELECT * FROM crm_activities WHERE deal_id = $1 AND activity_type = 'entered_nurture_workflow'`,
      [dealId]
    );
    assert(actRes.rows.length >= 1, "Nurture sequence activity logged");
  });

  // Test 8: Loop Prevention Safeguards (Max Depth Abort)
  await test("Loop Prevention: Aborts and Logs When Depth Exceeds Threshold (Depth > 3)", async () => {
    const logs = await AutomationEngine.triggerEvent(
      "NEW_LEAD",
      "lead",
      "00000000-0000-0000-0000-000000000001",
      { _force: true },
      4 // Depth 4 > MAX_DEPTH 3
    );

    assert(logs.length === 1, "Must return single log");
    assert(logs[0].status === "FAILED", "Must be marked FAILED");
    assert(logs[0].error_message?.includes("Loop prevention triggered") === true, "Must flag loop prevention");
  });

  // Test 9: Rule Enable / Disable Status Toggle
  await test("Rule Toggle: Disabled Rules are Marked SKIPPED", async () => {
    const rules = await AutomationEngine.listRules();
    const targetRule = rules[0];

    // Disable rule
    await AutomationEngine.toggleRule(targetRule.id, false);

    const logs = await AutomationEngine.triggerEvent(
      targetRule.trigger_event,
      "lead",
      "00000000-0000-0000-0000-000000000002",
      { _force: true }
    );

    const targetLog = logs.find((l) => l.rule_id === targetRule.id);
    assert(targetLog?.status === "SKIPPED", "Disabled rule must be marked SKIPPED");

    // Re-enable rule
    await AutomationEngine.toggleRule(targetRule.id, true);
  });

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 15 Tests: ${results.length} | Passed: ${results.filter((r) => r.passed).length} | Failed: ${results.filter((r) => !r.passed).length}`);
  console.log("-------------------------------------------------------\n");

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAutomationEngineTests().catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
  });
}
