import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { conversationIntelligenceService } from "@/packages/voice/intelligence";
import { handleApiError } from "@/packages/errors/errorHandler";
import { NotFoundError, ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requirePermission(req, "dashboard:view");

    const recording = await conversationIntelligenceService.getCallRecordingById(params.id);
    if (!recording) {
      throw new NotFoundError(`Call recording with ID ${params.id} not found`);
    }

    return NextResponse.json({
      success: true,
      recording,
    });
  } catch (err) {
    return handleApiError(err, "AdminCallRecordingDetailAPI");
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await requirePermission(req, "conversations:takeover");

    const body = await req.json();
    if (body.actionItemIndex === undefined || typeof body.completed !== "boolean") {
      throw new ValidationError("actionItemIndex and completed boolean are required");
    }

    const updated = await conversationIntelligenceService.toggleActionItem(
      params.id,
      body.actionItemIndex,
      body.completed
    );

    if (!updated) {
      throw new NotFoundError(`Call recording with ID ${params.id} not found`);
    }

    return NextResponse.json({
      success: true,
      recording: updated,
    });
  } catch (err) {
    return handleApiError(err, "AdminCallRecordingActionToggleAPI");
  }
}
