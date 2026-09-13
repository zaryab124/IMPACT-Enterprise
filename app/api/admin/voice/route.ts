import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { voiceService } from "@/packages/voice";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "dashboard:view");

    const analytics = await voiceService.getVoiceAnalytics();

    return NextResponse.json({
      success: true,
      stats: analytics.stats,
      recent: analytics.recent,
    });
  } catch (err) {
    return handleApiError(err, "AdminVoiceAPI");
  }
}
