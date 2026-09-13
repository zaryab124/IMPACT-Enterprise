import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { conversationService } from "@/packages/ai";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      throw new ValidationError("Query parameter 'conversationId' is required");
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      throw new ValidationError("Invalid conversationId format. Must be a valid UUID");
    }

    const messages = await conversationService.getHistory(conversationId);

    return NextResponse.json({
      success: true,
      conversationId,
      messages,
      meta: {
        total: messages.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return handleApiError(err, "ChatHistoryAPI");
  }
}
