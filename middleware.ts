import { NextResponse, NextRequest } from "next/server";
import {
  rateLimiter,
  RateLimitTier,
  corsHandler,
  csrfValidator,
  applySecurityHeaders,
} from "./packages/security";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip internal Next.js assets, favicons, static images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // e.g. favicon.ico, images, robots.txt
  ) {
    const response = NextResponse.next();
    applySecurityHeaders(response.headers);
    return response;
  }

  // 2. CORS Preflight Resolution for OPTIONS requests
  if (request.method === "OPTIONS") {
    const preflightRes = corsHandler.handlePreflight(request);
    if (preflightRes) {
      applySecurityHeaders(preflightRes.headers);
      return preflightRes;
    }
  }

  // 3. CSRF Validation for state-mutating requests
  if (pathname.startsWith("/api/")) {
    const csrfResult = csrfValidator.validate(request);
    if (!csrfResult.valid) {
      return new NextResponse(
        JSON.stringify({
          error: {
            code: "CSRF_VALIDATION_FAILED",
            message: csrfResult.reason || "Cross-site request forgery protection triggered",
          },
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }
  }

  // 4. Tiered Rate Limiting for API Endpoints
  let rateLimitResult = null;
  if (pathname.startsWith("/api/")) {
    const ip =
      request.ip ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const bypassHeader = request.headers.get("x-bypass-rate-limit");
    if (bypassHeader !== "true") {
      let tier: RateLimitTier = "api";
      if (pathname === "/api/auth/login") {
        tier = "auth";
      } else if (pathname.startsWith("/api/chat/") || pathname.startsWith("/api/voice/")) {
        tier = "ai";
      } else if (pathname.startsWith("/api/admin/")) {
        tier = "admin";
      }

      const rateKey = `${tier}:${ip}`;
      rateLimitResult = await rateLimiter.checkRateLimit(rateKey, tier);

      if (!rateLimitResult.allowed) {
        const rateRes = rateLimiter.buildRateLimitResponse(rateLimitResult);
        applySecurityHeaders(rateRes.headers);
        corsHandler.applyCorsHeaders(rateRes.headers, request);
        return rateRes;
      }
    }
  }

  // 5. Protected Admin and Internal Requests Route Gate
  const isProtectedPage =
    pathname === "/admin" ||
    (pathname.startsWith("/admin/") && pathname !== "/admin/login") ||
    pathname === "/requests" ||
    pathname.startsWith("/requests/");

  if (isProtectedPage) {
    const sessionToken = request.cookies.get("impact_session_token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const redirectRes = NextResponse.redirect(loginUrl);
      applySecurityHeaders(redirectRes.headers);
      return redirectRes;
    }
  }

  // 6. Normal Response Execution with Injected Security & CORS Headers
  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  corsHandler.applyCorsHeaders(response.headers, request);

  if (rateLimitResult) {
    const rlHeaders = rateLimiter.getRateLimitHeaders(rateLimitResult);
    for (const [k, v] of Object.entries(rlHeaders)) {
      response.headers.set(k, v);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
