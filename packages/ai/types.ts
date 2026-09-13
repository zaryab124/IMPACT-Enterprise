export type GeminiModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash-exp";

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system" | "tool";
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
}

export interface LeadQualificationState {
  name?: string;
  company?: string;
  industry?: string;
  phone?: string;
  email?: string;
  problem?: string;
  solution?: string;
  budget?: string;
  timeline?: string;
  decisionAuthority?: boolean;
  qualificationScore: number;
  stage: "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST" | "NURTURE";
  extractedAt?: string;
}

export interface AICompletionOptions {
  model?: GeminiModel;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
  groundingContext?: string;
}

export interface AIResponse {
  content: string;
  model: GeminiModel;
  isMock: boolean;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  toolCalls?: ToolCall[];
}

export interface ConversationTurnResult {
  conversationId: string;
  messageId: string;
  userMessage: string;
  reply: string;
  isMock: boolean;
  citations: string[];
  qualification: LeadQualificationState;
  timestamp: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}
