/**
 * IMPACT Growth OS — Phase 15 Event-Based Automation Engine Types
 * Provides triggers, conditions, sequential actions, retry policies, and loop prevention.
 */

export type AutomationTriggerEvent =
  | "NEW_LEAD"
  | "APPROVED_CONTENT"
  | "PUBLISHED_CONTENT"
  | "FOLLOW_UP_DUE"
  | "LEAD_INACTIVE"
  | "DEAL_WON"
  | "DEAL_LOST";

export type AutomationStatus = "SUCCESS" | "FAILED" | "RETRYING" | "SKIPPED";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "always_true";
  value?: any;
}

export type AutomationActionType =
  | "ASSIGN_OWNER"
  | "CALCULATE_AI_QUALIFICATION"
  | "CREATE_TASK"
  | "SCHEDULE_PUBLISHING"
  | "RECORD_PUBLICATION"
  | "NOTIFY_SALESPERSON"
  | "CREATE_RECOMMENDATION"
  | "CREATE_ONBOARDING_TASK"
  | "ENTER_NURTURE_WORKFLOW";

export interface AutomationAction {
  type: AutomationActionType;
  params?: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger_event: AutomationTriggerEvent;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_enabled: boolean;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

export interface AutomationLogRecord {
  id: string;
  rule_id: string | null;
  trigger_event: AutomationTriggerEvent;
  entity_type: string;
  entity_id: string;
  status: AutomationStatus;
  actions_executed: string[];
  execution_duration_ms: number;
  retry_count: number;
  error_message?: string;
  created_at: string;
}
