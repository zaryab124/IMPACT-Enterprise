-- ==============================================================================
-- IMPACT Growth OS: Phase 7 Social Media Publishing Accounts Rollback
-- Migration: 008_social_accounts (Rollback)
-- ==============================================================================

ALTER TABLE content_publish_logs DROP COLUMN IF EXISTS social_account_id;
ALTER TABLE content_publish_logs DROP COLUMN IF EXISTS retry_count;
ALTER TABLE content_publish_logs DROP COLUMN IF EXISTS last_attempt_at;
ALTER TABLE content_publish_logs DROP COLUMN IF EXISTS created_at;

DROP TABLE IF EXISTS social_accounts CASCADE;
