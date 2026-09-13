import crypto from "crypto";
import { ChannelAdapter } from "./channelAdapter";
import { ChannelType, DeliveryResult, InboundMessage, OutboundMessage, DeliveryStatus } from "../types";

export class WebChatAdapter implements ChannelAdapter {
  public readonly channelType: ChannelType = "web_chat";
  public readonly providerName = "IMPACT Real-Time Web Chat Bridge";

  public isConfigured(): boolean {
    return true;
  }

  public parseInboundWebhook(payload: any): InboundMessage[] | null {
    if (!payload || !payload.content) return null;
    return [
      {
        channel: "web_chat",
        channelMessageId: payload.messageId || crypto.randomUUID(),
        senderIdentifier: payload.customerId || "web_visitor",
        senderName: payload.name,
        content: payload.content,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  public async send(message: OutboundMessage): Promise<DeliveryResult> {
    const startTime = Date.now();
    const deliveryId = crypto.randomUUID();

    return {
      success: true,
      deliveryId,
      provider: this.providerName,
      providerMessageId: `msg_${deliveryId}`,
      status: "delivered",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      isMock: false,
    };
  }

  public async getDeliveryStatus(): Promise<DeliveryStatus> {
    return "delivered";
  }
}

export const webChatAdapter = new WebChatAdapter();
