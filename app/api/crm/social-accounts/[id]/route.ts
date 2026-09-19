import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/packages/growth-os/publishing/publishingService";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    if (typeof body.is_ai_agent_linked !== "boolean") {
      return NextResponse.json(
        { success: false, error: "is_ai_agent_linked must be a boolean" },
        { status: 400 }
      );
    }

    const updated = await PublishingService.linkAccountToAiAgent(id, body.is_ai_agent_linked);
    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const success = await PublishingService.disconnectAccount(id);
    return NextResponse.json({ success, message: "Account disconnected successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
