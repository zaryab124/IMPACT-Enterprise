import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { db } from "@/packages/database";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (!body.content || typeof body.content !== "string" || !body.content.trim()) {
      throw new ValidationError("content is required for a note");
    }

    if (!body.lead_id && !body.deal_id && !body.contact_id && !body.company_id) {
      throw new ValidationError("At least one association (lead_id, deal_id, contact_id, company_id) is required");
    }

    const res = await db.query(
      `INSERT INTO crm_notes (lead_id, deal_id, contact_id, company_id, content, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        body.lead_id || null,
        body.deal_id || null,
        body.contact_id || null,
        body.company_id || null,
        body.content.trim(),
        user.id,
      ]
    );

    const note = res.rows[0];

    // Log activity for complete history
    await db.query(
      `INSERT INTO crm_activities (lead_id, deal_id, contact_id, company_id, activity_type, subject, description, performed_by)
       VALUES ($1, $2, $3, $4, 'note_added', 'Note Added', $5, $6);`,
      [
        body.lead_id || null,
        body.deal_id || null,
        body.contact_id || null,
        body.company_id || null,
        `Internal note added: "${body.content.trim().slice(0, 100)}${body.content.trim().length > 100 ? "..." : ""}"`,
        user.id,
      ]
    );

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "CrmNotesCreateAPI");
  }
}
