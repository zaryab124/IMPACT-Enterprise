/**
 * IMPACT Growth OS — Phase 5 & 6 Verification Test Suite
 * Validates AI Social Media Agent, Brand Consistency, Approval Gates,
 * Weekly Calendar Generation, and Simulated Publishing.
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { BrandConsistencyChecker } from "../marketing/brandConsistencyChecker";
import { SimulatedPublisher } from "../marketing/simulatedPublisher";
import { SocialMediaAgent } from "../marketing/socialMediaAgent";
import { WeeklyPlanningEngine } from "../marketing/weeklyPlanningEngine";

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
  console.log("  IMPACT GROWTH OS — PHASE 5 & 6 SOCIAL AGENT & CALENDAR");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Test 1: Brand Consistency Checker - Valid Official Services
  await runTest("Brand Consistency Checker (Valid Service & Grounding)", async () => {
    const validContent =
      "Modern organizations require resilient AI agents to orchestrate complex multi-step workflows. Grounded in IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT.";
    const check = BrandConsistencyChecker.check(validContent, "AI agents");
    if (!check.passed) {
      throw new Error(`Expected brand check to pass, failed with flags: ${check.flags.join("; ")}`);
    }
    if (check.score < 70) {
      throw new Error(`Expected score >= 70, got ${check.score}`);
    }
    if (check.serviceMatched !== "AI agents") {
      throw new Error(`Expected matched service 'AI agents', got '${check.serviceMatched}'`);
    }
  });

  // Test 2: Brand Consistency Checker - Negative Boundaries
  await runTest("Brand Consistency Checker (Negative Boundaries: Guarantees & Prices)", async () => {
    const violatingContent =
      "Get 1000% ROI guaranteed with our $99 per month automation package. Official partner of Google.";
    const check = BrandConsistencyChecker.check(violatingContent, "AI automation");
    if (check.passed) {
      throw new Error("Brand check should fail for forbidden guarantee & pricing claims");
    }
    if (!check.flags.some((f) => f.includes("Negative boundary violation"))) {
      throw new Error("Expected flag for negative boundary violation");
    }
  });

  // Test 3: Generate 5 Distinct Posts Across 5 Services
  let generatedPosts: any[] = [];
  await runTest("AI Social Agent: Generate 5 Posts Across 5 Services", async () => {
    const testCases: Array<{ service: string; capability: any; platform: any; goal: any }> = [
      { service: "AI models", capability: "thought_leadership", platform: "linkedin", goal: "AUTHORITY" },
      { service: "AI agents", capability: "service_spotlight", platform: "linkedin", goal: "SERVICE_PROMOTION" },
      { service: "AI automation", capability: "educational_breakdown", platform: "twitter", goal: "EDUCATION" },
      { service: "Call agents", capability: "conversational_ai_insights", platform: "linkedin", goal: "LEAD_GENERATION" },
      { service: "Business automation", capability: "problem_solution_framework", platform: "linkedin", goal: "DIRECT_CONVERSION" },
    ];

    for (const tc of testCases) {
      const post = await SocialMediaAgent.generateAndSavePost({
        serviceInterest: tc.service,
        capability: tc.capability,
        platform: tc.platform,
        goal: tc.goal,
      });

      if (!post.id) throw new Error(`Failed to save generated post for ${tc.service}`);
      if (post.status !== "PENDING_APPROVAL") {
        throw new Error(`Expected status 'PENDING_APPROVAL', got '${post.status}'`);
      }
      if (!post.hook || !post.content || !post.cta) {
        throw new Error(`Post missing required components (hook/content/cta) for ${tc.service}`);
      }
      generatedPosts.push(post);
    }

    if (generatedPosts.length !== 5) {
      throw new Error(`Expected 5 generated posts, got ${generatedPosts.length}`);
    }
  });

  // Test 4: Publishing Guardrail (Cannot publish unapproved draft)
  await runTest("Publishing Guardrail: Refuses Unapproved Post", async () => {
    const unapprovedPost = generatedPosts[0];
    let threw = false;
    try {
      await SimulatedPublisher.publishPost(unapprovedPost.id);
    } catch (err: any) {
      if (err.message.includes("Publishing guardrail violation")) {
        threw = true;
      }
    }
    if (!threw) {
      throw new Error("SimulatedPublisher should have thrown guardrail violation for PENDING_APPROVAL post");
    }
  });

  // Test 5: Human Approval & Rejection Workflow
  await runTest("Human Review Workflow: Approve and Reject Post", async () => {
    const postToApprove = generatedPosts[0];
    const approved = await SimulatedPublisher.approvePost(postToApprove.id, undefined, "Approved for enterprise feed");
    if (approved.status !== "APPROVED") {
      throw new Error(`Expected status 'APPROVED', got '${approved.status}'`);
    }

    const postToReject = generatedPosts[1];
    const rejected = await SimulatedPublisher.rejectPost(postToReject.id, undefined, "Needs deeper architecture depth");
    if (rejected.status !== "REJECTED") {
      throw new Error(`Expected status 'REJECTED', got '${rejected.status}'`);
    }
  });

  // Test 6: Scheduling & Publishing Approved Post
  await runTest("Publishing Pipeline: Schedule & Publish Approved Post", async () => {
    const post = generatedPosts[0];
    const futureDate = new Date(Date.now() + 86400000);
    const scheduled = await SimulatedPublisher.schedulePost(post.id, futureDate);
    if (scheduled.status !== "SCHEDULED") {
      throw new Error(`Expected status 'SCHEDULED', got '${scheduled.status}'`);
    }

    const publishResult = await SimulatedPublisher.publishPost(post.id);
    if (!publishResult.success || publishResult.status !== "published") {
      throw new Error("Expected successful publishing of scheduled post");
    }

    // Verify DB updated
    const checkRes = await db.query(`SELECT status, published_at FROM content_posts WHERE id = $1;`, [post.id]);
    if (checkRes.rows[0].status !== "PUBLISHED" || !checkRes.rows[0].published_at) {
      throw new Error("Database content_post not updated to PUBLISHED");
    }
  });

  // Test 7: Simulated Failure & Retry Tracking
  await runTest("Publishing Resilience: Simulated Failure Logging", async () => {
    const postToFail = generatedPosts[2];
    await SimulatedPublisher.approvePost(postToFail.id);
    const failResult = await SimulatedPublisher.publishPost(postToFail.id, true);
    if (failResult.success !== false || failResult.status !== "failed") {
      throw new Error("Expected simulated failure result");
    }

    const checkLog = await db.query(
      `SELECT * FROM content_publish_logs WHERE post_id = $1 AND status = 'failed';`,
      [postToFail.id]
    );
    if (checkLog.rows.length === 0) {
      throw new Error("Failed publishing log entry not found in content_publish_logs");
    }
  });

  // Test 8: 7-Day Editorial Weekly Plan Generation
  await runTest("Weekly Planning Engine: 7-Day Balanced Schedule", async () => {
    const plan = WeeklyPlanningEngine.generateWeeklyPlan(new Date(), "Q4 Enterprise Scale");
    if (plan.slots.length !== 7) {
      throw new Error(`Expected 7 calendar slots, got ${plan.slots.length}`);
    }
    const servicesCovered = new Set(plan.slots.map((s) => s.service));
    if (servicesCovered.size < 5) {
      throw new Error(`Expected at least 5 distinct services covered across 7 days, got ${servicesCovered.size}`);
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 5 & 6 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running Phase 5 & 6 tests:", err);
  process.exit(1);
});
