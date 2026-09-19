import { growthOsRepository } from "../repositories/growthOsRepository";
import { GROWTH_OS_MODULES, IMPACT_ENTERPRISE, CORE_SERVICES } from "../constants";
import { db } from "../../database";
import { logger } from "../../logging/logger";

export class GrowthOsService {
  /**
   * Return enriched module catalog with user permission checks.
   */
  public async getModuleCatalog(userPermissions: string[] = []) {
    const dbModules = await growthOsRepository.getModules();
    const isSuperAdmin = userPermissions.includes("system:manage") || userPermissions.includes("all");

    // Merge static module definitions with live database states
    return GROWTH_OS_MODULES.map((staticDef) => {
      const dbRecord = dbModules.find((m) => m.code === staticDef.code);
      const isPermitted = isSuperAdmin || userPermissions.includes(staticDef.minPermission);

      return {
        number: staticDef.number,
        id: staticDef.id,
        code: staticDef.code,
        name: staticDef.name,
        suite: staticDef.suite,
        description: staticDef.description,
        icon: staticDef.icon,
        phasePlanned: staticDef.phasePlanned,
        isActive: dbRecord ? dbRecord.is_active : true,
        isPermitted,
        minPermission: staticDef.minPermission,
        status: staticDef.phasePlanned === 0
          ? "ACTIVE"
          : staticDef.phasePlanned === 1
          ? "NEXT_PHASE"
          : "SCHEDULED",
      };
    });
  }

  /**
   * Health telemetry for Growth OS engine.
   */
  public async getHealth() {
    const start = Date.now();
    let dbStatus = "healthy";
    let dbLatencyMs = 0;

    try {
      await db.query("SELECT 1;");
      dbLatencyMs = Date.now() - start;
    } catch (err: any) {
      dbStatus = "unhealthy";
      logger.error("Growth OS DB health check failed", err, { module: "GrowthOsService" });
    }

    const summary = await growthOsRepository.getFoundationSummary();

    return {
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      latencyMs: dbLatencyMs,
      brand: {
        company: IMPACT_ENTERPRISE.name,
        positioning: IMPACT_ENTERPRISE.brandPositioning,
        authorizedServicesCount: CORE_SERVICES.length,
      },
      telemetry: {
        totalModules: GROWTH_OS_MODULES.length,
        registeredInDb: summary.modulesCount,
        openTasks: summary.openTasksCount,
        urgentTasks: summary.urgentTasksCount,
        campaigns: summary.campaignsCount,
      },
    };
  }

  /**
   * High level foundation summary.
   */
  public async getPlatformSummary() {
    return growthOsRepository.getFoundationSummary();
  }
}

export const growthOsService = new GrowthOsService();
