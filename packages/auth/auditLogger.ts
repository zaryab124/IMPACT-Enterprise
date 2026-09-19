import { db } from "../database";
import { logger } from "../logging/logger";

export interface SecurityAuditEvent {
  actorId?: string;
  actorEmail?: string;
  action: "LOGIN" | "LOGOUT" | "ACCESS_DENIED" | "ROLE_CHANGE" | "STATE_MUTATION";
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logSecurityEvent(event: SecurityAuditEvent): Promise<void> {
  logger.info(`[SecurityAudit] ${event.action} by ${event.actorEmail || event.actorId || "anonymous"} on ${event.resource}`, {
    module: "SecurityAudit",
    ...event,
  });

  try {
    await db.query(
      `INSERT INTO audit_logs (actor_type, actor_id, action, resource_type, resource_id, changes)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        event.actorEmail ? "user" : "system",
        event.actorId || event.actorEmail || null,
        event.action,
        event.resource,
        event.details?.id || "N/A",
        JSON.stringify(event.details || {}),
      ]
    );
  } catch (err: any) {
    logger.warn(`Failed to persist security audit log to DB: ${err.message}`, { module: "SecurityAudit" });
  }
}
