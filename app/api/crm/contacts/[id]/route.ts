import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmContactRepository } from "@/packages/growth-os/crm";
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

    const contact = await crmContactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError(`Contact with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (err) {
    return handleApiError(err, "CrmContactGetAPI");
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

    const updated = await crmContactRepository.update(id, {
      ...body,
      updated_by: user.id,
    });
    if (!updated) {
      throw new NotFoundError(`Contact with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      contact: updated,
    });
  } catch (err) {
    return handleApiError(err, "CrmContactUpdateAPI");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
    const { id } = params;

    const ok = await crmContactRepository.softDelete(id);
    if (!ok) {
      throw new NotFoundError(`Contact with ID '${id}' not found or already archived`);
    }

    return NextResponse.json({
      success: true,
      message: `Contact '${id}' archived successfully`,
    });
  } catch (err) {
    return handleApiError(err, "CrmContactDeleteAPI");
  }
}
