-- ============================================================================
-- IMPACT ENTERPRISE SCHEMA MIGRATION: 004_voice_intelligence
-- Voice call recordings, speaker diarization, sentiment & conversation intelligence
-- ============================================================================

-- 25. Voice Call Recordings & Conversation Intelligence
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_session_id VARCHAR(100) NOT NULL REFERENCES voice_sessions(session_id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  recording_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  consent_granted BOOLEAN NOT NULL DEFAULT TRUE,
  overall_sentiment VARCHAR(20) NOT NULL DEFAULT 'neutral',
  sentiment_score NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
  executive_summary TEXT,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  bant_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  diarized_transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_recordings_voice_session ON call_recordings(voice_session_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_conversation ON call_recordings(conversation_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_customer ON call_recordings(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_sentiment ON call_recordings(overall_sentiment);
CREATE INDEX IF NOT EXISTS idx_call_recordings_created_at ON call_recordings(created_at);
