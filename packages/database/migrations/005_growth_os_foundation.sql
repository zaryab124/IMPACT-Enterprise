-- ==============================================================================
-- IMPACT Growth OS: Phase 0 Foundation Schema Migration
-- Migration: 005_growth_os_foundation
-- ==============================================================================

-- 1. Growth OS Module Registry
CREATE TABLE IF NOT EXISTS growth_os_modules (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  suite VARCHAR(50) NOT NULL, -- 'marketing', 'revenue', 'operations'
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  min_permission VARCHAR(100) NOT NULL DEFAULT 'dashboard:view',
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_growth_os_modules_suite ON growth_os_modules(suite);
CREATE INDEX IF NOT EXISTS idx_growth_os_modules_sort ON growth_os_modules(sort_order);

-- 2. Strategic Marketing Campaigns
CREATE TABLE IF NOT EXISTS content_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  target_service VARCHAR(100), -- AI models, AI agents, AI automation, etc.
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'draft', 'active', 'completed', 'archived'
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_campaigns_status ON content_campaigns(status);

-- 3. Social Media Content & Posts (Marketing Suite)
CREATE TABLE IF NOT EXISTS content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES content_campaigns(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_platforms JSONB NOT NULL DEFAULT '["linkedin"]'::jsonb, -- ['linkedin', 'twitter_x', 'facebook', 'instagram', 'youtube']
  post_type VARCHAR(50) NOT NULL DEFAULT 'social_post', -- 'social_post', 'article', 'case_study_blurb'
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'REJECTED'
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  ai_model VARCHAR(100), -- e.g. 'gemini-2.5-flash'
  ai_prompt TEXT,
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_posts_status ON content_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_campaign ON content_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_scheduled ON content_posts(scheduled_at);

-- 4. Content Review & Approval Audit
CREATE TABLE IF NOT EXISTS content_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL, -- 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED'
  feedback TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_approvals_post ON content_approvals(post_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_reviewer ON content_approvals(reviewer_id);

-- 5. Multi-Channel Social Publishing Execution Logs
CREATE TABLE IF NOT EXISTS content_publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'published', 'failed'
  provider_post_id VARCHAR(255),
  error_message TEXT,
  idempotency_key VARCHAR(255) UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_content_publish_logs_post ON content_publish_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_content_publish_logs_platform ON content_publish_logs(platform);

-- 6. Operational Tasks & Reminders (Operations Suite)
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned_to ON crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_lead ON crm_tasks(lead_id);

-- 7. Automated Lead Follow-up Sequences (Revenue Suite)
CREATE TABLE IF NOT EXISTS lead_followup_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL DEFAULT 1,
  channel VARCHAR(50) NOT NULL DEFAULT 'email', -- 'email', 'whatsapp', 'sms'
  trigger_condition VARCHAR(100) NOT NULL DEFAULT 'no_response_24h',
  delay_hours INTEGER NOT NULL DEFAULT 24,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'cancelled', 'skipped'
  content_template TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_followup_lead ON lead_followup_sequences(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_followup_scheduled ON lead_followup_sequences(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_lead_followup_status ON lead_followup_sequences(status);
