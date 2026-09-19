import { NextResponse } from "next/server";
import { growthOsService } from "@/packages/growth-os";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = await growthOsService.getHealth();
    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "GROWTH_OS_HEALTH_CHECK_FAILED",
          message: err.message || "Failed to retrieve Growth OS health status",
        },
      },
      { status: 500 }
    );
  }
}
