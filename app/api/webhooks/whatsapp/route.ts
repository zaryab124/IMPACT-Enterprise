import { NextRequest, NextResponse } from "next/server";
import { whatsAppAdapter, omnichannelService } from "@/packages/omnichannel";
import { logger } from "@/packages/logging/logger";

export const dynamic = "force-dynamic";

/**
 * GET: Meta Webhook Subscription Challenge
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      query[key] = val;
    });

    const verification = whatsAppAdapter.verifyWebhook({ query });

    if (verification.isValid && verification.challengeResponse) {
      return new NextResponse(verification.challengeResponse, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return NextResponse.json(
      { error: verification.error || "Forbidden: Webhook challenge verification failed" },
      { status: verification.statusCode || 403 }
    );
  } catch (err: any) {
    logger.error(`Error verifying WhatsApp webhook: ${err.message}`, err, {
      module: "WhatsAppWebhookAPI",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST: Inbound WhatsApp Messages and Event Ingestion
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-hub-signature-256") || undefined;

    // Verify HMAC signature if configured
    if (!whatsAppAdapter.verifyPayloadSignature(rawBody, signatureHeader)) {
      logger.warn("WhatsApp webhook rejected: Invalid HMAC SHA-256 signature", {
        module: "WhatsAppWebhookAPI",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const messages = whatsAppAdapter.parseInboundWebhook(payload);
    if (!messages || messages.length === 0) {
      // Return 200 for non-message events (e.g. read receipts, status updates)
      return NextResponse.json({ success: true, processed: 0, notice: "Non-message event acknowledged" });
    }

    const results = [];
    for (const msg of messages) {
      const turnResult = await omnichannelService.handleInboundMessage(msg);
      results.push(turnResult);
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (err: any) {
    logger.error(`Error processing WhatsApp webhook payload: ${err.message}`, err, {
      module: "WhatsAppWebhookAPI",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
