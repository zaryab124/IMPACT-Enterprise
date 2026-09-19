import { db } from "../../../database";
import { CrmContact } from "../types";

export interface CreateContactDto {
  company_id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  job_title?: string | null;
  country?: string | null;
  city?: string | null;
  is_primary?: boolean;
  assigned_to?: string | null;
  notes?: string | null;
  created_by?: string | null;
}

export interface UpdateContactDto {
  company_id?: string | null;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string | null;
  whatsapp?: string | null;
  job_title?: string | null;
  country?: string | null;
  city?: string | null;
  is_primary?: boolean;
  assigned_to?: string | null;
  notes?: string | null;
  updated_by?: string | null;
}

export class CrmContactRepository {
  public async create(dto: CreateContactDto): Promise<CrmContact> {
    const res = await db.query<CrmContact>(
      `INSERT INTO crm_contacts (
        company_id, first_name, last_name, email, phone, whatsapp,
        job_title, country, city, is_primary, assigned_to, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;`,
      [
        dto.company_id || null,
        dto.first_name,
        dto.last_name,
        dto.email,
        dto.phone || null,
        dto.whatsapp || null,
        dto.job_title || null,
        dto.country || null,
        dto.city || null,
        dto.is_primary ?? false,
        dto.assigned_to || null,
        dto.notes || null,
        dto.created_by || null,
      ]
    );
    return res.rows[0];
  }

  public async findById(id: string, options: { includeDeleted?: boolean } = {}): Promise<CrmContact | null> {
    const whereDeleted = options.includeDeleted ? "" : "AND deleted_at IS NULL";
    const res = await db.query<CrmContact>(
      `SELECT * FROM crm_contacts WHERE id = $1 ${whereDeleted} LIMIT 1;`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async list(filter: {
    companyId?: string;
    search?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ contacts: CrmContact[]; total: number }> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (!filter.includeDeleted) {
      clauses.push("deleted_at IS NULL");
    }

    if (filter.companyId) {
      params.push(filter.companyId);
      clauses.push(`company_id = $${params.length}`);
    }

    if (filter.search) {
      params.push(`%${filter.search}%`);
      clauses.push(`(
        first_name ILIKE $${params.length} OR
        last_name ILIKE $${params.length} OR
        email ILIKE $${params.length} OR
        phone ILIKE $${params.length} OR
        job_title ILIKE $${params.length}
      )`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM crm_contacts ${whereClause};`,
      params
    );
    const total = Number(countRes.rows[0]?.count || 0);

    const queryParams = [...params, limit, offset];
    const res = await db.query<CrmContact>(
      `SELECT * FROM crm_contacts
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
      queryParams
    );

    return { contacts: res.rows, total };
  }

  public async update(id: string, dto: UpdateContactDto): Promise<CrmContact | null> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [id];

    const fields: [keyof UpdateContactDto, string][] = [
      ["company_id", "company_id"],
      ["first_name", "first_name"],
      ["last_name", "last_name"],
      ["email", "email"],
      ["phone", "phone"],
      ["whatsapp", "whatsapp"],
      ["job_title", "job_title"],
      ["country", "country"],
      ["city", "city"],
      ["is_primary", "is_primary"],
      ["assigned_to", "assigned_to"],
      ["notes", "notes"],
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

    const res = await db.query<CrmContact>(
      `UPDATE crm_contacts SET ${updates.join(", ")} WHERE id = $1 RETURNING *;`,
      params
    );
    return res.rows[0] || null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE crm_contacts SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }

  public async restore(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE crm_contacts SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }
}

export const crmContactRepository = new CrmContactRepository();
