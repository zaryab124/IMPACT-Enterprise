/**
 * IMPACT Growth OS — Phase 15 Default Enterprise Automation Rules
 * 7 canonical business events: NEW_LEAD, APPROVED_CONTENT, PUBLISHED_CONTENT,
 * FOLLOW_UP_DUE, LEAD_INACTIVE, DEAL_WON, DEAL_LOST.
 */

import { AutomationTriggerEvent, AutomationCondition, AutomationAction } from "./types";

export interface DefaultRuleTemplate {
  name: string;
  trigger_event: AutomationTriggerEvent;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  max_retries: number;
}

export const DEFAULT_AUTOMATION_RULES: DefaultRuleTemplate[] = [
  {
    name: "New Inbound Lead Intake & AI Triage Pipeline",
    trigger_event: "NEW_LEAD",
    conditions: [{ field: "source", operator: "always_true" }],
    actions: [
      { type: "ASSIGN_OWNER", params: { defaultRole: "salesperson" } },
      { type: "CALCULATE_AI_QUALIFICATION", params: { autoTriage: true } },
      { type: "CREATE_TASK", params: { title: "Conduct Initial Lead Discovery", priority: "high", dueDays: 1 } },
    ],
    max_retries: 3,
  },
  {
    name: "Approved Content Auto-Scheduling Pipeline",
    trigger_event: "APPROVED_CONTENT",
    conditions: [{ field: "status", operator: "equals", value: "APPROVED" }],
    actions: [
      { type: "SCHEDULE_PUBLISHING", params: { bufferHours: 4 } },
    ],
    max_retries: 3,
  },
  {
    name: "Published Content Performance Logging",
    trigger_event: "PUBLISHED_CONTENT",
    conditions: [{ field: "status", operator: "equals", value: "PUBLISHED" }],
    actions: [
      { type: "RECORD_PUBLICATION", params: { trackImpressions: true } },
    ],
    max_retries: 3,
  },
  {
    name: "Lead Follow-up Due SLA Alert",
    trigger_event: "FOLLOW_UP_DUE",
    conditions: [{ field: "is_overdue", operator: "equals", value: true }],
    actions: [
      { type: "NOTIFY_SALESPERSON", params: { channel: "crm_activity", urgent: true } },
    ],
    max_retries: 3,
  },
  {
    name: "Stale / Inactive Lead Re-engagement Engine",
    trigger_event: "LEAD_INACTIVE",
    conditions: [{ field: "days_since_contact", operator: "greater_than", value: 14 }],
    actions: [
      { type: "CREATE_RECOMMENDATION", params: { type: "nurture_checkin" } },
      { type: "CREATE_TASK", params: { title: "Execute Inactive Lead Re-engagement", priority: "medium", dueDays: 2 } },
    ],
    max_retries: 2,
  },
  {
    name: "Deal Won Client Onboarding Pipeline",
    trigger_event: "DEAL_WON",
    conditions: [{ field: "status", operator: "equals", value: "won" }],
    actions: [
      { type: "CREATE_ONBOARDING_TASK", params: { title: "Initiate Client Technical Onboarding & Kickoff", priority: "urgent" } },
    ],
    max_retries: 3,
  },
  {
    name: "Deal Lost Retrospective & Nurture Sequence",
    trigger_event: "DEAL_LOST",
    conditions: [{ field: "status", operator: "equals", value: "lost" }],
    actions: [
      { type: "ENTER_NURTURE_WORKFLOW", params: { delayDays: 60, sequence: "quarterly_tech_roundup" } },
    ],
    max_retries: 2,
  },
];
