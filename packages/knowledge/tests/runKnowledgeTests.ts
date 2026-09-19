import { knowledgeService } from "../knowledgeService";
import { APPROVED_KNOWLEDGE_DOCUMENTS } from "../data/approvedKnowledge";
import { generateToken } from "../../auth/jwt";
import { db } from "../../database";
import { seedDevelopmentDatabase } from "../../database/seed";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

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

export async function runAllKnowledgeTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 4 KNOWLEDGE BASE VERIFICATION SUITE");
  console.log("=======================================================\n");

  // 1. Database & 15 Categories Synchronization
  await runTest("Database Seeding & 15 Knowledge Categories Verification", async () => {
    await seedDevelopmentDatabase();
    await knowledgeService.seedKnowledgeTable();

    const countRes = await db.query<{ count: string }>(
      "SELECT count(*) FROM knowledge_documents;"
    );
    const count = parseInt(countRes.rows[0].count, 10);
    if (count < APPROVED_KNOWLEDGE_DOCUMENTS.length) {
      throw new Error(`Expected at least ${APPROVED_KNOWLEDGE_DOCUMENTS.length} documents in DB, found ${count}`);
    }

    // Verify all 15 categories present
    const categoriesRes = await db.query<{ category: string }>(
      "SELECT DISTINCT category FROM knowledge_documents;"
    );
    const dbCategories = new Set(categoriesRes.rows.map((r) => r.category));
    const required15 = [
      "COMPANY",
      "SERVICES",
      "SERVICE_DESCRIPTIONS",
      "TARGET_INDUSTRIES",
      "TARGET_CUSTOMERS",
      "FAQS",
      "TEAM",
      "PROJECTS",
      "CASE_STUDIES",
      "BRAND_GUIDELINES",
      "CONTACT_INFORMATION",
      "SALES_POLICIES",
      "PRICING_RULES",
      "APPROVED_CLAIMS",
      "RESTRICTED_CLAIMS",
    ];
    for (const reqCat of required15) {
      if (!dbCategories.has(reqCat)) {
        throw new Error(`Missing mandatory category '${reqCat}' in database`);
      }
    }
  });

  // 2. Smoke Test 1: "What services does IMPACT Enterprise provide?"
  await runTest("Smoke Test 1: 'What services does IMPACT Enterprise provide?'", async () => {
    const res = await knowledgeService.search("What services does IMPACT Enterprise provide?");
    if (res.isOutOfScope) throw new Error("Query was incorrectly marked out of scope");
    if (res.documents.length === 0) throw new Error("No documents retrieved for services query");

    const topDoc = res.documents[0].document;
    if (topDoc.id !== "kb-services-catalog" && topDoc.category !== "SERVICES") {
      throw new Error(`Expected 'kb-services-catalog', got '${topDoc.id}'`);
    }

    // Must strictly verify the 9 official services
    const official9 = [
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
    for (const svc of official9) {
      if (!topDoc.content.includes(svc)) {
        throw new Error(`Services document missing official service: '${svc}'`);
      }
    }
  });

  // 3. Smoke Test 2: "What is IMPACT Enterprise?"
  await runTest("Smoke Test 2: 'What is IMPACT Enterprise?'", async () => {
    const res = await knowledgeService.search("What is IMPACT Enterprise?");
    if (res.isOutOfScope) throw new Error("Query was incorrectly marked out of scope");
    if (res.documents.length === 0) throw new Error("No documents retrieved for company query");

    const topDoc = res.documents[0].document;
    if (topDoc.id !== "kb-company-profile" && topDoc.category !== "COMPANY") {
      throw new Error(`Expected 'kb-company-profile', got '${topDoc.id}'`);
    }

    if (!topDoc.content.includes("IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT")) {
      throw new Error("Company document missing official brand positioning formula");
    }
  });

  // 4. Smoke Test 3: "What information is unavailable?"
  await runTest("Smoke Test 3: 'What information is unavailable?' (Negative Boundary)", async () => {
    const res = await knowledgeService.search("What information is unavailable?");
    if (res.isOutOfScope) throw new Error("Query was incorrectly marked out of scope");
    if (res.documents.length === 0) throw new Error("No documents retrieved for restricted claims query");

    const topDoc = res.documents[0].document;
    if (topDoc.id !== "kb-restricted-claims" && topDoc.category !== "RESTRICTED_CLAIMS") {
      throw new Error(`Expected 'kb-restricted-claims', got '${topDoc.id}'`);
    }

    // Verify all 9 forbidden invention categories are documented
    const forbidden9 = [
      "Customers",
      "Partnerships",
      "Revenue",
      "Results",
      "Certifications",
      "Employees",
      "Prices",
      "Guarantees",
      "Case Studies",
    ];
    for (const item of forbidden9) {
      if (!topDoc.content.toLowerCase().includes(item.toLowerCase())) {
        throw new Error(`Restricted claims missing mandatory constraint: '${item}'`);
      }
    }

    if (!topDoc.content.includes("IMPACT Enterprise does not have confirmed information on this topic")) {
      throw new Error("Missing mandatory fallback statement for unavailable information");
    }
  });

  // 5. Versioning & Document Update Test
  await runTest("Knowledge Document Versioning & Audit Increment", async () => {
    const originalDoc = await knowledgeService.getDocumentById("kb-brand-guidelines");
    if (!originalDoc) throw new Error("Brand guidelines document not found");

    const originalVersion = originalDoc.version;
    const updated = await knowledgeService.updateDocument("kb-brand-guidelines", {
      title: "Brand Voice, Tone & Messaging Standards (Updated)",
    });

    if (!updated) throw new Error("Failed to update knowledge document");
    if (updated.version !== originalVersion + 1) {
      throw new Error(`Expected version ${originalVersion + 1}, got ${updated.version}`);
    }
  });

  // 6. Archival & Review Workflow Test
  await runTest("Document Archival & Review Status Workflow", async () => {
    // Add temp doc
    const tempDoc = await knowledgeService.createDocument({
      id: "temp-test-doc",
      category: "FAQS",
      title: "Temporary Test Document",
      content: "This is a temporary test document for verification.",
      source: "Test Authority",
      metadata: { tags: ["temp", "test"], summary: "Temp doc" },
      reviewStatus: "UNDER_REVIEW",
      isActive: true,
    });

    // Review toggle
    const reviewed = await knowledgeService.reviewDocument("temp-test-doc", "APPROVED", "admin-1", "Verified by QA");
    if (!reviewed || reviewed.reviewStatus !== "APPROVED") {
      throw new Error("Failed to transition review status to APPROVED");
    }

    // Archive
    const archived = await knowledgeService.archiveDocument("temp-test-doc");
    if (!archived) throw new Error("Failed to archive temporary document");

    const activeList = await knowledgeService.listDocuments(undefined, false);
    if (activeList.some((d) => d.id === "temp-test-doc")) {
      throw new Error("Archived document still appears in active list");
    }
  });

  // 7. Grounded Retrieval Context for Future AI Agents
  await runTest("AI Prompt Grounding Context Generation", async () => {
    const context = await knowledgeService.getGroundedPromptContext("Tell me about custom business applications");
    if (!context || !context.includes("GROUNDING DOCUMENT")) {
      throw new Error("Grounded prompt context builder failed to generate context block");
    }
    if (!context.includes("Custom business applications")) {
      throw new Error("Grounded prompt context missing requested service content");
    }
  });

  // 8. Out-of-Scope Detection Gate
  await runTest("Out-of-Scope Boundary Detection", async () => {
    const res = await knowledgeService.search("What is the weather forecast in London?");
    if (!res.isOutOfScope) throw new Error("Failed to detect out-of-scope query");
    if (res.confidenceScore !== 0) throw new Error("Expected 0 confidence for out-of-scope query");
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = results.filter((r) => !r.passed);
  console.log(`Total Knowledge Tests: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL 8 PHASE 4 KNOWLEDGE BASE VERIFICATIONS PASSED!\x1b[0m\n");
  return true;
}

// CLI Entrypoint
if (require.main === module) {
  runAllKnowledgeTests()
    .then(async (success) => {
      await db.close();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Unhandled knowledge test runner exception:", err);
      process.exit(1);
    });
}
