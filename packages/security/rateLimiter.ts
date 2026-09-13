import { RateLimitTier, RateLimitPolicy, RateLimitResult } from "./types";

export const RATE_LIMIT_POLICIES: Record<RateLimitTier, RateLimitPolicy> = {
  auth: { windowSeconds: 60, maxRequests: 15 }, // 15 requests per min
  ai: { windowSeconds: 60, maxRequests: 120 }, // 120 requests per min (chat turns & voice sessions)
  api: { windowSeconds: 60, maxRequests: 120 }, // 120 requests per min (standard endpoints)
  admin: { windowSeconds: 60, maxRequests: 240 }, // 240 requests per min (admin operators)
  default: { windowSeconds: 60, maxRequests: 120 },
};

interface MemoryRecord {
  timestamps: number[];
}

export class RateLimiter {
  private store: Map<string, MemoryRecord> = new Map();
  private lastCleanup: number = Date.now();

  /**
   * Periodically remove expired keys to prevent memory leaks in the Node process.
   */
  private cleanup(maxWindowSec: number = 60): void {
    const now = Date.now();
    // Run cleanup at most once every 30 seconds
    if (now - this.lastCleanup < 30000) return;

    this.lastCleanup = now;
    const cutoff = now - maxWindowSec * 1000;

    this.store.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((t: number) => t > cutoff);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    });
  }

  /**
   * Evaluates if a request from key is allowed under the specified tier policy using a sliding window.
   */
  public async checkRateLimit(
    key: string,
    tier: RateLimitTier = "default"
  ): Promise<RateLimitResult> {
    const policy = RATE_LIMIT_POLICIES[tier] || RATE_LIMIT_POLICIES.default;
    const now = Date.now();
    const windowMs = policy.windowSeconds * 1000;
    const cutoff = now - windowMs;

    this.cleanup(policy.windowSeconds);

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((t) => t > cutoff);

    const currentCount = record.timestamps.length;
    const allowed = currentCount < policy.maxRequests;

    if (allowed) {
      record.timestamps.push(now);
    }

    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + windowMs) / 1000);
    const retryAfterSec = Math.max(1, resetTime - Math.floor(now / 1000));
    const remaining = Math.max(0, policy.maxRequests - record.timestamps.length);

    return {
      allowed,
      limit: policy.maxRequests,
      remaining,
      resetTime,
      retryAfterSec: allowed ? 0 : retryAfterSec,
    };
  }

  /**
   * Reset store (useful in automated testing).
   */
  public reset(): void {
    this.store.clear();
  }

  /**
   * Generates standard RFC rate limit headers for a response.
   */
  public getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(result.remaining),
      "X-RateLimit-Reset": String(result.resetTime),
    };

    if (!result.allowed) {
      headers["Retry-After"] = String(result.retryAfterSec);
    }

    return headers;
  }

  /**
   * Creates a standard HTTP 429 Too Many Requests response.
   */
  public buildRateLimitResponse(result: RateLimitResult): Response {
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      ...this.getRateLimitHeaders(result),
    };

    const body = {
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: `Too many requests. Limit is ${result.limit} requests per minute. Please retry after ${result.retryAfterSec} seconds.`,
        retryAfter: result.retryAfterSec,
        resetTime: result.resetTime,
      },
    };

    return new Response(JSON.stringify(body, null, 2), {
      status: 429,
      headers,
    });
  }
}

export const rateLimiter = new RateLimiter();
