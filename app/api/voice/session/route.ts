import { NextRequest, NextResponse } from "next/server";
import { voiceService } from "../../../../packages/voice";
import { VoiceName } from "../../../../packages/voice/types";
import { logger } from "../../../../packages/logging/logger";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const voiceName = body.voiceName as VoiceName | undefined;
    const allowedVoices: VoiceName[] = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"];
    const validatedVoice = voiceName && allowedVoices.includes(voiceName) ? voiceName : "Puck";

    const session = await voiceService.createVoiceSession({
      voiceName: validatedVoice,
      conversationId: body.conversationId,
      customerId: body.customerId,
      clientMetadata: body.metadata,
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (err: any) {
    logger.error("Error generating voice session:", err, { module: "VoiceSessionAPI" });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize real-time voice session.",
        details: err.message,
      },
      { status: 500 }
    );
  }
}
