import { db } from "../index";
import { logger } from "../../logging/logger";

export interface VoiceSessionRecord {
  id: string;
  conversation_id: string | null;
  session_id: string;
  model: string;
  voice_name: string;
  status: "active" | "completed" | "interrupted" | "error";
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  turns_count: number;
  interruptions_count: number;
  latency_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface VoiceSessionStats {
  totalSessions: number;
  completedSessions: number;
  activeSessions: number;
  totalDurationSeconds: number;
  averageLatencyMs: number;
  totalTurns: number;
  totalInterruptions: number;
}

export const voiceSessionRepository = {
  /**
   * Ensure table exists for development and testing environments
   */
  async ensureTable(): Promise<void> {
    const ddl = `
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
    `;
    await db.exec(ddl);
  },

  /**
   * Record a new voice session
   */
  async create(data: {
    sessionId: string;
    conversationId?: string | null;
    model?: string;
    voiceName?: string;
    metadata?: Record<string, unknown>;
  }): Promise<VoiceSessionRecord> {
    await this.ensureTable();

    const res = await db.query<VoiceSessionRecord>(
      `INSERT INTO voice_sessions (
        session_id, conversation_id, model, voice_name, metadata
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;`,
      [
        data.sessionId,
        data.conversationId || null,
        data.model || "gemini-3.1-flash-live-preview",
        data.voiceName || "Puck",
        JSON.stringify(data.metadata || {}),
      ]
    );

    return res.rows[0];
  },

  /**
   * Find voice session by session ID
   */
  async findBySessionId(sessionId: string): Promise<VoiceSessionRecord | null> {
    await this.ensureTable();
    const res = await db.query<VoiceSessionRecord>(
      "SELECT * FROM voice_sessions WHERE session_id = $1 LIMIT 1;",
      [sessionId]
    );
    return res.rows[0] || null;
  },

  /**
   * Update voice session status and telemetry metrics
   */
  async update(
    sessionId: string,
    data: {
      status?: "active" | "completed" | "interrupted" | "error";
      durationSeconds?: number;
      turnsCount?: number;
      interruptionsCount?: number;
      latencyMs?: number;
      endedAt?: string | null;
      metadata?: Record<string, unknown>;
    }
  ): Promise<VoiceSessionRecord | null> {
    await this.ensureTable();

    const existing = await this.findBySessionId(sessionId);
    if (!existing) {
      return null;
    }

    const mergedMetadata = {
      ...(existing.metadata || {}),
      ...(data.metadata || {}),
    };

    const res = await db.query<VoiceSessionRecord>(
      `UPDATE voice_sessions
       SET status = COALESCE($1, status),
           duration_seconds = COALESCE($2, duration_seconds),
           turns_count = COALESCE($3, turns_count),
           interruptions_count = COALESCE($4, interruptions_count),
           latency_ms = COALESCE($5, latency_ms),
           ended_at = CASE WHEN $6::timestamptz IS NOT NULL THEN $6::timestamptz ELSE ended_at END,
           metadata = $7,
           updated_at = NOW()
       WHERE session_id = $8
       RETURNING *;`,
      [
        data.status || null,
        data.durationSeconds !== undefined ? data.durationSeconds : null,
        data.turnsCount !== undefined ? data.turnsCount : null,
        data.interruptionsCount !== undefined ? data.interruptionsCount : null,
        data.latencyMs !== undefined ? data.latencyMs : null,
        data.endedAt || null,
        JSON.stringify(mergedMetadata),
        sessionId,
      ]
    );

    return res.rows[0] || null;
  },

  /**
   * List recent voice sessions
   */
  async listRecent(limit = 20): Promise<VoiceSessionRecord[]> {
    await this.ensureTable();
    const res = await db.query<VoiceSessionRecord>(
      "SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT $1;",
      [limit]
    );
    return res.rows;
  },

  /**
   * Get aggregate voice metrics for dashboard telemetry
   */
  async getStats(): Promise<VoiceSessionStats> {
    await this.ensureTable();

    const res = await db.query<{
      total: string;
      completed: string;
      active: string;
      total_duration: string;
      avg_latency: string;
      total_turns: string;
      total_interruptions: string;
    }>(`
      SELECT 
        COUNT(*)::text AS total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::text AS completed,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::text AS active,
        COALESCE(SUM(duration_seconds), 0)::text AS total_duration,
        COALESCE(AVG(latency_ms), 0)::text AS avg_latency,
        COALESCE(SUM(turns_count), 0)::text AS total_turns,
        COALESCE(SUM(interruptions_count), 0)::text AS total_interruptions
      FROM voice_sessions;
    `);

    const row = res.rows[0];
    return {
      totalSessions: parseInt(row?.total || "0", 10),
      completedSessions: parseInt(row?.completed || "0", 10),
      activeSessions: parseInt(row?.active || "0", 10),
      totalDurationSeconds: parseInt(row?.total_duration || "0", 10),
      averageLatencyMs: Math.round(parseFloat(row?.avg_latency || "0")),
      totalTurns: parseInt(row?.total_turns || "0", 10),
      totalInterruptions: parseInt(row?.total_interruptions || "0", 10),
    };
  },
};
