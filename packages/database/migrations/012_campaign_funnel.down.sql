-- ==============================================================================
-- IMPACT Growth OS: Phase 13 Campaign Funnel & Attribution Rollback
-- Migration: 012_campaign_funnel (Rollback)
-- ==============================================================================

DROP TABLE IF EXISTS campaign_funnel_events CASCADE;

ALTER TABLE crm_campaigns DROP COLUMN IF EXISTS objective;
ALTER TABLE crm_campaigns DROP COLUMN IF EXISTS target_audience;
ALTER TABLE crm_campaigns DROP COLUMN IF EXISTS platforms;
ALTER TABLE crm_campaigns DROP COLUMN IF EXISTS landing_page;
ALTER TABLE crm_campaigns DROP COLUMN IF EXISTS lead_source;
ALTER TABLE crm_campaigns DROP COLUMN IF EXISTS click_count;
