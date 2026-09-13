import fs from "fs";
import path from "path";
import { db } from "./index";
import { logger } from "../logging/logger";
import { BUNDLED_MIGRATIONS } from "./bundledMigrations";

interface MigrationRecord {
  id: number;
  name: string;
  applied_at: string;
}

export class Migrator {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.join(process.cwd(), "packages", "database", "migrations");
  }

  private async ensureMigrationsTable(): Promise<void> {
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async getAppliedMigrations(): Promise<string[]> {
    await this.ensureMigrationsTable();
    const result = await db.query<MigrationRecord>(
      "SELECT name FROM schema_migrations ORDER BY id ASC;"
    );
    return result.rows.map((row) => row.name);
  }

  public async migrateUp(): Promise<string[]> {
    await this.ensureMigrationsTable();
    const applied = await this.getAppliedMigrations();

    let migrationEntries: { name: string; sql: string }[] = [];

    if (fs.existsSync(this.migrationsDir)) {
      try {
        const allFiles = fs.readdirSync(this.migrationsDir);
        const upFiles = allFiles
          .filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql"))
          .sort();

        for (const file of upFiles) {
          const migrationName = path.basename(file, ".sql");
          const sqlContent = fs.readFileSync(path.join(this.migrationsDir, file), "utf8");
          migrationEntries.push({ name: migrationName, sql: sqlContent });
        }
      } catch (err: any) {
        logger.warn(`Could not read migrations from disk: ${err.message}. Using bundled migrations fallback.`, { module: "Migrator" });
      }
    }

    if (migrationEntries.length === 0) {
      // Bundled fallback for Serverless / Vercel cloud execution
      migrationEntries = Object.keys(BUNDLED_MIGRATIONS).sort().map((name) => ({
        name,
        sql: BUNDLED_MIGRATIONS[name],
      }));
    }

    const newlyApplied: string[] = [];

    for (const entry of migrationEntries) {
      const migrationName = entry.name;
      if (applied.includes(migrationName)) {
        continue;
      }

      logger.info(`Applying migration: ${migrationName}...`, { module: "Migrator" });
      const sqlContent = entry.sql;

      try {
        await db.exec(sqlContent);
        await db.query("INSERT INTO schema_migrations (name) VALUES ($1);", [migrationName]);

        newlyApplied.push(migrationName);
        logger.info(`Successfully applied migration: ${migrationName}`, { module: "Migrator" });
      } catch (err: any) {
        await db.query("ROLLBACK;");
        logger.error(`Failed to apply migration ${migrationName}: ${err.message}`, err, {
          module: "Migrator",
        });
        throw err;
      }
    }

    return newlyApplied;
  }

  public async migrateDown(): Promise<string | null> {
    await this.ensureMigrationsTable();
    const applied = await this.getAppliedMigrations();

    if (applied.length === 0) {
      logger.info("No migrations to revert.", { module: "Migrator" });
      return null;
    }

    const lastMigration = applied[applied.length - 1];
    const downFileName = `${lastMigration}.down.sql`;
    const downFilePath = path.join(this.migrationsDir, downFileName);

    if (!fs.existsSync(downFilePath)) {
      throw new Error(`Rollback file not found: ${downFileName}`);
    }

    logger.info(`Reverting migration: ${lastMigration}...`, { module: "Migrator" });
    const sqlContent = fs.readFileSync(downFilePath, "utf8");

    try {
      await db.exec(sqlContent);
      await db.query("DELETE FROM schema_migrations WHERE name = $1;", [lastMigration]);


      logger.info(`Successfully reverted migration: ${lastMigration}`, { module: "Migrator" });
      return lastMigration;
    } catch (err: any) {
      await db.query("ROLLBACK;");
      logger.error(`Failed to rollback migration ${lastMigration}: ${err.message}`, err, {
        module: "Migrator",
      });
      throw err;
    }
  }
}

export const migrator = new Migrator();

// CLI Entrypoint
if (require.main === module) {
  const action = process.argv[2] || "up";
  (async () => {
    try {
      if (action === "up") {
        const applied = await migrator.migrateUp();
        console.log(`Migrations up complete. Newly applied: ${applied.length}`);
      } else if (action === "down") {
        const reverted = await migrator.migrateDown();
        console.log(`Migration down complete. Reverted: ${reverted || "none"}`);
      } else if (action === "status") {
        const applied = await migrator.getAppliedMigrations();
        console.log(`Applied migrations (${applied.length}):`, applied);
      } else {
        console.error(`Unknown action: ${action}. Use 'up', 'down', or 'status'.`);
        process.exit(1);
      }
      await db.close();
      process.exit(0);
    } catch (err) {
      console.error("Migration command error:", err);
      process.exit(1);
    }
  })();
}
