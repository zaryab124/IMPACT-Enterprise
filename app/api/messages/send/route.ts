import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/packages/auth/session";
import { omnichannelService } from "@/packages/omnichannel";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

const sendMessageSchema = z.object({
  channel: z.enum(["whatsapp", "email", "phone_sms", "web_chat"]),
  recipient: z.string().min(3, "Valid recipient identifier is required"),
  content: z.string().min(1, "Message content cannot be empty").max(4000),
  subject: z.string().max(255).optional(),
  conversationId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission(req, "conversations:takeover");
    const body = await req.json();
    const validated = sendMessageSchema.parse(body);

    const deliveryResult = await omnichannelService.sendOutbound({
      channel: validated.channel,
      recipientIdentifier: validated.recipient,
      senderIdentifier: session.email,
      content: validated.content,
      subject: validated.subject,
      conversationId: validated.conversationId,
      metadata: {
        dispatchedByUserId: session.id,
        dispatchedByEmail: session.email,
      },
    });

    if (!deliveryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROVIDER_DELIVERY_FAILED",
            message: deliveryResult.error || "External provider rejected delivery",
          },
          delivery: deliveryResult,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      delivery: deliveryResult,
    });
  } catch (err) {
    return handleApiError(err, "MessagesSendAPI");
  }
}
