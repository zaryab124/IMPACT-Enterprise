import { ChannelType, DeliveryResult, InboundMessage, OutboundMessage, DeliveryStatus } from "../types";

export interface WebhookVerificationRequest {
  query: Record<string, string>;
  headers?: Record<string, string>;
  rawBody?: string;
}

export interface WebhookVerificationResponse {
  isValid: boolean;
  challengeResponse?: string;
  statusCode: number;
  error?: string;
}

export interface ChannelAdapter {
  readonly channelType: ChannelType;
  readonly providerName: string;

  /**
   * Check whether the channel adapter has valid live production API credentials configured
   */
  isConfigured(): boolean;

  /**
   * Send an outbound message through this channel
   * Strictly enforces delivery truth: returns success = false if the provider fails
   */
  send(message: OutboundMessage): Promise<DeliveryResult>;

  /**
   * Parse inbound webhook payload into standardized InboundMessage models
   */
  parseInboundWebhook(payload: unknown, headers?: Record<string, string>): InboundMessage[] | null;

  /**
   * Verify webhook subscription or signature (e.g. Meta verification challenge or HMAC)
   */
  verifyWebhook?(req: WebhookVerificationRequest): WebhookVerificationResponse;

  /**
   * Retrieve real-time delivery receipt status
   */
  getDeliveryStatus?(providerMessageId: string): Promise<DeliveryStatus>;
}
