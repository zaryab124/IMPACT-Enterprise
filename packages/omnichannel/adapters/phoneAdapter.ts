import crypto from "crypto";
import { ChannelAdapter } from "./channelAdapter";
import { ChannelType, DeliveryResult, InboundMessage, OutboundMessage, DeliveryStatus } from "../types";
import { logger } from "../../logging/logger";

export class PhoneAdapter implements ChannelAdapter {
  public readonly channelType: ChannelType = "phone_sms";
  public readonly providerName = "Telephony & SMS Gateway (Twilio / Carrier SIP)";

  private forceFailure = false;

  public isConfigured(): boolean {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  }

  public setForceFailure(force: boolean): void {
    this.forceFailure = force;
  }

  public getDirectDialUri(): string {
    return "tel:+96181221829";
  }

  public getWhatsAppDirectUri(): string {
    return "https://wa.me/96181221829";
  }

  public parseInboundWebhook(payload: any): InboundMessage[] | null {
    if (!payload || typeof payload !== "object") return null;
    const from = payload.From || payload.from;
    const body = payload.Body || payload.body || payload.text;
    const sid = payload.MessageSid || payload.SmsMessageSid || `sms_${Date.now()}`;

    if (!from || !body) return null;

    return [
      {
        channel: "phone_sms",
        channelMessageId: sid,
        senderIdentifier: from,
        content: body,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  public async send(message: OutboundMessage): Promise<DeliveryResult> {
    const startTime = Date.now();
    const deliveryId = crypto.randomUUID();
    const cleanedRecipient = message.recipientIdentifier.replace(/[^0-9+]/g, "");

    if (this.forceFailure || cleanedRecipient === "+10000000000") {
      const latencyMs = Date.now() - startTime;
      return {
        success: false,
        deliveryId,
        provider: this.providerName,
        status: "failed",
        error: "Carrier network failure: SMS rejected (Simulated)",
        timestamp: new Date().toISOString(),
        latencyMs,
        isMock: true,
      };
    }

    const latencyMs = Date.now() - startTime;
    const mockSid = `SM_${deliveryId.slice(0, 16)}`;

    logger.info(
      `[DEVELOPMENT MOCK: Phone / SMS Gateway] SMS alert sent to ${cleanedRecipient}: "${message.content.slice(0, 50)}..."`,
      {
        module: "PhoneAdapter",
        data: { recipient: cleanedRecipient, sid: mockSid },
      }
    );

    return {
      success: true,
      deliveryId,
      provider: "Carrier SMS Gateway (Development Simulator)",
      providerMessageId: mockSid,
      status: "delivered",
      timestamp: new Date().toISOString(),
      latencyMs,
      isMock: true,
    };
  }

  public async getDeliveryStatus(): Promise<DeliveryStatus> {
    return this.forceFailure ? "failed" : "delivered";
  }
}

export const phoneAdapter = new PhoneAdapter();
