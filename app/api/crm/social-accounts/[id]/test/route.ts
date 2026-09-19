import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/packages/growth-os/publishing/publishingService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const testResult = await PublishingService.testAccountConnection(id);
    return NextResponse.json({ success: testResult.success, data: testResult });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
