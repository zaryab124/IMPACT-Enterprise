export type SentimentLabel = "positive" | "neutral" | "negative" | "urgent";

export interface DiarizedTurn {
  speaker: "user" | "agent";
  speakerName?: string;
  text: string;
  timestamp: string;
  sentiment?: SentimentLabel;
}

export interface SentimentScore {
  score: number; // -1.00 to 1.00
  label: SentimentLabel;
}

export interface ActionItem {
  task: string;
  owner: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

export interface BANTInsights {
  budget?: string;
  authority?: string;
  need?: string;
  timeline?: string;
  score?: number;
  readiness?: "cold" | "warm" | "qualified" | "ready_for_proposal";
}

export interface CallAnalysisResult {
  id?: string;
  voiceSessionId: string;
  conversationId?: string | null;
  customerId?: string | null;
  durationSeconds: number;
  recordingUrl?: string | null;
  consentGranted: boolean;
  overallSentiment: SentimentLabel;
  sentimentScore: number;
  executiveSummary: string;
  actionItems: ActionItem[];
  keyTopics: string[];
  bantInsights: BANTInsights;
  diarizedTranscript: DiarizedTurn[];
  isMock: boolean;
}
