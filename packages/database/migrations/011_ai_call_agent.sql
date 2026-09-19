-- ==============================================================================
-- IMPACT Growth OS: Phase 12 AI Call Agent & CRM Voice Schema
-- Migration: 011_ai_call_agent
-- ==============================================================================

ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS transcript_turns JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50);
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS service_interest VARCHAR(100);
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS qualification JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS next_action TEXT;
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS recording_consent BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS disclosure_given BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS escalation_requested BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE crm_calls ADD COLUMN IF NOT EXISTS escalation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_calls_lead ON crm_calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_calls_status ON crm_calls(status);
