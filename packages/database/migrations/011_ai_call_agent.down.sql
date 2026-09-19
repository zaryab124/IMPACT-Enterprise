-- ==============================================================================
-- IMPACT Growth OS: Phase 12 AI Call Agent & CRM Voice Rollback
-- Migration: 011_ai_call_agent (Rollback)
-- ==============================================================================

ALTER TABLE crm_calls DROP COLUMN IF EXISTS transcript_turns;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS sentiment;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS service_interest;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS qualification;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS next_action;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS recording_consent;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS disclosure_given;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS escalation_requested;
ALTER TABLE crm_calls DROP COLUMN IF EXISTS escalation_reason;
