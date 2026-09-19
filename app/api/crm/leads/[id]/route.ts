import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePermission, requireAnyPermission, canAccessLead } from "@/packages/auth/session";
import { crmLeadRepository, LEAD_STATUSES } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { NotFoundError, ValidationError, ForbiddenError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAnyPermission(req, [
      "crm:view_all",
      "crm:view_assigned",
      "leads:view_all",
      "leads:view_assigned",
    ]);
    const { id } = params;

    const data = await crmLeadRepository.findWithHistory(id);
    if (!data.lead) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }

    if (!canAccessLead(user, data.lead)) {
      throw new ForbiddenError("You do not have access to view this lead");
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err) {
    return handleApiError(err, "CrmLeadGetAPI");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAnyPermission(req, ["crm:leads_manage", "leads:edit"]);
    const { id } = params;
    const body = await req.json();

    const existing = await crmLeadRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }

    if (!canAccessLead(user, existing)) {
      throw new ForbiddenError("You do not have permission to modify this lead");
    }

    if (body.lead_status && !LEAD_STATUSES.includes(body.lead_status)) {
      throw new ValidationError(
        `Invalid lead_status. Allowed values: [${LEAD_STATUSES.join(", ")}]`
      );
    }

    const updated = await crmLeadRepository.update(id, body, user.id);
    if (!updated) {
      throw new NotFoundError(`Lead with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      lead: updated,
    });
  } catch (err) {
    return handleApiError(err, "CrmLeadUpdateAPI");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission(req, "crm:leads_delete");
    const { id } = params;

    const ok = await crmLeadRepository.softDelete(id, user.id);
    if (!ok) {
      throw new NotFoundError(`Lead with ID '${id}' not found or already archived`);
    }

    return NextResponse.json({
      success: true,
      message: `Lead '${id}' archived successfully`,
    });
  } catch (err) {
    return handleApiError(err, "CrmLeadDeleteAPI");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requirePermission(req, "crm:leads_delete");
    const { id } = params;
    let action = "restore";
    try {
      const body = await req.json();
      if (body?.action) action = body.action;
    } catch {
      // Default to restore if body not provided
    }

    if (action === "restore") {
      const ok = await crmLeadRepository.restore(id, user.id);
      if (!ok) {
        throw new NotFoundError(`Lead with ID '${id}' not found or is not archived`);
      }
      return NextResponse.json({
        success: true,
        message: `Lead '${id}' restored successfully`,
      });
    }

    throw new ValidationError(`Unknown action: ${action}`);
  } catch (err) {
    return handleApiError(err, "CrmLeadPatchAPI");
  }
}
