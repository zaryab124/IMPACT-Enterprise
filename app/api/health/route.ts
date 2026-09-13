import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/packages/database/health";
import { env } from "@/packages/config/env";
import { logger } from "@/packages/logging/logger";

const serverStartTime = Date.now();

export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

  const memory = process.memoryUsage();
  const memoryMb = {
    rss: Math.round((memory.rss / (1024 * 1024)) * 10) / 10,
    heapUsed: Math.round((memory.heapUsed / (1024 * 1024)) * 10) / 10,
    heapTotal: Math.round((memory.heapTotal / (1024 * 1024)) * 10) / 10,
  };

  const payload = {
    status: dbHealth.connected ? "ok" : "degraded",
    database: {
      status: dbHealth.connected ? "connected" : "disconnected",
      engine: dbHealth.engine,
      latencyMs: dbHealth.latencyMs,
      ...(dbHealth.error ? { error: dbHealth.error } : {}),
    },
    system: {
      uptimeSeconds,
      memoryMb,
      nodeVersion: process.version,
    },
    security: {
      rateLimiter: "active",
      slidingWindowSec: 60,
      cors: "active",
      csrf: "active",
      csp: "enforced",
      hsts: "enforced",
    },
    environment: env.NODE_ENV,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };

  logger.info(`Health telemetry: status=${payload.status}, db=${payload.database.status}, heapUsed=${memoryMb.heapUsed}MB`, {
    module: "HealthAPI",
    data: { latencyMs: dbHealth.latencyMs, heapUsedMb: memoryMb.heapUsed },
  });

  const statusCode = dbHealth.connected ? 200 : 503;
  return NextResponse.json(payload, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
