import { db } from "../../../database";
import { CrmTaskExtended } from "../types";

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  due_date?: string | null;
  lead_id?: string | null;
  deal_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  due_date?: string | null;
  assigned_to?: string | null;
  lead_id?: string | null;
  deal_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  updated_by?: string | null;
}

export class CrmTaskRepository {
  public async create(dto: CreateTaskDto): Promise<CrmTaskExtended> {
    const res = await db.query<CrmTaskExtended>(
      `INSERT INTO crm_tasks (
        title, description, priority, status, due_date, lead_id,
        deal_id, contact_id, company_id, assigned_to, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;`,
      [
        dto.title,
        dto.description || null,
        dto.priority || "MEDIUM",
        dto.status || "PENDING",
        dto.due_date || null,
        dto.lead_id || null,
        dto.deal_id || null,
        dto.contact_id || null,
        dto.company_id || null,
        dto.assigned_to || null,
        dto.created_by || null,
      ]
    );

    const task = res.rows[0];

    // Log activity
    if (task.lead_id || task.deal_id || task.contact_id || task.company_id) {
      await db.query(
        `INSERT INTO crm_activities (lead_id, deal_id, contact_id, company_id, activity_type, subject, description, performed_by)
         VALUES ($1, $2, $3, $4, 'task_created', 'Task Created', $5, $6);`,
        [
          task.lead_id || null,
          task.deal_id || null,
          task.contact_id || null,
          task.company_id || null,
          `Task created: "${task.title}" (Priority: ${task.priority}).`,
          dto.created_by || null,
        ]
      );
    }

    return task;
  }

  public async findById(id: string, options: { includeDeleted?: boolean } = {}): Promise<CrmTaskExtended | null> {
    const whereDeleted = options.includeDeleted ? "" : "AND deleted_at IS NULL";
    const res = await db.query<CrmTaskExtended>(
      `SELECT * FROM crm_tasks WHERE id = $1 ${whereDeleted} LIMIT 1;`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async list(filter: {
    leadId?: string;
    dealId?: string;
    contactId?: string;
    companyId?: string;
    assignedTo?: string;
    status?: string;
    priority?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ tasks: CrmTaskExtended[]; total: number }> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (!filter.includeDeleted) {
      clauses.push("deleted_at IS NULL");
    }

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

    if (filter.assignedTo) {
      params.push(filter.assignedTo);
      clauses.push(`assigned_to = $${params.length}`);
    }

    if (filter.status) {
      params.push(filter.status);
      clauses.push(`status = $${params.length}`);
    }

    if (filter.priority) {
      params.push(filter.priority);
      clauses.push(`priority = $${params.length}`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM crm_tasks ${whereClause};`,
      params
    );
    const total = Number(countRes.rows[0]?.count || 0);

    const queryParams = [...params, limit, offset];
    const res = await db.query<CrmTaskExtended>(
      `SELECT * FROM crm_tasks
       ${whereClause}
       ORDER BY due_date ASC NULLS LAST, created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
      queryParams
    );

    return { tasks: res.rows, total };
  }

  public async update(id: string, dto: UpdateTaskDto, actorId?: string): Promise<CrmTaskExtended | null> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [id];

    const fields: [keyof UpdateTaskDto, string][] = [
      ["title", "title"],
      ["description", "description"],
      ["priority", "priority"],
      ["status", "status"],
      ["due_date", "due_date"],
      ["assigned_to", "assigned_to"],
      ["lead_id", "lead_id"],
      ["deal_id", "deal_id"],
      ["contact_id", "contact_id"],
      ["company_id", "company_id"],
      ["updated_by", "updated_by"],
    ];

    for (const [prop, col] of fields) {
      if (dto[prop] !== undefined) {
        params.push(dto[prop]);
        updates.push(`${col} = $${params.length}`);
      }
    }

    if (dto.status === "COMPLETED" && existing.status !== "COMPLETED") {
      updates.push("completed_at = NOW()");
    } else if (dto.status && dto.status !== "COMPLETED") {
      updates.push("completed_at = NULL");
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = NOW()");

    const res = await db.query<CrmTaskExtended>(
      `UPDATE crm_tasks SET ${updates.join(", ")} WHERE id = $1 RETURNING *;`,
      params
    );
    const updated = res.rows[0];

    // Log completion activity
    if (dto.status === "COMPLETED" && existing.status !== "COMPLETED") {
      await db.query(
        `INSERT INTO crm_activities (lead_id, deal_id, contact_id, company_id, activity_type, subject, description, performed_by)
         VALUES ($1, $2, $3, $4, 'task_completed', 'Task Completed', $5, $6);`,
        [
          updated.lead_id || null,
          updated.deal_id || null,
          updated.contact_id || null,
          updated.company_id || null,
          `Task "${updated.title}" marked as completed.`,
          actorId || dto.updated_by || null,
        ]
      );
    }

    return updated;
  }

  public async softDelete(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE crm_tasks SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }

  public async restore(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE crm_tasks SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }
}

export const crmTaskRepository = new CrmTaskRepository();
