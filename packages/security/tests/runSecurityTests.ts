import { rateLimiter } from "../rateLimiter";
import { applySecurityHeaders, SECURITY_HEADERS } from "../headers";
import { corsHandler } from "../cors";
import { csrfValidator } from "../csrf";
import { sanitizeString, sanitizeObject, detectSqlInjection } from "../sanitizer";
import { GET as getHealthHandler } from "../../../app/api/health/route";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const report: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  process.stdout.write(`  ▶ Running test: ${name}... `);
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    report.push({ name, passed: true, durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    \x1b[31mError:\x1b[0m ${err.message}`);
    report.push({ name, passed: false, error: err.message, durationMs });
  }
}

export async function runAllSecurityTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 14 SECURITY HARDENING SUITE");
  console.log("=======================================================\n");

  rateLimiter.reset();

  // 1. Sliding Window Rate Limiter Quota & Remaining Arithmetic
  await runTest("Sliding Window Rate Limiter Quota & Remaining Arithmetic", async () => {
    const testKey = "test:client:1";
    const res1 = await rateLimiter.checkRateLimit(testKey, "api");
    if (!res1.allowed || res1.remaining !== 59 || res1.limit !== 60) {
      throw new Error(`Expected remaining 59/60, got ${res1.remaining}/${res1.limit}`);
    }

    const res2 = await rateLimiter.checkRateLimit(testKey, "api");
    if (!res2.allowed || res2.remaining !== 58) {
      throw new Error(`Expected remaining 58, got ${res2.remaining}`);
    }
  });

  // 2. Rate Limit Threshold Enforcement (HTTP 429 Too Many Requests)
  await runTest("Rate Limit Threshold Enforcement (HTTP 429)", async () => {
    const bruteKey = "auth:brute:victim1";
    // Auth tier limit is 5 requests per minute
    for (let i = 0; i < 5; i++) {
      const allowedRes = await rateLimiter.checkRateLimit(bruteKey, "auth");
      if (!allowedRes.allowed) {
        throw new Error(`Request ${i + 1} should have been allowed`);
      }
    }

    // 6th request must be rejected
    const blockedRes = await rateLimiter.checkRateLimit(bruteKey, "auth");
    if (blockedRes.allowed) {
      throw new Error("6th request exceeded quota but was erroneously allowed");
    }
    if (blockedRes.retryAfterSec <= 0) {
      throw new Error(`Expected positive retryAfterSec, got ${blockedRes.retryAfterSec}`);
    }

    const http429 = rateLimiter.buildRateLimitResponse(blockedRes);
    if (http429.status !== 429) {
      throw new Error(`Expected status 429, got ${http429.status}`);
    }

    const body = await http429.json();
    if (body.error?.code !== "RATE_LIMIT_EXCEEDED") {
      throw new Error(`Expected code RATE_LIMIT_EXCEEDED, got ${body.error?.code}`);
    }
  });

  // 3. Rate Limit HTTP Headers Generation
  await runTest("Rate Limit HTTP Headers Generation", async () => {
    const result = {
      allowed: false,
      limit: 30,
      remaining: 0,
      resetTime: 1789299999,
      retryAfterSec: 42,
    };
    const headers = rateLimiter.getRateLimitHeaders(result);
    if (headers["X-RateLimit-Limit"] !== "30") throw new Error("Missing X-RateLimit-Limit");
    if (headers["X-RateLimit-Remaining"] !== "0") throw new Error("Missing X-RateLimit-Remaining");
    if (headers["X-RateLimit-Reset"] !== "1789299999") throw new Error("Missing X-RateLimit-Reset");
    if (headers["Retry-After"] !== "42") throw new Error("Missing Retry-After");
  });

  // 4. Auth Brute-Force Mitigation Tier Isolation
  await runTest("Auth Brute-Force Mitigation Tier Isolation", async () => {
    const ip1 = "192.168.1.100";
    const ip2 = "192.168.1.101";

    // Exhaust IP1 quota
    for (let i = 0; i < 5; i++) {
      await rateLimiter.checkRateLimit(`auth:${ip1}`, "auth");
    }
    const ip1Check = await rateLimiter.checkRateLimit(`auth:${ip1}`, "auth");
    if (ip1Check.allowed) throw new Error("IP1 was not throttled");

    // IP2 must still be permitted
    const ip2Check = await rateLimiter.checkRateLimit(`auth:${ip2}`, "auth");
    if (!ip2Check.allowed) throw new Error("IP2 was erroneously throttled by IP1 quota");
  });

  // 5. Security Headers Integrity (CSP, HSTS, X-Frame-Options, Permissions-Policy)
  await runTest("Security Headers Integrity (CSP, HSTS, X-Frame-Options)", async () => {
    const headers = new Headers();
    applySecurityHeaders(headers);

    if (!headers.get("Content-Security-Policy")?.includes("default-src 'self'")) {
      throw new Error("CSP missing default-src 'self'");
    }
    if (!headers.get("Strict-Transport-Security")?.includes("max-age=63072000")) {
      throw new Error("HSTS missing 2-year max-age preload");
    }
    if (headers.get("X-Frame-Options") !== "DENY") {
      throw new Error(`Expected X-Frame-Options DENY, got ${headers.get("X-Frame-Options")}`);
    }
    if (headers.get("X-Content-Type-Options") !== "nosniff") {
      throw new Error("Missing X-Content-Type-Options: nosniff");
    }
    if (!headers.get("Permissions-Policy")?.includes("microphone=(self)")) {
      throw new Error("Permissions-Policy missing microphone self allowance for voice agent");
    }
  });

  // 6. CORS Preflight OPTIONS Request Handling & Allowed Origin
  await runTest("CORS Preflight OPTIONS Request Handling & Allowed Origin", async () => {
    const optionsReq = new Request("http://localhost:3005/api/chat/message", {
      method: "OPTIONS",
      headers: {
        Origin: "https://impact-enterprise.vercel.app",
        Host: "localhost:3005",
      },
    });

    const preflightRes = corsHandler.handlePreflight(optionsReq);
    if (!preflightRes || preflightRes.status !== 204) {
      throw new Error(`Expected 204 No Content for preflight, got ${preflightRes?.status}`);
    }

    if (
      preflightRes.headers.get("Access-Control-Allow-Origin") !==
      "https://impact-enterprise.vercel.app"
    ) {
      throw new Error("CORS preflight missing allowed origin header");
    }
    if (preflightRes.headers.get("Access-Control-Allow-Credentials") !== "true") {
      throw new Error("CORS preflight missing credentials header");
    }
  });

  // 7. CORS Unauthorized Origin Rejection
  await runTest("CORS Unauthorized Origin Rejection", async () => {
    const forbiddenReq = new Request("http://localhost:3005/api/chat/message", {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil-phishing-site.xyz",
        Host: "localhost:3005",
      },
    });

    const preflightRes = corsHandler.handlePreflight(forbiddenReq);
    if (!preflightRes || preflightRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for disallowed origin, got ${preflightRes?.status}`);
    }
  });

  // 8. CSRF Mutation Request Validation & Exemption Rules
  await runTest("CSRF Mutation Request Validation & Exemption Rules", async () => {
    // 1. Safe GET passes without Origin
    const getReq = new Request("http://localhost:3005/api/health", { method: "GET" });
    const getRes = csrfValidator.validate(getReq);
    if (!getRes.valid) throw new Error("Safe GET should pass CSRF validation");

    // 2. Disallowed cross-site POST is blocked
    const maliciousPost = new Request("http://localhost:3005/api/admin/settings", {
      method: "POST",
      headers: {
        Origin: "https://evil-attacker.com",
        Host: "localhost:3005",
        "Sec-Fetch-Site": "cross-site",
      },
    });
    const malRes = csrfValidator.validate(maliciousPost);
    if (malRes.valid) throw new Error("Malicious cross-site POST was erroneously permitted");

    // 3. Webhooks are exempt
    const webhookReq = new Request("http://localhost:3005/api/webhooks/whatsapp", {
      method: "POST",
      headers: {
        Origin: "https://graph.facebook.com",
        Host: "localhost:3005",
        "Sec-Fetch-Site": "cross-site",
      },
    });
    const whRes = csrfValidator.validate(webhookReq);
    if (!whRes.valid) throw new Error("Webhook endpoint should be exempt from CSRF");
  });

  // 9. Input Sanitization Engine & SQL Injection Heuristic
  await runTest("Input Sanitization Engine & SQL Injection Heuristic", async () => {
    // XSS Tag Stripping
    const dirtyXss = "<script>alert('attack')</script>Inbound Inquiry Message";
    const cleanXss = sanitizeString(dirtyXss);
    if (cleanXss.includes("<script>") || cleanXss !== "Inbound Inquiry Message") {
      throw new Error(`XSS sanitization failed, got: "${cleanXss}"`);
    }

    // Event Handler Stripping
    const dirtyEvent = '<img src="avatar.png" onerror="stealCookies()">Alex';
    const cleanEvent = sanitizeString(dirtyEvent);
    if (cleanEvent.includes("onerror")) {
      throw new Error(`Event handler not stripped: "${cleanEvent}"`);
    }

    // Javascript URI Stripping
    const dirtyUri = 'javascript:alert(1)';
    const cleanUri = sanitizeString(dirtyUri);
    if (cleanUri.includes("javascript:")) {
      throw new Error(`Javascript URI not stripped: "${cleanUri}"`);
    }

    // Recursive object sanitization
    const dirtyObj = {
      name: "<b>John Doe</b>",
      nested: {
        comment: "<script>hack()</script>Interested in enterprise plan",
      },
    };
    const cleanObj = sanitizeObject(dirtyObj);
    if (cleanObj.nested.comment.includes("<script>")) {
      throw new Error("Recursive object sanitization failed");
    }

    // SQL Injection Detection
    if (!detectSqlInjection("admin' OR 1=1 --")) {
      throw new Error("Failed to detect classic SQL injection signature");
    }
    if (!detectSqlInjection("'; DROP TABLE users; --")) {
      throw new Error("Failed to detect DROP TABLE SQL injection");
    }
    if (detectSqlInjection("We need automated appointment scheduling for our 50 employees.")) {
      throw new Error("False positive SQL injection detected on legitimate customer inquiry");
    }
  });

  // 10. Enhanced /api/health Telemetry Endpoint Verification
  await runTest("Enhanced /api/health Telemetry Endpoint Verification", async () => {
    const res = await getHealthHandler();
    if (res.status !== 200 && res.status !== 503) {
      throw new Error(`Unexpected health status: ${res.status}`);
    }

    const payload = await res.json();
    if (!payload.system || typeof payload.system.uptimeSeconds !== "number") {
      throw new Error("Missing system uptime in health telemetry");
    }
    if (!payload.system.memoryMb || typeof payload.system.memoryMb.heapUsed !== "number") {
      throw new Error("Missing heapUsed in health telemetry");
    }
    if (!payload.security || payload.security.rateLimiter !== "active") {
      throw new Error("Missing active rate limiter flag in health telemetry");
    }
    if (payload.security.csp !== "enforced" || payload.security.hsts !== "enforced") {
      throw new Error("Missing CSP/HSTS enforcement flags in health telemetry");
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = report.filter((r) => !r.passed);
  console.log(
    `Total Security Tests: ${report.length} | Passed: ${report.length - failed.length} | Failed: ${failed.length}`
  );
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED IN SECURITY SUITE:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL SECURITY HARDENING & RATE LIMITING TESTS PASSED!\x1b[0m\n");
  return true;
}

if (require.main === module) {
  runAllSecurityTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal error during security test run:", err);
      process.exit(1);
    });
}
