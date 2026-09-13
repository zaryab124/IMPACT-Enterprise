export interface ConsultationSlot {
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  timeFormatted: string; // "10:00 AM"
  dateFormatted: string; // "2026-10-15"
  timezone: string;
  isAvailable: boolean;
  consultantTitle: string;
}

export interface SlotAvailabilityQuery {
  date: string; // YYYY-MM-DD
  timezone?: string;
  durationMinutes?: number;
}

export interface BookingRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  startTime: string; // ISO 8601 string
  timezone?: string;
  notes?: string;
  leadId?: string;
  conversationId?: string;
}

export interface CalendarLinks {
  googleCalendarUrl: string;
  icsDownloadUrl: string;
  icsContent: string;
  meetingLink: string;
}

export interface BookingResult {
  success: boolean;
  appointmentId: string;
  customerId: string;
  leadId?: string;
  title: string;
  status: "scheduled" | "confirmed" | "rescheduled" | "cancelled" | "completed";
  startTime: string;
  endTime: string;
  timezone: string;
  consultant: string;
  meetingLink: string;
  calendarLinks: CalendarLinks;
  confirmationMessage: string;
}

export interface AppointmentWithCustomer {
  id: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingLink: string | null;
  notes: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  companyName: string | null;
  leadId: string | null;
  leadStage: string | null;
  createdAt: string;
  updatedAt: string;
}
