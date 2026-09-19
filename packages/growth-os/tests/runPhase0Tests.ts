import { db } from "../../database";
import { migrator } from "../../database/migrator";
import { seedDevelopmentDatabase } from "../../database/seed";
import {
  GROWTH_OS_MODULES,
  CORE_SERVICES,
  IMPACT_ENTERPRISE,
} from "../constants";
import { growthOsRepository } from "../repositories/growthOsRepository";
import { growthOsService } from "../services/growthOsService";
import { ROLE_PERMISSIONS } from "../../auth/roles";

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

export async function runAllPhase0Tests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 0 FOUNDATION VERIFICATION SUITE");
  console.log("=======================================================\n");

  // Step 0: Ensure database migrations are applied and seeded
  await migrator.migrateUp();
  await seedDevelopmentDatabase();

  // Test 1: Brand Positioning & Services Grounding
  await runTest("Brand Positioning & Services Grounding", async () => {
    if (IMPACT_ENTERPRISE.brandPositioning !== "IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT") {
      throw new Error(`Invalid brand positioning string: ${IMPACT_ENTERPRISE.brandPositioning}`);
    }

    if (IMPACT_ENTERPRISE.name !== "IMPACT Enterprise") {
      throw new Error(`Invalid company name: ${IMPACT_ENTERPRISE.name}`);
    }

    const expectedServices = [
      "AI models",
      "AI agents",
      "AI automation",
      "Make-based lead-conversion automation",
      "Chat agents",
      "Call agents",
      "Custom business applications",
      "Software development",
      "Business automation",
    ];

    if (CORE_SERVICES.length !== 9) {
      throw new Error(`Expected exactly 9 core services, found ${CORE_SERVICES.length}`);
    }

    for (const name of expectedServices) {
      const found = CORE_SERVICES.find((s) => s.name === name);
      if (!found) {
        throw new Error(`Required core service missing: "${name}"`);
      }
    }
  });

  // Test 2: Growth OS Modules Registry Completeness
  await runTest("Growth OS Modules Registry (All 14 Modules)", async () => {
    if (GROWTH_OS_MODULES.length !== 14) {
      throw new Error(`Expected exactly 14 Growth OS modules, found ${GROWTH_OS_MODULES.length}`);
    }

    const suites = new Set(GROWTH_OS_MODULES.map((m) => m.suite));
    if (!suites.has("marketing") || !suites.has("revenue") || !suites.has("operations")) {
      throw new Error("Missing one or more required suites: marketing, revenue, operations");
    }

    // Check numbering 1 through 14
    for (let i = 1; i <= 14; i++) {
      const mod = GROWTH_OS_MODULES.find((m) => m.number === i);
      if (!mod) {
        throw new Error(`Missing module number ${i}`);
      }
    }
  });

  // Test 3: Database Schema Tables & Column Verification
  await runTest("Database Migration 005 Tables & Constraints", async () => {
    const requiredTables = [
      "growth_os_modules",
      "content_campaigns",
      "content_posts",
      "content_approvals",
      "content_publish_logs",
      "crm_tasks",
      "lead_followup_sequences",
    ];

    for (const table of requiredTables) {
      const res = await db.query(
        `SELECT COUNT(*)::int AS cnt FROM ${table};`
      );
      if (res.rows[0].cnt === undefined) {
        throw new Error(`Table ${table} could not be queried.`);
      }
    }
  });

  // Test 4: Database Seeding Verification (Modules in DB)
  await runTest("Database Seeding Verification", async () => {
    const dbModules = await growthOsRepository.getModules();
    if (dbModules.length < 14) {
      throw new Error(`Expected at least 14 seeded modules in DB, found ${dbModules.length}`);
    }

    const campaigns = await growthOsRepository.getCampaigns();
    if (campaigns.length === 0) {
      throw new Error("Expected at least 1 seeded campaign");
    }

    const tasks = await growthOsRepository.getTasks();
    if (tasks.length === 0) {
      throw new Error("Expected at least 1 seeded task");
    }
  });

  // Test 5: Content Campaign & Post CRUD Operations
  let testCampaignId = "";
  let testPostId = "";
  await runTest("Content Campaign & Post Lifecycle Operations", async () => {
    const campaign = await growthOsRepository.createCampaign({
      name: "Phase 0 Verification Campaign",
      target_service: "AI agents",
      description: "Automated test campaign for Growth OS Phase 0",
      status: "active",
    });

    if (!campaign.id || campaign.name !== "Phase 0 Verification Campaign") {
      throw new Error("Campaign creation failed");
    }
    testCampaignId = campaign.id;

    const post = await growthOsRepository.createContentPost({
      campaign_id: testCampaignId,
      title: "Autonomous AI Agents in 2026",
      content: "Discover how IMPACT Enterprise deploys goal-directed AI agents to automate lead qualification.",
      target_platforms: ["linkedin", "twitter_x"],
      post_type: "social_post",
      status: "DRAFT",
      ai_model: "gemini-2.5-flash",
      tags: ["AI", "Enterprise", "Automation"],
    });

    if (!post.id || post.status !== "DRAFT") {
      throw new Error("Content post creation failed");
    }
    testPostId = post.id;

    // Test query by filter
    const posts = await growthOsRepository.getContentPosts({ campaignId: testCampaignId });
    if (posts.length !== 1 || posts[0].id !== testPostId) {
      throw new Error("Failed to query post by campaign ID filter");
    }
  });

  // Test 6: Content Approval State Machine & Synchronization
  await runTest("Content Approval State Machine Transition", async () => {
    if (!testPostId) throw new Error("Test post ID is missing");

    const approval = await growthOsRepository.createApproval({
      post_id: testPostId,
      status: "APPROVED",
      feedback: "Content adheres to IMPACT brand guidelines.",
    });

    if (!approval.id || approval.status !== "APPROVED") {
      throw new Error("Approval record creation failed");
    }

    // Verify the post's status was automatically updated to APPROVED
    const post = await growthOsRepository.getContentPostById(testPostId);
    if (!post || post.status !== "APPROVED") {
      throw new Error(`Expected post status APPROVED, received ${post?.status}`);
    }

    // Verify approval history lookup
    const history = await growthOsRepository.getApprovalsForPost(testPostId);
    if (history.length === 0 || history[0].id !== approval.id) {
      throw new Error("Approval history lookup failed");
    }
  });

  // Test 7: CRM Tasks Creation & Completion
  await runTest("CRM Tasks & Reminders State Progression", async () => {
    const task = await growthOsRepository.createTask({
      title: "Review Scheduled LinkedIn Posts",
      description: "Verify copy accuracy before automatic dispatch",
      priority: "HIGH",
      status: "PENDING",
      due_date: new Date(Date.now() + 86400000).toISOString(),
    });

    if (!task.id || task.status !== "PENDING") {
      throw new Error("Task creation failed");
    }

    const updated = await growthOsRepository.updateTaskStatus(task.id, "COMPLETED");
    if (!updated || updated.status !== "COMPLETED" || !updated.completed_at) {
      throw new Error("Task status transition to COMPLETED failed");
    }
  });

  // Test 8: Relational Foreign Key Cascades
  await runTest("Relational Foreign Key Cascade Deletion", async () => {
    if (!testPostId) throw new Error("Test post ID is missing");

    // Deleting post should cascade and delete approvals
    await db.query("DELETE FROM content_posts WHERE id = $1;", [testPostId]);

    const approvals = await growthOsRepository.getApprovalsForPost(testPostId);
    if (approvals.length !== 0) {
      throw new Error("Expected child approvals to be cascaded upon post deletion");
    }

    // Clean up test campaign
    if (testCampaignId) {
      await db.query("DELETE FROM content_campaigns WHERE id = $1;", [testCampaignId]);
    }
  });

  // Test 9: RBAC Module Permissions Mapping
  await runTest("RBAC Permissions Alignment for All Modules", async () => {
    const allSystemPermissions = new Set<string>();
    Object.values(ROLE_PERMISSIONS).forEach((perms) => perms.forEach((p) => allSystemPermissions.add(p)));

    for (const mod of GROWTH_OS_MODULES) {
      if (!allSystemPermissions.has(mod.minPermission)) {
        throw new Error(`Module ${mod.name} references non-existent permission: ${mod.minPermission}`);
      }
    }

    // Test service layer permission enrichment
    const superAdminCatalog = await growthOsService.getModuleCatalog(["system:manage"]);
    const permittedCount = superAdminCatalog.filter((m) => m.isPermitted).length;
    if (permittedCount !== 14) {
      throw new Error(`Expected all 14 modules permitted for Super Admin, got ${permittedCount}`);
    }

    const viewerCatalog = await growthOsService.getModuleCatalog(["dashboard:view"]);
    const viewerPermitted = viewerCatalog.filter((m) => m.isPermitted).length;
    if (viewerPermitted <= 0 || viewerPermitted >= 14) {
      throw new Error(`Expected selective permissions for Viewer, got ${viewerPermitted}`);
    }
  });

  // Test 10: Growth OS Health Telemetry
  await runTest("Growth OS Health Telemetry Engine", async () => {
    const health = await growthOsService.getHealth();
    if (health.status !== "healthy") {
      throw new Error(`Expected healthy engine status, got ${health.status}`);
    }
    if (health.brand.authorizedServicesCount !== 9) {
      throw new Error(`Expected 9 authorized services in health payload, got ${health.brand.authorizedServicesCount}`);
    }
  });

  // Test 11: Migration Rollback and Re-Apply
  await runTest("Migration 005 Rollback (migrateDown) & Re-apply (migrateUp)", async () => {
    let reverted = await migrator.migrateDown();
    while (reverted && reverted !== "005_growth_os_foundation") {
      reverted = await migrator.migrateDown();
    }
    if (reverted !== "005_growth_os_foundation") {
      throw new Error(`Expected reverted migration 005_growth_os_foundation, got ${reverted}`);
    }

    // Verify table is gone
    const checkTable = await db.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_name = 'growth_os_modules'
       );`
    );
    if (checkTable.rows[0].exists) {
      throw new Error("Table growth_os_modules still exists after rollback");
    }

    // Re-apply migration up
    const reapplied = await migrator.migrateUp();
    if (!reapplied.includes("005_growth_os_foundation")) {
      throw new Error("Failed to re-apply 005_growth_os_foundation");
    }

    // Re-seed
    await seedDevelopmentDatabase();
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 0 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    console.error("FAILURES DETECTED:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`  - ${r.name}: ${r.error}`);
    });
    return false;
  }

  console.log("\x1b[32mALL PHASE 0 FOUNDATION TESTS PASSED SUCCESSFULLY!\x1b[0m\n");
  return true;
}

// CLI Execution
if (require.main === module) {
  (async () => {
    try {
      const ok = await runAllPhase0Tests();
      await db.close();
      process.exit(ok ? 0 : 1);
    } catch (err) {
      console.error("Fatal test runner error:", err);
      process.exit(1);
    }
  })();
}
