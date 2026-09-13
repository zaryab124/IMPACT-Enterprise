import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/packages/auth/session";
import { appointmentService } from "@/packages/appointments";
import { handleApiError } from "@/packages/errors/errorHandler";

const rescheduleSchema = z.object({
  newStartTime: z.string().min(10, "Valid newStartTime ISO string is required"),
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
    const validated = rescheduleSchema.parse(body);

    const updated = await appointmentService.reschedule(id, validated.newStartTime, validated.notes);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return handleApiError(err, "AdminAppointmentRescheduleAPI");
  }
}
