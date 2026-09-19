import { NextRequest, NextResponse } from "next/server";
import { CampaignFunnelService } from "@/packages/growth-os/marketing/campaignFunnelService";

export async function GET(req: NextRequest) {
  try {
    const summary = await CampaignFunnelService.getCampaignDashboardSummary();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const campaign = await CampaignFunnelService.createCampaign(body);
    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
