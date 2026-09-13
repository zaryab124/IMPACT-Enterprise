import crypto from "crypto";
import { whatsAppAdapter } from "../adapters/whatsAppAdapter";
import { emailAdapter } from "../adapters/emailAdapter";
import { phoneAdapter } from "../adapters/phoneAdapter";
import { omnichannelService } from "../omnichannelService";
import { channelDeliveryRepository } from "../../database/repositories/channelDeliveryRepository";
import { customerRepository } from "../../database/repositories/customerRepository";
import { conversationRepository } from "../../database/repositories/conversationRepository";
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

export async function runAllOmnichannelTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 10 OMNICHANNEL INTEGRATIONS");
  console.log("=======================================================\n");

  let adminToken = "";
  let viewerToken = "";

  // 0. Database & System Readiness Check
  await runTest("Database & System Readiness Check", async () => {
    await seedDevelopmentDatabase();

    const tableRes = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    const tableNames = tableRes.rows.map((r: any) => r.table_name);
    if (!tableNames.includes("channel_deliveries") || !tableNames.includes("webhook_idempotency")) {
      // If migrations didn't create them, ensure via repository
      await (channelDeliveryRepository as any).ensureTables();
    }

    // Authenticate admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "admin@impact.enterprise",
        password: "AdminPassword2026!",
      }),
    });
    if (adminLoginRes.status !== 200) {
      const errBody = await adminLoginRes.text();
      throw new Error(`Admin login failed: HTTP ${adminLoginRes.status} — ${errBody}`);
    }
    const adminData = await adminLoginRes.json();
    adminToken = adminData.token;

    // Authenticate viewer
    const viewerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "viewer@impact.enterprise",
        password: "ViewerPassword2026!",
      }),
    });
    if (viewerLoginRes.status !== 200) {
      const errBody = await viewerLoginRes.text();
      throw new Error(`Viewer login failed: HTTP ${viewerLoginRes.status} — ${errBody}`);
    }
    const viewerData = await viewerLoginRes.json();
    viewerToken = viewerData.token;
  });

  // 1. WhatsApp Adapter Outbound Formatting & Delivery
  await runTest("WhatsApp Adapter Outbound Message Formatting & Delivery", async () => {
    const res = await whatsAppAdapter.send({
      channel: "whatsapp",
      recipientIdentifier: "+14155552671",
      content: "Hello from IMPACT Enterprise AI! Your consultation is scheduled.",
    });

    if (!res.success) {
      throw new Error(`Expected successful WhatsApp delivery, got error: ${res.error}`);
    }
    if (res.status !== "delivered") {
      throw new Error(`Expected status 'delivered', got '${res.status}'`);
    }
    if (!res.providerMessageId?.startsWith("wamid.")) {
      throw new Error(`Expected wamid prefix in providerMessageId, got '${res.providerMessageId}'`);
    }
  });

  // 2. Transactional Email Adapter Formatting & Delivery
  await runTest("Transactional Email Adapter Formatting & Delivery", async () => {
    const res = await emailAdapter.send({
      channel: "email",
      recipientIdentifier: "marcus@rome-holdings.com",
      subject: "IMPACT Consultation Confirmation",
      content: "Thank you for scheduling a discovery session with our engineering leads.",
    });

    if (!res.success) {
      throw new Error(`Expected successful Email delivery, got error: ${res.error}`);
    }
    if (res.status !== "delivered") {
      throw new Error(`Expected status 'delivered', got '${res.status}'`);
    }
    if (!res.providerMessageId?.startsWith("re_")) {
      throw new Error(`Expected re_ prefix in providerMessageId, got '${res.providerMessageId}'`);
    }
  });

  // 3. Phone / SMS Gateway Formatting & Direct Telephony Links
  await runTest("Phone / SMS Gateway Formatting & Direct Telephony Links", async () => {
    const directDial = phoneAdapter.getDirectDialUri();
    if (directDial !== "tel:+96181221829") {
      throw new Error(`Expected 'tel:+96181221829', got '${directDial}'`);
    }

    const waDirect = phoneAdapter.getWhatsAppDirectUri();
    if (!waDirect.includes("96181221829")) {
      throw new Error(`Expected WhatsApp direct URI with phone number, got '${waDirect}'`);
    }

    const res = await phoneAdapter.send({
      channel: "phone_sms",
      recipientIdentifier: "+14155552671",
      content: "Urgent: High-value lead requires custom AI architecture review.",
    });

    if (!res.success || res.status !== "delivered") {
      throw new Error("SMS delivery simulation failed");
    }
  });

  // 4. Hard Verification Gate: Provider Delivery Failure & Zero False Success
  await runTest("Hard Gate: Provider Delivery Failure & Zero False Success", async () => {
    // A. Force provider failure
    whatsAppAdapter.setForceFailure(true);

    const failRes = await omnichannelService.sendOutbound({
      channel: "whatsapp",
      recipientIdentifier: "+14155559999",
      content: "This message should fail delivery.",
    });

    // Hard gate check 1: result MUST report failure
    if (failRes.success) {
      whatsAppAdapter.setForceFailure(false);
      throw new Error("Hard Gate Violated: System falsely claimed message was sent when provider failed!");
    }
    if (failRes.status !== "failed") {
      whatsAppAdapter.setForceFailure(false);
      throw new Error(`Expected status 'failed', got '${failRes.status}'`);
    }

    // Hard gate check 2: database record MUST reflect failed status
    const record = await channelDeliveryRepository.findByProviderMessageId(failRes.deliveryId);
    // Or check recent
    const recent = await channelDeliveryRepository.listRecent(5, "whatsapp");
    const failedRecord = recent.find((r) => r.recipient === "+14155559999");

    if (!failedRecord || failedRecord.status !== "failed") {
      whatsAppAdapter.setForceFailure(false);
      throw new Error("Database failed to record 'failed' status for rejected delivery");
    }

    // Reset adapter
    whatsAppAdapter.setForceFailure(false);
  });

  // 5. Inbound WhatsApp Webhook Challenge Verification (GET)
  await runTest("Inbound WhatsApp Webhook Challenge Verification (GET /api/webhooks/whatsapp)", async () => {
    // 1. Valid subscription challenge
    const challengeVal = "challenge_nonce_98765";
    const validUrl = `${BASE_URL}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=impact_webhook_verify_token_2026&hub.challenge=${challengeVal}`;
    const validRes = await fetch(validUrl);

    if (validRes.status !== 200) {
      throw new Error(`Expected HTTP 200 on valid challenge, got ${validRes.status}`);
    }
    const bodyText = await validRes.text();
    if (bodyText !== challengeVal) {
      throw new Error(`Expected challenge response '${challengeVal}', got '${bodyText}'`);
    }

    // 2. Invalid verify token -> 403 Forbidden
    const invalidUrl = `${BASE_URL}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=${challengeVal}`;
    const invalidRes = await fetch(invalidUrl);
    if (invalidRes.status !== 403) {
      throw new Error(`Expected HTTP 403 on invalid token, got ${invalidRes.status}`);
    }
  });

  // 6. Inbound WhatsApp Webhook Ingestion & Customer Resolution (POST)
  const uniqueMsgId = `wamid.TEST_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const prospectPhone = `1415555${Math.floor(1000 + Math.random() * 9000)}`;

  await runTest("Inbound WhatsApp Webhook Ingestion & Autonomous AI Turn (POST)", async () => {
    const mockWebhookPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "15550234567",
                  phone_number_id: "104928491823901",
                },
                contacts: [
                  {
                    profile: { name: "Lucius Aurelius" },
                    wa_id: prospectPhone,
                  },
                ],
                messages: [
                  {
                    from: prospectPhone,
                    id: uniqueMsgId,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: {
                      body: "Hello IMPACT team, we need an autonomous voice agent for our multi-branch logistics network.",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const postRes = await fetch(`${BASE_URL}/api/webhooks/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockWebhookPayload),
    });

    if (postRes.status !== 200) {
      const err = await postRes.text();
      throw new Error(`Inbound webhook POST failed: HTTP ${postRes.status}: ${err}`);
    }

    const postData = await postRes.json();
    if (!postData.success || postData.processed !== 1) {
      throw new Error(`Expected 1 processed message, got ${postData.processed}`);
    }

    const firstResult = postData.results?.[0];
    if (!firstResult || !firstResult.success) {
      throw new Error("Expected successful inbound turn processing");
    }
    if (!firstResult.conversationId) {
      throw new Error("Missing conversationId in turn result");
    }
    if (!firstResult.response || firstResult.response.length < 10) {
      throw new Error("Expected non-empty AI response generated for WhatsApp message");
    }
    if (!firstResult.deliveryResult || firstResult.deliveryResult.status !== "delivered") {
      throw new Error("Expected delivered status on outbound WhatsApp reply");
    }

    // Verify omnichannelService directly creates customer and conversation in repository
    const localPhone = "14155559922";
    await omnichannelService.handleInboundMessage({
      channel: "whatsapp",
      channelMessageId: `wamid.DIRECT_${Date.now()}`,
      senderIdentifier: localPhone,
      senderName: "Direct Lucius",
      content: "Can you help automate our procurement workflows?",
      timestamp: new Date().toISOString(),
    });

    const localCustomer = await customerRepository.findByPhone(localPhone);
    if (!localCustomer) {
      throw new Error(`Expected customer to be created for direct phone ${localPhone}`);
    }
    const localConv = await conversationRepository.findActiveByCustomerAndChannel(localCustomer.id, "whatsapp");
    if (!localConv) {
      throw new Error("Expected active whatsapp conversation for direct customer");
    }
  });

  // 7. Webhook Idempotency & Duplicate Payload Suppression Gate
  await runTest("Webhook Idempotency & Duplicate Payload Suppression", async () => {
    // Replay the EXACT SAME payload with uniqueMsgId
    const replayPayload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                messages: [
                  {
                    from: prospectPhone,
                    id: uniqueMsgId, // Same ID!
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: {
                      body: "Hello IMPACT team, we need an autonomous voice agent for our multi-branch logistics network.",
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const replayRes = await fetch(`${BASE_URL}/api/webhooks/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replayPayload),
    });

    if (replayRes.status !== 200) {
      throw new Error(`Replay webhook failed: HTTP ${replayRes.status}`);
    }

    const replayData = await replayRes.json();
    const firstResult = replayData.results?.[0];
    if (!firstResult?.isDuplicate) {
      throw new Error("Idempotency Gate Failed: Replayed webhook was not flagged as duplicate!");
    }
  });

  // 8. Admin Outbound Dispatch API & RBAC Enforcement Gate
  await runTest("Admin Outbound Dispatch API & RBAC Enforcement Gate", async () => {
    // 1. Unauthenticated request -> 401
    const unauthRes = await fetch(`${BASE_URL}/api/messages/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "email",
        recipient: "client@venture.io",
        content: "Testing unauthenticated send",
      }),
    });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got HTTP ${unauthRes.status}`);
    }

    // 2. VIEWER role -> 403 Forbidden (no conversations:takeover permission)
    const viewerRes = await fetch(`${BASE_URL}/api/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: "email",
        recipient: "client@venture.io",
        content: "Testing viewer forbidden action",
      }),
    });
    if (viewerRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for VIEWER, got HTTP ${viewerRes.status}`);
    }

    // 3. SUPER_ADMIN role -> 200 OK
    const adminRes = await fetch(`${BASE_URL}/api/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: "email",
        recipient: "executive@venture.io",
        subject: "Executive Architecture Proposal",
        content: "We have finalized the technical discovery architecture for your evaluation.",
      }),
    });
    if (adminRes.status !== 200) {
      const err = await adminRes.text();
      throw new Error(`Admin send failed: HTTP ${adminRes.status}: ${err}`);
    }
    const adminData = await adminRes.json();
    if (!adminData.success || adminData.delivery?.status !== "delivered") {
      throw new Error("Expected successful delivery record in response");
    }
  });

  // 9. Admin Channels Diagnostics API & Telemetry
  await runTest("Admin Channels Diagnostics API & Telemetry", async () => {
    const diagRes = await fetch(`${BASE_URL}/api/admin/channels/status`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (diagRes.status !== 200) {
      throw new Error(`Diagnostics API failed: HTTP ${diagRes.status}`);
    }

    const diagData = await diagRes.json();
    if (!diagData.success || !diagData.diagnostics) {
      throw new Error("Malformed diagnostics response");
    }

    const channels = diagData.diagnostics.channels;
    if (!Array.isArray(channels) || channels.length !== 4) {
      throw new Error(`Expected 4 channel configurations, got ${channels?.length}`);
    }

    const expectedChannels = ["whatsapp", "email", "web_chat", "phone_sms"];
    for (const ch of expectedChannels) {
      const found = channels.find((c: any) => c.channel === ch);
      if (!found) {
        throw new Error(`Missing channel config for '${ch}' in diagnostics`);
      }
    }

    if (!Array.isArray(diagData.recentDeliveries) || diagData.recentDeliveries.length === 0) {
      throw new Error("Expected populated recentDeliveries array in diagnostics");
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total Omnichannel Tests: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log("-------------------------------------------------------\n");

  if (failedCount > 0) {
    console.error("Failed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(`  ✖ ${r.name}: ${r.error}`));
    return false;
  }

  console.log("\x1b[32mALL OMNICHANNEL & MESSAGING TESTS PASSED!\x1b[0m\n");
  return true;
}

if (require.main === module) {
  runAllOmnichannelTests()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((err) => {
      console.error("Unhandled exception in omnichannel test suite:", err);
      process.exit(1);
    });
}
