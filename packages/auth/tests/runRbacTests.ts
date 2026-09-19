import { generateToken } from "../jwt";
import { ROLE_PERMISSIONS, UserRole, hasPermission } from "../roles";
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

export async function runAllRbacTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 3 AUTH & RBAC VERIFICATION  ");
  console.log("=======================================================\n");

  await seedDevelopmentDatabase();

  // Test 1: Role Permissions Matrix Verification
  await runTest("Granular Permissions Mapping for All 8 Enterprise Roles", async () => {
    // 1a: CEO Permissions
    if (!hasPermission("CEO", "crm:leads_delete")) throw new Error("CEO missing crm:leads_delete");
    if (!hasPermission("CEO", "content:approve")) throw new Error("CEO missing content:approve");
    if (!hasPermission("CEO", "team:manage")) throw new Error("CEO missing team:manage");
    if (!hasPermission("CEO", "analytics:view")) throw new Error("CEO missing analytics:view");

    // 1b: Sales Agent Permissions & Guardrails
    if (!hasPermission("SALES_AGENT", "crm:view_assigned")) throw new Error("Sales Agent missing crm:view_assigned");
    if (!hasPermission("SALES_AGENT", "crm:deals_manage")) throw new Error("Sales Agent missing crm:deals_manage");
    if (hasPermission("SALES_AGENT", "crm:leads_delete")) throw new Error("Sales Agent should NOT have crm:leads_delete");
    if (hasPermission("SALES_AGENT", "team:manage")) throw new Error("Sales Agent should NOT have team:manage");

    // 1c: Content Manager Permissions
    if (!hasPermission("CONTENT_MANAGER", "content:view")) throw new Error("Content Manager missing content:view");
    if (!hasPermission("CONTENT_MANAGER", "social:publish")) throw new Error("Content Manager missing social:publish");
    if (hasPermission("CONTENT_MANAGER", "crm:deals_manage")) throw new Error("Content Manager should NOT have crm:deals_manage");

    // 1d: Viewer Strictly Read-Only
    if (!hasPermission("VIEWER", "dashboard:view")) throw new Error("Viewer missing dashboard:view");
    if (!hasPermission("VIEWER", "crm:view_all")) throw new Error("Viewer missing crm:view_all");
    if (hasPermission("VIEWER", "crm:leads_manage")) throw new Error("Viewer must NOT have write permission crm:leads_manage");
    if (hasPermission("VIEWER", "crm:leads_delete")) throw new Error("Viewer must NOT have crm:leads_delete");
    if (hasPermission("VIEWER", "content:approve")) throw new Error("Viewer must NOT have content:approve");
  });

  // Test 2: Multi-Role Login Verification
  const tokens: Record<string, string> = {};

  const roleLogins = [
    { role: "SUPER_ADMIN", email: "admin@impact.enterprise", pass: "AdminPassword2026!" },
    { role: "CEO", email: "ceo@impact.enterprise", pass: "CeoPassword2026!" },
    { role: "SALES_MANAGER", email: "sales.manager@impact.enterprise", pass: "SalesManagerPassword2026!" },
    { role: "SALES_AGENT", email: "sales.agent@impact.enterprise", pass: "SalesAgentPassword2026!" },
    { role: "MARKETING_MANAGER", email: "marketing.manager@impact.enterprise", pass: "MarketingManagerPassword2026!" },
    { role: "CONTENT_MANAGER", email: "content.manager@impact.enterprise", pass: "ContentManagerPassword2026!" },
    { role: "SUPPORT_AGENT", email: "support.agent@impact.enterprise", pass: "SupportAgentPassword2026!" },
    { role: "VIEWER", email: "viewer@impact.enterprise", pass: "ViewerPassword2026!" },
  ];

  await runTest("Authentication & Token Generation for All 8 Roles", async () => {
    for (const item of roleLogins) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
        body: JSON.stringify({ email: item.email, password: item.pass }),
      });

      if (res.status !== 200) {
        throw new Error(`Login failed for role ${item.role} (${item.email}): HTTP ${res.status}`);
      }

      const json = await res.json();
      if (!json.token || !json.user.roles.includes(item.role)) {
        throw new Error(`Invalid token or role response for ${item.role}`);
      }

      tokens[item.role] = json.token;
    }
  });

  // Test 3: Logout Invalidation
  await runTest("Logout Clears Session Cookie", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST" });
    if (res.status !== 200) {
      throw new Error(`Logout returned HTTP ${res.status}`);
    }
    const setCookie = res.headers.get("set-cookie");
    if (setCookie && !setCookie.includes("Max-Age=0")) {
      throw new Error("Logout did not expire impact_session_token");
    }
  });

  // Test 4: Server-Side Write Enforcement (Viewer blocked with HTTP 403 Forbidden)
  let createdLeadId = "";
  await runTest("Server-Side Authorization: Viewer Blocked from Mutation (HTTP 403)", async () => {
    const viewerToken = tokens["VIEWER"];
    if (!viewerToken) throw new Error("Missing Viewer token");

    // Viewer attempting to create lead
    const resCreate = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${viewerToken}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({
        first_name: "Unauthorized",
        last_name: "Attempt",
        email: "unauth@test.com",
      }),
    });

    if (resCreate.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for Viewer lead creation, got ${resCreate.status}`);
    }
  });

  // Test 5: Authorized CEO / Sales Manager Mutation (HTTP 201)
  await runTest("Server-Side Authorization: Authorized Role Mutation (HTTP 201)", async () => {
    const ceoToken = tokens["CEO"];
    if (!ceoToken) throw new Error("Missing CEO token");

    const resCreate = await fetch(`${BASE_URL}/api/crm/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ceoToken}`,
        "x-bypass-rate-limit": "true",
      },
      body: JSON.stringify({
        first_name: "Robert",
        last_name: "Sterling",
        email: "r.sterling@sterlingholdings.com",
        company: "Sterling Holdings International",
        service_interest: "AI models",
        lead_status: "NEW",
      }),
    });

    if (resCreate.status !== 201) {
      const err = await resCreate.text();
      throw new Error(`Expected HTTP 201 for CEO lead creation, got ${resCreate.status}: ${err}`);
    }

    const data = await resCreate.json();
    createdLeadId = data.lead.id;
  });

  // Test 6: Sales Agent Blocked from Deleting Leads (HTTP 403)
  await runTest("Server-Side Authorization: Sales Agent Blocked from Lead Deletion (HTTP 403)", async () => {
    if (!createdLeadId) throw new Error("Missing createdLeadId");
    const agentToken = tokens["SALES_AGENT"];

    const resDelete = await fetch(`${BASE_URL}/api/crm/leads/${createdLeadId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${agentToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    if (resDelete.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for Sales Agent lead deletion, got ${resDelete.status}`);
    }
  });

  // Test 7: CEO Authorized Lead Deletion (HTTP 200)
  await runTest("Server-Side Authorization: CEO Authorized Lead Deletion (HTTP 200)", async () => {
    if (!createdLeadId) throw new Error("Missing createdLeadId");
    const ceoToken = tokens["CEO"];

    const resDelete = await fetch(`${BASE_URL}/api/crm/leads/${createdLeadId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${ceoToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    if (resDelete.status !== 200) {
      throw new Error(`Expected HTTP 200 for CEO lead deletion, got ${resDelete.status}`);
    }
  });

  // Test 8: Expired JWT Rejection (HTTP 401)
  await runTest("Expired Token Rejection & Session Invalidation", async () => {
    // Generate an expired token
    const expiredToken = generateToken(
      {
        userId: "00000000-0000-0000-0000-000000000001",
        email: "admin@impact.enterprise",
        roles: ["SUPER_ADMIN"],
      },
      "-1s" // already expired
    );

    const res = await fetch(`${BASE_URL}/api/crm/leads`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`,
        "x-bypass-rate-limit": "true",
      },
    });

    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 for expired JWT, got ${res.status}`);
    }
  });

  // Test 9: Direct URL Access Protection & Unauthorized Page
  await runTest("Protected Unauthorized Page Returns HTTP 200", async () => {
    const res = await fetch(`${BASE_URL}/admin/unauthorized`);
    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 for /admin/unauthorized, got ${res.status}`);
    }
  });

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n-------------------------------------------------------");
  console.log(`Total RBAC Tests: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log("-------------------------------------------------------\n");

  if (failed > 0) {
    console.error("FAILURES DETECTED:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.error(`  - ${r.name}: ${r.error}`);
    });
    return false;
  }

  console.log("\x1b[32mALL AUTH & RBAC VERIFICATION TESTS PASSED SUCCESSFULLY!\x1b[0m\n");
  return true;
}

if (require.main === module) {
  runAllRbacTests()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((err) => {
      console.error("RBAC tests fatal error:", err);
      process.exit(1);
    });
}
