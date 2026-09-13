import { NextRequest, NextResponse } from "next/server";
import { conversationIntelligenceService } from "@/packages/voice/intelligence";
import { handleApiError } from "@/packages/errors/errorHandler";
import { logger } from "@/packages/logging/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required for call analysis" },
        { status: 400 }
      );
    }

    const analysis = await conversationIntelligenceService.analyzeVoiceCall(body.sessionId);

    logger.info(`Voice call analysis completed for session: ${body.sessionId}`, {
      module: "VoiceAnalyzeAPI",
      data: {
        sentiment: analysis.overallSentiment,
        topicsCount: analysis.keyTopics.length,
        actionItemsCount: analysis.actionItems.length,
      },
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (err) {
    return handleApiError(err, "VoiceAnalyzeAPI");
  }
}
