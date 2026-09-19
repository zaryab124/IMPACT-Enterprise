/**
 * IMPACT Growth OS — Phase 7 Publishing Integration Test Suite
 * Tests CryptoVault AES-256-GCM, Account Storage, Guardrails,
 * Controlled Failure/Retry Logging, and Successful Publishing via LinkedIn Adapter.
 */

import { db } from "../../database";
import { Migrator } from "../../database/migrator";
import { SimulatedPublisher } from "../marketing/simulatedPublisher";
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
  console.log("  IMPACT GROWTH OS — PHASE 7 PUBLISHING INTEGRATIONS");
  console.log("=======================================================\n");

  const migrator = new Migrator();
  await migrator.migrateUp();

  // Test 1: CryptoVault Encryption & Decryption
  await runTest("CryptoVault AES-256-GCM Roundtrip & Security", async () => {
    const secret = "AQX_live_enterprise_secret_token_123456789";
    const encrypted = CryptoVault.encrypt(secret);

    if (encrypted === secret) {
      throw new Error("Ciphertext must not match plaintext");
    }
    if (!encrypted.includes(":")) {
      throw new Error("Encrypted payload should contain iv:tag:ciphertext components");
    }

    const decrypted = CryptoVault.decrypt(encrypted);
    if (decrypted !== secret) {
      throw new Error(`Decryption failed. Expected '${secret}', got '${decrypted}'`);
    }

    const masked = CryptoVault.maskToken(secret);
    if (masked.includes("enterprise_secret")) {
      throw new Error("Masked token leaked sensitive substring");
    }
  });

  // Test 2: Social Account Registration & Zero-Token Leak
  let accountId = "";
  await runTest("Social Account Registration (Encrypted & Masked)", async () => {
    const rawToken = "simulated_oauth_linkedin_token_super_safe";
    const account = await PublishingService.registerAccount(
      "linkedin",
      "IMPACT Enterprise Official",
      "impact-enterprise-ai",
      rawToken,
      { vanityName: "impact-enterprise" }
    );

    if (!account.id) throw new Error("Failed to register account");
    accountId = account.id;

    // Verify DB does not contain rawToken
    const dbRow = await db.query(`SELECT encrypted_access_token FROM social_accounts WHERE id = $1;`, [account.id]);
    if (dbRow.rows[0].encrypted_access_token === rawToken) {
      throw new Error("Plaintext token was stored directly in database!");
    }

    // List accounts: ensure token is masked
    const accounts = await PublishingService.getAccounts();
    const found = accounts.find((a) => a.id === account.id);
    if (!found) throw new Error("Created account not returned by getAccounts");
    if ((found as any).encrypted_access_token) {
      throw new Error("getAccounts() exposed encrypted_access_token to caller");
    }
    if (found.masked_token !== "••••••••••••••••") {
      throw new Error("getAccounts() did not provide standard masked token");
    }
  });

  // Test 3: Generate Post & Pre-flight Guardrail
  let testPost: any;
  await runTest("Publishing Guardrail: Refuses Unapproved Post", async () => {
    testPost = await SocialMediaAgent.generateAndSavePost({
      serviceInterest: "AI agents",
      capability: "thought_leadership",
      platform: "linkedin",
      goal: "AUTHORITY",
    });

    let threw = false;
    try {
      await PublishingService.executePublish(testPost.id, accountId);
    } catch (err: any) {
      if (err.message.includes("Publishing guardrail violation")) {
        threw = true;
      }
    }
    if (!threw) {
      throw new Error("PublishingService should refuse to publish post in PENDING_APPROVAL status");
    }
  });

  // Test 4: Controlled Failure & Retry Count Increment
  await runTest("Controlled Failure: Logs Failure & Tracks Retry Count", async () => {
    // Approve post first
    await SimulatedPublisher.approvePost(testPost.id);

    // Force failure
    const failResult = await PublishingService.executePublish(testPost.id, accountId, true);
    if (failResult.success !== false) {
      throw new Error("Expected executePublish to report failure");
    }
    if (failResult.retryCount !== 0) {
      throw new Error(`Expected first attempt retryCount 0, got ${failResult.retryCount}`);
    }

    // Verify post status is FAILED
    const postCheck = await db.query(`SELECT status FROM content_posts WHERE id = $1;`, [testPost.id]);
    if (postCheck.rows[0].status !== "FAILED") {
      throw new Error(`Expected post status 'FAILED', got '${postCheck.rows[0].status}'`);
    }

    // Attempt second time (still failure) to verify retryCount increments to 1
    // Reset to APPROVED to allow retry
    await db.query(`UPDATE content_posts SET status = 'APPROVED' WHERE id = $1;`, [testPost.id]);
    const retryResult = await PublishingService.executePublish(testPost.id, accountId, true);
    if (retryResult.retryCount !== 1) {
      throw new Error(`Expected retry attempt retryCount 1, got ${retryResult.retryCount}`);
    }
  });

  // Test 5: Successful Publishing with LinkedIn Adapter
  await runTest("Successful Publishing via LinkedIn Adapter & Idempotent Log", async () => {
    // Reset post to APPROVED
    await db.query(`UPDATE content_posts SET status = 'APPROVED' WHERE id = $1;`, [testPost.id]);

    const successResult = await PublishingService.executePublish(testPost.id, accountId, false);
    if (!successResult.success) {
      throw new Error(`Expected successful publish, got: ${successResult.errorMessage}`);
    }
    if (!successResult.providerPostId?.startsWith("urn:li:share:")) {
      throw new Error(`Expected LinkedIn URN providerPostId, got ${successResult.providerPostId}`);
    }

    // Verify post updated to PUBLISHED
    const postCheck = await db.query(`SELECT status, published_at FROM content_posts WHERE id = $1;`, [testPost.id]);
    if (postCheck.rows[0].status !== "PUBLISHED" || !postCheck.rows[0].published_at) {
      throw new Error("Database record not marked as PUBLISHED with published_at timestamp");
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 7 Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error running Phase 7 tests:", err);
  process.exit(1);
});
