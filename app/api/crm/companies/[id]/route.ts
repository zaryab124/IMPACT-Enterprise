import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmCompanyRepository } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { NotFoundError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
    const { id } = params;

    const company = await crmCompanyRepository.findById(id);
    if (!company) {
      throw new NotFoundError(`Company with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (err) {
    return handleApiError(err, "CrmCompanyGetAPI");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);
    const { id } = params;
    const body = await req.json();

    const updated = await crmCompanyRepository.update(id, {
      ...body,
      updated_by: user.id,
    });
    if (!updated) {
      throw new NotFoundError(`Company with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      company: updated,
    });
  } catch (err) {
    return handleApiError(err, "CrmCompanyUpdateAPI");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
    const { id } = params;

    const ok = await crmCompanyRepository.softDelete(id);
    if (!ok) {
      throw new NotFoundError(`Company with ID '${id}' not found or already archived`);
    }

    return NextResponse.json({
      success: true,
      message: `Company '${id}' archived successfully`,
    });
  } catch (err) {
    return handleApiError(err, "CrmCompanyDeleteAPI");
  }
}
