import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmTaskRepository } from "@/packages/growth-os/crm";
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

    const task = await crmTaskRepository.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (err) {
    return handleApiError(err, "CrmTaskGetAPI");
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

    const updated = await crmTaskRepository.update(id, {
      ...body,
      updated_by: user.id,
    }, user.id);

    if (!updated) {
      throw new NotFoundError(`Task with ID '${id}' not found`);
    }

    return NextResponse.json({
      success: true,
      task: updated,
    });
  } catch (err) {
    return handleApiError(err, "CrmTaskUpdateAPI");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth(req);
    const { id } = params;

    const ok = await crmTaskRepository.softDelete(id);
    if (!ok) {
      throw new NotFoundError(`Task with ID '${id}' not found or already archived`);
    }

    return NextResponse.json({
      success: true,
      message: `Task '${id}' archived successfully`,
    });
  } catch (err) {
    return handleApiError(err, "CrmTaskDeleteAPI");
  }
}
