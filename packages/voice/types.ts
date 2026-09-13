export type VoiceModel =
  | "gemini-3.1-flash-live-preview"
  | "gemini-3.5-transcribe-live";

export type VoiceName =
  | "Puck"
  | "Charon"
  | "Kore"
  | "Fenrir"
  | "Aoede";

export interface VoiceSessionConfig {
  voiceName?: VoiceName;
  model?: VoiceModel;
  systemInstruction?: string;
  temperature?: number;
  customerId?: string;
  conversationId?: string;
  clientMetadata?: Record<string, unknown>;
}

export interface EphemeralTokenSession {
  sessionId: string;
  token: string;
  model: VoiceModel;
  voiceName: VoiceName;
  expireTime: string;
  newSessionExpireTime: string;
  webSocketUrl: string;
  isMock: boolean;
  systemInstructionPreview: string;
}

export interface VoiceTurn {
  sessionId: string;
  conversationId?: string;
  role: "user" | "model";
  text: string;
  audioDurationMs?: number;
  timestamp: string;
  isInterrupted?: boolean;
}

export interface AudioPCMConfig {
  inputSampleRate: number; // default 16000
  outputSampleRate: number; // default 24000
  channels: number; // mono (1)
  bitDepth: number; // 16-bit linear PCM
}

export interface LiveVoiceStatus {
  state: "idle" | "connecting" | "listening" | "thinking" | "speaking" | "interrupted" | "ended" | "error";
  error?: string;
}
