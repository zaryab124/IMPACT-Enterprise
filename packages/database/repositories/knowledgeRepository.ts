import { db } from "../index";

export interface ServiceRecord {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  capabilities: string[];
  typical_timeline: string | null;
  target_audience: string | null;
  is_active: boolean;
}

export interface CaseStudyRecord {
  id: string;
  title: string;
  category: string;
  headline: string;
  problem_statement: string;
  solution_delivered: string;
  technologies: string[];
  capabilities: string[];
  outcome_summary: string;
  is_published: boolean;
}

export const knowledgeRepository = {
  async listServices(): Promise<ServiceRecord[]> {
    const res = await db.query<any>(
      "SELECT * FROM services WHERE is_active = TRUE ORDER BY id ASC;"
    );
    return res.rows.map((row) => ({
      ...row,
      capabilities: typeof row.capabilities === "string" ? JSON.parse(row.capabilities) : row.capabilities,
    }));
  },

  async findServiceById(id: string): Promise<ServiceRecord | null> {
    const res = await db.query<any>(
      "SELECT * FROM services WHERE id = $1 AND is_active = TRUE;",
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      capabilities: typeof row.capabilities === "string" ? JSON.parse(row.capabilities) : row.capabilities,
    };
  },

  async searchServices(keyword: string): Promise<ServiceRecord[]> {
    const term = `%${keyword.toLowerCase().trim()}%`;
    const res = await db.query<any>(
      `SELECT * FROM services
       WHERE is_active = TRUE
         AND (LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 OR LOWER(category) LIKE $1)
       ORDER BY id ASC;`,
      [term]
    );
    return res.rows.map((row) => ({
      ...row,
      capabilities: typeof row.capabilities === "string" ? JSON.parse(row.capabilities) : row.capabilities,
    }));
  },

  async listCaseStudies(): Promise<CaseStudyRecord[]> {
    const res = await db.query<any>(
      "SELECT * FROM case_studies WHERE is_published = TRUE ORDER BY id ASC;"
    );
    return res.rows.map((row) => ({
      ...row,
      technologies: typeof row.technologies === "string" ? JSON.parse(row.technologies) : row.technologies,
      capabilities: typeof row.capabilities === "string" ? JSON.parse(row.capabilities) : row.capabilities,
    }));
  },

  async findCaseStudyById(id: string): Promise<CaseStudyRecord | null> {
    const res = await db.query<any>(
      "SELECT * FROM case_studies WHERE id = $1 AND is_published = TRUE;",
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      technologies: typeof row.technologies === "string" ? JSON.parse(row.technologies) : row.technologies,
      capabilities: typeof row.capabilities === "string" ? JSON.parse(row.capabilities) : row.capabilities,
    };
  },
};
