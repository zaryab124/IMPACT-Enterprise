import { db } from "../index";
import { migrator } from "../migrator";
import { seedDevelopmentDatabase } from "../seed";
import { checkDatabaseHealth } from "../health";
import {
  customerRepository,
  leadRepository,
  conversationRepository,
  appointmentRepository,
  userRepository,
  knowledgeRepository,
  auditRepository,
} from "../repositories";

interface TestReportItem {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const report: TestReportItem[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`  ▶ Running test: ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    report.push({ name, passed: true, durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
    report.push({ name, passed: false, error: err.message, durationMs });
  }
}

export async function runAllDatabaseTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 2 DATABASE VERIFICATION SUITE");
  console.log("=======================================================\n");

  // 1. Connection Test
  await runTest("Database Connection Health Check", async () => {
    const health = await checkDatabaseHealth();
    if (!health.connected) {
      throw new Error(`Health check failed: ${health.error}`);
    }
  });

  // 2. Migration Execution Test
  await runTest("Migration Up Execution (001_initial_schema)", async () => {
    const applied = await migrator.migrateUp();
    const allApplied = await migrator.getAppliedMigrations();
    if (!allApplied.includes("001_initial_schema")) {
      throw new Error("001_initial_schema was not recorded in schema_migrations");
    }
  });

  // 3. Seed Execution Test
  await runTest("Development Seed Data Execution", async () => {
    await seedDevelopmentDatabase();
    const admin = await userRepository.findByEmail("admin@impact.enterprise");
    if (!admin) throw new Error("Seed admin user not found");
    if (!admin.roles.includes("SUPER_ADMIN")) throw new Error("Admin missing SUPER_ADMIN role");

    const services = await knowledgeRepository.listServices();
    if (services.length < 4) throw new Error(`Expected >=4 services, found ${services.length}`);

    const caseStudies = await knowledgeRepository.listCaseStudies();
    if (caseStudies.length < 3) throw new Error(`Expected >=3 case studies, found ${caseStudies.length}`);
  });

  // 4. Insert & Read CRUD Test
  let testCustomerId = "";
  let testLeadId = "";
  let testConversationId = "";

  await runTest("Insert & Read Operations (Customer, Conversation, Lead, Appointment)", async () => {
    // Insert customer
    const testEmail = `test.client.${Date.now()}@example.com`;
    const customer = await customerRepository.upsert({
      name: "Acme Dynamics",
      email: testEmail,
      phone: "+1 555 0199",
      country: "United States",
      source: "web_chat",
    });
    if (!customer.id) throw new Error("Customer insertion failed");
    testCustomerId = customer.id;

    // Read customer
    const fetchedCustomer = await customerRepository.findById(testCustomerId);
    if (!fetchedCustomer || fetchedCustomer.email !== testEmail) {
      throw new Error("Fetched customer data does not match inserted record");
    }

    // Insert conversation
    const conversation = await conversationRepository.create({
      customerId: testCustomerId,
      channel: "web_chat",
      metadata: { referrer: "https://impact-enterprise.vercel.app" },
    });
    if (!conversation.id) throw new Error("Conversation insertion failed");
    testConversationId = conversation.id;

    // Insert message
    const msg = await conversationRepository.addMessage({
      conversationId: testConversationId,
      senderType: "customer",
      content: "Hello, I am interested in building an autonomous sales agent for our CRM.",
    });
    if (!msg.id) throw new Error("Message insertion failed");

    // Insert lead
    const lead = await leadRepository.create({
      customerId: testCustomerId,
      conversationId: testConversationId,
      problemStatement: "Manual CRM entry taking 15 hours per week",
      proposedSolution: "Automated webhook ingestion & scoring",
      budgetRange: "$10,000 - $25,000",
      timeline: "1 month",
      stage: "NEW",
    });
    if (!lead.id) throw new Error("Lead insertion failed");
    testLeadId = lead.id;

    // Insert appointment
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const tomorrowEnd = new Date(Date.now() + 86400000 + 3600000).toISOString();
    const appointment = await appointmentRepository.create({
      customerId: testCustomerId,
      leadId: testLeadId,
      title: "Technical Discovery Call",
      startTime: tomorrow,
      endTime: tomorrowEnd,
      timezone: "UTC",
    });
    if (!appointment.id) throw new Error("Appointment insertion failed");
  });

  // 5. Update Operations Test
  await runTest("Update Operations & State Transitions", async () => {
    // Update lead stage
    const updatedLead = await leadRepository.updateStage(testLeadId, "QUALIFIED", "AI", "IMPACT_AGENT");
    if (!updatedLead || updatedLead.stage !== "QUALIFIED") {
      throw new Error("Lead stage transition failed");
    }

    // Record lead scoring
    const score = await leadRepository.recordScore({
      leadId: testLeadId,
      fitScore: 90,
      clarityScore: 85,
      timelineScore: 80,
      budgetScore: 90,
      authorityScore: 100,
      reasoning: "High decision authority with clear technical requirements and budget fit.",
    });
    if (score < 80) throw new Error(`Expected weighted score >= 80, got ${score}`);

    // Verify lead score updated
    const refreshedLead = await leadRepository.findById(testLeadId);
    if (!refreshedLead || refreshedLead.score !== score) {
      throw new Error("Lead score was not updated on parent lead record");
    }

    // Update conversation status
    const updatedConv = await conversationRepository.updateStatus(
      testConversationId,
      "human_handoff_requested"
    );
    if (!updatedConv || updatedConv.status !== "human_handoff_requested") {
      throw new Error("Conversation status update failed");
    }
  });

  // 6. Conflict Detection Test
  await runTest("Appointment Calendar Conflict Detection", async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const tomorrowEnd = new Date(Date.now() + 86400000 + 3600000).toISOString();

    const hasConflict = await appointmentRepository.hasConflict(tomorrow, tomorrowEnd);
    if (!hasConflict) {
      throw new Error("Conflict detection failed to identify overlapping appointment");
    }

    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
    const nextWeekEnd = new Date(Date.now() + 7 * 86400000 + 3600000).toISOString();
    const noConflict = await appointmentRepository.hasConflict(nextWeek, nextWeekEnd);
    if (noConflict) {
      throw new Error("Conflict detection incorrectly flagged an empty time slot");
    }
  });

  // 7. Foreign Key Constraint & Restrict Test
  await runTest("Foreign Key Restrict Enforcement", async () => {
    let failedAsExpected = false;
    try {
      // Attempt to insert a user_role with non-existent user UUID
      await db.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ('00000000-0000-0000-0000-000000000000', 'SUPER_ADMIN');"
      );
    } catch (err: any) {
      failedAsExpected = true;
    }
    if (!failedAsExpected) {
      throw new Error("Foreign key violation did not reject invalid user_id reference");
    }
  });

  // 8. Foreign Key Cascade Deletion Test
  await runTest("Foreign Key Cascade Deletion (Customer -> Conversations -> Messages)", async () => {
    // Create isolated customer and conversation
    const tempCustomer = await customerRepository.upsert({
      name: "Temporary Client",
      email: `temp.${Date.now()}@example.com`,
    });
    const tempConv = await conversationRepository.create({
      customerId: tempCustomer.id,
      channel: "web_chat",
    });
    await conversationRepository.addMessage({
      conversationId: tempConv.id,
      senderType: "customer",
      content: "Temporary query",
    });

    // Verify records exist
    const messagesBefore = await conversationRepository.getMessages(tempConv.id);
    if (messagesBefore.length === 0) throw new Error("Failed to insert temp message");

    // Delete customer
    await db.query("DELETE FROM customers WHERE id = $1;", [tempCustomer.id]);

    // Verify cascade deleted conversation and messages
    const convAfter = await conversationRepository.findById(tempConv.id);
    if (convAfter !== null) throw new Error("Conversation was not cascade deleted");

    const messagesAfter = await conversationRepository.getMessages(tempConv.id);
    if (messagesAfter.length !== 0) throw new Error("Messages were not cascade deleted");
  });

  // 9. Unique Constraint Enforcement Test
  await runTest("Unique Constraint Enforcement (Duplicate Customer Email)", async () => {
    let failedAsExpected = false;
    const existing = await customerRepository.findById(testCustomerId);
    if (!existing) throw new Error("Test customer not found");

    try {
      // Direct raw INSERT without ON CONFLICT to trigger duplicate key exception
      await db.query("INSERT INTO customers (name, email) VALUES ($1, $2);", [
        "Duplicate",
        existing.email,
      ]);
    } catch (err: any) {
      failedAsExpected = true;
    }

    if (!failedAsExpected) {
      throw new Error("Database failed to enforce unique email constraint");
    }
  });

  // 10. Index Verification Test
  await runTest("Index Verification across Critical Entities", async () => {
    const indexesRes = await db.query<{ indexname: string }>(
      "SELECT indexname FROM pg_indexes WHERE schemaname = 'public';"
    );
    const indexNames = indexesRes.rows.map((r) => r.indexname);

    const requiredIndexes = [
      "idx_users_email",
      "idx_customers_email",
      "idx_conversations_customer",
      "idx_conversations_status",
      "idx_messages_conversation",
      "idx_leads_customer",
      "idx_leads_stage",
      "idx_appointments_start_time",
      "idx_notifications_user_unread",
      "idx_audit_logs_actor",
    ];

    for (const idx of requiredIndexes) {
      if (!indexNames.includes(idx)) {
        throw new Error(`Required index '${idx}' is missing from database schema`);
      }
    }
  });

  // 11. Security Isolation Test (Cross-Customer Privacy)
  await runTest("SECURITY TEST: Cross-Customer Data Isolation", async () => {
    // Create Customer A
    const custA = await customerRepository.upsert({
      name: "Customer Alpha",
      email: `cust.alpha.${Date.now()}@example.com`,
    });
    const convA = await conversationRepository.create({
      customerId: custA.id,
      channel: "web_chat",
    });
    await conversationRepository.addMessage({
      conversationId: convA.id,
      senderType: "customer",
      content: "Customer Alpha confidential trade secrets and budget $500,000.",
    });

    // Create Customer B
    const custB = await customerRepository.upsert({
      name: "Customer Beta",
      email: `cust.beta.${Date.now()}@example.com`,
    });
    const convB = await conversationRepository.create({
      customerId: custB.id,
      channel: "web_chat",
    });
    await conversationRepository.addMessage({
      conversationId: convB.id,
      senderType: "customer",
      content: "Customer Beta public inquiry.",
    });

    // Verify Customer B cannot view Customer A's conversation or messages
    const custBMessages = await conversationRepository.getMessages(convB.id);
    const containsAlphaSecrets = custBMessages.some((m) =>
      m.content.includes("Customer Alpha confidential")
    );
    if (containsAlphaSecrets) {
      throw new Error("SECURITY VIOLATION: Customer B received Customer A's private messages");
    }

    // Verify scoped customer queries
    const custBLeads = await leadRepository.findByCustomerId(custB.id);
    const hasAlphaLeads = custBLeads.some((l) => l.customer_id === custA.id);
    if (hasAlphaLeads) {
      throw new Error("SECURITY VIOLATION: Customer B lead list leaked Customer A leads");
    }
  });

  // 12. Audit Logging Test
  await runTest("Immutable Audit Logging Execution", async () => {
    const log = await auditRepository.log({
      actorType: "AI_AGENT",
      actorId: "IMPACT_AGENT",
      action: "QUALIFY_LEAD",
      resourceType: "lead",
      resourceId: testLeadId,
      changes: { oldStage: "NEW", newStage: "QUALIFIED", score: 85 },
    });
    if (!log.id) throw new Error("Audit log insertion failed");

    const logs = await auditRepository.list(10);
    if (!logs.some((l) => l.id === log.id)) {
      throw new Error("Recorded audit log was not retrievable");
    }
  });

  // 13. Rollback & Re-apply Migration Test
  await runTest("Migration Rollback (migrateDown) and Re-apply (migrateUp)", async () => {
    // Rollback all migrations to test complete down migration capability
    const appliedBefore = await migrator.getAppliedMigrations();
    if (appliedBefore.length === 0) {
      throw new Error("No migrations found to roll back");
    }

    while ((await migrator.getAppliedMigrations()).length > 0) {
      const reverted = await migrator.migrateDown();
      if (!reverted) break;
    }

    const appliedAfterRollback = await migrator.getAppliedMigrations();
    if (appliedAfterRollback.includes("001_initial_schema")) {
      throw new Error("001_initial_schema still present in applied list after rollback");
    }

    // Re-apply migration
    const reapplied = await migrator.migrateUp();
    if (!reapplied.includes("001_initial_schema")) {
      throw new Error("Failed to re-apply 001_initial_schema after rollback");
    }

    // Re-seed development data
    await seedDevelopmentDatabase();
    const admin = await userRepository.findByEmail("admin@impact.enterprise");
    if (!admin) throw new Error("Admin user missing after re-migration and seed");
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = report.filter((r) => !r.passed);
  console.log(`Total Tests: ${report.length} | Passed: ${report.length - failed.length} | Failed: ${failed.length}`);
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL DATABASE TESTS PASSED SUCCESSFULLY!\x1b[0m\n");
  return true;
}

// CLI Entrypoint
if (require.main === module) {
  runAllDatabaseTests()
    .then(async (success) => {
      await db.close();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Unhandled test runner exception:", err);
      process.exit(1);
    });
}
