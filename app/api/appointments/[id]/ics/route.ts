import { NextRequest, NextResponse } from "next/server";
import { appointmentService } from "@/packages/appointments";
import { handleApiError, NotFoundError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const appt = await appointmentService.getAppointment(id);

    if (!appt) {
      throw new NotFoundError(`Appointment with ID ${id} not found`);
    }

    const icsContent = appt.calendarLinks.icsContent;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="impact-consultation-${id.slice(0, 8)}.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    return handleApiError(err, "AppointmentIcsDownloadAPI");
  }
}
