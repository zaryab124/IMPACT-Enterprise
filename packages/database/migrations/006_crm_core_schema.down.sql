-- ==============================================================================
-- IMPACT Growth OS: Phase 1 CRM Core Schema Rollback
-- Migration: 006_crm_core_schema (Rollback)
-- ==============================================================================

DROP TABLE IF EXISTS crm_attachments CASCADE;
DROP TABLE IF EXISTS crm_calls CASCADE;
DROP TABLE IF EXISTS crm_messages CASCADE;
DROP TABLE IF EXISTS crm_entity_tags CASCADE;
DROP TABLE IF EXISTS crm_tags CASCADE;
DROP TABLE IF EXISTS crm_notes CASCADE;
DROP TABLE IF EXISTS crm_activities CASCADE;
DROP TABLE IF EXISTS crm_deals CASCADE;
DROP TABLE IF EXISTS crm_pipeline_stages CASCADE;
DROP TABLE IF EXISTS crm_pipelines CASCADE;
DROP TABLE IF EXISTS crm_campaigns CASCADE;
DROP TABLE IF EXISTS crm_lead_sources CASCADE;
DROP TABLE IF EXISTS crm_contacts CASCADE;
DROP TABLE IF EXISTS crm_team_members CASCADE;
DROP TABLE IF EXISTS crm_teams CASCADE;

-- Revert columns added to existing tables
ALTER TABLE appointments DROP COLUMN IF EXISTS deal_id;
ALTER TABLE appointments DROP COLUMN IF EXISTS contact_id;
ALTER TABLE appointments DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE crm_tasks DROP COLUMN IF EXISTS deal_id;
ALTER TABLE crm_tasks DROP COLUMN IF EXISTS contact_id;
ALTER TABLE crm_tasks DROP COLUMN IF EXISTS company_id;
ALTER TABLE crm_tasks DROP COLUMN IF EXISTS updated_by;
ALTER TABLE crm_tasks DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE leads DROP COLUMN IF EXISTS first_name;
ALTER TABLE leads DROP COLUMN IF EXISTS last_name;
ALTER TABLE leads DROP COLUMN IF EXISTS email;
ALTER TABLE leads DROP COLUMN IF EXISTS phone;
ALTER TABLE leads DROP COLUMN IF EXISTS whatsapp;
ALTER TABLE leads DROP COLUMN IF EXISTS company;
ALTER TABLE leads DROP COLUMN IF EXISTS company_id;
ALTER TABLE leads DROP COLUMN IF EXISTS contact_id;
ALTER TABLE leads DROP COLUMN IF EXISTS job_title;
ALTER TABLE leads DROP COLUMN IF EXISTS country;
ALTER TABLE leads DROP COLUMN IF EXISTS city;
ALTER TABLE leads DROP COLUMN IF EXISTS website;
ALTER TABLE leads DROP COLUMN IF EXISTS source;
ALTER TABLE leads DROP COLUMN IF EXISTS campaign;
ALTER TABLE leads DROP COLUMN IF EXISTS service_interest;
ALTER TABLE leads DROP COLUMN IF EXISTS lead_status;
ALTER TABLE leads DROP COLUMN IF EXISTS lead_score;
ALTER TABLE leads DROP COLUMN IF EXISTS assigned_salesperson;
ALTER TABLE leads DROP COLUMN IF EXISTS last_contacted;
ALTER TABLE leads DROP COLUMN IF EXISTS next_follow_up;
ALTER TABLE leads DROP COLUMN IF EXISTS notes;
ALTER TABLE leads DROP COLUMN IF EXISTS created_by;
ALTER TABLE leads DROP COLUMN IF EXISTS updated_by;
ALTER TABLE leads DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE companies DROP COLUMN IF EXISTS address;
ALTER TABLE companies DROP COLUMN IF EXISTS city;
ALTER TABLE companies DROP COLUMN IF EXISTS country;
ALTER TABLE companies DROP COLUMN IF EXISTS phone;
ALTER TABLE companies DROP COLUMN IF EXISTS email;
ALTER TABLE companies DROP COLUMN IF EXISTS domain;
ALTER TABLE companies DROP COLUMN IF EXISTS annual_revenue;
ALTER TABLE companies DROP COLUMN IF EXISTS employee_count;
ALTER TABLE companies DROP COLUMN IF EXISTS assigned_to;
ALTER TABLE companies DROP COLUMN IF EXISTS created_by;
ALTER TABLE companies DROP COLUMN IF EXISTS updated_by;
ALTER TABLE companies DROP COLUMN IF EXISTS deleted_at;

ALTER TABLE users DROP COLUMN IF EXISTS team_id;
