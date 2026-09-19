import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmContactRepository } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const companyId = searchParams.get("company_id") || undefined;
    const search = searchParams.get("search") || undefined;
    const includeDeleted = searchParams.get("include_deleted") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = await crmContactRepository.list({
      companyId,
      search,
      includeDeleted,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      contacts: result.contacts,
    });
  } catch (err) {
    return handleApiError(err, "CrmContactsListAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (!body.first_name || !body.last_name || !body.email) {
      throw new ValidationError("first_name, last_name, and email are required");
    }

    const contact = await crmContactRepository.create({
      company_id: body.company_id,
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone,
      whatsapp: body.whatsapp,
      job_title: body.job_title,
      country: body.country,
      city: body.city,
      is_primary: body.is_primary,
      assigned_to: body.assigned_to || user.id,
      notes: body.notes,
      created_by: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        contact,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "CrmContactsCreateAPI");
  }
}
