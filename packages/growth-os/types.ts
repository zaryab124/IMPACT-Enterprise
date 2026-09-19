/**
 * IMPACT Enterprise — Growth OS Data Types
 */

import { GrowthOsSuite } from "./constants";

export interface GrowthOsModuleRecord {
  id: string;
  code: string;
  name: string;
  suite: GrowthOsSuite;
  description: string;
  icon: string;
  is_active: boolean;
  min_permission: string;
  sort_order: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type ContentPostStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "REJECTED";

export type ContentPlatform = "linkedin" | "twitter_x" | "facebook" | "instagram" | "youtube";

export interface ContentCampaignRecord {
  id: string;
  name: string;
  target_service?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: "draft" | "active" | "completed" | "archived";
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPostRecord {
  id: string;
  campaign_id?: string;
  title: string;
  content: string;
  target_platforms: ContentPlatform[];
  post_type: "social_post" | "article" | "case_study_blurb";
  status: ContentPostStatus;
  scheduled_at?: string;
  published_at?: string;
  ai_model?: string;
  ai_prompt?: string;
  media_urls: string[];
  tags: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentApprovalRecord {
  id: string;
  post_id: string;
  reviewer_id?: string;
  status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  feedback?: string;
  reviewed_at: string;
}

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface CrmTaskRecord {
  id: string;
  lead_id?: string;
  customer_id?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  assigned_to?: string;
  created_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFollowupSequenceRecord {
  id: string;
  lead_id: string;
  step_number: number;
  channel: "email" | "whatsapp" | "sms";
  trigger_condition: string;
  delay_hours: number;
  scheduled_at: string;
  status: "pending" | "sent" | "cancelled" | "skipped";
  content_template?: string;
  sent_at?: string;
  created_at: string;
}

export interface GrowthOsFoundationSummary {
  campaignsCount: number;
  draftPostsCount: number;
  pendingApprovalsCount: number;
  scheduledPostsCount: number;
  publishedPostsCount: number;
  openTasksCount: number;
  urgentTasksCount: number;
  modulesCount: number;
  activeModulesCount: number;
}
