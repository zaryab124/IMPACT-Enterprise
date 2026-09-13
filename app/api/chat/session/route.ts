import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { conversationService } from "@/packages/ai";
import { handleApiError } from "@/packages/errors/errorHandler";

const sessionInitSchema = z.object({
  customerId: z.string().uuid().optional(),
  channel: z.enum(["website_chat", "whatsapp", "email", "voice", "admin"]).optional().default("website_chat"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const { customerId, channel } = sessionInitSchema.parse(body);
    const session = await conversationService.getOrCreateConversation(undefined, customerId, channel);

    return NextResponse.json({
      success: true,
      conversationId: session.id,
      customerId: session.customerId,
      channel,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return handleApiError(err, "ChatSessionAPI");
  }
}
