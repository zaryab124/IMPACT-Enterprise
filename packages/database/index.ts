import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import path from "path";
import fs from "fs";
import { logger } from "../logging/logger";

export type DbEngine = "postgresql" | "pglite";

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

class DatabaseManager {
  private pgPool: Pool | null = null;
  private pgliteInstance: PGlite | null = null;
  private activeEngine: DbEngine = "pglite";
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private async initialize(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl && databaseUrl.startsWith("postgres")) {
      try {
        logger.info("Attempting connection to PostgreSQL server...", { module: "Database" });
        const pool = new Pool({
          connectionString: databaseUrl,
          connectionTimeoutMillis: 3000,
          idleTimeoutMillis: 10000,
          max: 10,
        });

        // Test connection
        const client = await pool.connect();
        client.release();

        this.pgPool = pool;
        this.activeEngine = "postgresql";
        this.initialized = true;
        logger.info("Successfully connected to external PostgreSQL database pool", { module: "Database" });
        return;
      } catch (err: any) {
        logger.warn(
          `PostgreSQL server connection failed (${err.message}). Falling back to embedded PostgreSQL (PGlite).`,
          { module: "Database" }
        );
      }
    }

    // Fallback: Use official embedded PostgreSQL (PGlite)
    try {
      const dataDir = path.join(process.cwd(), ".data", "postgres");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // If a stale postmaster.pid exists from an ungracefully terminated process, clean it up
      const pidFile = path.join(dataDir, "postmaster.pid");
      if (fs.existsSync(pidFile)) {
        try {
          fs.unlinkSync(pidFile);
          logger.info("Removed stale postmaster.pid lock file", { module: "Database" });
        } catch {
          // Ignore if locked
        }
      }

      this.pgliteInstance = new PGlite(dataDir);
      await this.pgliteInstance.waitReady;
      this.activeEngine = "pglite";
      this.initialized = true;
      logger.info(`Initialized embedded PostgreSQL (PGlite) at ${dataDir}`, { module: "Database" });
    } catch (err: any) {
      logger.warn(`Persistent PGlite fallback triggered: ${err.message}`, { module: "Database" });
      try {
        this.pgliteInstance = new PGlite();
        await this.pgliteInstance.waitReady;
        this.activeEngine = "pglite";
        this.initialized = true;
        logger.info("Initialized in-memory embedded PostgreSQL (PGlite)", { module: "Database" });
        const { seedDevelopmentDatabase } = await import("./seed");
        await seedDevelopmentDatabase();
      } catch (innerErr: any) {
        logger.error(`Failed to initialize embedded PostgreSQL: ${innerErr.message}`, innerErr, { module: "Database" });
        throw innerErr;
      }
    }
  }

  public async getEngine(): Promise<DbEngine> {
    if (!this.initialized) {
      if (!this.initPromise) {
        this.initPromise = this.initialize();
      }
      await this.initPromise;
    }
    return this.activeEngine;
  }

  public async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.initialized) {
      if (!this.initPromise) {
        this.initPromise = this.initialize();
      }
      await this.initPromise;
    }

    if (this.activeEngine === "postgresql" && this.pgPool) {
      const result = await this.pgPool.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount ?? result.rows.length,
      };
    }

    if (this.pgliteInstance) {
      const result = await this.pgliteInstance.query<T>(text, params);
      const affected = (result as any).affectedRows ?? (result as any).rowCount;
      return {
        rows: result.rows,
        rowCount: typeof affected === "number" ? affected : result.rows.length,
      };
    }

    throw new Error("Database is not initialized.");
  }

  public async exec(sql: string): Promise<void> {
    if (!this.initialized) {
      if (!this.initPromise) {
        this.initPromise = this.initialize();
      }
      await this.initPromise;
    }

    if (this.activeEngine === "postgresql" && this.pgPool) {
      await this.pgPool.query(sql);
      return;
    }

    if (this.pgliteInstance) {
      await this.pgliteInstance.exec(sql);
      return;
    }

    throw new Error("Database is not initialized.");
  }

  public async close(): Promise<void> {
    if (this.pgPool) {
      await this.pgPool.end();
      this.pgPool = null;
    }
    if (this.pgliteInstance) {
      await this.pgliteInstance.close();
      this.pgliteInstance = null;
    }
    this.initialized = false;
    this.initPromise = null;
  }
}

export const db = new DatabaseManager();
