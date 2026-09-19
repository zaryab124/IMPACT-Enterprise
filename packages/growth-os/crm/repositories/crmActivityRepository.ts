import { db } from "../../../database";
import { CrmActivity, ActivityType } from "../types";

export interface CreateActivityDto {
  lead_id?: string | null;
  deal_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  activity_type: ActivityType;
  subject: string;
  description?: string | null;
  performed_by?: string | null;
  performed_at?: string | null;
  metadata?: Record<string, any>;
}

export class CrmActivityRepository {
  public async create(dto: CreateActivityDto): Promise<CrmActivity> {
    const res = await db.query<CrmActivity>(
      `INSERT INTO crm_activities (
        lead_id, deal_id, contact_id, company_id, activity_type,
        subject, description, performed_by, performed_at, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()), $10)
      RETURNING *;`,
      [
        dto.lead_id || null,
        dto.deal_id || null,
        dto.contact_id || null,
        dto.company_id || null,
        dto.activity_type,
        dto.subject,
        dto.description || null,
        dto.performed_by || null,
        dto.performed_at || null,
        JSON.stringify(dto.metadata || {}),
      ]
    );

    // If activity was logged on a lead and is a contact action (call, email, meeting), update last_contacted
    if (
      dto.lead_id &&
      ["call", "email", "meeting", "message_sent"].includes(dto.activity_type)
    ) {
      await db.query(
        `UPDATE leads SET last_contacted = NOW(), updated_at = NOW() WHERE id = $1;`,
        [dto.lead_id]
      );
    }

    return res.rows[0];
  }

  public async findById(id: string): Promise<CrmActivity | null> {
    const res = await db.query<CrmActivity>(
      `SELECT * FROM crm_activities WHERE id = $1 LIMIT 1;`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async list(filter: {
    leadId?: string;
    dealId?: string;
    contactId?: string;
    companyId?: string;
    activityType?: ActivityType;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ activities: CrmActivity[]; total: number }> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (filter.leadId) {
      params.push(filter.leadId);
      clauses.push(`lead_id = $${params.length}`);
    }

    if (filter.dealId) {
      params.push(filter.dealId);
      clauses.push(`deal_id = $${params.length}`);
    }

    if (filter.contactId) {
      params.push(filter.contactId);
      clauses.push(`contact_id = $${params.length}`);
    }

    if (filter.companyId) {
      params.push(filter.companyId);
      clauses.push(`company_id = $${params.length}`);
    }

    if (filter.activityType) {
      params.push(filter.activityType);
      clauses.push(`activity_type = $${params.length}`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM crm_activities ${whereClause};`,
      params
    );
    const total = Number(countRes.rows[0]?.count || 0);

    const queryParams = [...params, limit, offset];
    const res = await db.query<CrmActivity>(
      `SELECT * FROM crm_activities
       ${whereClause}
       ORDER BY performed_at DESC, created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
      queryParams
    );

    return { activities: res.rows, total };
  }
}

export const crmActivityRepository = new CrmActivityRepository();
