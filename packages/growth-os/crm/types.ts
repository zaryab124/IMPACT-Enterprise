/**
 * IMPACT Growth OS — Phase 1 CRM Core Domain Types
 */

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "NURTURE";

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
  "NURTURE",
] as const;

export interface CrmLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  company?: string | null;
  company_id?: string | null;
  contact_id?: string | null;
  job_title?: string | null;
  country?: string | null;
  city?: string | null;
  website?: string | null;
  source?: string | null;
  campaign?: string | null;
  service_interest?: string | null;
  lead_status: LeadStatus;
  lead_score: number;
  assigned_salesperson?: string | null;
  last_contacted?: string | null;
  next_follow_up?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CrmContact {
  id: string;
  company_id?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  job_title?: string | null;
  country?: string | null;
  city?: string | null;
  is_primary: boolean;
  assigned_to?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CrmCompany {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  domain?: string | null;
  size_tier?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  annual_revenue?: number | null;
  employee_count?: number | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface CrmDeal {
  id: string;
  title: string;
  pipeline_id: string;
  stage_id: string;
  lead_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  amount: number;
  currency: string;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  status: "open" | "won" | "lost" | "abandoned";
  service_interest?: string | null;
  assigned_to?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "status_change"
  | "task_created"
  | "task_completed"
  | "message_sent";

export interface CrmActivity {
  id: string;
  lead_id?: string | null;
  deal_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  activity_type: ActivityType;
  subject: string;
  description?: string | null;
  performed_by?: string | null;
  performed_at: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CrmTaskExtended {
  id: string;
  lead_id?: string | null;
  deal_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  due_date?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CrmNote {
  id: string;
  lead_id?: string | null;
  deal_id?: string | null;
  contact_id?: string | null;
  company_id?: string | null;
  content: string;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CrmPipeline {
  id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CrmPipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  code: string;
  order_index: number;
  probability_percent: number;
  created_at: string;
  updated_at: string;
}

export interface CrmTag {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}
