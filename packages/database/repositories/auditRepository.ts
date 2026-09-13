import { db } from "../index";

export interface AuditLogRecord {
  id: string;
  actor_type: "USER" | "AI_AGENT" | "SYSTEM";
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  changes: unknown;
  created_at: string;
}

export const auditRepository = {
  async log(data: {
    actorType: "USER" | "AI_AGENT" | "SYSTEM";
    actorId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    changes?: unknown;
  }): Promise<AuditLogRecord> {
    const res = await db.query<AuditLogRecord>(
      `INSERT INTO audit_logs (actor_type, actor_id, action, resource_type, resource_id, ip_address, user_agent, changes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [
        data.actorType,
        data.actorId || null,
        data.action,
        data.resourceType,
        data.resourceId || null,
        data.ipAddress || null,
        data.userAgent || null,
        data.changes ? JSON.stringify(data.changes) : null,
      ]
    );
    return res.rows[0];
  },

  async list(limit = 100, offset = 0): Promise<AuditLogRecord[]> {
    const res = await db.query<AuditLogRecord>(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2;",
      [limit, offset]
    );
    return res.rows;
  },
};
