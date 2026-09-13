import crypto from "crypto";
import { ChannelAdapter } from "./channelAdapter";
import { ChannelType, DeliveryResult, InboundMessage, OutboundMessage, DeliveryStatus } from "../types";
import { logger } from "../../logging/logger";

export class EmailAdapter implements ChannelAdapter {
  public readonly channelType: ChannelType = "email";
  public readonly providerName = "Transactional Email (Resend / SMTP)";

  private apiKey: string | null = null;
  private fromAddress: string;
  private forceFailure = false;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || null;
    this.fromAddress = process.env.EMAIL_FROM || "IMPACT Enterprise <team@impact.enterprise>";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  public setForceFailure(force: boolean): void {
    this.forceFailure = force;
  }

  /**
   * Parse inbound email webhook (e.g. Resend / SendGrid Inbound Parse)
   */
  public parseInboundWebhook(payload: any): InboundMessage[] | null {
    if (!payload || typeof payload !== "object") return null;

    const from = payload.from || payload.sender || payload.envelope?.from;
    const text = payload.text || payload.body || payload.html;
    const messageId = payload.messageId || payload.id || `email_${Date.now()}`;

    if (!from || !text) return null;

    return [
      {
        channel: "email",
        channelMessageId: messageId,
        senderIdentifier: from,
        senderName: payload.name || from.split("@")[0],
        content: text,
        timestamp: new Date().toISOString(),
        metadata: {
          subject: payload.subject,
        },
      },
    ];
  }

  /**
   * Build responsive HTML email template
   */
  private generateHtml(message: OutboundMessage): string {
    const title = message.subject || "IMPACT Enterprise Notification";
    const bodyContent = message.content
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => `<p style="margin: 0 0 16px; line-height: 1.6; color: #334155;">${line}</p>`)
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
    <tr>
      <td style="padding: 28px 36px; background-color: #0f172a; text-align: center;">
        <h1 style="margin:0; font-size: 22px; color: #38bdf8; letter-spacing: -0.5px; font-weight: 700;">IMPACT ENTERPRISE</h1>
        <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">AI Systems & Autonomous Business Automation</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px;">
        <h2 style="margin: 0 0 20px; font-size: 18px; color: #0f172a; font-weight: 600;">${title}</h2>
        ${bodyContent}
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
          <p style="margin: 0;">Have urgent questions? Reach our engineering team directly on WhatsApp at <a href="https://wa.me/96181221829" style="color: #0284c7; text-decoration: underline;">+961 81 221 829</a>.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 36px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} IMPACT Technologies Enterprise. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Send outbound transactional email
   */
  public async send(message: OutboundMessage): Promise<DeliveryResult> {
    const startTime = Date.now();
    const deliveryId = crypto.randomUUID();
    const subject = message.subject || "Message from IMPACT Enterprise";

    // Failure simulation
    if (
      this.forceFailure ||
      message.recipientIdentifier.includes("fail@") ||
      message.recipientIdentifier.includes("invalid-domain")
    ) {
      const latencyMs = Date.now() - startTime;
      logger.warn(`Email delivery failed (Forced / Simulated Provider Outage): to=${message.recipientIdentifier}`, {
        module: "EmailAdapter",
      });
      return {
        success: false,
        deliveryId,
        provider: this.providerName,
        status: "failed",
        error: "SMTP Provider Rejected: 550 Mailbox unavailable (Simulated Failure)",
        timestamp: new Date().toISOString(),
        latencyMs,
        isMock: true,
      };
    }

    // LIVE RESEND API DISPATCH
    if (this.isConfigured()) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.fromAddress,
            to: [message.recipientIdentifier],
            subject,
            text: message.content,
            html: this.generateHtml(message),
          }),
        });

        const latencyMs = Date.now() - startTime;
        const resJson = await res.json();

        if (!res.ok) {
          const errMsg = resJson.message || `Resend API error HTTP ${res.status}`;
          logger.error(`Transactional email failed: ${errMsg}`, resJson, { module: "EmailAdapter" });
          return {
            success: false,
            deliveryId,
            provider: this.providerName,
            status: "failed",
            error: errMsg,
            timestamp: new Date().toISOString(),
            latencyMs,
            isMock: false,
          };
        }

        const providerMessageId = resJson.id || `re_${deliveryId}`;
        logger.info(`Transactional email sent via Resend API: ID=${providerMessageId}`, {
          module: "EmailAdapter",
        });

        return {
          success: true,
          deliveryId,
          provider: this.providerName,
          providerMessageId,
          status: "delivered",
          timestamp: new Date().toISOString(),
          latencyMs,
          isMock: false,
        };
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        logger.error(`Network error connecting to Resend API: ${err.message}`, err, { module: "EmailAdapter" });
        return {
          success: false,
          deliveryId,
          provider: this.providerName,
          status: "failed",
          error: `Network failure: ${err.message}`,
          timestamp: new Date().toISOString(),
          latencyMs,
          isMock: false,
        };
      }
    }

    // DEVELOPMENT MOCK SIMULATOR
    const latencyMs = Date.now() - startTime;
    const mockEmailId = `re_mock_${deliveryId.slice(0, 12)}`;

    logger.info(
      `[DEVELOPMENT MOCK: Email Provider] Transactional email dispatched to ${message.recipientIdentifier}: Subject="${subject}"`,
      {
        module: "EmailAdapter",
        data: {
          recipient: message.recipientIdentifier,
          subject,
          mockEmailId,
        },
      }
    );

    return {
      success: true,
      deliveryId,
      provider: "Transactional Email Provider (Development Simulator)",
      providerMessageId: mockEmailId,
      status: "delivered",
      timestamp: new Date().toISOString(),
      latencyMs,
      isMock: true,
    };
  }

  public async getDeliveryStatus(providerMessageId: string): Promise<DeliveryStatus> {
    if (this.forceFailure) return "failed";
    return "delivered";
  }
}

export const emailAdapter = new EmailAdapter();
