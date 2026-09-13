export type ChannelType = "whatsapp" | "email" | "web_chat" | "phone_sms";

export type DeliveryStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface InboundMessage {
  channel: ChannelType;
  channelMessageId: string;
  senderIdentifier: string; // Phone number or email address
  senderName?: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface OutboundMessage {
  channel: ChannelType;
  recipientIdentifier: string;
  senderIdentifier?: string;
  content: string;
  conversationId?: string;
  subject?: string; // Relevant for email channel
  templateName?: string;
  templateArgs?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  success: boolean;
  deliveryId: string;
  provider: string;
  providerMessageId?: string;
  status: DeliveryStatus;
  error?: string;
  timestamp: string;
  latencyMs: number;
  isMock?: boolean;
}

export interface ChannelConfig {
  channel: ChannelType;
  enabled: boolean;
  providerName: string;
  isConfigured: boolean;
  isLive: boolean;
  statusText: string;
}

export interface ChannelStatusSummary {
  channels: ChannelConfig[];
  total24hDeliveries: number;
  total24hFailed: number;
  overallDeliveryRate: number;
}
