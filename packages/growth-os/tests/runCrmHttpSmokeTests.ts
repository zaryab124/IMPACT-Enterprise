import { generateToken } from "../../auth/jwt";

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

export async function runAllCrmHttpSmokeTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 1 CRM HTTP SMOKE TEST SUITE");
  console.log("=======================================================\n");

  let token = "";
  let sessionCookie = "";

  // Authenticate as seeded SUPER_ADMIN
  await runTest("Admin Login via POST /api/auth/login", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "admin@impact.enterprise",
        password: "AdminPassword2026!",
      }),
    });

    if (res.status !== 200) {
      const err = await res.text();
      throw new Error(`Admin login failed: HTTP ${res.status} - ${err}`);
    }

    const data = await res.json();
    if (!data.token) throw new Error("Missing token in login response");
    token = data.token;

    const cookieHeader = res.headers.get("set-cookie");
    if (cookieHeader) {
      sessionCookie = cookieHeader.split(";")[0];
    }
  });

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    Cookie: sessionCookie,
    "x-bypass-rate-limit": "true",
  };

  // Test 1: Unauthenticated API Access Protection (401 Unauthorized)
  await runTest("Unauthenticated Access to CRM APIs returns HTTP 401", async () => {
    const resGet = await fetch(`${BASE_URL}/api/crm/leads`);
    if (resGet.status !== 401) {
      throw new Error(`Expected HTTP 401 for unauthenticated GET /api/crm/leads, got ${resGet.status}`);
    }

    const resPost = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: "Test", last_name: "User" }),
    });
    if (resPost.status !== 401) {
      throw new Error(`Expected HTTP 401 for unauthenticated POST /api/crm/leads, got ${resPost.status}`);
    }
  });

  // Test 2: Input Validation & Error Handling (HTTP 400 Bad Request)
  await runTest("Lead Input Validation & Format Constraints return HTTP 400", async () => {
    // Missing required fields
    const resMissing = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    if (resMissing.status !== 400) {
      throw new Error(`Expected HTTP 400 for empty body, got ${resMissing.status}`);
    }

    // Invalid email
    const resBadEmail = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        first_name: "Alice",
        last_name: "Stone",
        email: "not-a-valid-email",
      }),
    });
    if (resBadEmail.status !== 400) {
      throw new Error(`Expected HTTP 400 for invalid email, got ${resBadEmail.status}`);
    }

    // Invalid status
    const resBadStatus = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        first_name: "Alice",
        last_name: "Stone",
        email: "alice.stone@enterprise.com",
        lead_status: "INVALID_STATUS",
      }),
    });
    if (resBadStatus.status !== 400) {
      throw new Error(`Expected HTTP 400 for invalid lead_status, got ${resBadStatus.status}`);
    }

    // Invalid score (> 100)
    const resBadScore = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        first_name: "Alice",
        last_name: "Stone",
        email: "alice.stone@enterprise.com",
        lead_score: 150,
      }),
    });
    if (resBadScore.status !== 400) {
      throw new Error(`Expected HTTP 400 for score > 100, got ${resBadScore.status}`);
    }
  });

  // Test 3: Create Company via HTTP API
  let testCompanyId = "";
  await runTest("Create CRM Company via POST /api/crm/companies", async () => {
    const res = await fetch(`${BASE_URL}/api/crm/companies`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        name: "Apex Global Robotics",
        industry: "Robotics & AI Automation",
        website: "https://apexrobotics.ai",
        city: "Zurich",
        country: "Switzerland",
        size_tier: "ENTERPRISE",
      }),
    });

    if (res.status !== 201) {
      const err = await res.text();
      throw new Error(`Expected HTTP 201, got ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (!data.company?.id) throw new Error("Missing company id in response");
    testCompanyId = data.company.id;
  });

  // Test 4: Create Contact via HTTP API
  let testContactId = "";
  await runTest("Create CRM Contact via POST /api/crm/contacts", async () => {
    const res = await fetch(`${BASE_URL}/api/crm/contacts`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        company_id: testCompanyId,
        first_name: "Dr. Elena",
        last_name: "Rostova",
        email: "e.rostova@apexrobotics.ai",
        phone: "+41441234567",
        job_title: "Chief Technology Officer",
        city: "Zurich",
        country: "Switzerland",
        is_primary: true,
      }),
    });

    if (res.status !== 201) {
      const err = await res.text();
      throw new Error(`Expected HTTP 201, got ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (!data.contact?.id) throw new Error("Missing contact id in response");
    testContactId = data.contact.id;
  });

  // Test 5: Full Lead Lifecycle via HTTP (Create -> Read with History -> Update -> Soft Delete -> Restore)
  let testLeadId = "";
  await runTest("Complete Lead HTTP Lifecycle (Create, History, Update, Soft Delete, Restore)", async () => {
    // 5a: Create Lead with all fields
    const createRes = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        first_name: "Elena",
        last_name: "Rostova",
        email: "e.rostova@apexrobotics.ai",
        phone: "+41441234567",
        whatsapp: "+41441234567",
        company: "Apex Global Robotics",
        company_id: testCompanyId,
        contact_id: testContactId,
        job_title: "Chief Technology Officer",
        country: "Switzerland",
        city: "Zurich",
        website: "https://apexrobotics.ai",
        source: "linkedin",
        campaign: "Global Enterprise AI Rollout",
        service_interest: "AI models",
        lead_status: "NEW",
        lead_score: 90,
        notes: "Evaluating custom AI models and Make-based automated pipeline.",
      }),
    });

    if (createRes.status !== 201) {
      const err = await createRes.text();
      throw new Error(`Lead creation failed HTTP ${createRes.status}: ${err}`);
    }

    const createData = await createRes.json();
    testLeadId = createData.lead.id;

    // 5b: Read Lead with Complete History
    const historyRes = await fetch(`${BASE_URL}/api/crm/leads/${testLeadId}`, {
      headers: authHeaders,
    });
    if (historyRes.status !== 200) {
      throw new Error(`Failed to read lead history: HTTP ${historyRes.status}`);
    }
    const historyData = await historyRes.json();
    if (historyData.lead.first_name !== "Elena") throw new Error("Lead first name mismatch");
    if (!Array.isArray(historyData.activities) || historyData.activities.length === 0) {
      throw new Error("Lead creation activity was not tracked in history");
    }

    // 5c: Update Lead (Status progression: NEW -> QUALIFIED)
    const updateRes = await fetch(`${BASE_URL}/api/crm/leads/${testLeadId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        lead_status: "QUALIFIED",
        lead_score: 98,
        notes: "Technical architecture alignment meeting completed.",
      }),
    });
    if (updateRes.status !== 200) {
      throw new Error(`Lead update failed: HTTP ${updateRes.status}`);
    }

    // 5d: Verify status update activity was automatically logged
    const updatedHistoryRes = await fetch(`${BASE_URL}/api/crm/leads/${testLeadId}`, {
      headers: authHeaders,
    });
    const updatedHistoryData = await updatedHistoryRes.json();
    const statusActivity = updatedHistoryData.activities.find(
      (a: any) => a.activity_type === "status_change" && a.description.includes("QUALIFIED")
    );
    if (!statusActivity) {
      throw new Error("Status change was not automatically logged to activity history");
    }

    // 5e: Soft Delete (Archive)
    const deleteRes = await fetch(`${BASE_URL}/api/crm/leads/${testLeadId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (deleteRes.status !== 200) {
      throw new Error(`Lead soft delete failed: HTTP ${deleteRes.status}`);
    }

    // Verify lead is excluded from active list
    const listRes = await fetch(`${BASE_URL}/api/crm/leads?search=Rostova`, {
      headers: authHeaders,
    });
    const listData = await listRes.json();
    const isFoundInActive = listData.leads.some((l: any) => l.id === testLeadId);
    if (isFoundInActive) {
      throw new Error("Soft-deleted lead should not appear in active search list");
    }

    // 5f: Restore lead from archive
    const restoreRes = await fetch(`${BASE_URL}/api/crm/leads/${testLeadId}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ action: "restore" }),
    });
    if (restoreRes.status !== 200) {
      throw new Error(`Lead restore failed: HTTP ${restoreRes.status}`);
    }

    // Verify lead is restored to active list
    const restoredListRes = await fetch(`${BASE_URL}/api/crm/leads?search=Rostova`, {
      headers: authHeaders,
    });
    const restoredListData = await restoredListRes.json();
    const isFoundAfterRestore = restoredListData.leads.some((l: any) => l.id === testLeadId);
    if (!isFoundAfterRestore) {
      throw new Error("Restored lead should appear in active search list");
    }
  });

  // Test 6: Create Deal & Tasks linked to Lead & Company
  let testDealId = "";
  await runTest("Create Deal & Task via HTTP linked to Lead & Company", async () => {
    // Create deal
    const dealRes = await fetch(`${BASE_URL}/api/crm/deals`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: "Apex AI Model Integration Contract",
        amount: 150000,
        currency: "USD",
        lead_id: testLeadId,
        company_id: testCompanyId,
        contact_id: testContactId,
        service_interest: "AI models",
      }),
    });

    if (dealRes.status !== 201) {
      const err = await dealRes.text();
      throw new Error(`Deal creation failed HTTP ${dealRes.status}: ${err}`);
    }
    const dealData = await dealRes.json();
    testDealId = dealData.deal.id;

    // Create task
    const taskRes = await fetch(`${BASE_URL}/api/crm/tasks`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: "Draft Enterprise AI SOW & SLA",
        priority: "URGENT",
        lead_id: testLeadId,
        deal_id: testDealId,
        company_id: testCompanyId,
        contact_id: testContactId,
        due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      }),
    });

    if (taskRes.status !== 201) {
      const err = await taskRes.text();
      throw new Error(`Task creation failed HTTP ${taskRes.status}: ${err}`);
    }

    const taskData = await taskRes.json();
    if (!taskData.task?.id) throw new Error("Missing task id in response");
  });

  // Test 7: HTTP 404 Not Found for non-existent entities
  await runTest("Non-existent Entity Lookup returns HTTP 404", async () => {
    const res = await fetch(`${BASE_URL}/api/crm/leads/00000000-0000-0000-0000-000000000000`, {
      headers: authHeaders,
    });
    if (res.status !== 404) {
      throw new Error(`Expected HTTP 404 for non-existent lead, got ${res.status}`);
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total CRM HTTP Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    console.error("FAILURES DETECTED:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`  - ${r.name}: ${r.error}`);
    });
    return false;
  }

  console.log("\x1b[32mALL CRM HTTP SMOKE TESTS PASSED SUCCESSFULLY!\x1b[0m\n");
  return true;
}

if (require.main === module) {
  runAllCrmHttpSmokeTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("CRM HTTP smoke tests fatal error:", err);
      process.exit(1);
    });
}
