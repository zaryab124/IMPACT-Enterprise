import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { conversationService } from "@/packages/ai";
import { handleApiError } from "@/packages/errors/errorHandler";

const chatMessageSchema = z.object({
  message: z.string().min(1, "Message content cannot be empty").max(4000, "Message exceeds 4000 characters"),
  conversationId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  channel: z.enum(["website_chat", "whatsapp", "email", "voice", "admin"]).optional().default("website_chat"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = chatMessageSchema.parse(body);

    const result = await conversationService.processMessage({
      userMessage: validated.message,
      conversationId: validated.conversationId,
      customerId: validated.customerId,
      channel: validated.channel,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return handleApiError(err, "ChatMessageAPI");
  }
}
