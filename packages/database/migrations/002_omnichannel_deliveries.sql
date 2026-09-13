-- ============================================================================
-- IMPACT ENTERPRISE SCHEMA MIGRATION: 002_omnichannel_deliveries
-- Multi-channel delivery tracking and webhook idempotency
-- ============================================================================

-- 22. Multi-Channel Message Deliveries & Provider Logs
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

-- 23. Inbound Webhook Idempotency Records
CREATE TABLE IF NOT EXISTS webhook_idempotency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL UNIQUE,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_webhook_idempotency_key ON webhook_idempotency(idempotency_key);
