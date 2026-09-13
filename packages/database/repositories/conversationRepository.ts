import { db } from "../index";

export interface ConversationRecord {
  id: string;
  customer_id: string;
  channel: string;
  status: string;
  assigned_agent_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "ai_agent" | "human_agent" | "system";
  sender_id: string | null;
  content: string;
  tool_calls: unknown;
  tool_results: unknown;
  created_at: string;
}

export const conversationRepository = {
  async create(data: {
    customerId: string;
    channel: string;
    metadata?: Record<string, unknown>;
  }): Promise<ConversationRecord> {
    const res = await db.query<ConversationRecord>(
      `INSERT INTO conversations (customer_id, channel, metadata)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [data.customerId, data.channel, JSON.stringify(data.metadata || {})]
    );
    return res.rows[0];
  },

  async findById(id: string): Promise<ConversationRecord | null> {
    const res = await db.query<ConversationRecord>(
      "SELECT * FROM conversations WHERE id = $1;",
      [id]
    );
    return res.rows[0] || null;
  },

  async findActiveByCustomerAndChannel(
    customerId: string,
    channel: string
  ): Promise<ConversationRecord | null> {
    const res = await db.query<ConversationRecord>(
      `SELECT * FROM conversations
       WHERE customer_id = $1 AND channel = $2 AND status = 'active'
       ORDER BY updated_at DESC LIMIT 1;`,
      [customerId, channel]
    );
    return res.rows[0] || null;
  },

  async addMessage(data: {
    conversationId: string;
    senderType: "customer" | "ai_agent" | "human_agent" | "system";
    senderId?: string;
    content: string;
    toolCalls?: unknown;
    toolResults?: unknown;
  }): Promise<MessageRecord> {
    const res = await db.query<MessageRecord>(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, content, tool_calls, tool_results)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [
        data.conversationId,
        data.senderType,
        data.senderId || null,
        data.content,
        data.toolCalls ? JSON.stringify(data.toolCalls) : null,
        data.toolResults ? JSON.stringify(data.toolResults) : null,
      ]
    );

    await db.query("UPDATE conversations SET updated_at = NOW() WHERE id = $1;", [
      data.conversationId,
    ]);

    return res.rows[0];
  },

  async getMessages(conversationId: string, limit = 100): Promise<MessageRecord[]> {
    const res = await db.query<MessageRecord>(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2;",
      [conversationId, limit]
    );
    return res.rows;
  },

  async updateStatus(
    id: string,
    status: "active" | "closed" | "human_handoff_requested" | "handed_off",
    assignedAgentId?: string
  ): Promise<ConversationRecord | null> {
    const res = await db.query<ConversationRecord>(
      `UPDATE conversations
       SET status = $1,
           assigned_agent_id = COALESCE($2, assigned_agent_id),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *;`,
      [status, assignedAgentId || null, id]
    );
    return res.rows[0] || null;
  },
};
