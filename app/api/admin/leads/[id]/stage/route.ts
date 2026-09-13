import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/packages/auth/session";
import { hasPermission } from "@/packages/auth/roles";
import { dealStageEngine } from "@/packages/sales/dealStageEngine";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ForbiddenError, ValidationError } from "@/packages/errors/AppError";

const stageTransitionSchema = z.object({
  stage: z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "WON",
    "LOST",
    "NURTURE",
  ]),
  reason: z.string().max(500).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);

    const canEdit = user.roles.some((r) => hasPermission(r, "leads:edit"));
    if (!canEdit) {
      throw new ForbiddenError("You do not have permission to modify lead deal stages.");
    }

    const isSuperAdmin = user.roles.includes("SUPER_ADMIN");
    const body = await req.json();
    const { stage: targetStage, reason } = stageTransitionSchema.parse(body);

    const result = await dealStageEngine.transitionStage({
      leadId: params.id,
      targetStage,
      actorType: "USER",
      actorId: user.id,
      isSuperAdmin,
      reason,
    });

    if (!result.success) {
      throw new ValidationError(result.error || "Stage transition failed.");
    }

    return NextResponse.json({
      success: true,
      leadId: params.id,
      stage: result.lead?.stage,
      message: `Lead successfully updated to stage '${targetStage}'`,
    });
  } catch (err) {
    return handleApiError(err, "AdminLeadStageAPI");
  }
}
