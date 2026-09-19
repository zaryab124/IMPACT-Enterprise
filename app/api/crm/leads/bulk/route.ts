import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { db } from "@/packages/database";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";
import { LEAD_STATUSES } from "@/packages/growth-os/crm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const { ids, action, value } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ValidationError("ids must be a non-empty array of lead IDs");
    }

    if (!action) {
      throw new ValidationError("action is required ('status', 'assign', 'archive', 'restore')");
    }

    if (action === "status") {
      if (!value || !LEAD_STATUSES.includes(value)) {
        throw new ValidationError(`Invalid lead_status: ${value}. Allowed: [${LEAD_STATUSES.join(", ")}]`);
      }

      await db.query(
        `UPDATE leads SET lead_status = $1, stage = $1, updated_at = NOW(), updated_by = $2
         WHERE id = ANY($3) AND deleted_at IS NULL;`,
        [value, user.id, ids]
      );

      for (const id of ids) {
        await db.query(
          `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
           VALUES ($1, 'status_change', 'Bulk Status Update', $2, $3);`,
          [id, `Status updated to ${value} via bulk action.`, user.id]
        );
      }

      return NextResponse.json({
        success: true,
        message: `Successfully updated status to '${value}' for ${ids.length} leads`,
        count: ids.length,
      });
    }

    if (action === "assign") {
      if (!value) {
        throw new ValidationError("value (assigned_salesperson user ID) is required for assign action");
      }

      await db.query(
        `UPDATE leads SET assigned_salesperson = $1, updated_at = NOW(), updated_by = $2
         WHERE id = ANY($3) AND deleted_at IS NULL;`,
        [value, user.id, ids]
      );

      for (const id of ids) {
        await db.query(
          `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
           VALUES ($1, 'lead_assigned', 'Bulk Salesperson Assignment', $2, $3);`,
          [id, `Assigned to salesperson ${value} via bulk action.`, user.id]
        );
      }

      return NextResponse.json({
        success: true,
        message: `Successfully assigned ${ids.length} leads to ${value}`,
        count: ids.length,
      });
    }

    if (action === "archive") {
      await db.query(
        `UPDATE leads SET deleted_at = NOW(), updated_at = NOW(), updated_by = $1
         WHERE id = ANY($2) AND deleted_at IS NULL;`,
        [user.id, ids]
      );

      for (const id of ids) {
        await db.query(
          `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
           VALUES ($1, 'status_change', 'Bulk Lead Archival', 'Lead archived via bulk action.', $2);`,
          [id, user.id]
        );
      }

      return NextResponse.json({
        success: true,
        message: `Successfully archived ${ids.length} leads`,
        count: ids.length,
      });
    }

    if (action === "restore") {
      await db.query(
        `UPDATE leads SET deleted_at = NULL, updated_at = NOW(), updated_by = $1
         WHERE id = ANY($2) AND deleted_at IS NOT NULL;`,
        [user.id, ids]
      );

      for (const id of ids) {
        await db.query(
          `INSERT INTO crm_activities (lead_id, activity_type, subject, description, performed_by)
           VALUES ($1, 'status_change', 'Bulk Lead Restoration', 'Lead restored via bulk action.', $2);`,
          [id, user.id]
        );
      }

      return NextResponse.json({
        success: true,
        message: `Successfully restored ${ids.length} leads`,
        count: ids.length,
      });
    }

    throw new ValidationError(`Unknown action: ${action}`);
  } catch (err) {
    return handleApiError(err, "CrmLeadsBulkAPI");
  }
}
