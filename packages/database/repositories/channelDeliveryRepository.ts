import { db } from "../index";
import { ChannelType, DeliveryStatus } from "../../omnichannel/types";
import { logger } from "../../logging/logger";

export interface ChannelDeliveryRecord {
  id: string;
  conversation_id: string | null;
  channel: ChannelType;
  recipient: string;
  sender: string | null;
  direction: "inbound" | "outbound";
  content: string;
  provider: string;
  provider_message_id: string | null;
  status: DeliveryStatus;
  error_details: string | null;
  latency_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateDeliveryParams {
  conversationId?: string;
  channel: ChannelType;
  recipient: string;
  sender?: string;
  direction?: "inbound" | "outbound";
  content: string;
  provider: string;
  providerMessageId?: string;
  status?: DeliveryStatus;
  errorDetails?: string;
  latencyMs?: number;
  metadata?: Record<string, unknown>;
}

export class ChannelDeliveryRepository {
  private tablesEnsured = false;

  private async ensureTables(): Promise<void> {
    if (this.tablesEnsured) return;
    try {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS channel_deliveries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
          channel VARCHAR(50) NOT NULL,
          recipient VARCHAR(255) NOT NULL,
          sender VARCHAR(255),
          direction VARCHAR(20) NOT NULL DEFAULT 'outbound',
          content TEXT NOT NULL,
          provider VARCHAR(100) NOT NULL,
          provider_message_id VARCHAR(255),
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          error_details TEXT,
          latency_ms INTEGER,
          metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_channel_deliveries_conversation ON channel_deliveries(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_channel_deliveries_channel ON channel_deliveries(channel);
        CREATE INDEX IF NOT EXISTS idx_channel_deliveries_status ON channel_deliveries(status);
        CREATE INDEX IF NOT EXISTS idx_channel_deliveries_provider_msg ON channel_deliveries(provider_message_id);
        CREATE INDEX IF NOT EXISTS idx_channel_deliveries_created_at ON channel_deliveries(created_at);

        CREATE TABLE IF NOT EXISTS webhook_idempotency (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          provider VARCHAR(50) NOT NULL,
          idempotency_key VARCHAR(255) NOT NULL UNIQUE,
          processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          response_payload JSONB
        );

        CREATE INDEX IF NOT EXISTS idx_webhook_idempotency_key ON webhook_idempotency(idempotency_key);
      `);
      this.tablesEnsured = true;
    } catch (err: any) {
      logger.warn(`Failed to ensure channel_deliveries tables: ${err.message}`, {
        module: "ChannelDeliveryRepository",
      });
    }
  }

  /**
   * Record a new message delivery attempt
   */
  public async create(data: CreateDeliveryParams): Promise<ChannelDeliveryRecord> {
    await this.ensureTables();
    const result = await db.query<ChannelDeliveryRecord>(
      `INSERT INTO channel_deliveries (
        conversation_id,
        channel,
        recipient,
        sender,
        direction,
        content,
        provider,
        provider_message_id,
        status,
        error_details,
        latency_ms,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;`,
      [
        data.conversationId || null,
        data.channel,
        data.recipient,
        data.sender || null,
        data.direction || "outbound",
        data.content,
        data.provider,
        data.providerMessageId || null,
        data.status || "pending",
        data.errorDetails || null,
        data.latencyMs ?? null,
        JSON.stringify(data.metadata || {}),
      ]
    );

    return result.rows[0];
  }

  /**
   * Update message delivery status
   */
  public async updateStatus(
    id: string,
    status: DeliveryStatus,
    details?: { errorDetails?: string; providerMessageId?: string; latencyMs?: number }
  ): Promise<ChannelDeliveryRecord | null> {
    await this.ensureTables();
    const result = await db.query<ChannelDeliveryRecord>(
      `UPDATE channel_deliveries
       SET status = $1,
           error_details = COALESCE($2, error_details),
           provider_message_id = COALESCE($3, provider_message_id),
           latency_ms = COALESCE($4, latency_ms),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *;`,
      [
        status,
        details?.errorDetails || null,
        details?.providerMessageId || null,
        details?.latencyMs ?? null,
        id,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Query delivery by provider message ID
   */
  public async findByProviderMessageId(providerMessageId: string): Promise<ChannelDeliveryRecord | null> {
    await this.ensureTables();
    const result = await db.query<ChannelDeliveryRecord>(
      `SELECT * FROM channel_deliveries WHERE provider_message_id = $1 LIMIT 1;`,
      [providerMessageId]
    );
    return result.rows[0] || null;
  }

  /**
   * List recent deliveries
   */
  public async listRecent(limit = 50, channel?: string): Promise<ChannelDeliveryRecord[]> {
    await this.ensureTables();
    let query = `SELECT * FROM channel_deliveries`;
    const params: any[] = [];

    if (channel && channel !== "all") {
      params.push(channel);
      query += ` WHERE channel = $${params.length}`;
    }

    params.push(limit);
    query += ` ORDER BY created_at DESC LIMIT $${params.length};`;

    const result = await db.query<ChannelDeliveryRecord>(query, params);
    return result.rows;
  }

  /**
   * Aggregate delivery statistics
   */
  public async getDeliveryStats(hours = 24): Promise<{
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  }> {
    await this.ensureTables();
    const result = await db.query<{
      total: string;
      delivered: string;
      failed: string;
      pending: string;
    }>(
      `SELECT
        COUNT(*)::text as total,
        COUNT(CASE WHEN status IN ('delivered', 'read', 'sent') THEN 1 END)::text as delivered,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::text as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::text as pending
       FROM channel_deliveries
       WHERE created_at >= NOW() - INTERVAL '1 hour' * $1;`,
      [hours]
    );

    const row = result.rows[0];
    return {
      total: parseInt(row?.total || "0", 10),
      delivered: parseInt(row?.delivered || "0", 10),
      failed: parseInt(row?.failed || "0", 10),
      pending: parseInt(row?.pending || "0", 10),
    };
  }

  /**
   * Check if a webhook idempotency key has already been processed
   */
  public async isWebhookProcessed(provider: string, idempotencyKey: string): Promise<boolean> {
    await this.ensureTables();
    const result = await db.query(
      `SELECT id FROM webhook_idempotency WHERE provider = $1 AND idempotency_key = $2 LIMIT 1;`,
      [provider, idempotencyKey]
    );
    return result.rows.length > 0;
  }

  /**
   * Mark a webhook as processed
   */
  public async recordWebhookProcessed(
    provider: string,
    idempotencyKey: string,
    responsePayload?: any
  ): Promise<void> {
    await this.ensureTables();
    await db.query(
      `INSERT INTO webhook_idempotency (provider, idempotency_key, response_payload)
       VALUES ($1, $2, $3)
       ON CONFLICT (idempotency_key) DO NOTHING;`,
      [provider, idempotencyKey, responsePayload ? JSON.stringify(responsePayload) : null]
    );
  }
}

export const channelDeliveryRepository = new ChannelDeliveryRepository();
