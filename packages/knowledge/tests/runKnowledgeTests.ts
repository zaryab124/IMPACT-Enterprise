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

  // 1. Database & Knowledge Synchronization
  await runTest("Database Seeding & Knowledge Table Verification", async () => {
    await seedDevelopmentDatabase();
    const countRes = await db.query<{ count: string }>(
      "SELECT count(*) FROM knowledge_documents;"
    );
    const count = parseInt(countRes.rows[0].count, 10);
    if (count < APPROVED_KNOWLEDGE_DOCUMENTS.length) {
      throw new Error(`Expected at least ${APPROVED_KNOWLEDGE_DOCUMENTS.length} documents in DB, found ${count}`);
    }
  });

  // 2. Exact Service Retrieval
  await runTest("Exact Service Retrieval: AI Agents & Voice Engineering", async () => {
    const res = await knowledgeService.search("voice agents low latency gemini live");
    if (res.isOutOfScope) throw new Error("Expected in-scope query, got out of scope");
    if (res.documents.length === 0) throw new Error("No documents retrieved for AI agents");

    const topDoc = res.documents[0].document;
    if (topDoc.id !== "svc-ai-agents") {
      throw new Error(`Expected top doc 'svc-ai-agents', got '${topDoc.id}'`);
    }
    if (!topDoc.content.includes("sub-400ms voice")) {
      throw new Error("Missing sub-400ms voice capability in retrieved document");
    }
    if (res.confidenceScore < 60) {
      throw new Error(`Confidence score too low: ${res.confidenceScore}`);
    }
  });

  // 3. Exact Case Study Retrieval with Technical Verification
  await runTest("Case Study Retrieval: Restaurant Platform HMAC & KDS", async () => {
    const res = await knowledgeService.search("restaurant platform HMAC QR table ordering and KDS");
    if (res.isOutOfScope) throw new Error("Expected in-scope query");
    if (res.documents.length === 0) throw new Error("No documents retrieved for restaurant platform");

    const topDoc = res.documents[0].document;
    if (topDoc.id !== "cs-restaurant-platform") {
      throw new Error(`Expected 'cs-restaurant-platform', got '${topDoc.id}'`);
    }
    if (!topDoc.content.includes("HMAC") || !topDoc.content.includes("Kitchen Display System")) {
      throw new Error("Missing critical technical highlights in restaurant case study");
    }
  });

  // 4. Executive Leadership & Company Purpose Retrieval
  await runTest("Leadership & Executive Inquiry Verification", async () => {
    const res = await knowledgeService.search("Who is the CEO of IMPACT and who leads the team?");
    if (res.isOutOfScope) throw new Error("Expected in-scope query");
    if (res.documents.length === 0) throw new Error("No documents retrieved for leadership query");

    const topDoc = res.documents[0].document;
    if (topDoc.id !== "lead-team") {
      throw new Error(`Expected 'lead-team', got '${topDoc.id}'`);
    }
    if (!topDoc.content.includes("MUHAMMAD ZARYAB HASSAN") || !topDoc.content.includes("MAHAD AZIZ")) {
      throw new Error("Missing key executive profiles in leadership document");
    }
  });

  // 5. Anti-Hallucination Commercial & Pricing Policy Gate
  await runTest("Anti-Hallucination Commercial Gate: No Fabricated Pricing", async () => {
    const queries = [
      "How much do your AI agents cost?",
      "Can I get a discount on software development?",
      "What is your price list?",
    ];

    for (const q of queries) {
      const res = await knowledgeService.search(q);
      if (res.documents.length === 0) {
        throw new Error(`No document retrieved for pricing query: '${q}'`);
      }
      const topDoc = res.documents[0].document;
      if (topDoc.id !== "policy-pricing-scoping") {
        throw new Error(`Expected 'policy-pricing-scoping' for query '${q}', got '${topDoc.id}'`);
      }
      if (!topDoc.content.includes("No Fabricated or Flat Pricing")) {
        throw new Error("Pricing document does not strictly prohibit flat pricing");
      }
      if (!topDoc.content.includes("/start-a-project")) {
        throw new Error("Pricing document missing discovery wizard reference");
      }
    }
  });

  // 6. Anti-Hallucination Out-of-Scope Boundary Detection Gate
  await runTest("Out-of-Scope Query Detection (Anti-Hallucination Boundary)", async () => {
    const outOfScopeQueries = [
      "What is the weather forecast in Tokyo tomorrow?",
      "I have a severe headache, what medicine should I take?",
      "Which cryptocurrency token will pump 100x this month?",
      "Can you give me a recipe for baking chocolate cake?",
    ];

    for (const q of outOfScopeQueries) {
      const res = await knowledgeService.search(q);
      if (!res.isOutOfScope) {
        throw new Error(`Failed to catch out-of-scope query: '${q}'`);
      }
      if (res.confidenceScore !== 0) {
        throw new Error(`Expected 0 confidence for out-of-scope query, got ${res.confidenceScore}`);
      }
      if (!res.guardrailMessage || !res.guardrailMessage.includes("IMPACT Enterprise")) {
        throw new Error("Missing appropriate guardrail message for out-of-scope query");
      }
    }
  });

  // 7. Category Scoped Search Filter
  await runTest("Category Scoped Retrieval: Case Studies Isolation", async () => {
    const res = await knowledgeService.search("automation", { category: "CASE_STUDIES" });
    if (res.documents.some((d) => d.document.category !== "CASE_STUDIES")) {
      throw new Error("Retrieved documents contain items outside the requested category");
    }
  });

  // 8. Public Knowledge Search API (GET /api/knowledge/search)
  await runTest("Public Search API Endpoint (GET /api/knowledge/search)", async () => {
    const res = await fetch(`${BASE_URL}/api/knowledge/search?q=restaurant+kds`);
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 from knowledge search API, got ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error("Malformed knowledge search API response");
    }
    if (json.data.documents.length === 0) {
      throw new Error("Expected at least 1 document from API search");
    }
    if (json.data.documents[0].document.id !== "cs-restaurant-platform") {
      throw new Error(`Expected 'cs-restaurant-platform', got '${json.data.documents[0].document.id}'`);
    }

    // Test out of scope via API
    const oosRes = await fetch(`${BASE_URL}/api/knowledge/search?q=what+medicine+cures+headache`);
    const oosJson = await oosRes.json();
    if (!oosJson.data?.isOutOfScope) {
      throw new Error("API failed to flag out-of-scope query");
    }
  });

  // 9. Protected Admin Knowledge API (RBAC Gate)
  await runTest("Protected Admin Knowledge API: 401 Unauthenticated & 200 Authenticated", async () => {
    // 1. Unauthenticated -> 401
    const unauthRes = await fetch(`${BASE_URL}/api/admin/knowledge`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected HTTP 401 for unauthenticated access, got ${unauthRes.status}`);
    }

    // 2. Authenticated Admin -> 200
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "admin@impact.enterprise",
        password: "AdminPassword2026!",
      }),
    });
    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    const adminToken = loginData.token;

    const authRes = await fetch(`${BASE_URL}/api/admin/knowledge`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (authRes.status !== 200) {
      throw new Error(`Expected HTTP 200 for authenticated admin, got ${authRes.status}`);
    }

    const data = await authRes.json();
    if (!data.success || !Array.isArray(data.documents) || data.documents.length === 0) {
      throw new Error("Admin knowledge list returned invalid or empty document array");
    }
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

  console.log("\x1b[32mALL KNOWLEDGE BASE & RETRIEVAL TESTS PASSED!\x1b[0m\n");
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
