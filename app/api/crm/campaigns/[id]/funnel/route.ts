import { NextRequest, NextResponse } from "next/server";
import { CampaignFunnelService, FunnelEventType } from "@/packages/growth-os/marketing/campaignFunnelService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const metrics = await CampaignFunnelService.getCampaignFunnelMetrics(params.id);
    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 404 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const eventType = body.event_type as FunnelEventType;
    if (!eventType) {
      return NextResponse.json({ success: false, error: "event_type is required" }, { status: 400 });
    }

    const event = await CampaignFunnelService.recordFunnelEvent(
      params.id,
      eventType,
      body.entity_id,
      body.metadata || {}
    );

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
