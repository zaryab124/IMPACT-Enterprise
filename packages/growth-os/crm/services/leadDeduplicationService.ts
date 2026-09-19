/**
 * IMPACT Growth OS — Lead Deduplication Engine (Phase 8)
 * Implements 4-tier configurable matching rules:
 * 1. Email (normalized case-insensitive)
 * 2. Phone (normalized digit matching)
 * 3. WhatsApp (normalized digit matching)
 * 4. Company + Contact Name (fuzzy/normalized match)
 */

import { db } from "../../../database";
import { logger } from "../../../logging/logger";

export interface DeduplicationMatch {
  matchFound: boolean;
  matchType?: "email" | "phone" | "whatsapp" | "company_contact";
  existingLeadId?: string;
  existingCustomerId?: string;
  existingContactId?: string;
  matchedField?: string;
  matchedValue?: string;
}

export interface CandidateLead {
  email?: string;
  phone?: string;
  whatsapp?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

export class LeadDeduplicationService {
  /**
   * Normalize telephone or WhatsApp number by removing spaces, dashes, parentheses
   */
  public static normalizePhone(phone?: string | null): string {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, "").trim();
  }

  /**
   * Search for existing lead or customer using the 4 matching rules
   */
  public static async findMatch(candidate: CandidateLead): Promise<DeduplicationMatch> {
    // 1. Email Match (highest priority)
    if (candidate.email && candidate.email.trim().length > 0) {
      const normalizedEmail = candidate.email.trim().toLowerCase();

      // Check leads table
      const leadEmailRes = await db.query<{ id: string; customer_id: string; contact_id: string }>(
        `SELECT id, customer_id, contact_id FROM leads 
         WHERE LOWER(email) = $1 AND deleted_at IS NULL 
         ORDER BY created_at DESC LIMIT 1;`,
        [normalizedEmail]
      );
      if (leadEmailRes.rows.length > 0) {
        return {
          matchFound: true,
          matchType: "email",
          existingLeadId: leadEmailRes.rows[0].id,
          existingCustomerId: leadEmailRes.rows[0].customer_id,
          existingContactId: leadEmailRes.rows[0].contact_id,
          matchedField: "email",
          matchedValue: normalizedEmail,
        };
      }

      // Check customers table
      const customerEmailRes = await db.query<{ id: string }>(
        `SELECT id FROM customers WHERE LOWER(email) = $1 LIMIT 1;`,
        [normalizedEmail]
      );
      if (customerEmailRes.rows.length > 0) {
        return {
          matchFound: true,
          matchType: "email",
          existingCustomerId: customerEmailRes.rows[0].id,
          matchedField: "customer_email",
          matchedValue: normalizedEmail,
        };
      }
    }

    // 2. Phone Match
    const cleanPhone = this.normalizePhone(candidate.phone);
    if (cleanPhone.length >= 7) {
      const phonePattern = `%${cleanPhone.slice(-8)}%`;
      const leadPhoneRes = await db.query<{ id: string; customer_id: string }>(
        `SELECT id, customer_id FROM leads 
         WHERE REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, ''), '-', ''), ' ', ''), '(', ''), ')', '') LIKE $1 
           AND deleted_at IS NULL 
         ORDER BY created_at DESC LIMIT 1;`,
        [phonePattern]
      );
      if (leadPhoneRes.rows.length > 0) {
        return {
          matchFound: true,
          matchType: "phone",
          existingLeadId: leadPhoneRes.rows[0].id,
          existingCustomerId: leadPhoneRes.rows[0].customer_id,
          matchedField: "phone",
          matchedValue: cleanPhone,
        };
      }
    }

    // 3. WhatsApp Match
    const cleanWhatsApp = this.normalizePhone(candidate.whatsapp);
    if (cleanWhatsApp.length >= 7) {
      const waPattern = `%${cleanWhatsApp.slice(-8)}%`;
      const leadWaRes = await db.query<{ id: string; customer_id: string }>(
        `SELECT id, customer_id FROM leads 
         WHERE REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(whatsapp, ''), '-', ''), ' ', ''), '(', ''), ')', '') LIKE $1 
           AND deleted_at IS NULL 
         ORDER BY created_at DESC LIMIT 1;`,
        [waPattern]
      );
      if (leadWaRes.rows.length > 0) {
        return {
          matchFound: true,
          matchType: "whatsapp",
          existingLeadId: leadWaRes.rows[0].id,
          existingCustomerId: leadWaRes.rows[0].customer_id,
          matchedField: "whatsapp",
          matchedValue: cleanWhatsApp,
        };
      }
    }

    // 4. Company + Contact Name Match
    if (
      candidate.company &&
      candidate.company.trim().length > 1 &&
      candidate.first_name &&
      candidate.first_name.trim().length > 1 &&
      candidate.last_name &&
      candidate.last_name.trim().length > 1
    ) {
      const leadCompanyContactRes = await db.query<{ id: string; customer_id: string }>(
        `SELECT id, customer_id FROM leads 
         WHERE LOWER(company) = LOWER($1) 
           AND LOWER(first_name) = LOWER($2) 
           AND LOWER(last_name) = LOWER($3)
           AND deleted_at IS NULL 
         ORDER BY created_at DESC LIMIT 1;`,
        [candidate.company.trim(), candidate.first_name.trim(), candidate.last_name.trim()]
      );
      if (leadCompanyContactRes.rows.length > 0) {
        return {
          matchFound: true,
          matchType: "company_contact",
          existingLeadId: leadCompanyContactRes.rows[0].id,
          existingCustomerId: leadCompanyContactRes.rows[0].customer_id,
          matchedField: "company_and_contact",
          matchedValue: `${candidate.company} - ${candidate.first_name} ${candidate.last_name}`,
        };
      }
    }

    return { matchFound: false };
  }
}
