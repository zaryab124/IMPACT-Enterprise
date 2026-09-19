/**
 * IMPACT Growth OS — Phase 8 Lead Intake & Attribution Test Suite
 * Tests the 6 specified scenarios:
 * 1. Website lead ingestion & attribution
 * 2. Duplicate lead deduplication & merge
 * 3. Incomplete lead validation
 * 4. Invalid email rejection
 * 5. Invalid phone rejection
 * 6. Existing customer linkage
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { LeadIntakeService } from "../crm/services/leadIntakeService";

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
  console.log("  IMPACT GROWTH OS — PHASE 8 LEAD INTAKE & ATTRIBUTION");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Test 1: Ingest Website Lead with Attribution
  let originalLeadId = "";
  await runTest("Lead Intake: Standard Website Lead with Full Attribution", async () => {
    const intakeResult = await LeadIntakeService.ingestLead({
      first_name: "Marcus",
      last_name: "Vance",
      email: "marcus.vance@vanguard-logistics.io",
      phone: "+1-415-555-0182",
      whatsapp: "+1-415-555-0182",
      company: "Vanguard Logistics Global",
      job_title: "VP Supply Chain",
      source: "website",
      campaign: "Q4 Supply Chain AI Modernization",
      landing_page: "/solutions/ai-automation",
      referrer: "https://linkedin.com/ad-track",
      service_interest: "AI automation",
      problem_statement: "Need automated freight invoice processing and customs clearance routing.",
    });

    if (!intakeResult.success || !intakeResult.leadId) {
      throw new Error("Failed to ingest standard website lead");
    }
    if (intakeResult.isDuplicate || intakeResult.action !== "created") {
      throw new Error("First intake should be a new created lead");
    }
    originalLeadId = intakeResult.leadId;

    // Verify attribution in DB
    const leadRow = await db.query(`SELECT * FROM leads WHERE id = $1;`, [originalLeadId]);
    const lead = leadRow.rows[0];
    if (lead.source !== "website") {
      throw new Error(`Expected source 'website', got '${lead.source}'`);
    }
    if (lead.campaign !== "Q4 Supply Chain AI Modernization") {
      throw new Error(`Attribution campaign mismatch: got '${lead.campaign}'`);
    }
    if (lead.landing_page !== "/solutions/ai-automation") {
      throw new Error(`Attribution landing page mismatch: got '${lead.landing_page}'`);
    }
  });

  // Test 2: Duplicate Lead (Matches Email -> Merged Without Creating Rogue Lead)
  await runTest("Lead Deduplication: Duplicate Inbound Inquiry Merged", async () => {
    const duplicateResult = await LeadIntakeService.ingestLead({
      first_name: "Marcus",
      last_name: "Vance",
      email: "marcus.vance@vanguard-logistics.io",
      source: "whatsapp",
      campaign: "WhatsApp Direct Inbound",
      service_interest: "AI automation",
      problem_statement: "Following up regarding automated invoice clearance.",
    });

    if (!duplicateResult.success) {
      throw new Error("Duplicate intake should succeed with merge action");
    }
    if (!duplicateResult.isDuplicate || duplicateResult.action !== "merged") {
      throw new Error(`Expected action 'merged' with isDuplicate=true, got action='${duplicateResult.action}', isDuplicate=${duplicateResult.isDuplicate}`);
    }
    if (duplicateResult.leadId !== originalLeadId) {
      throw new Error(`Expected duplicate to merge into original lead ID ${originalLeadId}, got ${duplicateResult.leadId}`);
    }

    // Verify DB activity logged
    const activities = await db.query(
      `SELECT * FROM crm_activities WHERE lead_id = $1 AND activity_type = 'lead_duplicate_touchpoint';`,
      [originalLeadId]
    );
    if (activities.rows.length === 0) {
      throw new Error("Duplicate touchpoint activity was not recorded");
    }
  });

  // Test 3: Incomplete Lead (Missing all contact channels)
  await runTest("Lead Validation: Incomplete Lead Missing All Contact Channels", async () => {
    let rejected = false;
    try {
      await LeadIntakeService.ingestLead({
        first_name: "Ghost",
        company: "No Contact Corp",
        source: "website",
      });
    } catch (err: any) {
      if (err.message.includes("Validation Error: Lead must provide at least one contact channel")) {
        rejected = true;
      }
    }
    if (!rejected) {
      throw new Error("Intake should reject lead with no email, phone, or whatsapp");
    }
  });

  // Test 4: Invalid Email
  await runTest("Lead Validation: Rejects Malformed Email", async () => {
    let rejected = false;
    try {
      await LeadIntakeService.ingestLead({
        first_name: "Alice",
        email: "not-an-email-address",
        source: "contact_form",
      });
    } catch (err: any) {
      if (err.message.includes("Validation Error: Invalid email format")) {
        rejected = true;
      }
    }
    if (!rejected) {
      throw new Error("Intake should reject malformed email");
    }
  });

  // Test 5: Invalid Phone
  await runTest("Lead Validation: Rejects Obsoletely Short / Invalid Phone", async () => {
    let rejected = false;
    try {
      await LeadIntakeService.ingestLead({
        first_name: "Bob",
        phone: "123",
        source: "contact_form",
      });
    } catch (err: any) {
      if (err.message.includes("Validation Error: Invalid phone number")) {
        rejected = true;
      }
    }
    if (!rejected) {
      throw new Error("Intake should reject phone with fewer than 7 digits");
    }
  });

  // Test 6: Existing Customer Linkage
  await runTest("Existing Customer: Links Inbound Lead to Existing Customer Record", async () => {
    // 1. Create existing customer directly
    const custRes = await db.query(
      `INSERT INTO customers (name, email, phone, source)
       VALUES ('Evelyn Thorne', 'evelyn@thorne-aerospace.com', '+1-206-555-0144', 'referral')
       ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
       RETURNING id;`
    );
    const existingCustId = custRes.rows[0].id;

    // 2. Ingest lead with that customer's email
    const intakeRes = await LeadIntakeService.ingestLead({
      first_name: "Evelyn",
      last_name: "Thorne",
      email: "evelyn@thorne-aerospace.com",
      company: "Thorne Aerospace",
      source: "referral",
      service_interest: "Custom business applications",
      problem_statement: "Expanding contract into custom flight inventory portal.",
    });

    if (!intakeRes.success) {
      throw new Error("Failed to ingest lead for existing customer");
    }

    // Verify lead record has customer_id linked
    const leadCheck = await db.query(`SELECT customer_id FROM leads WHERE id = $1;`, [intakeRes.leadId]);
    if (leadCheck.rows[0].customer_id !== existingCustId) {
      throw new Error(
        `Expected customer_id to link to existing customer ${existingCustId}, got ${leadCheck.rows[0].customer_id}`
      );
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 8 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running Phase 8 tests:", err);
  process.exit(1);
});
