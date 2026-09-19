-- ==============================================================================
-- IMPACT Growth OS: Phase 5 AI Social Media Content Schema
-- Migration: 007_ai_social_content
-- ==============================================================================

ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS platform VARCHAR(50) DEFAULT 'linkedin';
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS format VARCHAR(50) DEFAULT 'post';
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS objective VARCHAR(50) DEFAULT 'EDUCATE';
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS hook TEXT;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS cta TEXT;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS hashtags JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS visual_brief TEXT;
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS target_audience VARCHAR(255);
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS service VARCHAR(100);
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS campaign VARCHAR(255);
ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS brand_check JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_content_posts_platform ON content_posts(platform);
CREATE INDEX IF NOT EXISTS idx_content_posts_service ON content_posts(service);
CREATE INDEX IF NOT EXISTS idx_content_posts_objective ON content_posts(objective);
