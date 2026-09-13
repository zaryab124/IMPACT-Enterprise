import { ChannelAdapter } from "./adapters/channelAdapter";
import { whatsAppAdapter } from "./adapters/whatsAppAdapter";
import { emailAdapter } from "./adapters/emailAdapter";
import { phoneAdapter } from "./adapters/phoneAdapter";
import { webChatAdapter } from "./adapters/webChatAdapter";
import {
  ChannelType,
  DeliveryResult,
  InboundMessage,
  OutboundMessage,
  ChannelStatusSummary,
  ChannelConfig,
} from "./types";
import {
  channelDeliveryRepository,
  ChannelDeliveryRecord,
} from "../database/repositories/channelDeliveryRepository";
import { customerRepository } from "../database/repositories/customerRepository";
import { conversationRepository } from "../database/repositories/conversationRepository";
import { conversationService } from "../ai/conversationService";
import { logger } from "../logging/logger";

export class OmnichannelService {
  private adapters: Map<ChannelType, ChannelAdapter> = new Map();

  constructor() {
    this.registerAdapter(whatsAppAdapter);
    this.registerAdapter(emailAdapter);
    this.registerAdapter(phoneAdapter);
    this.registerAdapter(webChatAdapter);
  }

  public registerAdapter(adapter: ChannelAdapter): void {
    this.adapters.set(adapter.channelType, adapter);
  }

  public getAdapter(channel: ChannelType): ChannelAdapter {
    const adapter = this.adapters.get(channel);
    if (!adapter) {
      throw new Error(`No adapter registered for channel: '${channel}'`);
    }
    return adapter;
  }

  /**
   * Process inbound message across any channel (WhatsApp, Email, Phone/SMS, WebChat)
   * Enforces webhook idempotency, customer resolution, AI turn generation, and automated outbound reply
   */
  public async handleInboundMessage(inbound: InboundMessage): Promise<{
    success: boolean;
    conversationId?: string;
    response?: string;
    deliveryResult?: DeliveryResult;
    isDuplicate?: boolean;
    error?: string;
  }> {
    logger.info(
      `Omnichannel message received on [${inbound.channel}]: from=${inbound.senderIdentifier}, id=${inbound.channelMessageId}`,
      { module: "OmnichannelService" }
    );

    // 1. Idempotency Gate
    const isDuplicate = await channelDeliveryRepository.isWebhookProcessed(
      inbound.channel,
      inbound.channelMessageId
    );
    if (isDuplicate) {
      logger.warn(
        `Duplicate webhook payload suppressed by idempotency gate: channel=${inbound.channel}, id=${inbound.channelMessageId}`,
        { module: "OmnichannelService" }
      );
      return { success: true, isDuplicate: true };
    }

    // Record idempotency key immediately
    await channelDeliveryRepository.recordWebhookProcessed(
      inbound.channel,
      inbound.channelMessageId,
      { timestamp: inbound.timestamp, sender: inbound.senderIdentifier }
    );

    // 2. Customer Resolution / Upsert
    let customer = null;

    if (inbound.channel === "whatsapp" || inbound.channel === "phone_sms") {
      const cleanPhone = inbound.senderIdentifier.replace(/[^0-9+]/g, "");
      customer = await customerRepository.findByPhone(cleanPhone);

      if (!customer) {
        const generatedEmail = `wa-${cleanPhone.replace(/[^0-9]/g, "") || "user"}@whatsapp.impact.enterprise`;
        const displayName = inbound.senderName || `WhatsApp Lead (+${cleanPhone.slice(-4)})`;
        customer = await customerRepository.upsert({
          name: displayName,
          email: generatedEmail,
          phone: cleanPhone,
          source: inbound.channel,
        });
      }
    } else if (inbound.channel === "email") {
      const email = inbound.senderIdentifier.toLowerCase().trim();
      customer = await customerRepository.findByEmail(email);

      if (!customer) {
        const displayName = inbound.senderName || email.split("@")[0];
        customer = await customerRepository.upsert({
          name: displayName,
          email,
          source: "email",
        });
      }
    } else {
      // Web chat or fallback
      customer = await customerRepository.upsert({
        name: inbound.senderName || "Web Visitor",
        email: `guest-${Date.now()}@webchat.impact.enterprise`,
        source: "web_chat",
      });
    }

    // 3. Find or Create Active Conversation
    let conversation = await conversationRepository.findActiveByCustomerAndChannel(
      customer.id,
      inbound.channel
    );

    if (!conversation) {
      conversation = await conversationRepository.create({
        customerId: customer.id,
        channel: inbound.channel,
        metadata: {
          source: inbound.channel,
          initialSenderIdentifier: inbound.senderIdentifier,
          ...inbound.metadata,
        },
      });
      logger.info(`Initiated new [${inbound.channel}] conversation: ID=${conversation.id}`, {
        module: "OmnichannelService",
      });
    }

    // 4. Log Inbound Delivery Record
    await channelDeliveryRepository.create({
      conversationId: conversation.id,
      channel: inbound.channel,
      recipient: "IMPACT Enterprise AI",
      sender: inbound.senderIdentifier,
      direction: "inbound",
      content: inbound.content,
      provider: this.getAdapter(inbound.channel).providerName,
      providerMessageId: inbound.channelMessageId,
      status: "delivered",
      latencyMs: 0,
      metadata: inbound.metadata,
    });

    // 5. Execute Gemini AI Conversation Turn
    const turnResult = await conversationService.processMessage({
      conversationId: conversation.id,
      userMessage: inbound.content,
      channel: inbound.channel,
      customerId: customer.id,
    });

    // 6. Dispatch Outbound Response via Channel Adapter
    let deliveryResult: DeliveryResult | undefined;
    if (turnResult.reply) {
      deliveryResult = await this.sendOutbound({
        channel: inbound.channel,
        recipientIdentifier: inbound.senderIdentifier,
        content: turnResult.reply,
        conversationId: conversation.id,
        subject: `Re: IMPACT Enterprise AI Inquiry`,
        metadata: {
          inReplyTo: inbound.channelMessageId,
        },
      });
    }

    return {
      success: true,
      conversationId: conversation.id,
      response: turnResult.reply,
      deliveryResult,
    };
  }

  /**
   * Send an outbound message across any channel with strict delivery verification
   */
  public async sendOutbound(message: OutboundMessage): Promise<DeliveryResult> {
    const adapter = this.getAdapter(message.channel);
    const startTime = Date.now();

    const res = await adapter.send(message);

    // Hard Gate: Persist delivery record with TRUE status
    const record = await channelDeliveryRepository.create({
      conversationId: message.conversationId,
      channel: message.channel,
      recipient: message.recipientIdentifier,
      sender: message.senderIdentifier || "IMPACT AI",
      direction: "outbound",
      content: message.content,
      provider: res.provider,
      providerMessageId: res.providerMessageId,
      status: res.status,
      errorDetails: res.error,
      latencyMs: res.latencyMs || Date.now() - startTime,
      metadata: message.metadata,
    });

    res.deliveryId = record.id;
    return res;
  }

  /**
   * Retrieve diagnostics and connectivity status for all channels
   */
  public async getChannelDiagnostics(): Promise<ChannelStatusSummary> {
    const configs: ChannelConfig[] = [];

    const channels: ChannelType[] = ["whatsapp", "email", "web_chat", "phone_sms"];
    for (const ch of channels) {
      const adapter = this.getAdapter(ch);
      const isConfigured = adapter.isConfigured();
      configs.push({
        channel: ch,
        enabled: true,
        providerName: adapter.providerName,
        isConfigured,
        isLive: isConfigured,
        statusText: isConfigured
          ? "Connected & Operational (Production Live)"
          : "Development Simulator Active [MOCK]",
      });
    }

    const stats = await channelDeliveryRepository.getDeliveryStats(24);
    const overallRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 100;

    return {
      channels: configs,
      total24hDeliveries: stats.total,
      total24hFailed: stats.failed,
      overallDeliveryRate: overallRate,
    };
  }

  /**
   * List recent deliveries
   */
  public async listRecentDeliveries(limit = 50, channel?: string): Promise<ChannelDeliveryRecord[]> {
    return channelDeliveryRepository.listRecent(limit, channel);
  }
}

export const omnichannelService = new OmnichannelService();
