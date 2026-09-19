/**
 * IMPACT Growth OS — Social Media Accounts & AI Agent Linking Test Suite
 * Tests universal linking for LinkedIn, Twitter/X, Instagram, and Facebook.
 * Verifies CryptoVault token encryption, connection health diagnostics,
 * multi-channel AI generation, and multi-account publishing.
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { SocialMediaAgent } from "../marketing/socialMediaAgent";
import { CryptoVault } from "../publishing/cryptoVault";
import { PublishingService } from "../publishing/publishingService";

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
  console.log("  IMPACT GROWTH OS — SOCIAL MEDIA & AI AGENT LINKING");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Test 1: Link All 4 Social Media Accounts with CryptoVault AES-256-GCM
  const linkedAccountsMap: Record<string, string> = {};
  await runTest("Link All 4 Accounts (LinkedIn, Twitter/X, Instagram, Facebook)", async () => {
    const testAccounts = [
      {
        platform: "linkedin",
        name: "IMPACT Enterprise Official",
        pageId: "urn:li:organization:987654321",
        token: "simulated_oauth_linkedin_token_enterprise_999",
      },
      {
        platform: "twitter",
        name: "IMPACT Enterprise AI",
        pageId: "@ImpactEntAI",
        token: "simulated_bearer_twitter_token_enterprise_888",
      },
      {
        platform: "instagram",
        name: "impact.enterprise.official",
        pageId: "ig_page_1020304050",
        token: "simulated_graph_instagram_token_enterprise_777",
      },
      {
        platform: "facebook",
        name: "IMPACT Enterprise Global Page",
        pageId: "fb_page_5566778899",
        token: "simulated_graph_facebook_token_enterprise_666",
      },
    ];

    for (const acc of testAccounts) {
      const created = await PublishingService.registerAccount(
        acc.platform,
        acc.name,
        acc.pageId,
        acc.token,
        { handle: acc.pageId }
      );
      if (!created.id) throw new Error(`Failed to link account for ${acc.platform}`);
      linkedAccountsMap[acc.platform] = created.id;

      // Verify zero plaintext token in DB
      const dbRow = await db.query(
        `SELECT encrypted_access_token FROM social_accounts WHERE id = $1;`,
        [created.id]
      );
      if (dbRow.rows[0].encrypted_access_token === acc.token) {
        throw new Error(`Plaintext token leaked in database for ${acc.platform}!`);
      }
    }

    const allAccounts = await PublishingService.getAccounts();
    if (allAccounts.length < 4) {
      throw new Error(`Expected at least 4 registered accounts, got ${allAccounts.length}`);
    }

    // Ensure all tokens are masked
    for (const a of allAccounts) {
      if (a.masked_token !== "••••••••••••••••") {
        throw new Error(`Account ${a.account_name} did not return masked token!`);
      }
      if ((a as any).encrypted_access_token) {
        throw new Error(`Account ${a.account_name} exposed encrypted_access_token in list!`);
      }
    }
  });

  // Test 2: Connection Health Diagnostics across All 4 Adapters
  await runTest("Connection Health Diagnostics for All 4 Accounts", async () => {
    for (const [platform, id] of Object.entries(linkedAccountsMap)) {
      const testResult = await PublishingService.testAccountConnection(id);
      if (!testResult.success) {
        throw new Error(`Connection test failed for ${platform}: ${testResult.error}`);
      }
      if (testResult.latencyMs <= 0) {
        throw new Error(`Invalid latency for ${platform}: ${testResult.latencyMs}ms`);
      }
    }
  });

  // Test 3: AI Agent Link Retrieval & Dynamic Toggle
  await runTest("AI Agent Link Status Toggle & Retrieval", async () => {
    // Check all are linked
    let agentLinked = await PublishingService.getLinkedAccountsForAiAgent();
    const platformsLinked = agentLinked.map((a) => a.platform);
    if (!platformsLinked.includes("linkedin") || !platformsLinked.includes("twitter")) {
      throw new Error("Missing expected accounts in getLinkedAccountsForAiAgent");
    }

    // Toggle Twitter unlinked from AI Agent
    const twId = linkedAccountsMap["twitter"];
    await PublishingService.linkAccountToAiAgent(twId, false);

    agentLinked = await PublishingService.getLinkedAccountsForAiAgent();
    if (agentLinked.some((a) => a.id === twId)) {
      throw new Error("Unlinked Twitter account still returned in getLinkedAccountsForAiAgent");
    }

    // Re-link Twitter to AI Agent
    await PublishingService.linkAccountToAiAgent(twId, true);
    agentLinked = await PublishingService.getLinkedAccountsForAiAgent();
    if (!agentLinked.some((a) => a.id === twId)) {
      throw new Error("Re-linked Twitter account not returned in getLinkedAccountsForAiAgent");
    }
  });

  // Test 4: AI Agent Generates Multi-Channel Content for Linked Accounts
  let generatedPosts: any[] = [];
  await runTest("AI Social Media Agent Generates Posts for Linked Accounts", async () => {
    generatedPosts = await SocialMediaAgent.generatePostsForLinkedAccounts({
      serviceInterest: "AI agents",
      capability: "thought_leadership",
      goal: "AUTHORITY",
    });

    if (generatedPosts.length < 4) {
      throw new Error(`Expected at least 4 generated posts, got ${generatedPosts.length}`);
    }

    const generatedPlatforms = generatedPosts.map((p) => p.platform);
    for (const p of ["linkedin", "twitter", "instagram", "facebook"]) {
      if (!generatedPlatforms.includes(p)) {
        throw new Error(`AI Agent failed to generate post for platform: ${p}`);
      }
    }

    for (const post of generatedPosts) {
      if (post.status !== "PENDING_APPROVAL") {
        throw new Error(`Human review gate violated: Post status is ${post.status}, expected PENDING_APPROVAL`);
      }
      if (!post.brand_check || post.brand_check.score < 75) {
        throw new Error(`Brand check score too low: ${post.brand_check?.score}`);
      }
    }
  });

  // Test 5: Multi-Account Publishing Dispatch
  await runTest("Editorial Approval & Multi-Account Publishing Dispatch", async () => {
    const postToPublish = generatedPosts.find((p) => p.platform === "linkedin");
    if (!postToPublish) throw new Error("No LinkedIn post available to publish");

    // Guardrail test: Publishing a PENDING_APPROVAL post directly should throw
    let guardrailPassed = false;
    try {
      await PublishingService.executePublish(postToPublish.id, linkedAccountsMap["linkedin"]);
    } catch (e: any) {
      if (e.message.includes("Publishing guardrail violation")) {
        guardrailPassed = true;
      }
    }
    if (!guardrailPassed) {
      throw new Error("Publishing guardrail failed: Allowed publishing unapproved post");
    }

    // Mark Approved
    await db.query(
      `UPDATE content_posts SET status = 'APPROVED' WHERE id = $1;`,
      [postToPublish.id]
    );

    // Publish to linked accounts
    const publishResults = await PublishingService.publishPostToAllLinkedAccounts(postToPublish.id);
    if (publishResults.length === 0) {
      throw new Error("publishPostToAllLinkedAccounts returned 0 results");
    }

    const allSuccessful = publishResults.every((r) => r.success);
    if (!allSuccessful) {
      throw new Error("One or more platform publications failed");
    }

    // Verify post status updated to PUBLISHED
    const updatedPost = await db.query(
      `SELECT status, published_at FROM content_posts WHERE id = $1;`,
      [postToPublish.id]
    );
    if (updatedPost.rows[0].status !== "PUBLISHED") {
      throw new Error(`Post status not updated to PUBLISHED (was ${updatedPost.rows[0].status})`);
    }

    // Verify audit logs in content_publish_logs
    const logs = await db.query(
      `SELECT * FROM content_publish_logs WHERE post_id = $1 AND status = 'published';`,
      [postToPublish.id]
    );
    if (logs.rows.length === 0) {
      throw new Error("No publication logs recorded in database");
    }
  });

  // Test 6: Account Disconnection / Revocation
  await runTest("Disconnect Social Account & Verify Revoked Status", async () => {
    const fbId = linkedAccountsMap["facebook"];
    const disconnected = await PublishingService.disconnectAccount(fbId);
    if (!disconnected) throw new Error("Failed to disconnect Facebook account");

    const activeAccounts = await PublishingService.getAccounts();
    if (activeAccounts.some((a) => a.id === fbId)) {
      throw new Error("Revoked account still returned in active getAccounts()");
    }

    const agentLinked = await PublishingService.getLinkedAccountsForAiAgent();
    if (agentLinked.some((a) => a.id === fbId)) {
      throw new Error("Revoked account still returned in getLinkedAccountsForAiAgent()");
    }
  });

  console.log("\n-------------------------------------------------------");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Total Social Media Linking Tests: ${results.length} | Passed: ${passedCount} | Failed: ${results.length - passedCount}`);
  console.log("-------------------------------------------------------\n");

  if (passedCount === results.length) {
    console.log("🎉 ALL SOCIAL MEDIA & AI AGENT LINKING TESTS PASSED WITH 100% RELIABILITY!\n");
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
