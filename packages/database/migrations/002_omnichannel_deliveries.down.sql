-- Revert 002_omnichannel_deliveries
DROP TABLE IF EXISTS webhook_idempotency CASCADE;
DROP TABLE IF EXISTS channel_deliveries CASCADE;
