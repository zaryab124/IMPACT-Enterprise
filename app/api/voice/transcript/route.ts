import { NextRequest, NextResponse } from "next/server";
import { voiceService } from "../../../../packages/voice";
import { logger } from "../../../../packages/logging/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: "sessionId is required" },
        { status: 400 }
      );
    }

    if (body.endCall) {
      await voiceService.endVoiceSession(body.sessionId, {
        durationSeconds: body.durationSeconds,
        latencyMs: body.latencyMs,
      });
      return NextResponse.json({ success: true, message: "Voice session ended" });
    }

    if (!body.role || !body.text) {
      return NextResponse.json(
        { success: false, error: "role and text are required for transcript saving" },
        { status: 400 }
      );
    }

    await voiceService.saveTranscriptTurn({
      sessionId: body.sessionId,
      conversationId: body.conversationId,
      role: body.role === "user" ? "user" : "model",
      text: body.text,
      audioDurationMs: body.audioDurationMs,
      timestamp: new Date().toISOString(),
      isInterrupted: Boolean(body.isInterrupted),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error("Error saving voice transcript:", err, { module: "VoiceTranscriptAPI" });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save voice transcript turn.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
