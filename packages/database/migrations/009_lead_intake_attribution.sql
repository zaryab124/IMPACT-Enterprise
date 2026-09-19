-- ==============================================================================
-- IMPACT Growth OS: Phase 8 Lead Intake & Attribution Schema
-- Migration: 009_lead_intake_attribution
-- ==============================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_page VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referrer VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS attribution_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_duplicate_merge BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure all 10 canonical lead sources are registered
INSERT INTO crm_lead_sources (id, name, is_active)
VALUES
  ('website', 'Website', TRUE),
  ('contact_form', 'Contact form', TRUE),
  ('social_media', 'Social media', TRUE),
  ('campaign', 'Campaign', TRUE),
  ('landing_page', 'Landing page', TRUE),
  ('whatsapp', 'WhatsApp', TRUE),
  ('email', 'Email', TRUE),
  ('manual_entry', 'Manual entry', TRUE),
  ('referral', 'Referral', TRUE),
  ('advertisement', 'Advertisement', TRUE)
ON CONFLICT (id) DO NOTHING;
