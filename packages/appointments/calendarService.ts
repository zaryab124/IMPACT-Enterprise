import { CalendarLinks } from "./types";

export interface CalendarEventPayload {
  id: string;
  title: string;
  startTime: string | Date;
  endTime: string | Date;
  timezone?: string;
  meetingLink?: string;
  customerName: string;
  customerEmail: string;
  notes?: string;
}

export class CalendarService {
  /**
   * Format Date to standard iCalendar UTC string format: YYYYMMDDTHHMMSSZ
   */
  public formatIcsDate(dateInput: string | Date): string {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = d.getUTCFullYear();
    const month = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());
    const seconds = pad(d.getUTCSeconds());

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Generate RFC 5545 compliant .ics iCalendar file content
   */
  public generateIcs(payload: CalendarEventPayload): string {
    const dtStamp = this.formatIcsDate(new Date());
    const dtStart = this.formatIcsDate(payload.startTime);
    const dtEnd = this.formatIcsDate(payload.endTime);
    const location = payload.meetingLink || "https://meet.impact-enterprise.com";
    const notesClean = (payload.notes || "Technical discovery consultation with IMPACT Enterprise engineering directors.")
      .replace(/\r?\n/g, "\\n");

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//IMPACT Enterprise//Consultation Booking System//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:appointment-${payload.id}@impact-enterprise.com`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${payload.title}`,
      `DESCRIPTION:${notesClean}\\n\\nMeeting Link: ${location}`,
      `LOCATION:${location}`,
      "ORGANIZER;CN=IMPACT Enterprise Engineering:mailto:consultations@impact-enterprise.com",
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${payload.customerName}:mailto:${payload.customerEmail}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    return icsLines.join("\r\n");
  }

  /**
   * Generate 1-Click Google Calendar event template URL
   */
  public generateGoogleCalendarUrl(payload: CalendarEventPayload): string {
    const dtStart = this.formatIcsDate(payload.startTime);
    const dtEnd = this.formatIcsDate(payload.endTime);
    const location = payload.meetingLink || "https://meet.impact-enterprise.com";
    const details = `${payload.notes || "Technical discovery consultation with IMPACT Enterprise engineering directors."}\n\nMeeting Link: ${location}`;

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: payload.title,
      dates: `${dtStart}/${dtEnd}`,
      details,
      location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Generate full bundle of calendar links
   */
  public generateCalendarLinks(payload: CalendarEventPayload, baseUrl = ""): CalendarLinks {
    const icsContent = this.generateIcs(payload);
    const googleCalendarUrl = this.generateGoogleCalendarUrl(payload);
    const icsDownloadUrl = `${baseUrl}/api/appointments/${payload.id}/ics`;
    const meetingLink = payload.meetingLink || `https://meet.impact-enterprise.com/discovery-${payload.id.slice(0, 8)}`;

    return {
      googleCalendarUrl,
      icsDownloadUrl,
      icsContent,
      meetingLink,
    };
  }
}

export const calendarService = new CalendarService();
