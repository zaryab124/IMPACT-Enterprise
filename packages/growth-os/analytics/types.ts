/**
 * IMPACT Growth OS — Phase 14 Growth Analytics Types
 * Enforces strict metric transparency: definition, time period, and database source.
 */

export interface MetricTransparency<T = number | string> {
  value: T;
  display: string;
  definition: string;
  time_period: string;
  source: string;
}

export interface PlatformComparisonMetric {
  platform: string;
  posts: number;
  reach: number;
  engagement: number;
  clicks: number;
}

export interface SocialAnalyticsDomain {
  posts: MetricTransparency<number>;
  reach: MetricTransparency<number>;
  engagement: MetricTransparency<number>;
  clicks: MetricTransparency<number>;
  follower_changes: MetricTransparency<number>;
  platform_comparison: {
    definition: string;
    time_period: string;
    source: string;
    platforms: PlatformComparisonMetric[];
  };
}

export interface LeadsAnalyticsDomain {
  total_leads: MetricTransparency<number>;
  qualified_leads: MetricTransparency<number>;
  lead_response_time_minutes: MetricTransparency<number>;
  leads_by_source: {
    definition: string;
    time_period: string;
    source: string;
    breakdown: Record<string, number>;
  };
  leads_by_campaign: {
    definition: string;
    time_period: string;
    source: string;
    breakdown: Record<string, number>;
  };
  leads_by_service: {
    definition: string;
    time_period: string;
    source: string;
    breakdown: Record<string, number>;
  };
}

export interface SalesAnalyticsDomain {
  pipeline_value: MetricTransparency<number>;
  active_deals: MetricTransparency<number>;
  won_deals: MetricTransparency<number>;
  won_revenue: MetricTransparency<number | null>;
  lost_deals: MetricTransparency<number>;
  average_deal_value: MetricTransparency<number>;
  sales_cycle_duration_days: MetricTransparency<number>;
}

export interface AiAnalyticsDomain {
  ai_generated_content: MetricTransparency<number>;
  approved_content: MetricTransparency<number>;
  rejected_content: MetricTransparency<number>;
  ai_qualified_leads: MetricTransparency<number>;
  human_overrides: MetricTransparency<number>;
  ai_follow_ups: MetricTransparency<number>;
}

export interface GrowthAnalyticsReport {
  time_range: string;
  start_date: string;
  end_date: string;
  generated_at: string;
  social: SocialAnalyticsDomain;
  leads: LeadsAnalyticsDomain;
  sales: SalesAnalyticsDomain;
  ai: AiAnalyticsDomain;
}

export interface AnalyticsDateFilter {
  timeRange?: "7d" | "30d" | "90d" | "all" | "custom";
  startDate?: string;
  endDate?: string;
}
