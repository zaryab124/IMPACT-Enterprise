import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/packages/auth/session";
import { appointmentService } from "@/packages/appointments";
import { handleApiError } from "@/packages/errors/errorHandler";

const updateStatusSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "rescheduled", "cancelled", "completed"]),
  notes: z.string().max(1000).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission(req, "appointments:manage");
    const { id } = params;
    const body = await req.json();
    const validated = updateStatusSchema.parse(body);

    const updated = await appointmentService.updateStatus(id, validated.status, validated.notes);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return handleApiError(err, "AdminAppointmentStatusAPI");
  }
}
