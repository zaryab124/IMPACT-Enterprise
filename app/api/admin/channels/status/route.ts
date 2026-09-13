import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { omnichannelService } from "@/packages/omnichannel";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "dashboard:view");
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel") || undefined;
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const diagnostics = await omnichannelService.getChannelDiagnostics();
    const recentDeliveries = await omnichannelService.listRecentDeliveries(limit, channel);

    return NextResponse.json({
      success: true,
      diagnostics,
      recentDeliveries,
    });
  } catch (err) {
    return handleApiError(err, "AdminChannelsStatusAPI");
  }
}
