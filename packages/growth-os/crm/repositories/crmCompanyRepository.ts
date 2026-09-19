import { db } from "../../../database";
import { CrmCompany } from "../types";

export interface CreateCompanyDto {
  name: string;
  industry?: string | null;
  website?: string | null;
  domain?: string | null;
  size_tier?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  annual_revenue?: number | null;
  employee_count?: number | null;
  assigned_to?: string | null;
  created_by?: string | null;
}

export interface UpdateCompanyDto {
  name?: string;
  industry?: string | null;
  website?: string | null;
  domain?: string | null;
  size_tier?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  annual_revenue?: number | null;
  employee_count?: number | null;
  assigned_to?: string | null;
  updated_by?: string | null;
}

export class CrmCompanyRepository {
  public async create(dto: CreateCompanyDto): Promise<CrmCompany> {
    const res = await db.query<CrmCompany>(
      `INSERT INTO companies (
        name, industry, website, domain, size_tier, address, city, country,
        phone, email, annual_revenue, employee_count, assigned_to, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;`,
      [
        dto.name,
        dto.industry || null,
        dto.website || null,
        dto.domain || null,
        dto.size_tier || null,
        dto.address || null,
        dto.city || null,
        dto.country || null,
        dto.phone || null,
        dto.email || null,
        dto.annual_revenue || null,
        dto.employee_count || null,
        dto.assigned_to || null,
        dto.created_by || null,
      ]
    );
    return res.rows[0];
  }

  public async findById(id: string, options: { includeDeleted?: boolean } = {}): Promise<CrmCompany | null> {
    const whereDeleted = options.includeDeleted ? "" : "AND deleted_at IS NULL";
    const res = await db.query<CrmCompany>(
      `SELECT * FROM companies WHERE id = $1 ${whereDeleted} LIMIT 1;`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async list(filter: {
    industry?: string;
    search?: string;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ companies: CrmCompany[]; total: number }> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (!filter.includeDeleted) {
      clauses.push("deleted_at IS NULL");
    }

    if (filter.industry) {
      params.push(filter.industry);
      clauses.push(`industry = $${params.length}`);
    }

    if (filter.search) {
      params.push(`%${filter.search}%`);
      clauses.push(`(
        name ILIKE $${params.length} OR
        website ILIKE $${params.length} OR
        city ILIKE $${params.length} OR
        country ILIKE $${params.length}
      )`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;

    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::int AS count FROM companies ${whereClause};`,
      params
    );
    const total = Number(countRes.rows[0]?.count || 0);

    const queryParams = [...params, limit, offset];
    const res = await db.query<CrmCompany>(
      `SELECT * FROM companies
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
      queryParams
    );

    return { companies: res.rows, total };
  }

  public async update(id: string, dto: UpdateCompanyDto): Promise<CrmCompany | null> {
    const existing = await this.findById(id, { includeDeleted: true });
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [id];

    const fields: [keyof UpdateCompanyDto, string][] = [
      ["name", "name"],
      ["industry", "industry"],
      ["website", "website"],
      ["domain", "domain"],
      ["size_tier", "size_tier"],
      ["address", "address"],
      ["city", "city"],
      ["country", "country"],
      ["phone", "phone"],
      ["email", "email"],
      ["annual_revenue", "annual_revenue"],
      ["employee_count", "employee_count"],
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

    const res = await db.query<CrmCompany>(
      `UPDATE companies SET ${updates.join(", ")} WHERE id = $1 RETURNING *;`,
      params
    );
    return res.rows[0] || null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE companies SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }

  public async restore(id: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE companies SET deleted_at = NULL, updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id;`,
      [id]
    );
    return (res.rowCount ?? 0) > 0 || res.rows.length > 0;
  }
}

export const crmCompanyRepository = new CrmCompanyRepository();
