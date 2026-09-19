import { NextRequest, NextResponse } from "next/server";
import { db } from "@/packages/database";
import { CallOrchestrator } from "@/packages/growth-os/voice/callOrchestrator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const leadId = searchParams.get("leadId");

    let query = `
      SELECT 
        c.*,
        l.first_name,
        l.last_name,
        l.company,
        l.email as lead_email
      FROM crm_calls c
      LEFT JOIN leads l ON c.lead_id = l.id
    `;
    const params: any[] = [];

    if (leadId) {
      params.push(leadId);
      query += ` WHERE c.lead_id = $${params.length}`;
    }

    query += ` ORDER BY c.created_at DESC LIMIT ${limit};`;

    const res = await db.query(query, params);
    return NextResponse.json({
      success: true,
      count: res.rows.length,
      calls: res.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await CallOrchestrator.processCall(body);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
