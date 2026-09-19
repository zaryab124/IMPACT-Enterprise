-- ==============================================================================
-- IMPACT Growth OS: Phase 8 Lead Intake & Attribution Rollback
-- Migration: 009_lead_intake_attribution (Rollback)
-- ==============================================================================

ALTER TABLE leads DROP COLUMN IF EXISTS landing_page;
ALTER TABLE leads DROP COLUMN IF EXISTS referrer;
ALTER TABLE leads DROP COLUMN IF EXISTS attribution_metadata;
ALTER TABLE leads DROP COLUMN IF EXISTS is_duplicate_merge;
