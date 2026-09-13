import { CorsConfig } from "./types";

export const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [
    "https://impact-enterprise.vercel.app",
    "http://localhost:3000",
    "http://localhost:3005",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3005",
  ],
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cookie",
  ],
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "Retry-After",
    "Content-Disposition",
  ],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

export class CorsHandler {
  private config: CorsConfig;

  constructor(config: CorsConfig = DEFAULT_CORS_CONFIG) {
    this.config = config;
  }

  /**
   * Checks if an origin is permitted by whitelist or is same-origin.
   */
  public isOriginAllowed(origin: string | null, host?: string | null): boolean {
    if (!origin) return true; // Non-browser / same-origin requests

    if (this.config.allowedOrigins.includes(origin)) {
      return true;
    }

    // Same-origin check
    if (host && origin.endsWith(host)) {
      return true;
    }

    return false;
  }

  /**
   * Handles preflight OPTIONS requests. Returns Response if OPTIONS, null otherwise.
   */
  public handlePreflight(req: Request): Response | null {
    if (req.method !== "OPTIONS") return null;

    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (!this.isOriginAllowed(origin, host)) {
      return new Response(
        JSON.stringify({ error: { code: "CORS_FORBIDDEN", message: "Origin not allowed by CORS policy" } }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const headers = new Headers();
    if (origin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
    }
    headers.set("Access-Control-Allow-Methods", this.config.allowedMethods.join(", "));
    headers.set("Access-Control-Allow-Headers", this.config.allowedHeaders.join(", "));
    headers.set("Access-Control-Expose-Headers", this.config.exposedHeaders.join(", "));
    if (this.config.allowCredentials) {
      headers.set("Access-Control-Allow-Credentials", "true");
    }
    headers.set("Access-Control-Max-Age", String(this.config.maxAge));

    return new Response(null, {
      status: 204,
      headers,
    });
  }

  /**
   * Injects CORS headers into outgoing response headers.
   */
  public applyCorsHeaders(headers: Headers, req: Request): void {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (origin && this.isOriginAllowed(origin, host)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
      headers.set("Access-Control-Expose-Headers", this.config.exposedHeaders.join(", "));
      if (this.config.allowCredentials) {
        headers.set("Access-Control-Allow-Credentials", "true");
      }
    }
  }
}

export const corsHandler = new CorsHandler();
