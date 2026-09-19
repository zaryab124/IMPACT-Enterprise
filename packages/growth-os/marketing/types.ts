/**
 * IMPACT Growth OS — Marketing & Social Media Types
 * Phase 5, 6, 7
 */

export type ContentCapability =
  | "thought_leadership"
  | "service_spotlight"
  | "educational_breakdown"
  | "enterprise_automation_insights"
  | "industry_use_cases"
  | "problem_solution_framework"
  | "technology_analysis"
  | "ai_transformation_strategy"
  | "implementation_best_practices"
  | "conversational_ai_insights"
  | "behind_the_scenes_engineering";

export type MarketingGoal =
  | "AWARENESS"
  | "EDUCATION"
  | "AUTHORITY"
  | "ENGAGEMENT"
  | "LEAD_GENERATION"
  | "SERVICE_PROMOTION"
  | "EVENT_ANNOUNCEMENT"
  | "HIRING_CULTURE"
  | "DIRECT_CONVERSION";

export type SocialPlatform = "linkedin" | "twitter" | "instagram" | "facebook";

export type PostFormat = "post" | "thread" | "carousel" | "article" | "short_video_script";

export type ContentPostStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED";

export interface BrandCheckResult {
  passed: boolean;
  score: number; // 0 - 100
  serviceMatched: string | null;
  flags: string[];
  suggestions: string[];
  checkedAt: string;
}

export interface ContentPost {
  id: string;
  campaign_id?: string | null;
  title: string;
  content: string;
  target_platforms: SocialPlatform[];
  platform: SocialPlatform;
  format: PostFormat;
  objective: MarketingGoal;
  hook?: string | null;
  cta?: string | null;
  hashtags: string[];
  visual_brief?: string | null;
  target_audience?: string | null;
  service?: string | null;
  campaign?: string | null;
  post_type: string;
  status: ContentPostStatus;
  brand_check: BrandCheckResult;
  scheduled_at?: string | null;
  published_at?: string | null;
  ai_model?: string | null;
  ai_prompt?: string | null;
  media_urls: string[];
  tags: string[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GeneratePostRequest {
  capability: ContentCapability;
  goal: MarketingGoal;
  platform: SocialPlatform;
  format?: PostFormat;
  serviceInterest?: string; // Must be one of the 9 official services
  targetAudience?: string;
  campaignName?: string;
  customPrompt?: string;
}

export interface GeneratedPostContent {
  title: string;
  platform: SocialPlatform;
  format: PostFormat;
  objective: MarketingGoal;
  hook: string;
  content: string;
  cta: string;
  hashtags: string[];
  visual_brief: string;
  target_audience: string;
  service: string;
  campaign: string;
  brand_check: BrandCheckResult;
  ai_model: string;
}

export interface ContentApprovalRecord {
  id: string;
  post_id: string;
  reviewer_id?: string | null;
  status: "APPROVED" | "REJECTED" | "REQUESTED_CHANGES";
  feedback?: string | null;
  reviewed_at: string;
}

export interface WeeklyPlanSlot {
  dayIndex: number; // 0 = Monday, 6 = Sunday
  dayName: string;
  timeSlot: string; // e.g. "09:00 UTC"
  platform: SocialPlatform;
  format: PostFormat;
  capability: ContentCapability;
  goal: MarketingGoal;
  service: string;
  suggestedTitle: string;
  post?: ContentPost | null;
}

export interface WeeklyPlan {
  id: string;
  weekStarting: string; // ISO date
  theme: string;
  slots: WeeklyPlanSlot[];
}
