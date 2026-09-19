import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/packages/growth-os/publishing/publishingService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const accountId = body.accountId;

    let results;
    if (accountId) {
      const single = await PublishingService.executePublish(id, accountId);
      results = [single];
    } else {
      results = await PublishingService.publishPostToAllLinkedAccounts(id);
    }

    const allSuccessful = results.every((r) => r.success);
    return NextResponse.json({
      success: allSuccessful,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
