-- ==============================================================================
-- IMPACT Growth OS: Phase 0 Foundation Schema Rollback
-- Migration: 005_growth_os_foundation (Rollback)
-- ==============================================================================

DROP TABLE IF EXISTS lead_followup_sequences CASCADE;
DROP TABLE IF EXISTS crm_tasks CASCADE;
DROP TABLE IF EXISTS content_publish_logs CASCADE;
DROP TABLE IF EXISTS content_approvals CASCADE;
DROP TABLE IF EXISTS content_posts CASCADE;
DROP TABLE IF EXISTS content_campaigns CASCADE;
DROP TABLE IF EXISTS growth_os_modules CASCADE;
