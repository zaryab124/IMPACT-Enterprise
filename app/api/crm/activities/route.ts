import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmActivityRepository, ActivityType } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

const VALID_ACTIVITY_TYPES: ActivityType[] = [
  "call",
  "email",
  "meeting",
  "note",
  "status_change",
  "task_created",
  "task_completed",
  "message_sent",
];

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const leadId = searchParams.get("lead_id") || undefined;
    const dealId = searchParams.get("deal_id") || undefined;
    const contactId = searchParams.get("contact_id") || undefined;
    const companyId = searchParams.get("company_id") || undefined;
    const activityType = searchParams.get("type") as ActivityType | null;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = await crmActivityRepository.list({
      leadId,
      dealId,
      contactId,
      companyId,
      activityType: activityType || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      activities: result.activities,
    });
  } catch (err) {
    return handleApiError(err, "CrmActivitiesListAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (!body.subject || !body.activity_type) {
      throw new ValidationError("subject and activity_type are required");
    }

    if (!VALID_ACTIVITY_TYPES.includes(body.activity_type)) {
      throw new ValidationError(
        `Invalid activity_type. Allowed: [${VALID_ACTIVITY_TYPES.join(", ")}]`
      );
    }

    const activity = await crmActivityRepository.create({
      lead_id: body.lead_id,
      deal_id: body.deal_id,
      contact_id: body.contact_id,
      company_id: body.company_id,
      activity_type: body.activity_type,
      subject: body.subject.trim(),
      description: body.description,
      performed_by: user.id,
      performed_at: body.performed_at,
      metadata: body.metadata,
    });

    return NextResponse.json(
      {
        success: true,
        activity,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "CrmActivitiesCreateAPI");
  }
}
