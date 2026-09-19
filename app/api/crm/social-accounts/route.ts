import { NextRequest, NextResponse } from "next/server";
import { PublishingService } from "@/packages/growth-os/publishing/publishingService";

export async function GET(req: NextRequest) {
  try {
    const accounts = await PublishingService.getAccounts();
    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, accountName, accountOrPageId, accessToken, metadata } = body;

    if (!platform || !accountName || !accountOrPageId || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: platform, accountName, accountOrPageId, accessToken",
        },
        { status: 400 }
      );
    }

    const account = await PublishingService.registerAccount(
      platform,
      accountName,
      accountOrPageId,
      accessToken,
      metadata || {}
    );

    return NextResponse.json(
      {
        success: true,
        account: {
          id: account.id,
          platform: account.platform,
          account_name: account.account_name,
          account_or_page_id: account.account_or_page_id,
          connection_status: account.connection_status,
          masked_token: "••••••••••••••••",
          is_ai_agent_linked: true,
          created_at: account.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
