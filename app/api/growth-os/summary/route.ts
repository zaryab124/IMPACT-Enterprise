import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { growthOsService } from "@/packages/growth-os";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const summary = await growthOsService.getPlatformSummary();

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err) {
    return handleApiError(err, "GrowthOsSummaryAPI");
  }
}
