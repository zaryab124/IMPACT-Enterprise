-- ==============================================================================
-- IMPACT Growth OS: Phase 9 AI Lead Qualification Schema
-- Migration: 010_lead_qualification
-- ==============================================================================

CREATE TABLE IF NOT EXISTS lead_qualification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  model VARCHAR(100) NOT NULL,
  input_snapshot JSONB NOT NULL,
  lead_score INTEGER NOT NULL,
  qualification_status VARCHAR(50) NOT NULL, -- UNQUALIFIED, POTENTIAL, QUALIFIED, HIGH_INTENT
  service_match VARCHAR(100),
  urgency VARCHAR(50) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
  recommended_next_action TEXT NOT NULL,
  reasoning_summary TEXT NOT NULL,
  confidence NUMERIC(5, 2),
  is_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  overridden_status VARCHAR(50),
  overridden_score INTEGER,
  overridden_by UUID REFERENCES users(id) ON DELETE SET NULL,
  override_reason TEXT,
  overridden_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qualification_lead ON lead_qualification_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_qualification_status ON lead_qualification_history(qualification_status);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS qualification_urgency VARCHAR(50) DEFAULT 'MEDIUM';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS recommended_next_action TEXT;
