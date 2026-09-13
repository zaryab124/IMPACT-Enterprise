import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { db } from "@/packages/database";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requirePermission(req, "dashboard:view");

    // Live counts from PostgreSQL
    const leadsRes = await db.query<{ count: string }>("SELECT COUNT(*) as count FROM leads;");
    const hotLeadsRes = await db.query<{ count: string }>("SELECT COUNT(*) as count FROM leads WHERE score >= 75;");
    const qualifiedRes = await db.query<{ count: string }>("SELECT COUNT(*) as count FROM leads WHERE stage = 'QUALIFIED';");
    const customersRes = await db.query<{ count: string }>("SELECT COUNT(*) as count FROM customers;");
    const conversationsRes = await db.query<{ count: string }>("SELECT COUNT(*) as count FROM conversations;");
    const appointmentsRes = await db.query<{ count: string }>("SELECT COUNT(*) as count FROM appointments;");
    const handoffsRes = await db.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM conversations WHERE status = 'human_handoff_requested';"
    );

    return NextResponse.json({
      success: true,
      metrics: {
        totalLeads: parseInt(leadsRes.rows[0]?.count || "0", 10),
        qualifiedLeads: parseInt(qualifiedRes.rows[0]?.count || "0", 10),
        hotLeads: parseInt(hotLeadsRes.rows[0]?.count || "0", 10),
        totalCustomers: parseInt(customersRes.rows[0]?.count || "0", 10),
        activeConversations: parseInt(conversationsRes.rows[0]?.count || "0", 10),
        bookedAppointments: parseInt(appointmentsRes.rows[0]?.count || "0", 10),
        pendingHandoffs: parseInt(handoffsRes.rows[0]?.count || "0", 10),
      },
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    return handleApiError(err, "AdminMetricsAPI");
  }
}
