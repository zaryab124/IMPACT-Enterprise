import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { appointmentService } from "@/packages/appointments";
import { handleApiError } from "@/packages/errors/errorHandler";

const bookingRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("A valid business email is required").max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(100).optional(),
  startTime: z.string().min(10, "Valid startTime ISO string is required"),
  timezone: z.string().max(50).optional().default("UTC"),
  notes: z.string().max(1000).optional(),
  leadId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = bookingRequestSchema.parse(body);

    const booking = await appointmentService.bookConsultation(validated);

    return NextResponse.json({
      success: true,
      data: booking,
    }, { status: 201 });
  } catch (err) {
    return handleApiError(err, "AppointmentsBookAPI");
  }
}
