import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { appointmentService } from "@/packages/appointments";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "appointments:view");
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const appointments = await appointmentService.listWithDetails(limit, offset, statusFilter);
    return NextResponse.json({
      success: true,
      total: appointments.length,
      appointments,
    });
  } catch (err) {
    return handleApiError(err, "AdminAppointmentsAPI");
  }
}
