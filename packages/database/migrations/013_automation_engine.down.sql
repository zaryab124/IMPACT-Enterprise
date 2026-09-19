-- ==============================================================================
-- IMPACT Growth OS: Phase 15 Event-Based Automation Engine Rollback
-- Migration: 013_automation_engine (Rollback)
-- ==============================================================================

DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
