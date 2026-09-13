/**
 * Standard API response contracts and shared domain primitives.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  database: "connected" | "disconnected" | "error";
  engine: "postgresql" | "pglite";
  timestamp: string;
  environment: string;
  version: string;
  uptimeSeconds: number;
}
