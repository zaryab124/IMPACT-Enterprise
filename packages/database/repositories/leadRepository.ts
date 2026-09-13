import { db } from "../index";

export type LeadStage =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "NURTURE";

export interface LeadRecord {
  id: string;
  customer_id: string;
  conversation_id: string | null;
  stage: LeadStage;
  score: number;
  problem_statement: string | null;
  proposed_solution: string | null;
  budget_range: string | null;
  timeline: string | null;
  decision_maker_status: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadScoreRecord {
  id: string;
  lead_id: string;
  fit_score: number;
  clarity_score: number;
  timeline_score: number;
  budget_score: number;
  authority_score: number;
  total_score: number;
  reasoning: string | null;
  scored_at: string;
}

export interface LeadEventRecord {
  id: string;
  lead_id: string;
  event_type: string;
  from_stage: string | null;
  to_stage: string | null;
  actor_type: string;
  actor_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadWithCustomerRecord extends LeadRecord {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_country?: string;
}

export const leadRepository = {
  async findById(id: string): Promise<LeadRecord | null> {
    const res = await db.query<LeadRecord>("SELECT * FROM leads WHERE id = $1;", [id]);
    return res.rows[0] || null;
  },

  async findByCustomerId(customerId: string): Promise<LeadRecord[]> {
    const res = await db.query<LeadRecord>(
      "SELECT * FROM leads WHERE customer_id = $1 ORDER BY created_at DESC;",
      [customerId]
    );
    return res.rows;
  },

  async create(data: {
    customerId: string;
    conversationId?: string;
    problemStatement?: string;
    proposedSolution?: string;
    budgetRange?: string;
    timeline?: string;
    decisionMakerStatus?: string;
    stage?: LeadStage;
    score?: number;
  }): Promise<LeadRecord> {
    const res = await db.query<LeadRecord>(
      `INSERT INTO leads (customer_id, conversation_id, problem_statement, proposed_solution, budget_range, timeline, decision_maker_status, stage, score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [
        data.customerId,
        data.conversationId || null,
        data.problemStatement || null,
        data.proposedSolution || null,
        data.budgetRange || null,
        data.timeline || null,
        data.decisionMakerStatus || null,
        data.stage || "NEW",
        data.score || 0,
      ]
    );

    const lead = res.rows[0];
    await db.query(
      `INSERT INTO lead_events (lead_id, event_type, to_stage, actor_type, actor_id, details)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [lead.id, "CREATED", lead.stage, "SYSTEM", "leadRepository", JSON.stringify({ score: lead.score })]
    );

    return lead;
  },

  async updateStage(id: string, newStage: LeadStage, actorType: "USER" | "AI" | "SYSTEM" = "SYSTEM", actorId = "system"): Promise<LeadRecord | null> {
    const current = await this.findById(id);
    if (!current) return null;

    const res = await db.query<LeadRecord>(
      `UPDATE leads SET stage = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`,
      [newStage, id]
    );

    const updated = res.rows[0];
    await db.query(
      `INSERT INTO lead_events (lead_id, event_type, from_stage, to_stage, actor_type, actor_id)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [id, "STAGE_CHANGED", current.stage, newStage, actorType, actorId]
    );

    return updated;
  },

  async recordScore(data: {
    leadId: string;
    fitScore: number;
    clarityScore: number;
    timelineScore: number;
    budgetScore: number;
    authorityScore: number;
    reasoning?: string;
  }): Promise<number> {
    const totalScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          data.fitScore * 0.25 +
            data.clarityScore * 0.2 +
            data.timelineScore * 0.2 +
            data.budgetScore * 0.2 +
            data.authorityScore * 0.15
        )
      )
    );

    await db.query(
      `INSERT INTO lead_scores (lead_id, fit_score, clarity_score, timeline_score, budget_score, authority_score, total_score, reasoning)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        data.leadId,
        data.fitScore,
        data.clarityScore,
        data.timelineScore,
        data.budgetScore,
        data.authorityScore,
        totalScore,
        data.reasoning || null,
      ]
    );

    await db.query(`UPDATE leads SET score = $1, updated_at = NOW() WHERE id = $2;`, [
      totalScore,
      data.leadId,
    ]);

    return totalScore;
  },

  async list(limit = 50, offset = 0): Promise<LeadRecord[]> {
    const res = await db.query<LeadRecord>(
      "SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2;",
      [limit, offset]
    );
    return res.rows;
  },

  async listWithCustomer(limit = 50, offset = 0): Promise<LeadWithCustomerRecord[]> {
    const res = await db.query<LeadWithCustomerRecord>(
      `SELECT l.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.country as customer_country
       FROM leads l
       LEFT JOIN customers c ON l.customer_id = c.id
       ORDER BY l.created_at DESC LIMIT $1 OFFSET $2;`,
      [limit, offset]
    );
    return res.rows;
  },

  async getLatestScore(leadId: string): Promise<LeadScoreRecord | null> {
    const res = await db.query<LeadScoreRecord>(
      "SELECT * FROM lead_scores WHERE lead_id = $1 ORDER BY scored_at DESC LIMIT 1;",
      [leadId]
    );
    return res.rows[0] || null;
  },

  async getScores(leadId: string): Promise<LeadScoreRecord[]> {
    const res = await db.query<LeadScoreRecord>(
      "SELECT * FROM lead_scores WHERE lead_id = $1 ORDER BY scored_at DESC LIMIT 50;",
      [leadId]
    );
    return res.rows;
  },

  async getEvents(leadId: string): Promise<LeadEventRecord[]> {
    const res = await db.query<LeadEventRecord>(
      "SELECT * FROM lead_events WHERE lead_id = $1 ORDER BY created_at DESC LIMIT 50;",
      [leadId]
    );
    return res.rows;
  },
};
