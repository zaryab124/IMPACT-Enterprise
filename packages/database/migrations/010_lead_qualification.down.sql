-- ==============================================================================
-- IMPACT Growth OS: Phase 9 AI Lead Qualification Rollback
-- Migration: 010_lead_qualification (Rollback)
-- ==============================================================================

ALTER TABLE leads DROP COLUMN IF EXISTS qualification_urgency;
ALTER TABLE leads DROP COLUMN IF EXISTS recommended_next_action;

DROP TABLE IF EXISTS lead_qualification_history CASCADE;
