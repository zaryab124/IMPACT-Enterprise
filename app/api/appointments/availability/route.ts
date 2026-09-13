import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appointmentService } from "@/packages/appointments";
import { handleApiError } from "@/packages/errors/errorHandler";

const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timezone: z.string().max(50).optional().default("UTC"),
});

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawDate = searchParams.get("date");
    const rawTimezone = searchParams.get("timezone") || "UTC";

    const validated = availabilityQuerySchema.parse({
      date: rawDate,
      timezone: rawTimezone,
    });

    const data = await appointmentService.getAvailableSlots(
      validated.date,
      validated.timezone
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    return handleApiError(err, "AppointmentsAvailabilityAPI");
  }
}
