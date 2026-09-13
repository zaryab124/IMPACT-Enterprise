import { hashPassword, verifyPassword } from "../password";
import { generateToken, verifyToken } from "../jwt";
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

export async function runAllAuthTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 3 AUTHENTICATION & RBAC TEST SUITE");
  console.log("=======================================================\n");

  // 1. Password Security
  await runTest("Password Hashing & Bcrypt Verification", async () => {
    const password = "SecureEnterprisePassword2026!";
    const hash = await hashPassword(password);
    if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
      throw new Error("Invalid bcrypt hash format generated");
    }

    const isValid = await verifyPassword(password, hash);
    if (!isValid) throw new Error("Valid password failed verification");

    const isInvalid = await verifyPassword("WrongPassword!", hash);
    if (isInvalid) throw new Error("Incorrect password passed verification");
  });

  // 2. JWT Generation & Verification
  await runTest("JWT Token Signing & Cryptographic Validation", async () => {
    const payload = {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@impact.enterprise",
      roles: ["SUPER_ADMIN" as const],
    };

    const token = generateToken(payload);
    const decoded = verifyToken(token);
    if (!decoded || decoded.userId !== payload.userId || decoded.email !== payload.email) {
      throw new Error("Decoded token does not match original payload");
    }

    const tampered = token.slice(0, -5) + "abcde";
    const decodedTampered = verifyToken(tampered);
    if (decodedTampered !== null) {
      throw new Error("Tampered token was erroneously accepted");
    }
  });

  // 3. Ensure database is seeded with role accounts
  await runTest("Database Account Preparation", async () => {
    await seedDevelopmentDatabase();
  });

  // 4. Direct Unauthenticated API Access (Expected 401)
  await runTest("Direct Unauthenticated API Access Returns 401 Unauthorized", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/leads`, {
      headers: { Accept: "application/json" },
    });

    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got: HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.error?.code !== "UNAUTHORIZED") {
      throw new Error(`Expected error code UNAUTHORIZED, got: ${json.error?.code}`);
    }
  });

  // 5. Direct Unauthenticated Web Route Access (Redirects to /admin/login)
  await runTest("Direct Unauthenticated Page Access Redirects to /admin/login", async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      redirect: "manual",
    });

    // In fetch with manual redirect, status should be 307 or redirect Location should point to /admin/login
    const location = res.headers.get("location");
    if (!location || !location.includes("/admin/login")) {
      // If Next.js served direct response, check if redirected
      if (res.status !== 307 && res.status !== 302 && res.status !== 308) {
        throw new Error(`Expected redirect to /admin/login, got status ${res.status} and location ${location}`);
      }
    }
  });

  // 6. Invalid Credentials Login (Expected 401)
  await runTest("Login With Invalid Password Returns 401", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "admin@impact.enterprise",
        password: "IncorrectPassword123!",
      }),
    });

    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 for invalid credentials, got: HTTP ${res.status}`);
    }
  });

  // 7. Valid Login & Cookie Header
  let superAdminToken = "";
  let sessionCookie = "";

  await runTest("Successful Login Returns User, Token, and Sets Session Cookie", async () => {
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
      throw new Error(`Expected HTTP 200, got: HTTP ${res.status} - ${err}`);
    }

    const data = await res.json();
    if (!data.success || !data.token) {
      throw new Error("Missing token in login response payload");
    }
    if (!data.user.roles.includes("SUPER_ADMIN")) {
      throw new Error("Admin user missing SUPER_ADMIN role");
    }

    superAdminToken = data.token;
    const cookieHeader = res.headers.get("set-cookie");
    if (!cookieHeader || !cookieHeader.includes("impact_session_token")) {
      throw new Error("set-cookie header missing impact_session_token");
    }
    sessionCookie = cookieHeader.split(";")[0];
  });

  // 8. Authenticated Permitted API Access (Expected 200)
  await runTest("Authenticated SUPER_ADMIN Access to Protected APIs (200 OK)", async () => {
    // Test with Cookie
    const resCookie = await fetch(`${BASE_URL}/api/admin/leads`, {
      headers: { Cookie: sessionCookie },
    });
    if (resCookie.status !== 200) {
      throw new Error(`Cookie auth failed. Expected 200, got ${resCookie.status}`);
    }

    // Test with Bearer Header
    const resBearer = await fetch(`${BASE_URL}/api/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (resBearer.status !== 200) {
      throw new Error(`Bearer auth failed. Expected 200, got ${resBearer.status}`);
    }

    const metricsData = await resBearer.json();
    if (!metricsData.success || !metricsData.metrics) {
      throw new Error("Metrics response payload malformed");
    }
  });

  // 9. RBAC Test: Viewer Role Forbidden from Performing Admin Actions (Expected 403)
  let viewerToken = "";

  await runTest("RBAC Gate: VIEWER Role Attempting SUPER_ADMIN Action Returns 403 Forbidden", async () => {
    // Login as Viewer
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "viewer@impact.enterprise",
        password: "ViewerPassword2026!",
      }),
    });

    if (loginRes.status !== 200) {
      throw new Error(`Failed to login as viewer: ${loginRes.status}`);
    }
    const loginData = await loginRes.json();
    viewerToken = loginData.token;

    // Attempt SUPER_ADMIN action (POST /api/admin/settings)
    const forbiddenRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ maintenanceMode: true }),
    });

    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for VIEWER, got: HTTP ${forbiddenRes.status}`);
    }

    const forbiddenJson = await forbiddenRes.json();
    if (forbiddenJson.error?.code !== "FORBIDDEN") {
      throw new Error(`Expected error code FORBIDDEN, got: ${forbiddenJson.error?.code}`);
    }
  });

  // 10. RBAC Test: SUPER_ADMIN Permitted to Perform Admin Action (Expected 200)
  await runTest("RBAC Gate: SUPER_ADMIN Role Permitted to Perform Admin Action (200 OK)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${superAdminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voiceLatencyTargetMs: 380 }),
    });

    if (res.status !== 200) {
      throw new Error(`Expected HTTP 200 for SUPER_ADMIN, got: HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error("Settings update failed for authorized super admin");
    }
  });

  // 11. Logout & Invalidation Test
  await runTest("Logout Clears Session Cookie & Subsequent Request Returns 401", async () => {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
    });

    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed: HTTP ${logoutRes.status}`);
    }

    const cookieHeader = logoutRes.headers.get("set-cookie");
    if (!cookieHeader || (!cookieHeader.includes("Max-Age=0") && !cookieHeader.includes("max-age=0") && !cookieHeader.includes("expires="))) {
      throw new Error("Session cookie was not cleared on logout");
    }

    // Subsequent request without cookie returns 401
    const subRes = await fetch(`${BASE_URL}/api/admin/leads`, {
      headers: { Accept: "application/json" },
    });

    if (subRes.status !== 401) {
      throw new Error(`Expected HTTP 401 after logout, got: HTTP ${subRes.status}`);
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = results.filter((r) => !r.passed);
  console.log(`Total Auth Tests: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL AUTHENTICATION & RBAC TESTS PASSED!\x1b[0m\n");
  return true;
}

// CLI Entrypoint
if (require.main === module) {
  runAllAuthTests()
    .then(async (success) => {
      await db.close();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Unhandled auth test runner exception:", err);
      process.exit(1);
    });
}
