-- ============================================================================
-- IMPACT ENTERPRISE SCHEMA MIGRATION: 003_voice_sessions
-- Real-time voice agent sessions, audio telemetry, and speech turn metrics
-- ============================================================================

-- 24. Real-time Gemini Live Voice Sessions
CREATE TABLE IF NOT EXISTS voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL UNIQUE,
  model VARCHAR(100) NOT NULL DEFAULT 'gemini-3.1-flash-live-preview',
  voice_name VARCHAR(50) NOT NULL DEFAULT 'Puck',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  turns_count INTEGER DEFAULT 0,
  interruptions_count INTEGER DEFAULT 0,
  latency_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_conversation ON voice_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_session_id ON voice_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_status ON voice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created_at ON voice_sessions(created_at);
