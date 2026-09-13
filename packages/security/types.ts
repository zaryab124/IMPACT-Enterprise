export type RateLimitTier = "auth" | "ai" | "api" | "admin" | "default";

export interface RateLimitPolicy {
  windowSeconds: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
  retryAfterSec: number;
}

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
}

export interface CsrfValidationResult {
  valid: boolean;
  reason?: string;
}
