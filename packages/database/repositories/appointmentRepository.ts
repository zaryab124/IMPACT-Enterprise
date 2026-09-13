import { db } from "../index";

export interface AppointmentRecord {
  id: string;
  lead_id: string | null;
  customer_id: string;
  assigned_agent_id: string | null;
  title: string;
  status: "scheduled" | "confirmed" | "rescheduled" | "cancelled" | "completed";
  start_time: string;
  end_time: string;
  timezone: string;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const appointmentRepository = {
  async findById(id: string): Promise<AppointmentRecord | null> {
    const res = await db.query<AppointmentRecord>("SELECT * FROM appointments WHERE id = $1;", [
      id,
    ]);
    return res.rows[0] || null;
  },

  async hasConflict(startTime: string, endTime: string, excludeId?: string): Promise<boolean> {
    const queryText = `
      SELECT id FROM appointments
      WHERE status IN ('scheduled', 'confirmed')
        AND (
          (start_time < $2 AND end_time > $1)
        )
        ${excludeId ? "AND id != $3" : ""};
    `;
    const params = excludeId ? [startTime, endTime, excludeId] : [startTime, endTime];
    const res = await db.query(queryText, params);
    return res.rows.length > 0;
  },

  async create(data: {
    customerId: string;
    leadId?: string;
    assignedAgentId?: string;
    title: string;
    startTime: string;
    endTime: string;
    timezone?: string;
    meetingLink?: string;
    notes?: string;
  }): Promise<AppointmentRecord> {
    const res = await db.query<AppointmentRecord>(
      `INSERT INTO appointments (customer_id, lead_id, assigned_agent_id, title, start_time, end_time, timezone, meeting_link, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [
        data.customerId,
        data.leadId || null,
        data.assignedAgentId || null,
        data.title,
        data.startTime,
        data.endTime,
        data.timezone || "UTC",
        data.meetingLink || null,
        data.notes || null,
      ]
    );
    return res.rows[0];
  },

  async updateStatus(
    id: string,
    status: AppointmentRecord["status"],
    notes?: string
  ): Promise<AppointmentRecord | null> {
    const res = await db.query<AppointmentRecord>(
      `UPDATE appointments
       SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
       WHERE id = $3
       RETURNING *;`,
      [status, notes || null, id]
    );
    return res.rows[0] || null;
  },

  async list(limit = 50, offset = 0): Promise<AppointmentRecord[]> {
    const res = await db.query<AppointmentRecord>(
      "SELECT * FROM appointments ORDER BY start_time ASC LIMIT $1 OFFSET $2;",
      [limit, offset]
    );
    return res.rows;
  },

  async findBetween(startTime: string, endTime: string): Promise<AppointmentRecord[]> {
    const res = await db.query<AppointmentRecord>(
      `SELECT * FROM appointments
       WHERE status IN ('scheduled', 'confirmed')
         AND (
           (start_time >= $1 AND start_time < $2)
           OR (end_time > $1 AND end_time <= $2)
           OR (start_time <= $1 AND end_time >= $2)
         )
       ORDER BY start_time ASC;`,
      [startTime, endTime]
    );
    return res.rows;
  },

  async listWithDetails(limit = 50, offset = 0, statusFilter?: string): Promise<any[]> {
    let queryText = `
      SELECT
        a.id,
        a.title,
        a.status,
        a.start_time,
        a.end_time,
        a.timezone,
        a.meeting_link,
        a.notes,
        a.customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        comp.name as company_name,
        a.lead_id,
        l.stage as lead_stage,
        a.created_at,
        a.updated_at
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN leads l ON a.lead_id = l.id
    `;
    const params: any[] = [];
    if (statusFilter && statusFilter !== "all") {
      params.push(statusFilter);
      queryText += ` WHERE a.status = $${params.length}`;
    }
    params.push(limit, offset);
    queryText += ` ORDER BY a.start_time DESC LIMIT $${params.length - 1} OFFSET $${params.length};`;

    const res = await db.query(queryText, params);
    return res.rows;
  },

  async update(id: string, data: Partial<{
    title: string;
    status: AppointmentRecord["status"];
    startTime: string;
    endTime: string;
    timezone: string;
    meetingLink: string | null;
    notes: string | null;
  }>): Promise<AppointmentRecord | null> {
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.title !== undefined) { sets.push(`title = $${idx++}`); params.push(data.title); }
    if (data.status !== undefined) { sets.push(`status = $${idx++}`); params.push(data.status); }
    if (data.startTime !== undefined) { sets.push(`start_time = $${idx++}`); params.push(data.startTime); }
    if (data.endTime !== undefined) { sets.push(`end_time = $${idx++}`); params.push(data.endTime); }
    if (data.timezone !== undefined) { sets.push(`timezone = $${idx++}`); params.push(data.timezone); }
    if (data.meetingLink !== undefined) { sets.push(`meeting_link = $${idx++}`); params.push(data.meetingLink); }
    if (data.notes !== undefined) { sets.push(`notes = $${idx++}`); params.push(data.notes); }

    if (sets.length === 0) return this.findById(id);

    sets.push("updated_at = NOW()");
    params.push(id);

    const queryText = `
      UPDATE appointments
      SET ${sets.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;

    const res = await db.query<AppointmentRecord>(queryText, params);
    return res.rows[0] || null;
  },
};
