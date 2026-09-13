import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { analyticsService } from "@/packages/analytics";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission(req, "dashboard:view");

    const { searchParams } = new URL(req.url);
    const rawRange = searchParams.get("timeRange") || "30d";
    const timeRange = ["7d", "30d", "all"].includes(rawRange)
      ? (rawRange as "7d" | "30d" | "all")
      : "30d";

    const summary = await analyticsService.getFullAnalytics(timeRange);

    return NextResponse.json({
      success: true,
      analytics: summary,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    return handleApiError(err, "AdminAnalyticsAPI");
  }
}
