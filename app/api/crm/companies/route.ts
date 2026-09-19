import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmCompanyRepository } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const industry = searchParams.get("industry") || undefined;
    const search = searchParams.get("search") || undefined;
    const includeDeleted = searchParams.get("include_deleted") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const result = await crmCompanyRepository.list({
      industry,
      search,
      includeDeleted,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      total: result.total,
      companies: result.companies,
    });
  } catch (err) {
    return handleApiError(err, "CrmCompaniesListAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      throw new ValidationError("name is required for company");
    }

    const company = await crmCompanyRepository.create({
      name: body.name.trim(),
      industry: body.industry,
      website: body.website,
      domain: body.domain,
      size_tier: body.size_tier,
      address: body.address,
      city: body.city,
      country: body.country,
      phone: body.phone,
      email: body.email,
      annual_revenue: body.annual_revenue ? Number(body.annual_revenue) : undefined,
      employee_count: body.employee_count ? parseInt(body.employee_count, 10) : undefined,
      assigned_to: body.assigned_to || user.id,
      created_by: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        company,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "CrmCompaniesCreateAPI");
  }
}
