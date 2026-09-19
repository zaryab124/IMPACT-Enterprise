import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAnyPermission } from "@/packages/auth/session";
import { hasPermission } from "@/packages/auth/roles";
import { crmLeadRepository, LEAD_STATUSES, LeadStatus } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAnyPermission(req, [
      "crm:view_all",
      "crm:view_assigned",
      "leads:view_all",
      "leads:view_assigned",
    ]);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") as LeadStatus | null;
    const search = searchParams.get("search") || undefined;
    let assignedSalesperson = searchParams.get("assigned_salesperson") || undefined;
    const includeDeleted = searchParams.get("include_deleted") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    // If user has view_assigned only (e.g. Sales Agent), automatically scope to their assigned leads
    const canViewAll = user.roles.some(
      (r) => hasPermission(r, "crm:view_all") || hasPermission(r, "leads:view_all")
    );
    if (!canViewAll && user.roles.includes("SALES_AGENT")) {
      assignedSalesperson = user.id;
    }

    const result = await crmLeadRepository.list({
      status: status || undefined,
      search,
      assignedSalesperson,
      includeDeleted,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      leads: result.leads,
    });
  } catch (err) {
    return handleApiError(err, "CrmLeadsListAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAnyPermission(req, ["crm:leads_manage", "leads:create"]);
    const body = await req.json();

    if (!body.first_name || typeof body.first_name !== "string" || !body.first_name.trim()) {
      throw new ValidationError("first_name is required");
    }
    if (!body.last_name || typeof body.last_name !== "string" || !body.last_name.trim()) {
      throw new ValidationError("last_name is required");
    }
    if (!body.email || typeof body.email !== "string" || !body.email.includes("@")) {
      throw new ValidationError("A valid email is required");
    }

    if (body.lead_status && !LEAD_STATUSES.includes(body.lead_status)) {
      throw new ValidationError(
        `Invalid lead_status. Allowed values: [${LEAD_STATUSES.join(", ")}]`
      );
    }

    if (
      body.lead_score !== undefined &&
      (typeof body.lead_score !== "number" || body.lead_score < 0 || body.lead_score > 100)
    ) {
      throw new ValidationError("lead_score must be a number between 0 and 100");
    }

    const lead = await crmLeadRepository.create({
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone,
      whatsapp: body.whatsapp,
      company: body.company,
      company_id: body.company_id,
      contact_id: body.contact_id,
      job_title: body.job_title,
      country: body.country,
      city: body.city,
      website: body.website,
      source: body.source || "website",
      campaign: body.campaign,
      service_interest: body.service_interest,
      lead_status: body.lead_status || "NEW",
      lead_score: body.lead_score ?? 0,
      assigned_salesperson: body.assigned_salesperson || user.id,
      notes: body.notes,
      created_by: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        lead,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "CrmLeadsCreateAPI");
  }
}
