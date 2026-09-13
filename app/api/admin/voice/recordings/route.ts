import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { conversationIntelligenceService } from "@/packages/voice/intelligence";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "dashboard:view");

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const sentiment = searchParams.get("sentiment") || undefined;
    const search = searchParams.get("search") || undefined;

    const data = await conversationIntelligenceService.getCallRecordings({
      limit,
      offset,
      sentiment,
      search,
    });

    const analytics = await conversationIntelligenceService.getIntelligenceAnalytics();

    return NextResponse.json({
      success: true,
      recordings: data.recordings,
      total: data.total,
      analytics,
    });
  } catch (err) {
    return handleApiError(err, "AdminVoiceRecordingsAPI");
  }
}
