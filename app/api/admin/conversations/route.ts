import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { db } from "@/packages/database";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "conversations:view");
    const res = await db.query(`
      SELECT c.*, cust.name as customer_name, cust.email as customer_email
      FROM conversations c
      JOIN customers cust ON c.customer_id = cust.id
      ORDER BY c.updated_at DESC
      LIMIT 100;
    `);
    return NextResponse.json({
      success: true,
      total: res.rows.length,
      conversations: res.rows,
    });
  } catch (err) {
    return handleApiError(err, "AdminConversationsAPI");
  }
}
