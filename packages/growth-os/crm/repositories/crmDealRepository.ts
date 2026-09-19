import { db } from "../../../database";
import { CrmDeal, CrmPipeline, CrmPipelineStage } from "../types";

export interface CreateDealDto {
  title: string;
  pipeline_id: string;
  stage_id: string;
  lead_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  amount?: number;
  currency?: string;
  expected_close_date?: string | null;
  status?: "open" | "won" | "lost" | "abandoned";
  service_interest?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
}

export interface UpdateDealDto {
  title?: string;
  pipeline_id?: string;
  stage_id?: string;
  lead_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  amount?: number;
  currency?: string;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  status?: "open" | "won" | "lost" | "abandoned";
  service_interest?: string | null;
  assigned_to?: string | null;
  updated_by?: string | null;
}

export class CrmDealRepository {
  public async create(dto: CreateDealDto): Promise<CrmDeal> {
    const res = await db.query<CrmDeal>(
      `INSERT INTO crm_deals (
        title, pipeline_id, stage_id, lead_id, contact_id, company_id,
        amount, currency, expected_close_date, status, service_interest,
        assigned_to, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;`,
      [
        dto.title,
        dto.pipeline_id,
        dto.stage_id,
        dto.lead_id || null,
        dto.contact_id || null,
        dto.company_id || null,
        dto.amount ?? 0.0,
        dto.currency || "USD",
        dto.expected_close_date || null,
        dto.status || "open",
        dto.service_interest || null,
        dto.assigned_to || null,
        dto.created_by || null,
      ]
    );

    const deal = res.rows[0];

    // Log activity if lead_id or company_id present
    if (deal.lead_id || deal.company_id || deal.contact_id) {
      await db.query(
        `INSERT INTO crm_activities (lead_id, deal_id, contact_id, company_id, activity_type, subject, description, performed_by)
         VALUES ($1, $2, $3, $4, 'status_change', 'Deal Created', $5, $6);`,
        [
          deal.lead_id || null,
          deal.id,
          deal.contact_id || null,
          deal.company_id || null,
          `Deal "${deal.title}" created with value ${deal.currency} ${deal.amount}.`,
          dto.created_by || null,
        ]
      );
    }

    return deal;
  }

  public async findById(id: string, options: { includeDeleted?: boolean } = {}): Promise<CrmDeal | null> {
    const whereDeleted = options.includeDeleted ? "" : "AND deleted_at IS NULL";
    const res = await db.query<CrmDeal>(
      `SELECT * FROM crm_deals WHERE id = $1 ${whereDeleted} LIMIT 1;`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async list(filter: {
    pipelineId?: string;
    stageId?: string;
    leadId?: string;
    companyId?: string;
    assignedTo?: string;
    status?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ deals: CrmDeal[]; total: number }> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (!filter.includeDeleted) {
      clauses.push("deleted_at IS NULL");
    }

    if (filter.pipelineId) {
      params.push(filter.pipelineId);
      clauses.push(`pipeline_id = $${params.length}`);
    }

    if (filter.stageId) {
      params.push(filter.stageId);
      clauses.push(`stage_id = $${params.length}`);
    }

    if (filter.leadId) {
      params.push(filter.leadId);
      clauses.push(`lead_id = $${params.length}`);
    }

    if (filter.companyId) {
      params.push(filter.companyId);
      clauses.push(`company_id = $${params.length}`);
    }

    if (filter.status) {
      params.push(filter.status);
      clauses.push(`status = $${params.length}`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM crm_deals ${whereClause};`,
      params
    );
    const total = Number(countRes.rows[0]?.count || 0);

    const queryParams = [...params, limit, offset];
    const res = await db.query<CrmDeal>(
      `SELECT * FROM crm_deals
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
      queryParams
    );

    return { deals: res.rows, total };
  }

  public async update(id: string, dto: UpdateDealDto, actorId?: string): Promise<CrmDeal | null> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [id];

    const fields: [keyof UpdateDealDto, string][] = [
      ["title", "title"],
      ["pipeline_id", "pipeline_id"],
      ["stage_id", "stage_id"],
      ["lead_id", "lead_id"],
      ["contact_id", "contact_id"],
      ["company_id", "company_id"],
      ["amount", "amount"],
      ["currency", "currency"],
      ["expected_close_date", "expected_close_date"],
      ["actual_close_date", "actual_close_date"],
      ["status", "status"],
      ["service_interest", "service_interest"],
      ["assigned_to", "assigned_to"],
      ["updated_by", "updated_by"],
    ];

    for (const [prop, col] of fields) {
      if (dto[prop] !== undefined) {
        params.push(dto[prop]);
        updates.push(`${col} = $${params.length}`);
      }
    }

    if (updates.length === 0) return existing;

    updates.push("updated_at = NOW()");

    const res = await db.query<CrmDeal>(
      `UPDATE crm_deals SET ${updates.join(", ")} WHERE id = $1 RETURNING *;`,
      params
    );
    const updated = res.rows[0];

    // Log stage change activity if stage changed
    if (dto.stage_id && dto.stage_id !== existing.stage_id) {
      await db.query(
        `INSERT INTO crm_activities (deal_id, lead_id, company_id, contact_id, activity_type, subject, description, performed_by)
         VALUES ($1, $2, $3, $4, 'status_change', 'Deal Stage Changed', $5, $6);`,
        [
          updated.id,
          updated.lead_id || null,
          updated.company_id || null,
          updated.contact_id || null,
          `Deal "${updated.title}" stage changed.`,
          actorId || dto.updated_by || null,
        ]
      );
    }

    return updated;
  }

  public async softDelete(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE crm_deals SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }

  public async restore(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE crm_deals SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }

  public async getPipelines(): Promise<(CrmPipeline & { stages: CrmPipelineStage[] })[]> {
    const pipeRes = await db.query<CrmPipeline>(
      `SELECT * FROM crm_pipelines WHERE deleted_at IS NULL ORDER BY is_default DESC, name ASC;`
    );
    const stageRes = await db.query<CrmPipelineStage>(
      `SELECT * FROM crm_pipeline_stages ORDER BY pipeline_id ASC, order_index ASC;`
    );

    return pipeRes.rows.map((pipe) => ({
      ...pipe,
      stages: stageRes.rows.filter((s) => s.pipeline_id === pipe.id),
    }));
  }
}

export const crmDealRepository = new CrmDealRepository();
