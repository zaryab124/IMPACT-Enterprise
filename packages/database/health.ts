import { db, DbEngine } from "./index";
import { logger } from "../logging/logger";

export interface DbHealthResult {
  connected: boolean;
  engine: DbEngine;
  serverTime?: string;
  latencyMs?: number;
  error?: string;
}

export async function checkDatabaseHealth(): Promise<DbHealthResult> {
  const startTime = Date.now();
  try {
    const engine = await db.getEngine();
    const result = await db.query<{ connected: number; current_time: string }>(
      "SELECT 1 AS connected, NOW() AS current_time;"
    );

    const latencyMs = Date.now() - startTime;
    if (result.rows.length > 0 && result.rows[0].connected === 1) {
      return {
        connected: true,
        engine,
        serverTime: result.rows[0].current_time,
        latencyMs,
      };
    }

    return {
      connected: false,
      engine,
      latencyMs,
      error: "Query returned unexpected result",
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    logger.error(`Database health check failed: ${err.message}`, err, { module: "Database" });
    return {
      connected: false,
      engine: "pglite",
      latencyMs,
      error: err.message,
    };
  }
}
