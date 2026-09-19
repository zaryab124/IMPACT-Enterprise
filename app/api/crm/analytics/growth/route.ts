import { NextRequest, NextResponse } from "next/server";
import { GrowthAnalyticsService } from "@/packages/growth-os/analytics/growthAnalyticsService";
import { AnalyticsDateFilter } from "@/packages/growth-os/analytics/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = (searchParams.get("timeRange") as any) || "30d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const filter: AnalyticsDateFilter = {
      timeRange,
      startDate,
      endDate,
    };

    const report = await GrowthAnalyticsService.getGrowthReport(filter);
    return NextResponse.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
