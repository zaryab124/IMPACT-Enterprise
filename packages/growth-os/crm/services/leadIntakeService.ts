/**
 * IMPACT Growth OS — Unified Lead Intake Service (Phase 8)
 * Handles omnichannel lead ingestion, source attribution,
 * rigorous validation, 4-tier deduplication, and CRM normalization.
 */

import { db } from "../../../database";
import { logger } from "../../../logging/logger";
import { CORE_SERVICES, IMPACT_SERVICES } from "../../constants";
import { LeadDeduplicationService } from "./leadDeduplicationService";

export const CANONICAL_LEAD_SOURCES = [
  "website",
  "contact_form",
  "social_media",
  "campaign",
  "landing_page",
  "whatsapp",
  "email",
  "manual_entry",
  "referral",
  "advertisement",
] as const;

export type CanonicalLeadSource = (typeof CANONICAL_LEAD_SOURCES)[number];

export interface LeadIntakePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  job_title?: string;
  country?: string;
  city?: string;
  source: string; // Must be one of the 10 canonical sources (normalized)
  campaign?: string;
  landing_page?: string;
  referrer?: string;
  service_interest?: string;
  problem_statement?: string;
  budget_range?: string;
  timeline?: string;
  attribution_metadata?: Record<string, any>;
  assigned_salesperson?: string;
}

export interface IntakeResult {
  success: boolean;
  leadId: string;
  isDuplicate: boolean;
  action: "created" | "merged";
  lead: any;
  message: string;
}

export class LeadIntakeService {
  /**
   * Validate and ingest inbound lead into CRM
   */
  public static async ingestLead(payload: LeadIntakePayload): Promise<IntakeResult> {
    // 1. Validation: Essential contactability
    if (!payload.email && !payload.phone && !payload.whatsapp) {
      throw new Error("Validation Error: Lead must provide at least one contact channel (email, phone, or whatsapp).");
    }

    // 2. Email format validation
    if (payload.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email.trim())) {
        throw new Error(`Validation Error: Invalid email format: '${payload.email}'`);
      }
    }

    // 3. Phone format validation
    if (payload.phone) {
      const digits = payload.phone.replace(/[^\d]/g, "");
      if (digits.length < 7 || digits.length > 16) {
        throw new Error(`Validation Error: Invalid phone number: '${payload.phone}'. Must contain between 7 and 16 digits.`);
      }
    }

    // 4. Normalize Source to Canonical
    const normalizedSource = this.normalizeSource(payload.source);

    // 5. Normalize Service Interest to Official 9
    const normalizedService = this.normalizeService(payload.service_interest);

    // 6. Deduplication Check
    const match = await LeadDeduplicationService.findMatch({
      email: payload.email,
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      first_name: payload.first_name,
      last_name: payload.last_name,
      company: payload.company,
    });

    // 7. Case A: Existing Lead Found -> Merge / Update
    if (match.matchFound && match.existingLeadId) {
      logger.info(
        `Duplicate match found (${match.matchType}) for existing lead [${match.existingLeadId}]`,
        { module: "LeadIntakeService" }
      );

      // Fetch existing lead
      const existingRes = await db.query(`SELECT * FROM leads WHERE id = $1;`, [match.existingLeadId]);
      const existingLead = existingRes.rows[0];

      // Update attribution touchpoints without losing historical data
      const updatedMetadata = {
        ...(existingLead.attribution_metadata || {}),
        subsequent_touchpoints: [
          ...((existingLead.attribution_metadata?.subsequent_touchpoints as any[]) || []),
          {
            source: normalizedSource,
            campaign: payload.campaign || existingLead.campaign,
            landing_page: payload.landing_page,
            referrer: payload.referrer,
            service_interest: normalizedService || existingLead.service_interest,
            problem_statement: payload.problem_statement,
            received_at: new Date().toISOString(),
          },
        ],
      };

      await db.query(
        `UPDATE leads 
         SET is_duplicate_merge = TRUE,
             attribution_metadata = $1,
             updated_at = NOW()
         WHERE id = $2;`,
        [JSON.stringify(updatedMetadata), match.existingLeadId]
      );

      // Log activity
      await db.query(
        `INSERT INTO crm_activities (
          lead_id, activity_type, subject, description, performed_at, metadata
        ) VALUES ($1, 'lead_duplicate_touchpoint', $2, $3, NOW(), $4);`,
        [
          match.existingLeadId,
          `Inbound inquiry from ${normalizedSource}`,
          `Prospect submitted inquiry again via ${normalizedSource}. Campaign: ${payload.campaign || "None"}. Problem: ${payload.problem_statement || "None"}`,
          JSON.stringify({ matchType: match.matchType, payload }),
        ]
      );

      return {
        success: true,
        leadId: match.existingLeadId,
        isDuplicate: true,
        action: "merged",
        lead: existingLead,
        message: `Existing lead matched by ${match.matchType}. Touchpoint merged successfully.`,
      };
    }

    // 8. Case B: New Lead Creation
    let customerId = match.existingCustomerId || null;

    // If existing customer found, link lead to existing customer
    if (!customerId && payload.email) {
      const custRes = await db.query<{ id: string }>(
        `INSERT INTO customers (name, email, phone, source)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
         RETURNING id;`,
        [
          `${payload.first_name || ""} ${payload.last_name || ""}`.trim() || payload.company || "Prospect",
          payload.email.trim().toLowerCase(),
          payload.phone || null,
          normalizedSource,
        ]
      );
      customerId = custRes.rows[0].id;
    }

    // Resolve assigned salesperson (use provided or fallback to system admin)
    let assignedUser = payload.assigned_salesperson || null;
    if (!assignedUser) {
      const userRes = await db.query<{ id: string }>(`SELECT id FROM users WHERE is_active = TRUE LIMIT 1;`);
      if (userRes.rows.length > 0) {
        assignedUser = userRes.rows[0].id;
      }
    }

    const attributionMetadata = {
      ...(payload.attribution_metadata || {}),
      initial_intake_timestamp: new Date().toISOString(),
      utm_campaign: payload.campaign,
      landing_page: payload.landing_page,
      referrer: payload.referrer,
    };

    const insertLeadRes = await db.query(
      `INSERT INTO leads (
        first_name,
        last_name,
        email,
        phone,
        whatsapp,
        company,
        job_title,
        country,
        city,
        source,
        campaign,
        landing_page,
        referrer,
        service_interest,
        problem_statement,
        budget_range,
        timeline,
        lead_status,
        customer_id,
        assigned_salesperson,
        attribution_metadata,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'NEW', $18, $19, $20, NOW(), NOW()
      ) RETURNING *;`,
      [
        payload.first_name || null,
        payload.last_name || null,
        payload.email ? payload.email.trim().toLowerCase() : null,
        payload.phone || null,
        payload.whatsapp || null,
        payload.company || null,
        payload.job_title || null,
        payload.country || null,
        payload.city || null,
        normalizedSource,
        payload.campaign || null,
        payload.landing_page || null,
        payload.referrer || null,
        normalizedService,
        payload.problem_statement || null,
        payload.budget_range || null,
        payload.timeline || null,
        customerId,
        assignedUser,
        JSON.stringify(attributionMetadata),
      ]
    );

    const newLead = insertLeadRes.rows[0];

    // Log creation activity
    await db.query(
      `INSERT INTO crm_activities (
        lead_id, activity_type, subject, description, performed_at, metadata
      ) VALUES ($1, 'lead_created', $2, $3, NOW(), $4);`,
      [
        newLead.id,
        `Lead created via ${normalizedSource}`,
        `New prospect captured from ${normalizedSource}. Campaign: ${payload.campaign || "Direct"}. Service: ${normalizedService}`,
        JSON.stringify({ source: normalizedSource, attributionMetadata }),
      ]
    );

    logger.info(`Lead [${newLead.id}] ingested successfully from ${normalizedSource}`, {
      module: "LeadIntakeService",
    });

    return {
      success: true,
      leadId: newLead.id,
      isDuplicate: false,
      action: "created",
      lead: newLead,
      message: `Lead ingested successfully from ${normalizedSource}.`,
    };
  }

  private static normalizeSource(source?: string): CanonicalLeadSource {
    if (!source) return "website";
    const cleaned = source.toLowerCase().replace(/[-\s]/g, "_");
    const matched = CANONICAL_LEAD_SOURCES.find((s) => s === cleaned);
    return matched || "website";
  }

  private static normalizeService(service?: string): string {
    if (!service) return CORE_SERVICES[1].name; // Default: AI agents
    const matched = IMPACT_SERVICES.find(
      (s) => s.toLowerCase() === service.toLowerCase()
    );
    return matched || CORE_SERVICES[1].name;
  }
}
