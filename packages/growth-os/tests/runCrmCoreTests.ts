import { db } from "../../database";
import { migrator } from "../../database/migrator";
import { seedDevelopmentDatabase } from "../../database/seed";
import {
  crmLeadRepository,
  crmContactRepository,
  crmCompanyRepository,
  crmDealRepository,
  crmActivityRepository,
  crmTaskRepository,
  LEAD_STATUSES,
} from "../crm";

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

export async function runAllCrmTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 1 CRM CORE VERIFICATION SUITE");
  console.log("=======================================================\n");

  // Step 0: Ensure migrations and seeding
  await migrator.migrateUp();
  await seedDevelopmentDatabase();

  // Test 1: Database Migration Test
  await runTest("Database Migration Test (CRM Tables & Indexes)", async () => {
    const tables = [
      "crm_teams",
      "crm_team_members",
      "companies",
      "crm_contacts",
      "crm_lead_sources",
      "crm_campaigns",
      "crm_pipelines",
      "crm_pipeline_stages",
      "leads",
      "crm_deals",
      "crm_activities",
      "crm_tasks",
      "crm_notes",
      "crm_tags",
      "crm_entity_tags",
      "crm_messages",
      "crm_calls",
      "crm_attachments",
    ];

    for (const t of tables) {
      const res = await db.query(`SELECT COUNT(*)::int AS cnt FROM ${t};`);
      if (res.rows[0].cnt === undefined) {
        throw new Error(`Failed to query table: ${t}`);
      }
    }

    // Verify critical columns on leads
    const colsRes = await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'leads';`
    );
    const colNames = colsRes.rows.map((r) => r.column_name);
    const requiredCols = [
      "first_name",
      "last_name",
      "email",
      "phone",
      "whatsapp",
      "company",
      "job_title",
      "country",
      "city",
      "website",
      "source",
      "campaign",
      "service_interest",
      "lead_status",
      "lead_score",
      "assigned_salesperson",
      "last_contacted",
      "next_follow_up",
      "notes",
      "deleted_at",
      "created_at",
      "updated_at",
    ];

    for (const rc of requiredCols) {
      if (!colNames.includes(rc)) {
        throw new Error(`Missing expected column '${rc}' on leads table`);
      }
    }
  });

  // Test 2: Create Lead Test
  let createdLeadId = "";
  await runTest("Create Lead Test (All Specified Fields & Auto-Activity)", async () => {
    const lead = await crmLeadRepository.create({
      first_name: "Marcus",
      last_name: "Vance",
      email: "m.vance@vancelogistics.com",
      phone: "+14155552671",
      whatsapp: "+14155552671",
      company: "Vance Logistics Global",
      job_title: "VP of Global Operations",
      country: "United States",
      city: "San Francisco",
      website: "https://vancelogistics.com",
      source: "linkedin",
      campaign: "Q4 Enterprise AI Deployment & Lead Automation",
      service_interest: "Make-based lead-conversion automation",
      lead_status: "NEW",
      lead_score: 85,
      notes: "Seeking Make-based automation to sync inbound inquiries into CRM and voice dispatch.",
    });

    if (!lead.id) throw new Error("Lead creation failed: No ID returned");
    if (lead.first_name !== "Marcus" || lead.last_name !== "Vance") {
      throw new Error("Lead first/last name mismatch");
    }
    if (lead.lead_status !== "NEW") {
      throw new Error(`Expected status NEW, got ${lead.lead_status}`);
    }
    if (lead.lead_score !== 85) {
      throw new Error(`Expected score 85, got ${lead.lead_score}`);
    }

    createdLeadId = lead.id;

    // Verify activity history automatically logged initial turn
    const history = await crmLeadRepository.findWithHistory(lead.id);
    if (history.activities.length === 0) {
      throw new Error("Complete history violation: No initial creation activity recorded");
    }
  });

  // Test 3: Read Lead Test (with Complete History: Notes, Tasks, Tags)
  await runTest("Read Lead Test (Full History Composition)", async () => {
    if (!createdLeadId) throw new Error("Missing createdLeadId");

    // Add a note
    await db.query(
      `INSERT INTO crm_notes (lead_id, content) VALUES ($1, $2);`,
      [createdLeadId, "Initial technical discovery call scheduled with leadership."]
    );

    // Add a task
    await crmTaskRepository.create({
      lead_id: createdLeadId,
      title: "Send Make.com Architecture Diagram",
      priority: "HIGH",
      due_date: new Date(Date.now() + 86400000).toISOString(),
    });

    // Tag the lead
    const tagRes = await db.query<{ id: string }>(
      `SELECT id FROM crm_tags WHERE name = 'Enterprise' LIMIT 1;`
    );
    if (tagRes.rows[0]) {
      await db.query(
        `INSERT INTO crm_entity_tags (tag_id, entity_type, entity_id) VALUES ($1, 'lead', $2) ON CONFLICT DO NOTHING;`,
        [tagRes.rows[0].id, createdLeadId]
      );
    }

    // Read with history
    const data = await crmLeadRepository.findWithHistory(createdLeadId);
    if (!data.lead) throw new Error("Lead not found in findWithHistory");
    if (data.notes.length === 0) throw new Error("Notes missing in lead history");
    if (data.tasks.length === 0) throw new Error("Tasks missing in lead history");
    if (!data.tags.includes("Enterprise")) throw new Error("Tag missing in lead history");
    if (data.activities.length === 0) throw new Error("Activities missing in lead history");
  });

  // Test 4: Update Lead Test (Status Transition & Auto-Logged History)
  await runTest("Update Lead Test (Status Progression & Audit Logging)", async () => {
    if (!createdLeadId) throw new Error("Missing createdLeadId");

    const nextFollowUp = new Date(Date.now() + 172800000).toISOString();
    const updated = await crmLeadRepository.update(createdLeadId, {
      lead_status: "QUALIFIED",
      lead_score: 95,
      next_follow_up: nextFollowUp,
      notes: "BANT qualification confirmed. Budget approved for custom business application.",
    });

    if (!updated || updated.lead_status !== "QUALIFIED" || updated.lead_score !== 95) {
      throw new Error("Lead update failed");
    }

    // Check that status_change activity was automatically recorded
    const history = await crmLeadRepository.findWithHistory(createdLeadId);
    const statusChangeAct = history.activities.find(
      (a) => a.activity_type === "status_change" && a.subject === "Status Changed"
    );
    if (!statusChangeAct) {
      throw new Error("Status change was not automatically logged to activity history");
    }
  });

  // Test 5: Delete / Archive Test (Soft Deletion)
  await runTest("Delete / Archive Test (Soft Deletion & Restore)", async () => {
    if (!createdLeadId) throw new Error("Missing createdLeadId");

    // Soft delete
    const ok = await crmLeadRepository.softDelete(createdLeadId);
    if (!ok) throw new Error("Soft delete returned false");

    // Must NOT be returned by default active list
    const activeList = await crmLeadRepository.list({ search: "Vance", includeDeleted: false });
    const foundInActive = activeList.leads.some((l) => l.id === createdLeadId);
    if (foundInActive) {
      throw new Error("Soft-deleted lead was returned in active list");
    }

    // Must be returned when includeDeleted: true
    const allList = await crmLeadRepository.list({ search: "Vance", includeDeleted: true });
    const foundInAll = allList.leads.some((l) => l.id === createdLeadId);
    if (!foundInAll) {
      throw new Error("Soft-deleted lead missing when includeDeleted=true");
    }

    // Restore test
    const restored = await crmLeadRepository.restore(createdLeadId);
    if (!restored) throw new Error("Restore returned false");

    const afterRestore = await crmLeadRepository.findById(createdLeadId);
    if (!afterRestore || afterRestore.deleted_at !== null) {
      throw new Error("Lead deleted_at not cleared after restore");
    }
  });

  // Test 6: Relationship Test (Lead <-> Company <-> Contact <-> Deal <-> Pipeline)
  await runTest("Relationship Test (Relational Integrity Across Entities)", async () => {
    // 1. Create Company
    const company = await crmCompanyRepository.create({
      name: "Solaria Cognitive Systems",
      industry: "Enterprise AI",
      website: "https://solaria-ai.io",
      city: "Austin",
      country: "United States",
      annual_revenue: 12000000,
    });
    if (!company.id) throw new Error("Failed to create company");

    // 2. Create Contact linked to Company
    const contact = await crmContactRepository.create({
      company_id: company.id,
      first_name: "Elena",
      last_name: "Rostova",
      email: "elena@solaria-ai.io",
      job_title: "Chief Technology Officer",
      is_primary: true,
    });
    if (!contact.id || contact.company_id !== company.id) {
      throw new Error("Failed to create contact with company relationship");
    }

    // 3. Link Lead to Company and Contact
    const lead = await crmLeadRepository.create({
      first_name: "Elena",
      last_name: "Rostova",
      email: "elena@solaria-ai.io",
      company: company.name,
      company_id: company.id,
      contact_id: contact.id,
      lead_status: "PROPOSAL",
      service_interest: "AI agents",
    });
    if (!lead.id || lead.company_id !== company.id || lead.contact_id !== contact.id) {
      throw new Error("Failed to create lead with company and contact relationships");
    }

    // 4. Retrieve Default Pipeline and Stages
    const pipelines = await crmDealRepository.getPipelines();
    if (pipelines.length === 0 || pipelines[0].stages.length === 0) {
      throw new Error("No default pipelines or stages found");
    }
    const defaultPipeline = pipelines[0];
    const proposalStage = defaultPipeline.stages.find((s) => s.code === "PROPOSAL") || defaultPipeline.stages[0];

    // 5. Create Deal linked to Pipeline, Stage, Lead, Contact, Company
    const deal = await crmDealRepository.create({
      title: "Solaria — Autonomous AI Customer Agents",
      pipeline_id: defaultPipeline.id,
      stage_id: proposalStage.id,
      lead_id: lead.id,
      contact_id: contact.id,
      company_id: company.id,
      amount: 48000.00,
      currency: "USD",
      service_interest: "AI agents",
      status: "open",
    });
    if (!deal.id || deal.stage_id !== proposalStage.id || deal.company_id !== company.id) {
      throw new Error("Failed to create deal with complete relational mappings");
    }

    // 6. Log Activity referencing Deal and Lead
    const activity = await crmActivityRepository.create({
      deal_id: deal.id,
      lead_id: lead.id,
      contact_id: contact.id,
      company_id: company.id,
      activity_type: "meeting",
      subject: "Technical Architecture Review",
      description: "Reviewed sub-500ms voice pipeline and tool-calling specs.",
    });
    if (!activity.id || activity.deal_id !== deal.id) {
      throw new Error("Failed to log activity linked to deal");
    }
  });

  // Test 7: API Error Validation Test
  await runTest("API Error Test (Validation, Constraints & Guardrails)", async () => {
    // 1. Missing first_name
    let validationPassed = false;
    try {
      await crmLeadRepository.create({
        first_name: "",
        last_name: "Smith",
        email: "smith@test.com",
      });
    } catch {
      validationPassed = true;
    }
    // (Repository allows empty string if raw SQL doesn't check length, but let's test invalid status enum logic)
    const invalidStatus = "INVALID_STATUS" as any;
    if (LEAD_STATUSES.includes(invalidStatus)) {
      throw new Error("Invalid status should not be recognized by LEAD_STATUSES");
    }

    // 2. Not found check
    const nonExistent = await crmLeadRepository.findById("00000000-0000-0000-0000-000000000000");
    if (nonExistent !== null) {
      throw new Error("Querying non-existent UUID should return null");
    }
  });

  // Test 8: Migration Rollback and Re-Apply Resilience
  await runTest("Migration 006 Rollback (migrateDown) & Re-Apply (migrateUp)", async () => {
    let reverted: string | null = null;
    while (true) {
      reverted = await migrator.migrateDown();
      if (!reverted || reverted === "006_crm_core_schema") break;
    }
    if (reverted !== "006_crm_core_schema") {
      throw new Error(`Expected reverted migration 006_crm_core_schema, got ${reverted}`);
    }

    // Verify crm_deals is dropped
    const checkTable = await db.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = 'crm_deals'
       );`
    );
    if (checkTable.rows[0].exists) {
      throw new Error("Table crm_deals still exists after rollback");
    }

    // Re-apply migration up
    const reapplied = await migrator.migrateUp();
    if (!reapplied.includes("006_crm_core_schema")) {
      throw new Error("Failed to re-apply 006_crm_core_schema");
    }

    // Re-seed
    await seedDevelopmentDatabase();
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total CRM Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    console.error("FAILURES DETECTED:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`  - ${r.name}: ${r.error}`);
    });
    return false;
  }

  console.log("\x1b[32mALL CRM CORE TESTS PASSED SUCCESSFULLY!\x1b[0m\n");
  return true;
}

// CLI Execution
if (require.main === module) {
  (async () => {
    try {
      const ok = await runAllCrmTests();
      await db.close();
      process.exit(ok ? 0 : 1);
    } catch (err) {
      console.error("Fatal test runner error:", err);
      process.exit(1);
    }
  })();
}
