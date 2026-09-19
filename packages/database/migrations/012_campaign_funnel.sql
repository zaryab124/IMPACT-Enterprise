-- ==============================================================================
-- IMPACT Growth OS: Phase 13 Campaign Funnel & Attribution Schema
-- Migration: 012_campaign_funnel
-- ==============================================================================

ALTER TABLE crm_campaigns ADD COLUMN IF NOT EXISTS objective VARCHAR(50) DEFAULT 'GENERATE_LEADS';
ALTER TABLE crm_campaigns ADD COLUMN IF NOT EXISTS target_audience VARCHAR(255);
ALTER TABLE crm_campaigns ADD COLUMN IF NOT EXISTS platforms JSONB NOT NULL DEFAULT '["linkedin"]'::jsonb;
ALTER TABLE crm_campaigns ADD COLUMN IF NOT EXISTS landing_page VARCHAR(255);
ALTER TABLE crm_campaigns ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100) DEFAULT 'campaign';
ALTER TABLE crm_campaigns ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS campaign_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES crm_campaigns(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'CLICK', 'LEAD_CREATED', 'LEAD_QUALIFIED', 'DEAL_CREATED', 'DEAL_WON'
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign ON campaign_funnel_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_type ON campaign_funnel_events(event_type);
