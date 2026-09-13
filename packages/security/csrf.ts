import { CsrfValidationResult } from "./types";
import { corsHandler } from "./cors";

export class CsrfValidator {
  private exemptPrefixes: string[] = [
    "/api/webhooks/",
    "/api/health",
  ];

  /**
   * Evaluates if an incoming mutation request complies with CSRF defense rules.
   */
  public validate(req: Request): CsrfValidationResult {
    const method = req.method.toUpperCase();

    // 1. Safe HTTP methods require no CSRF validation
    if (["GET", "HEAD", "OPTIONS"].includes(method)) {
      return { valid: true };
    }

    const url = new URL(req.url);

    // 2. Exempt webhook endpoints (signed via webhook HMAC signatures)
    if (this.exemptPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
      return { valid: true };
    }

    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    const referer = req.headers.get("referer");
    const secFetchSite = req.headers.get("sec-fetch-site");

    // 3. Reject explicit cross-site fetch requests that are not on the CORS whitelist
    if (secFetchSite === "cross-site") {
      if (!corsHandler.isOriginAllowed(origin, host)) {
        return {
          valid: false,
          reason: `Cross-site mutation request rejected from origin: ${origin || "unknown"}`,
        };
      }
    }

    // 4. Origin header validation
    if (origin) {
      if (!corsHandler.isOriginAllowed(origin, host)) {
        return {
          valid: false,
          reason: `Origin header mismatch: ${origin} not permitted for host ${host}`,
        };
      }
      return { valid: true };
    }

    // 5. Referer fallback if origin header is omitted by user-agent
    if (referer) {
      try {
        const refUrl = new URL(referer);
        if (!corsHandler.isOriginAllowed(refUrl.origin, host)) {
          return {
            valid: false,
            reason: `Referer header mismatch: ${refUrl.origin} not permitted for host ${host}`,
          };
        }
      } catch {
        return { valid: false, reason: "Malformed Referer header" };
      }
      return { valid: true };
    }

    // Non-browser or direct CLI / server-to-server requests without Origin/Referer are permitted
    return { valid: true };
  }
}

export const csrfValidator = new CsrfValidator();
