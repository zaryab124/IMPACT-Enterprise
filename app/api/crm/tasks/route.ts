import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmTaskRepository } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const leadId = searchParams.get("lead_id") || undefined;
    const dealId = searchParams.get("deal_id") || undefined;
    const contactId = searchParams.get("contact_id") || undefined;
    const companyId = searchParams.get("company_id") || undefined;
    const assignedTo = searchParams.get("assigned_to") || undefined;
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const includeDeleted = searchParams.get("include_deleted") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = await crmTaskRepository.list({
      leadId,
      dealId,
      contactId,
      companyId,
      assignedTo,
      status,
      priority,
      includeDeleted,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      tasks: result.tasks,
    });
  } catch (err) {
    return handleApiError(err, "CrmTasksListAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      throw new ValidationError("title is required for a task");
    }

    const task = await crmTaskRepository.create({
      title: body.title.trim(),
      description: body.description,
      priority: body.priority || "MEDIUM",
      status: body.status || "PENDING",
      due_date: body.due_date,
      lead_id: body.lead_id,
      deal_id: body.deal_id,
      contact_id: body.contact_id,
      company_id: body.company_id,
      assigned_to: body.assigned_to || user.id,
      created_by: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "CrmTasksCreateAPI");
  }
}
