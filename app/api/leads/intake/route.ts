import { NextRequest, NextResponse } from "next/server";
import { db } from "@/packages/database";
import { LeadIntakeService } from "@/packages/growth-os/crm/services/leadIntakeService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await LeadIntakeService.ingestLead(body);
    return NextResponse.json(result, { status: result.isDuplicate ? 200 : 201 });
  } catch (err: any) {
    const isValidation = err.message?.includes("Validation Error");
    return NextResponse.json(
      { success: false, error: err.message },
      { status: isValidation ? 400 : 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const source = searchParams.get("source");
    const campaign = searchParams.get("campaign");

    let query = `
      SELECT 
        l.id,
        l.first_name,
        l.last_name,
        l.email,
        l.phone,
        l.whatsapp,
        l.company,
        l.source,
        l.campaign,
        l.landing_page,
        l.referrer,
        l.service_interest,
        l.lead_status,
        l.lead_score,
        l.is_duplicate_merge,
        l.created_at,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name,
        u.email as assigned_email
      FROM leads l
      LEFT JOIN users u ON l.assigned_salesperson = u.id
      WHERE l.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (source) {
      params.push(source);
      query += ` AND l.source = $${params.length}`;
    }
    if (campaign) {
      params.push(campaign);
      query += ` AND l.campaign = $${params.length}`;
    }

    query += ` ORDER BY l.created_at DESC LIMIT ${limit};`;

    const res = await db.query(query, params);
    return NextResponse.json({
      success: true,
      count: res.rows.length,
      leads: res.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
