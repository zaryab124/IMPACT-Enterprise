import { randomUUID } from "crypto";
import {
  AppointmentWithCustomer,
  BookingRequest,
  BookingResult,
  ConsultationSlot,
  SlotAvailabilityQuery,
} from "./types";
import { slotEngine } from "./slotEngine";
import { calendarService } from "./calendarService";
import { appointmentRepository, AppointmentRecord } from "../database/repositories/appointmentRepository";
import { customerRepository } from "../database/repositories/customerRepository";
import { leadRepository } from "../database/repositories/leadRepository";
import { db } from "../database";
import { logger } from "../logging/logger";
import { ValidationError, NotFoundError, ConflictError } from "../errors/errorHandler";

export class AppointmentService {
  /**
   * Query open consultation slots for a specific date
   */
  public async getAvailableSlots(
    dateStr: string,
    timezone = "UTC"
  ): Promise<{
    date: string;
    timezone: string;
    totalSlots: number;
    availableSlots: ConsultationSlot[];
  }> {
    // Determine 24h window for the date
    const startOfDay = `${dateStr}T00:00:00.000Z`;
    const endOfDay = `${dateStr}T23:59:59.999Z`;

    // Fetch existing confirmed/scheduled appointments on this day
    const existing = await appointmentRepository.findBetween(startOfDay, endOfDay);

    // Generate slots
    const allSlots = slotEngine.generateSlotsForDate(
      { date: dateStr, timezone },
      existing
    );

    const availableSlots = allSlots.filter((s) => s.isAvailable);

    return {
      date: dateStr,
      timezone,
      totalSlots: allSlots.length,
      availableSlots,
    };
  }

  /**
   * Book a technical discovery consultation session
   */
  public async bookConsultation(req: BookingRequest): Promise<BookingResult> {
    logger.info(`Initiating consultation booking for ${req.email} at ${req.startTime}`, {
      module: "AppointmentService",
    });

    const startTimeDate = new Date(req.startTime);
    if (isNaN(startTimeDate.getTime())) {
      throw new ValidationError(`Invalid start time format: '${req.startTime}'. Expected ISO 8601 string.`);
    }

    // Must be in the future
    if (startTimeDate.getTime() <= Date.now()) {
      throw new ValidationError("Consultation time must be in the future.");
    }

    const durationMinutes = 45;
    const endTimeDate = new Date(startTimeDate.getTime() + durationMinutes * 60 * 1000);
    const startTimeIso = startTimeDate.toISOString();
    const endTimeIso = endTimeDate.toISOString();

    // 1. Conflict Detection
    const hasConflict = await appointmentRepository.hasConflict(startTimeIso, endTimeIso);
    if (hasConflict) {
      throw new ConflictError(
        `The requested consultation time (${startTimeIso}) conflicts with an existing booking. Please select another slot.`
      );
    }

    // 2. Resolve or Create Customer Record
    const customer = await customerRepository.upsert({
      name: req.name,
      email: req.email,
      phone: req.phone,
      source: "consultation_booking",
    });

    // 3. Resolve Lead (if provided or existing for customer)
    let leadId = req.leadId;
    if (!leadId) {
      const existingLeads = await leadRepository.findByCustomerId(customer.id);
      if (existingLeads.length > 0) {
        leadId = existingLeads[0].id;
      }
    }

    // 4. Generate Unique Meeting Room Link
    const roomId = randomUUID().replace(/-/g, "").slice(0, 10);
    const meetingLink = `https://meet.impact-enterprise.com/discovery-${roomId}`;

    const title = `Technical Discovery Consultation: ${req.name} (${req.company || "Enterprise"})`;
    const timezone = req.timezone || "UTC";

    // 5. Persist Appointment in Database
    const appointment = await appointmentRepository.create({
      customerId: customer.id,
      leadId,
      title,
      startTime: startTimeIso,
      endTime: endTimeIso,
      timezone,
      meetingLink,
      notes: req.notes || `Consultation booked for ${req.name}. Problem context: ${req.notes || "Technical discovery"}.`,
    });

    // 6. Generate Calendar Links
    const calendarLinks = calendarService.generateCalendarLinks({
      id: appointment.id,
      title: appointment.title,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      timezone: appointment.timezone,
      meetingLink: appointment.meeting_link || meetingLink,
      customerName: customer.name,
      customerEmail: customer.email,
      notes: appointment.notes || undefined,
    });

    // 7. Dispatch Internal Notification
    try {
      await db.query(
        `INSERT INTO notifications (type, priority, title, message, payload)
         VALUES ('APPOINTMENT_SCHEDULED', 'high', $1, $2, $3);`,
        [
          `New Consultation: ${req.name}`,
          `Confirmed discovery session on ${new Date(startTimeIso).toLocaleString()} with ${req.name} (${req.email}).`,
          JSON.stringify({
            appointmentId: appointment.id,
            customerId: customer.id,
            leadId,
            startTime: startTimeIso,
            meetingLink,
          }),
        ]
      );
    } catch (notifErr: any) {
      logger.warn(`Failed to dispatch appointment notification: ${notifErr.message}`, {
        module: "AppointmentService",
      });
    }

    logger.info(`Consultation booked successfully: ID=${appointment.id}, Time=${startTimeIso}`, {
      module: "AppointmentService",
    });

    return {
      success: true,
      appointmentId: appointment.id,
      customerId: customer.id,
      leadId,
      title: appointment.title,
      status: appointment.status,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      timezone: appointment.timezone,
      consultant: "IMPACT Enterprise Engineering Director",
      meetingLink,
      calendarLinks,
      confirmationMessage: `Your technical discovery consultation is confirmed for ${new Date(startTimeIso).toUTCString()}. A Google Calendar invitation and meeting link have been prepared.`,
    };
  }

  /**
   * Reschedule an existing appointment
   */
  public async reschedule(
    appointmentId: string,
    newStartTime: string,
    notes?: string
  ): Promise<AppointmentRecord> {
    const appt = await appointmentRepository.findById(appointmentId);
    if (!appt) {
      throw new NotFoundError(`Appointment not found with ID ${appointmentId}`);
    }

    const startTimeDate = new Date(newStartTime);
    if (isNaN(startTimeDate.getTime())) {
      throw new ValidationError(`Invalid newStartTime: '${newStartTime}'`);
    }

    if (startTimeDate.getTime() <= Date.now()) {
      throw new ValidationError("Rescheduled consultation time must be in the future.");
    }

    const durationMinutes = 45;
    const endTimeDate = new Date(startTimeDate.getTime() + durationMinutes * 60 * 1000);
    const startTimeIso = startTimeDate.toISOString();
    const endTimeIso = endTimeDate.toISOString();

    // Check conflict excluding current appointment
    const hasConflict = await appointmentRepository.hasConflict(
      startTimeIso,
      endTimeIso,
      appointmentId
    );

    if (hasConflict) {
      throw new ConflictError(`The requested rescheduled time (${startTimeIso}) conflicts with an existing booking.`);
    }

    const updated = await appointmentRepository.update(appointmentId, {
      startTime: startTimeIso,
      endTime: endTimeIso,
      status: "rescheduled",
      notes: notes ? `${appt.notes || ""}\n[Rescheduled]: ${notes}` : appt.notes,
    });

    if (!updated) {
      throw new NotFoundError(`Appointment not found with ID ${appointmentId}`);
    }

    logger.info(`Appointment ${appointmentId} rescheduled to ${startTimeIso}`, {
      module: "AppointmentService",
    });

    return updated;
  }

  /**
   * Update appointment status
   */
  public async updateStatus(
    appointmentId: string,
    status: AppointmentRecord["status"],
    notes?: string
  ): Promise<AppointmentRecord> {
    const updated = await appointmentRepository.updateStatus(appointmentId, status, notes);
    if (!updated) {
      throw new NotFoundError(`Appointment not found with ID ${appointmentId}`);
    }
    return updated;
  }

  /**
   * List appointments with customer and company details
   */
  public async listWithDetails(
    limit = 50,
    offset = 0,
    statusFilter?: string
  ): Promise<AppointmentWithCustomer[]> {
    const records = await appointmentRepository.listWithDetails(limit, offset, statusFilter);
    return records.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      startTime: r.start_time,
      endTime: r.end_time,
      timezone: r.timezone,
      meetingLink: r.meeting_link,
      notes: r.notes,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      companyName: r.company_name,
      leadId: r.lead_id,
      leadStage: r.lead_stage,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  /**
   * Get single appointment with calendar links
   */
  public async getAppointment(appointmentId: string) {
    const appt = await appointmentRepository.findById(appointmentId);
    if (!appt) return null;

    const customer = await customerRepository.findById(appt.customer_id);
    const calendarLinks = calendarService.generateCalendarLinks({
      id: appt.id,
      title: appt.title,
      startTime: appt.start_time,
      endTime: appt.end_time,
      timezone: appt.timezone,
      meetingLink: appt.meeting_link || undefined,
      customerName: customer?.name || "Client",
      customerEmail: customer?.email || "client@impact-enterprise.internal",
      notes: appt.notes || undefined,
    });

    return {
      ...appt,
      customer,
      calendarLinks,
    };
  }
}

export const appointmentService = new AppointmentService();
