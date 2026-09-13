import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { hasPermission } from "@/packages/auth/roles";
import { leadRepository } from "@/packages/database/repositories/leadRepository";
import { db } from "@/packages/database";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ForbiddenError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const canViewAll = user.roles.some((r) => hasPermission(r, "leads:view_all"));
    const canViewAssigned = user.roles.some((r) => hasPermission(r, "leads:view_assigned"));

    if (!canViewAll && !canViewAssigned) {
      throw new ForbiddenError("You do not have permission to view leads.");
    }

    let leads;
    if (canViewAll) {
      leads = await leadRepository.listWithCustomer(100);
    } else {
      // Scoped only to assigned leads for SALES_AGENT
      const res = await db.query(
        "SELECT * FROM leads WHERE assigned_to = $1 ORDER BY created_at DESC LIMIT 100;",
        [user.id]
      );
      leads = res.rows;
    }

    return NextResponse.json({
      success: true,
      total: leads.length,
      leads,
    });
  } catch (err) {
    return handleApiError(err, "AdminLeadsAPI");
  }
}
