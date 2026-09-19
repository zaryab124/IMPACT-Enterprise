import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmDealRepository } from "@/packages/growth-os/crm";
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

    const deal = await crmDealRepository.findById(id);
    if (!deal) {
      throw new NotFoundError(`Deal with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      deal,
    });
  } catch (err) {
    return handleApiError(err, "CrmDealGetAPI");
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

    const updated = await crmDealRepository.update(id, {
      ...body,
      updated_by: user.id,
    }, user.id);

    if (!updated) {
      throw new NotFoundError(`Deal with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      deal: updated,
    });
  } catch (err) {
    return handleApiError(err, "CrmDealUpdateAPI");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
    const { id } = params;

    const ok = await crmDealRepository.softDelete(id);
    if (!ok) {
      throw new NotFoundError(`Deal with ID '${id}' not found or already archived`);
    }

    return NextResponse.json({
      success: true,
      message: `Deal '${id}' archived successfully`,
    });
  } catch (err) {
    return handleApiError(err, "CrmDealDeleteAPI");
  }
}
