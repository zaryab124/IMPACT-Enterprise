import { ConsultationSlot, SlotAvailabilityQuery } from "./types";
import { AppointmentRecord } from "../database/repositories/appointmentRepository";

export interface SlotEngineConfig {
  startHourUtc: number; // 9 = 09:00 UTC
  endHourUtc: number;   // 18 = 18:00 UTC
  durationMinutes: number; // 45 minutes
  bufferMinutes: number;   // 15 minutes
  consultantTitle: string;
}

export const DEFAULT_SLOT_CONFIG: SlotEngineConfig = {
  startHourUtc: 9,
  endHourUtc: 18,
  durationMinutes: 45,
  bufferMinutes: 15,
  consultantTitle: "IMPACT Enterprise Engineering Director",
};

export class SlotEngine {
  private config: SlotEngineConfig;

  constructor(config: Partial<SlotEngineConfig> = {}) {
    this.config = { ...DEFAULT_SLOT_CONFIG, ...config };
  }

  /**
   * Generate consultation slots for a specific target date
   */
  public generateSlotsForDate(
    query: SlotAvailabilityQuery,
    existingAppointments: AppointmentRecord[] = [],
    referenceTimeMs = Date.now()
  ): ConsultationSlot[] {
    const { date, timezone = "UTC" } = query;
    const slots: ConsultationSlot[] = [];

    // Parse date (YYYY-MM-DD)
    const [yearStr, monthStr, dayStr] = date.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed
    const day = parseInt(dayStr, 10);

    // Create a base UTC date
    const targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0));

    // Check if weekend (0 = Sunday, 6 = Saturday in UTC)
    const dayOfWeek = targetDate.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return []; // No business hours on weekends
    }

    const slotIntervalMinutes = this.config.durationMinutes + this.config.bufferMinutes; // 60 mins

    for (let hour = this.config.startHourUtc; hour < this.config.endHourUtc; hour++) {
      const slotStart = new Date(Date.UTC(year, month, day, hour, 0, 0));
      const slotEnd = new Date(slotStart.getTime() + this.config.durationMinutes * 60 * 1000);

      // Check if in the past
      const isPast = slotStart.getTime() <= referenceTimeMs;

      // Check if conflicts with existing scheduled or confirmed appointment
      const hasConflict = existingAppointments.some((appt) => {
        const apptStart = new Date(appt.start_time).getTime();
        const apptEnd = new Date(appt.end_time).getTime();
        return (
          appt.status !== "cancelled" &&
          slotStart.getTime() < apptEnd &&
          slotEnd.getTime() > apptStart
        );
      });

      const isAvailable = !isPast && !hasConflict;

      // Time format (e.g. "10:00 AM")
      const hours12 = hour % 12 === 0 ? 12 : hour % 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const timeFormatted = `${hours12.toString().padStart(2, "0")}:00 ${ampm}`;

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        timeFormatted,
        dateFormatted: date,
        timezone,
        isAvailable,
        consultantTitle: this.config.consultantTitle,
      });
    }

    return slots;
  }
}

export const slotEngine = new SlotEngine();
