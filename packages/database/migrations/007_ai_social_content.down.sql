-- ==============================================================================
-- IMPACT Growth OS: Phase 5 AI Social Media Content Rollback
-- Migration: 007_ai_social_content (Rollback)
-- ==============================================================================

ALTER TABLE content_posts DROP COLUMN IF EXISTS platform;
ALTER TABLE content_posts DROP COLUMN IF EXISTS format;
ALTER TABLE content_posts DROP COLUMN IF EXISTS objective;
ALTER TABLE content_posts DROP COLUMN IF EXISTS hook;
ALTER TABLE content_posts DROP COLUMN IF EXISTS cta;
ALTER TABLE content_posts DROP COLUMN IF EXISTS hashtags;
ALTER TABLE content_posts DROP COLUMN IF EXISTS visual_brief;
ALTER TABLE content_posts DROP COLUMN IF EXISTS target_audience;
ALTER TABLE content_posts DROP COLUMN IF EXISTS service;
ALTER TABLE content_posts DROP COLUMN IF EXISTS campaign;
ALTER TABLE content_posts DROP COLUMN IF EXISTS brand_check;
