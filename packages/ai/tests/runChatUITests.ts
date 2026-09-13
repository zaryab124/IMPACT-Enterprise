


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

export async function runAllChatUITests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 6 CHAT AGENT UI & INTERACTION SUITE");
  console.log("=======================================================\n");

  let adminToken = "";

  // 0. Database & System Readiness Check
  await runTest("Database & System Readiness Check", async () => {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (healthRes.status !== 200) {
      throw new Error(`Health check returned HTTP ${healthRes.status}`);
    }
    const healthData = await healthRes.json();
    const dbStatus = typeof healthData.database === "string" ? healthData.database : healthData.database?.status;
    if (healthData.status !== "ok" || dbStatus !== "connected") {
      throw new Error(`System is not healthy: ${JSON.stringify(healthData)}`);
    }

    // Authenticate as Admin for verification access
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "admin@impact.enterprise",
        password: "AdminPassword2026!",
      }),
    });

    if (loginRes.status !== 200) {
      const errBody = await loginRes.text();
      throw new Error(`Admin login failed: HTTP ${loginRes.status} — ${errBody}`);
    }
    const loginData = await loginRes.json();
    adminToken = loginData.token;
  });

  let testConversationId = "";
  let testCustomerId = "";

  // 1. Session Initialization API
  await runTest("Chat Session Initialization API (POST /api/chat/session)", async () => {
    const res = await fetch(`${BASE_URL}/api/chat/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "website_chat" }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200, got ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.conversationId || !data.customerId) {
      throw new Error("Missing conversationId or customerId in session init response");
    }

    testConversationId = data.conversationId;
    testCustomerId = data.customerId;
  });

  // 2. Real-Time Message Exchange with Citations
  await runTest("Realtime Message Exchange with Knowledge Grounding (POST /api/chat/message)", async () => {
    const res = await fetch(`${BASE_URL}/api/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: testConversationId,
        message: "Tell me about your AI voice agents and typical timelines.",
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200, got ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !json.data || !json.data.reply) {
      throw new Error("Malformed chat response payload");
    }

    if (!json.data.citations || json.data.citations.length === 0) {
      throw new Error("Missing grounding citations in AI response");
    }

    if (!json.data.reply.includes("sub-400ms") && !json.data.reply.includes("2 to 6 weeks")) {
      throw new Error("Expected service details in AI reply");
    }
  });

  // 3. Conversation Resumption & History Rehydration
  await runTest("Conversation Resumption & History Rehydration (GET /api/chat/history)", async () => {
    const res = await fetch(`${BASE_URL}/api/chat/history?conversationId=${testConversationId}`);
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200, got ${res.status}`);
    }

    const json = await res.json();
    if (!json.success || !Array.isArray(json.messages) || json.messages.length < 2) {
      throw new Error(`Expected at least 2 messages in rehydrated history, found ${json.messages?.length}`);
    }

    const userMessage = json.messages.find((m: any) => m.role === "user");
    const aiMessage = json.messages.find((m: any) => m.role === "model");

    if (!userMessage || !aiMessage) {
      throw new Error("Missing user or model messages in conversation history");
    }
  });

  // 4. Interactive Lead Capture Card Submission Integration
  await runTest("In-Chat Lead Capture Form Submission & CRM Synchronization", async () => {
    const leadPayload =
      "[LEAD INTAKE SUBMISSION] Name: Robert Taylor | Email: robert@taylorlogistics.com | Phone: +1-555-0182 | Company: Taylor Logistics";

    const res = await fetch(`${BASE_URL}/api/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: testConversationId,
        message: leadPayload,
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 from lead submission, got ${res.status}`);
    }

    // Verify Customer record via Admin API
    const custRes = await fetch(`${BASE_URL}/api/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (custRes.status !== 200) {
      throw new Error(`Failed to fetch customers: HTTP ${custRes.status}`);
    }
    const custData = await custRes.json();
    const customer = custData.customers?.find((c: any) => c.email === "robert@taylorlogistics.com");
    if (!customer) {
      throw new Error("Customer record was not synced to database");
    }
    if (customer.name !== "Robert Taylor") {
      throw new Error(`Expected customer name 'Robert Taylor', got '${customer.name}'`);
    }

    // Verify Lead record via Admin API
    const leadsRes = await fetch(`${BASE_URL}/api/admin/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (leadsRes.status !== 200) {
      throw new Error(`Failed to fetch leads: HTTP ${leadsRes.status}`);
    }
    const leadsData = await leadsRes.json();
    const lead = leadsData.leads?.find((l: any) => l.customer_id === customer.id);
    if (!lead) {
      throw new Error("CRM Lead record was not created for submitted lead");
    }
  });

  // 5. Human Handoff Request & Status Escalation
  await runTest("Human Handoff Request & Operational Status Escalation", async () => {
    const handoffPayload =
      "[HUMAN HANDOFF REQUESTED] Prospective client requested escalation via whatsapp_hq.";

    const res = await fetch(`${BASE_URL}/api/chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: testConversationId,
        message: handoffPayload,
      }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 from handoff request, got ${res.status}`);
    }

    // Verify conversation status escalation via Admin API
    const convRes = await fetch(`${BASE_URL}/api/admin/conversations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (convRes.status !== 200) {
      throw new Error(`Failed to fetch conversations: HTTP ${convRes.status}`);
    }
    const convData = await convRes.json();
    const updatedConv = convData.conversations?.find((c: any) => c.id === testConversationId);
    if (!updatedConv) {
      throw new Error(`Conversation ${testConversationId} not found in admin list`);
    }
    if (updatedConv.status !== "human_handoff_requested") {
      throw new Error(`Expected status 'human_handoff_requested', got '${updatedConv.status}'`);
    }
  });

  // 6. Public Pages Layout Integrity
  await runTest("Public Pages Layout Integrity with Embedded ChatWidget", async () => {
    const pages = ["/", "/about", "/solutions", "/solutions/ai-agents", "/projects", "/contact", "/start-a-project"];
    for (const page of pages) {
      const res = await fetch(`${BASE_URL}${page}`);
      if (res.status !== 200) {
        throw new Error(`Page ${page} failed to render HTTP 200, got ${res.status}`);
      }
      const html = await res.text();
      if (!html.includes("Chat with IMPACT AI") && !html.includes("WhatsApp")) {
        throw new Error(`Page ${page} does not contain ChatWidget launcher`);
      }
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = results.filter((r) => !r.passed);
  console.log(`Total Chat UI Tests: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL CHAT AGENT UI & INTERACTION TESTS PASSED!\x1b[0m\n");
  return true;
}

// CLI Entrypoint
if (require.main === module) {
  runAllChatUITests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Unhandled Chat UI test runner exception:", err);
      process.exit(1);
    });
}
