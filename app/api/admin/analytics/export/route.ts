import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { analyticsService, ExportType, ExportFormat } from "@/packages/analytics";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "dashboard:view");

    const { searchParams } = new URL(req.url);
    const rawType = searchParams.get("type") || "leads";
    const rawFormat = searchParams.get("format") || "csv";
    const rawRange = searchParams.get("timeRange") || "all";

    const validTypes: ExportType[] = ["leads", "conversations", "appointments", "voice"];
    const validFormats: ExportFormat[] = ["csv", "json"];
    const validRanges = ["7d", "30d", "all"] as const;

    const type = validTypes.includes(rawType as ExportType) ? (rawType as ExportType) : "leads";
    const format = validFormats.includes(rawFormat as ExportFormat)
      ? (rawFormat as ExportFormat)
      : "csv";
    const timeRange = validRanges.includes(rawRange as any) ? (rawRange as "7d" | "30d" | "all") : "all";

    const exportResult = await analyticsService.generateExport(type, format, timeRange);

    return new Response(exportResult.content, {
      status: 200,
      headers: {
        "Content-Type": exportResult.mimeType,
        "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
        "X-Row-Count": String(exportResult.rowCount),
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return handleApiError(err, "AdminAnalyticsExportAPI");
  }
}
