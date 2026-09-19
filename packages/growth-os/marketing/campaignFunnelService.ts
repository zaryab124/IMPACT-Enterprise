/**
 * IMPACT Growth OS — Campaign Management & Full Funnel Attribution (Phase 13)
 * Tracks: Campaign → Content → Click → Lead → Qualified Lead → Deal → Won Deal
 * Enforces zero-fabrication revenue attribution: displays "Unknown" if unentered.
 */

import { db } from "../../database";
import { logger } from "../../logging/logger";
import { CORE_SERVICES, IMPACT_SERVICES } from "../constants";

export type FunnelEventType =
  | "CONTENT_PUBLISHED"
  | "CLICK"
  | "LEAD_CREATED"
  | "LEAD_QUALIFIED"
  | "DEAL_CREATED"
  | "DEAL_WON";

export interface CreateCampaignPayload {
  name: string;
  code?: string;
  objective?: string; // 'LEAD_GENERATION' | 'BRAND_AWARENESS' | 'PRODUCT_LAUNCH' | 'EVENT_REGISTRATION'
  service: string; // Must be one of the 9 official IMPACT services
  target_audience: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  platforms?: string[];
  content?: string; // Creative summary / copy brief
  landing_page?: string;
  lead_source?: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  code: string;
  channel?: string;
  target_service: string;
  budget: number;
  status: string;
  start_date?: string;
  end_date?: string;
  objective: string;
  target_audience: string;
  platforms: string[];
  landing_page?: string;
  lead_source: string;
  click_count: number;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface FunnelEventRecord {
  id: string;
  campaign_id: string;
  event_type: FunnelEventType;
  entity_id?: string;
  metadata: Record<string, any>;
  occurred_at: string;
}

export interface CampaignFunnelMetrics {
  campaign_id: string;
  campaign_name: string;
  service: string;
  content_count: number;
  clicks: number;
  leads: number;
  qualified_leads: number;
  deals: number;
  won_deals: number;
  conversion_rates: {
    click_to_lead: string; // e.g. "12.5%"
    lead_to_qualified: string; // e.g. "50.0%"
    qualified_to_deal: string; // e.g. "40.0%"
    deal_to_won: string; // e.g. "25.0%"
    overall_funnel: string; // e.g. "1.2%"
  };
  revenue: {
    amount: number | null;
    display: string; // "Unknown" or "$X,XXX.XX"
    is_unknown: boolean;
  };
}

export interface CampaignDashboardSummary {
  total_campaigns: number;
  total_budget: number;
  total_clicks: number;
  total_leads: number;
  total_qualified_leads: number;
  total_deals: number;
  total_won_deals: number;
  total_revenue_display: string;
  campaigns: CampaignFunnelMetrics[];
}

export class CampaignFunnelService {
  /**
   * Validate that the campaign service matches one of the official 9 IMPACT services
   */
  public static validateService(service: string): string {
    const matched = CORE_SERVICES.find(
      (s) => s.name.toLowerCase() === service.trim().toLowerCase()
    );
    if (!matched) {
      const allowed = CORE_SERVICES.map((s) => s.name).join(", ");
      throw new Error(`Invalid service '${service}'. Must be one of the 9 official IMPACT services: ${allowed}`);
    }
    return matched.name;
  }

  /**
   * Create a new campaign with complete fields
   */
  public static async createCampaign(payload: CreateCampaignPayload): Promise<CampaignRecord> {
    const validatedService = this.validateService(payload.service);
    const code = payload.code || `CMP-${payload.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-${Date.now().toString().slice(-4)}`;
    const platforms = payload.platforms && payload.platforms.length > 0 ? payload.platforms : ["linkedin"];
    const objective = payload.objective || "LEAD_GENERATION";
    const leadSource = payload.lead_source || "campaign";
    const budget = payload.budget || 0;

    const res = await db.query(
      `INSERT INTO crm_campaigns (
        name, code, channel, target_service, budget, status,
        start_date, end_date, objective, target_audience,
        platforms, landing_page, lead_source, click_count
      ) VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8, $9, $10, $11, $12, 0)
      RETURNING *`,
      [
        payload.name.trim(),
        code,
        platforms[0],
        validatedService,
        budget,
        payload.start_date ? new Date(payload.start_date) : new Date(),
        payload.end_date ? new Date(payload.end_date) : null,
        objective,
        payload.target_audience.trim(),
        JSON.stringify(platforms),
        payload.landing_page || null,
        leadSource,
      ]
    );

    const row = res.rows[0];
    logger.info(`[CampaignFunnelService] Created campaign [${row.id}] '${row.name}' for service '${row.target_service}'`);

    // If initial content provided, record CONTENT_PUBLISHED event
    if (payload.content) {
      await this.recordFunnelEvent(row.id, "CONTENT_PUBLISHED", undefined, {
        content: payload.content,
      });
    }

    return {
      ...row,
      platforms: typeof row.platforms === "string" ? JSON.parse(row.platforms) : row.platforms,
      content: payload.content,
    };
  }

  /**
   * Get single campaign by ID
   */
  public static async getCampaign(id: string): Promise<CampaignRecord | null> {
    const res = await db.query(
      `SELECT * FROM crm_campaigns WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      platforms: typeof row.platforms === "string" ? JSON.parse(row.platforms) : row.platforms,
    };
  }

  /**
   * Record a funnel event: CLICK, LEAD_CREATED, LEAD_QUALIFIED, DEAL_CREATED, DEAL_WON
   */
  public static async recordFunnelEvent(
    campaignId: string,
    eventType: FunnelEventType,
    entityId?: string,
    metadata: Record<string, any> = {}
  ): Promise<FunnelEventRecord> {
    // If event is click, also increment click_count on campaign
    if (eventType === "CLICK") {
      await db.query(
        `UPDATE crm_campaigns SET click_count = click_count + 1 WHERE id = $1`,
        [campaignId]
      );
    }

    const res = await db.query(
      `INSERT INTO campaign_funnel_events (
        campaign_id, event_type, entity_id, metadata, occurred_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *`,
      [campaignId, eventType, entityId || null, JSON.stringify(metadata)]
    );

    const row = res.rows[0];
    logger.info(`[CampaignFunnelService] Funnel event [${eventType}] logged for campaign [${campaignId}]`);
    return {
      ...row,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata,
    };
  }

  /**
   * Calculate full-funnel metrics and entered CRM revenue attribution
   */
  public static async getCampaignFunnelMetrics(campaignId: string): Promise<CampaignFunnelMetrics> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) {
      throw new Error(`Campaign [${campaignId}] not found`);
    }

    // 1. Funnel event counts
    const eventsRes = await db.query(
      `SELECT event_type, COUNT(*)::int as cnt
       FROM campaign_funnel_events
       WHERE campaign_id = $1
       GROUP BY event_type`,
      [campaignId]
    );

    const eventCounts: Record<string, number> = {};
    for (const row of eventsRes.rows) {
      eventCounts[row.event_type] = row.cnt;
    }

    // 2. Direct CRM Leads attributed to this campaign (by campaign name or code)
    const leadsRes = await db.query(
      `SELECT id, lead_status, lead_score
       FROM leads
       WHERE deleted_at IS NULL
         AND (campaign ILIKE $1 OR campaign ILIKE $2)`,
      [campaign.name, campaign.code]
    );

    const directLeads = leadsRes.rows;
    const leadsCount = Math.max(directLeads.length, eventCounts["LEAD_CREATED"] || 0);

    const qualifiedLeadsDirect = directLeads.filter(
      (l) => l.lead_status === "QUALIFIED" || l.lead_status === "HIGH_INTENT" || (l.lead_score && l.lead_score >= 70)
    ).length;
    const qualifiedLeadsCount = Math.max(qualifiedLeadsDirect, eventCounts["LEAD_QUALIFIED"] || 0);

    // 3. Direct CRM Deals created from those leads
    let dealsCount = eventCounts["DEAL_CREATED"] || 0;
    let wonDealsCount = eventCounts["DEAL_WON"] || 0;
    let actualEnteredRevenue = 0;
    let hasEnteredRevenue = false;

    if (directLeads.length > 0) {
      const leadIds = directLeads.map((l) => l.id);
      const dealsRes = await db.query(
        `SELECT id, status, amount
         FROM crm_deals
         WHERE deleted_at IS NULL AND lead_id = ANY($1::uuid[])`,
        [leadIds]
      );

      if (dealsRes.rows.length > 0) {
        dealsCount = Math.max(dealsCount, dealsRes.rows.length);
        const wonDeals = dealsRes.rows.filter((d) => d.status === "won");
        wonDealsCount = Math.max(wonDealsCount, wonDeals.length);

        for (const wd of wonDeals) {
          const amt = parseFloat(wd.amount);
          if (!isNaN(amt) && amt > 0) {
            actualEnteredRevenue += amt;
            hasEnteredRevenue = true;
          }
        }
      }
    }

    // Also inspect metadata in DEAL_WON events if revenue was passed there
    if (!hasEnteredRevenue && eventCounts["DEAL_WON"]) {
      const wonEvents = await db.query(
        `SELECT metadata FROM campaign_funnel_events WHERE campaign_id = $1 AND event_type = 'DEAL_WON'`,
        [campaignId]
      );
      for (const we of wonEvents.rows) {
        const meta = typeof we.metadata === "string" ? JSON.parse(we.metadata) : we.metadata;
        if (meta?.amount && parseFloat(meta.amount) > 0) {
          actualEnteredRevenue += parseFloat(meta.amount);
          hasEnteredRevenue = true;
        }
      }
    }

    const clicksCount = Math.max(campaign.click_count, eventCounts["CLICK"] || 0);
    const contentCount = eventCounts["CONTENT_PUBLISHED"] || 1;

    // Conversion rate calculations
    const clickToLeadRate = clicksCount > 0 ? ((leadsCount / clicksCount) * 100).toFixed(1) + "%" : "0.0%";
    const leadToQualRate = leadsCount > 0 ? ((qualifiedLeadsCount / leadsCount) * 100).toFixed(1) + "%" : "0.0%";
    const qualToDealRate = qualifiedLeadsCount > 0 ? ((dealsCount / qualifiedLeadsCount) * 100).toFixed(1) + "%" : "0.0%";
    const dealToWonRate = dealsCount > 0 ? ((wonDealsCount / dealsCount) * 100).toFixed(1) + "%" : "0.0%";
    const overallFunnelRate = clicksCount > 0 ? ((wonDealsCount / clicksCount) * 100).toFixed(2) + "%" : "0.00%";

    // Anti-fabrication revenue check: Must display "Unknown" if no entered revenue exists
    const revenueDisplay = hasEnteredRevenue && actualEnteredRevenue > 0
      ? `$${actualEnteredRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "Unknown";

    return {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      service: campaign.target_service,
      content_count: contentCount,
      clicks: clicksCount,
      leads: leadsCount,
      qualified_leads: qualifiedLeadsCount,
      deals: dealsCount,
      won_deals: wonDealsCount,
      conversion_rates: {
        click_to_lead: clickToLeadRate,
        lead_to_qualified: leadToQualRate,
        qualified_to_deal: qualToDealRate,
        deal_to_won: dealToWonRate,
        overall_funnel: overallFunnelRate,
      },
      revenue: {
        amount: hasEnteredRevenue ? actualEnteredRevenue : null,
        display: revenueDisplay,
        is_unknown: !hasEnteredRevenue,
      },
    };
  }

  /**
   * Dashboard aggregator across all active campaigns
   */
  public static async getCampaignDashboardSummary(): Promise<CampaignDashboardSummary> {
    const campaignsRes = await db.query(
      `SELECT id FROM crm_campaigns WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );

    const metricsList: CampaignFunnelMetrics[] = [];
    let totalBudget = 0;
    let totalClicks = 0;
    let totalLeads = 0;
    let totalQualified = 0;
    let totalDeals = 0;
    let totalWon = 0;
    let totalEnteredRevenue = 0;
    let hasAnyRevenue = false;

    for (const row of campaignsRes.rows) {
      const m = await this.getCampaignFunnelMetrics(row.id);
      metricsList.push(m);

      const camp = await this.getCampaign(row.id);
      if (camp) totalBudget += parseFloat(camp.budget as any) || 0;

      totalClicks += m.clicks;
      totalLeads += m.leads;
      totalQualified += m.qualified_leads;
      totalDeals += m.deals;
      totalWon += m.won_deals;
      if (m.revenue.amount !== null && m.revenue.amount > 0) {
        totalEnteredRevenue += m.revenue.amount;
        hasAnyRevenue = true;
      }
    }

    const totalRevenueDisplay = hasAnyRevenue
      ? `$${totalEnteredRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "Unknown";

    return {
      total_campaigns: metricsList.length,
      total_budget: totalBudget,
      total_clicks: totalClicks,
      total_leads: totalLeads,
      total_qualified_leads: totalQualified,
      total_deals: totalDeals,
      total_won_deals: totalWon,
      total_revenue_display: totalRevenueDisplay,
      campaigns: metricsList,
    };
  }
}
