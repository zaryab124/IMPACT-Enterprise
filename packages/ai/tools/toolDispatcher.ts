import { ToolExecutionContext, ToolExecutionResult } from "./types";
import { toolHandlers } from "./handlers";
import { db } from "../../database";
import { logger } from "../../logging/logger";

export class ToolDispatcher {
  /**
   * Execute an AI tool call with schema validation, latency measurement, and DB audit logging
   */
  public async executeTool(
    toolName: string,
    args: unknown,
    context: ToolExecutionContext = {}
  ): Promise<ToolExecutionResult> {
    const start = Date.now();
    logger.info(`Dispatching AI tool: '${toolName}'`, { module: "ToolDispatcher" });

    try {
      let data: unknown;

      switch (toolName) {
        case "captureLead":
          data = await toolHandlers.captureLead(args, context);
          break;
        case "lookupService":
          data = await toolHandlers.lookupService(args);
          break;
        case "queryCaseStudy":
          data = await toolHandlers.queryCaseStudy(args);
          break;
        case "checkAppointmentAvailability":
          data = await toolHandlers.checkAppointmentAvailability(args);
          break;
        case "bookAppointment":
          data = await toolHandlers.bookAppointment(args, context);
          break;
        case "triggerHumanHandoff":
          data = await toolHandlers.triggerHumanHandoff(args, context);
          break;
        default:
          throw new Error(`Unknown tool name: '${toolName}'`);
      }

      const durationMs = Date.now() - start;

      // Telemetry audit recording in PostgreSQL agent_actions table
      await this.recordTelemetry({
        toolName,
        args,
        result: data,
        durationMs,
        isSuccess: true,
        context,
      });

      return {
        toolName,
        success: true,
        data,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Date.now() - start;
      logger.warn(`Tool execution failure for '${toolName}': ${err.message}`, {
        module: "ToolDispatcher",
      });

      // Record failure telemetry
      await this.recordTelemetry({
        toolName,
        args,
        result: { error: err.message },
        durationMs,
        isSuccess: false,
        errorMessage: err.message,
        context,
      });

      return {
        toolName,
        success: false,
        error: err.message,
        durationMs,
      };
    }
  }

  /**
   * Record tool execution in agent_actions table
   */
  private async recordTelemetry(params: {
    toolName: string;
    args: unknown;
    result: unknown;
    durationMs: number;
    isSuccess: boolean;
    errorMessage?: string;
    context: ToolExecutionContext;
  }): Promise<void> {
    try {
      const { toolName, args, result, durationMs, isSuccess, errorMessage, context } = params;

      let sessionId = context.sessionId;
      if (!sessionId && context.conversationId) {
        const sessionRes = await db.query(
          "SELECT id FROM agent_sessions WHERE conversation_id = $1 ORDER BY started_at DESC LIMIT 1;",
          [context.conversationId]
        );
        if (sessionRes.rows.length > 0) {
          sessionId = sessionRes.rows[0].id;
        } else {
          const convRes = await db.query("SELECT id FROM conversations WHERE id = $1;", [context.conversationId]);
          if (convRes.rows.length > 0) {
            const newSessionRes = await db.query(
              `INSERT INTO agent_sessions (conversation_id, agent_type, status)
               VALUES ($1, 'TOOL_RUNNER', 'active')
               RETURNING id;`,
              [context.conversationId]
            );
            sessionId = newSessionRes.rows[0]?.id;
          }
        }
      }

      // If still no session exists (e.g., isolated tool test), create or link to fallback conversation
      if (!sessionId) {
        const latestConv = await db.query("SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1;");
        let fallbackConvId: string | null = latestConv.rows[0]?.id || null;
        if (!fallbackConvId) {
          const cust = await db.query(
            `INSERT INTO customers (name, email, source)
             VALUES ('System Tool Runner', 'tool-runner@impact-enterprise.internal', 'system')
             ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
             RETURNING id;`
          );
          const conv = await db.query(
            `INSERT INTO conversations (customer_id, channel)
             VALUES ($1, 'system')
             RETURNING id;`,
            [cust.rows[0].id]
          );
          fallbackConvId = conv.rows[0].id;
        }

        const newSessionRes = await db.query(
          `INSERT INTO agent_sessions (conversation_id, agent_type, status)
           VALUES ($1, 'TOOL_RUNNER', 'active')
           RETURNING id;`,
          [fallbackConvId]
        );
        sessionId = newSessionRes.rows[0]?.id;
      }

      if (sessionId) {
        await db.query(
          `INSERT INTO agent_actions (session_id, tool_name, input_arguments, execution_result, execution_duration_ms, is_success, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [
            sessionId,
            toolName,
            JSON.stringify(args || {}),
            JSON.stringify(result || {}),
            durationMs,
            isSuccess,
            errorMessage || null,
          ]
        );
      }
    } catch (err: any) {
      // Telemetry failures should not crash tool responses
      logger.warn(`Failed to record tool telemetry: ${err.message}`, { module: "ToolDispatcher" });
    }
  }
}

export const toolDispatcher = new ToolDispatcher();
