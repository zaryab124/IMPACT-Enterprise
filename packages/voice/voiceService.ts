import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { logger } from "../logging/logger";
import { conversationRepository, voiceSessionRepository } from "../database/repositories";
import {
  EphemeralTokenSession,
  VoiceName,
  VoiceSessionConfig,
  VoiceTurn,
} from "./types";
import { IMPACT_VOICE_SYSTEM_INSTRUCTION, getCustomizedVoicePrompt } from "./persona/voicePrompt";

export class VoiceService {
  private client: GoogleGenAI | null = null;
  private isConfigured = false;
  private defaultVoice: VoiceName = "Puck";
  private defaultModel = "gemini-3.1-flash-live-preview";

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("your-gemini-api-key")) {
      try {
        this.client = new GoogleGenAI({ apiKey });
        this.isConfigured = true;
        logger.info("GoogleGenAI client initialized successfully for Gemini Live API", {
          module: "VoiceService",
        });
      } catch (err: any) {
        logger.warn(`Failed to initialize GoogleGenAI client for voice: ${err.message}. Falling back to mock.`, {
          module: "VoiceService",
        });
      }
    } else {
      logger.info("No valid GEMINI_API_KEY configured for Live API. Running in DEVELOPMENT MOCK mode.", {
        module: "VoiceService",
      });
    }
  }

  public isLive(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Securely create a real-time voice session and mint an ephemeral token
   * Browser clients receive the short-lived token and connect directly to Live API.
   * The production GEMINI_API_KEY is NEVER sent to the client.
   */
  public async createVoiceSession(config: VoiceSessionConfig = {}): Promise<EphemeralTokenSession> {
    const sessionId = `voice-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const voiceName = config.voiceName || this.defaultVoice;
    const model = (config.model || this.defaultModel) as "gemini-3.1-flash-live-preview";
    const systemInstruction = config.systemInstruction || IMPACT_VOICE_SYSTEM_INSTRUCTION;

    // Verify conversationId exists in database to prevent foreign key violations from stale sessions
    let validConversationId: string | null = null;
    if (config.conversationId) {
      try {
        const conv = await conversationRepository.findById(config.conversationId);
        if (conv) {
          validConversationId = conv.id;
        }
      } catch {
        validConversationId = null;
      }
    }

    // Record session initialization in database
    await voiceSessionRepository.create({
      sessionId,
      conversationId: validConversationId,
      model,
      voiceName,
      metadata: {
        customerId: config.customerId || null,
        clientMetadata: config.clientMetadata || {},
      },
    });

    // Try live ephemeral token creation if live credentials are configured
    if (this.isLive() && this.client) {
      try {
        const now = Date.now();
        const expireTime = new Date(now + 30 * 60 * 1000).toISOString(); // 30 minutes
        const newSessionExpireTime = new Date(now + 2 * 60 * 1000).toISOString(); // 2 minutes

        const tokenResult = await this.client.authTokens.create({
          config: {
            uses: 1,
            expireTime,
            newSessionExpireTime,
            liveConnectConstraints: {
              model,
              config: {
                responseModalities: ["AUDIO" as any],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName,
                    },
                  },
                },
                systemInstruction: {
                  parts: [{ text: systemInstruction }],
                },
              },
            },
          },
        });

        const token = (tokenResult as any).name || (tokenResult as any).token || "";
        if (token) {
          logger.info(`Live ephemeral token created successfully for session ${sessionId}`, {
            module: "VoiceService",
          });

          return {
            sessionId,
            token,
            model,
            voiceName,
            expireTime,
            newSessionExpireTime,
            webSocketUrl: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContentConstrained?access_token=${token}`,
            isMock: false,
            systemInstructionPreview: systemInstruction.substring(0, 120) + "...",
          };
        }
      } catch (err: any) {
        logger.warn(
          `Live ephemeral token generation failed (${err.message}). Activating [DEVELOPMENT MOCK: Gemini Live API].`,
          { module: "VoiceService" }
        );
      }
    }

    // High-Fidelity Development Mock Simulator (Explicitly Labeled)
    const mockToken = `[DEVELOPMENT MOCK: Gemini Live API] mock-token-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();
    const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(now + 2 * 60 * 1000).toISOString();

    logger.info(`Provisioned development mock voice session: ${sessionId}`, {
      module: "VoiceService",
    });

    return {
      sessionId,
      token: mockToken,
      model,
      voiceName,
      expireTime,
      newSessionExpireTime,
      webSocketUrl: `/api/voice/mock-socket?sessionId=${sessionId}`,
      isMock: true,
      systemInstructionPreview: systemInstruction.substring(0, 120) + "...",
    };
  }

  /**
   * Persist user and agent spoken transcript turns into PostgreSQL
   */
  public async saveTranscriptTurn(turn: VoiceTurn): Promise<void> {
    logger.info(
      `Saving voice turn for session ${turn.sessionId}: [${turn.role}] ${turn.text.substring(0, 40)}...`,
      { module: "VoiceService" }
    );

    // 1. If linked to an active conversation, insert into messages
    if (turn.conversationId) {
      await conversationRepository.addMessage({
        conversationId: turn.conversationId,
        senderType: turn.role === "user" ? "customer" : "ai_agent",
        content: turn.text,
        toolCalls: turn.isInterrupted ? { interrupted: true } : undefined,
      });
    }

    // 2. Update voice session statistics in database
    const session = await voiceSessionRepository.findBySessionId(turn.sessionId);
    if (session) {
      const newTurnsCount = (session.turns_count || 0) + 1;
      const newInterruptions = turn.isInterrupted
        ? (session.interruptions_count || 0) + 1
        : session.interruptions_count || 0;

      await voiceSessionRepository.update(turn.sessionId, {
        turnsCount: newTurnsCount,
        interruptionsCount: newInterruptions,
      });
    }
  }

  /**
   * Record interruption event in database
   */
  public async recordInterruption(sessionId: string): Promise<void> {
    const session = await voiceSessionRepository.findBySessionId(sessionId);
    if (session) {
      await voiceSessionRepository.update(sessionId, {
        interruptionsCount: (session.interruptions_count || 0) + 1,
        status: "interrupted",
      });
    }
  }

  /**
   * Finalize a voice call session
   */
  public async endVoiceSession(
    sessionId: string,
    metrics: { durationSeconds?: number; latencyMs?: number } = {}
  ): Promise<void> {
    await voiceSessionRepository.update(sessionId, {
      status: "completed",
      durationSeconds: metrics.durationSeconds || 0,
      latencyMs: metrics.latencyMs,
      endedAt: new Date().toISOString(),
    });

    logger.info(`Voice session ${sessionId} finalized cleanly`, {
      module: "VoiceService",
      data: metrics,
    });
  }

  /**
   * Get aggregate voice analytics for Admin Hub
   */
  public async getVoiceAnalytics() {
    const stats = await voiceSessionRepository.getStats();
    const recent = await voiceSessionRepository.listRecent(15);
    return {
      stats,
      recent,
    };
  }
}

export const voiceService = new VoiceService();
