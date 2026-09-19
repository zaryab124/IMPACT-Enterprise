import { db } from "../../../database";
import { CrmLead, LeadStatus, CrmActivity, CrmNote, CrmTaskExtended } from "../types";

export interface CreateLeadDto {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  company?: string | null;
  company_id?: string | null;
  contact_id?: string | null;
  job_title?: string | null;
  country?: string | null;
  city?: string | null;
  website?: string | null;
  source?: string | null;
  campaign?: string | null;
  service_interest?: string | null;
  lead_status?: LeadStatus;
  lead_score?: number;
  assigned_salesperson?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface UpdateLeadDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string | null;
  whatsapp?: string | null;
  company?: string | null;
  company_id?: string | null;
  contact_id?: string | null;
  job_title?: string | null;
  country?: string | null;
  city?: string | null;
  website?: string | null;
  source?: string | null;
  campaign?: string | null;
  service_interest?: string | null;
  lead_status?: LeadStatus;
  lead_score?: number;
  assigned_salesperson?: string | null;
  last_contacted?: string | null;
  next_follow_up?: string | null;
  notes?: string | null;
  updated_by?: string | null;
}

export class CrmLeadRepository {
  public async create(dto: CreateLeadDto): Promise<CrmLead> {
    const status: LeadStatus = dto.lead_status || "NEW";
    const score = dto.lead_score ?? 0;

    const res = await db.query<CrmLead>(
      `INSERT INTO leads (
        first_name, last_name, email, phone, whatsapp, company, company_id,
        contact_id, job_title, country, city, website, source, campaign,
        service_interest, lead_status, stage, lead_score, score,
        assigned_salesperson, assigned_to, notes, created_by
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $16, $17, $17,
        $18, $18, $19, $20
      )
      RETURNING *;`,
      [
        dto.first_name,
        dto.last_name,
        dto.email,
        dto.phone || null,
        dto.whatsapp || null,
        dto.company || null,
        dto.company_id || null,
        dto.contact_id || null,
        dto.job_title || null,
        dto.country || null,
        dto.city || null,
        dto.website || null,
        dto.source || "website",
        dto.campaign || null,
        dto.service_interest || null,
        status,
        score,
        dto.assigned_salesperson || null,
        dto.notes || null,
        dto.created_by || null,
      ]
    );

    const lead = res.rows[0];

    // Automatically record an initial Activity turn to guarantee full history
    await db.query(
      `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
       VALUES ($1, 'status_change', 'Lead Created', $2, $3);`,
      [
        lead.id,
        `Lead created with status ${status} via ${dto.source || "direct input"}.`,
        dto.created_by || null,
      ]
    );

    return lead;
  }

  public async findById(id: string, options: { includeDeleted?: boolean } = {}): Promise<CrmLead | null> {
    const whereDeleted = options.includeDeleted ? "" : "AND deleted_at IS NULL";
    const res = await db.query<CrmLead>(
      `SELECT * FROM leads WHERE id = $1 ${whereDeleted} LIMIT 1;`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async findWithHistory(id: string): Promise<{
    lead: CrmLead | null;
    activities: CrmActivity[];
    notes: CrmNote[];
    tasks: CrmTaskExtended[];
    tags: string[];
    messages: any[];
    calls: any[];
    deals: any[];
    attachments: any[];
  }> {
    const lead = await this.findById(id, { includeDeleted: true });
    if (!lead) {
      return {
        lead: null,
        activities: [],
        notes: [],
        tasks: [],
        tags: [],
        messages: [],
        calls: [],
        deals: [],
        attachments: [],
      };
    }

    const [activitiesRes, notesRes, tasksRes, tagsRes, messagesRes, callsRes, dealsRes, attachmentsRes] =
      await Promise.all([
        db.query<CrmActivity>(
          `SELECT a.*, u.first_name, u.last_name FROM crm_activities a
           LEFT JOIN users u ON a.performed_by = u.id
           WHERE a.lead_id = $1 ORDER BY a.performed_at DESC, a.created_at DESC;`,
          [id]
        ),
        db.query<CrmNote>(
          `SELECT n.*, u.first_name, u.last_name FROM crm_notes n
           LEFT JOIN users u ON n.created_by = u.id
           WHERE n.lead_id = $1 AND n.deleted_at IS NULL ORDER BY n.created_at DESC;`,
          [id]
        ),
        db.query<CrmTaskExtended>(
          `SELECT * FROM crm_tasks WHERE lead_id = $1 AND deleted_at IS NULL ORDER BY due_date ASC NULLS LAST;`,
          [id]
        ),
        db.query<{ name: string }>(
          `SELECT t.name FROM crm_tags t
           INNER JOIN crm_entity_tags et ON t.id = et.tag_id
           WHERE et.entity_type = 'lead' AND et.entity_id = $1;`,
          [id]
        ),
        db.query(
          `SELECT * FROM crm_messages WHERE lead_id = $1 ORDER BY created_at DESC;`,
          [id]
        ),
        db.query(
          `SELECT * FROM crm_calls WHERE lead_id = $1 ORDER BY started_at DESC;`,
          [id]
        ),
        db.query(
          `SELECT * FROM crm_deals WHERE lead_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC;`,
          [id]
        ),
        db.query(
          `SELECT * FROM crm_attachments WHERE entity_type = 'lead' AND entity_id = $1 AND deleted_at IS NULL;`,
          [id]
        ),
      ]);

    return {
      lead,
      activities: activitiesRes.rows,
      notes: notesRes.rows,
      tasks: tasksRes.rows,
      tags: tagsRes.rows.map((r) => r.name),
      messages: messagesRes.rows,
      calls: callsRes.rows,
      deals: dealsRes.rows,
      attachments: attachmentsRes.rows,
    };
  }

  public async list(filter: {
    status?: LeadStatus;
    search?: string;
    assignedSalesperson?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ leads: CrmLead[]; total: number }> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (!filter.includeDeleted) {
      clauses.push("deleted_at IS NULL");
    }

    if (filter.status) {
      params.push(filter.status);
      clauses.push(`lead_status = $${params.length}`);
    }

    if (filter.assignedSalesperson) {
      params.push(filter.assignedSalesperson);
      clauses.push(`assigned_salesperson = $${params.length}`);
    }

    if (filter.search) {
      params.push(`%${filter.search}%`);
      clauses.push(`(
        first_name ILIKE $${params.length} OR
        last_name ILIKE $${params.length} OR
        email ILIKE $${params.length} OR
        company ILIKE $${params.length} OR
        service_interest ILIKE $${params.length}
      )`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM leads ${whereClause};`,
      params
    );
    const total = Number(countRes.rows[0]?.count || 0);

    const queryParams = [...params, limit, offset];
    const res = await db.query<CrmLead>(
      `SELECT * FROM leads
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
      queryParams
    );

    return { leads: res.rows, total };
  }

  public async update(id: string, dto: UpdateLeadDto, actorId?: string): Promise<CrmLead | null> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [id];

    const fields: [keyof UpdateLeadDto, string][] = [
      ["first_name", "first_name"],
      ["last_name", "last_name"],
      ["email", "email"],
      ["phone", "phone"],
      ["whatsapp", "whatsapp"],
      ["company", "company"],
      ["company_id", "company_id"],
      ["contact_id", "contact_id"],
      ["job_title", "job_title"],
      ["country", "country"],
      ["city", "city"],
      ["website", "website"],
      ["source", "source"],
      ["campaign", "campaign"],
      ["service_interest", "service_interest"],
      ["lead_status", "lead_status"],
      ["lead_score", "lead_score"],
      ["assigned_salesperson", "assigned_salesperson"],
      ["last_contacted", "last_contacted"],
      ["next_follow_up", "next_follow_up"],
      ["notes", "notes"],
      ["updated_by", "updated_by"],
    ];

    for (const [prop, col] of fields) {
      if (dto[prop] !== undefined) {
        params.push(dto[prop]);
        updates.push(`${col} = $${params.length}`);

        // Sync legacy stage and score columns
        if (col === "lead_status") {
          updates.push(`stage = $${params.length}`);
        }
        if (col === "lead_score") {
          updates.push(`score = $${params.length}`);
        }
        if (col === "assigned_salesperson") {
          updates.push(`assigned_to = $${params.length}`);
        }
      }
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = NOW()");

    const res = await db.query<CrmLead>(
      `UPDATE leads SET ${updates.join(", ")} WHERE id = $1 RETURNING *;`,
      params
    );
    const updated = res.rows[0];

    // Check if status changed, log activity for complete history
    if (dto.lead_status && dto.lead_status !== existing.lead_status) {
      await db.query(
        `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
         VALUES ($1, 'status_change', 'Status Changed', $2, $3);`,
        [
          id,
          `Status changed from ${existing.lead_status} to ${dto.lead_status}.`,
          actorId || dto.updated_by || null,
        ]
      );
    }

    return updated;
  }

  public async softDelete(id: string, actorId?: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE leads SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;`,
      [id]
    );

    if ((res.rowCount ?? 0) > 0 || res.rows.length > 0) {
      await db.query(
        `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
         VALUES ($1, 'status_change', 'Lead Archived', 'Lead soft-deleted / archived.', $2);`,
        [id, actorId || null]
      );
      return true;
    }
    return false;
  }

  public async restore(id: string, actorId?: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE leads SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id;`,
      [id]
    );

    if ((res.rowCount ?? 0) > 0 || res.rows.length > 0) {
      await db.query(
        `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
         VALUES ($1, 'status_change', 'Lead Restored', 'Lead restored from archive.', $2);`,
        [id, actorId || null]
      );
      return true;
    }
    return false;
  }
}

export const crmLeadRepository = new CrmLeadRepository();
