import { appointmentService } from "../appointmentService";
import { slotEngine } from "../slotEngine";
import { calendarService } from "../calendarService";
import { toolDispatcher } from "../../ai/tools/toolDispatcher";
import { db } from "../../database";
import { seedDevelopmentDatabase } from "../../database/seed";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`  ▶ Running test: ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    results.push({ name, passed: true, durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
    results.push({ name, passed: false, error: err.message, durationMs });
  }
}

export async function runAllAppointmentTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 9 APPOINTMENTS & CALENDAR BOOKING");
  console.log("=======================================================\n");

  let adminToken = "";
  let viewerToken = "";
  let apiApptId = "";

  // 0. Database & System Readiness Check
  await runTest("Database & System Readiness Check", async () => {
    await seedDevelopmentDatabase();

    // Verify appointments and notifications tables
    const tableRes = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
    const tableNames = tableRes.rows.map((r: any) => r.table_name);
    if (!tableNames.includes("appointments") || !tableNames.includes("notifications")) {
      throw new Error("Missing appointments or notifications tables in database");
    }

    // Authenticate admin
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "admin@impact.enterprise",
        password: "AdminPassword2026!",
      }),
    });
    if (adminLoginRes.status !== 200) {
      throw new Error(`Admin login failed: HTTP ${adminLoginRes.status}`);
    }
    const adminData = await adminLoginRes.json();
    adminToken = adminData.token;

    // Authenticate viewer
    const viewerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "viewer@impact.enterprise",
        password: "ViewerPassword2026!",
      }),
    });
    if (viewerLoginRes.status !== 200) {
      throw new Error(`Viewer login failed: HTTP ${viewerLoginRes.status}`);
    }
    const viewerData = await viewerLoginRes.json();
    viewerToken = viewerData.token;
  });

  // 1. Business Hours & Slot Generation Engine
  await runTest("Business Hours Slot Generation & Weekend Filtering", async () => {
    // 2026-10-14 is a Wednesday
    const slotsResult = await appointmentService.getAvailableSlots("2026-10-14", "UTC");
    if (slotsResult.totalSlots !== 9) {
      throw new Error(`Expected 9 total business slots for Wednesday, got ${slotsResult.totalSlots}`);
    }

    // Verify 45 min duration and 15 min buffer
    const firstSlot = slotsResult.availableSlots[0];
    const diffMins = (new Date(firstSlot.endTime).getTime() - new Date(firstSlot.startTime).getTime()) / 60000;
    if (diffMins !== 45) {
      throw new Error(`Expected 45-minute slot duration, got ${diffMins} minutes`);
    }

    // 2026-10-17 is a Saturday (Weekend)
    const weekendResult = await appointmentService.getAvailableSlots("2026-10-17", "UTC");
    if (weekendResult.totalSlots !== 0 || weekendResult.availableSlots.length !== 0) {
      throw new Error(`Expected 0 slots for weekend date, got ${weekendResult.totalSlots}`);
    }
  });

  // 2. Conflict Detection & Overlapping Booking Rejection
  await runTest("Atomic Conflict Detection & Overlapping Booking Rejection", async () => {
    const targetSlot = "2026-11-04T10:00:00.000Z";

    // First booking should succeed
    const firstBooking = await appointmentService.bookConsultation({
      name: "Marcus Aurelius",
      email: "marcus@rome-holdings.com",
      company: "Rome Capital Holdings",
      startTime: targetSlot,
      timezone: "UTC",
      notes: "Architectural consultation on automated deal engines",
    });

    if (!firstBooking.success || !firstBooking.appointmentId) {
      throw new Error("First booking failed unexpectedly");
    }

    // Second booking on IDENTICAL slot must be rejected
    let conflictRejected = false;
    try {
      await appointmentService.bookConsultation({
        name: "Lucius Verus",
        email: "lucius@rome-holdings.com",
        startTime: targetSlot,
      });
    } catch (err: any) {
      if (err.message.includes("conflicts with an existing booking")) {
        conflictRejected = true;
      }
    }

    if (!conflictRejected) {
      throw new Error("Conflict detection failed: Duplicate slot was booked!");
    }

    // Overlapping booking (15 mins into the 45-min slot) must also be rejected
    let overlapRejected = false;
    try {
      await appointmentService.bookConsultation({
        name: "Commodus Caesar",
        email: "commodus@rome-holdings.com",
        startTime: "2026-11-04T10:15:00.000Z",
      });
    } catch (err: any) {
      if (err.message.includes("conflicts with an existing booking")) {
        overlapRejected = true;
      }
    }

    if (!overlapRejected) {
      throw new Error("Conflict detection failed: Overlapping slot was booked!");
    }
  });

  // 3. Full Appointment Lifecycle (Create -> Confirm -> Reschedule -> Complete)
  let testApptId = "";
  await runTest("Full Appointment Lifecycle (Create -> Confirm -> Reschedule -> Complete)", async () => {
    const initialTime = "2026-11-05T14:00:00.000Z";
    const rescheduledTime = "2026-11-06T15:00:00.000Z";

    // 1. Create
    const booking = await appointmentService.bookConsultation({
      name: "Alexander Hamilton",
      email: "alex@treasury-tech.gov",
      startTime: initialTime,
      notes: "Financial workflow automation discovery",
    });
    testApptId = booking.appointmentId;
    if (booking.status !== "scheduled") {
      throw new Error(`Expected status 'scheduled', got '${booking.status}'`);
    }

    // 2. Confirm
    const confirmed = await appointmentService.updateStatus(testApptId, "confirmed");
    if (confirmed.status !== "confirmed") {
      throw new Error(`Expected status 'confirmed', got '${confirmed.status}'`);
    }

    // 3. Reschedule
    const rescheduled = await appointmentService.reschedule(testApptId, rescheduledTime, "Moved to Friday");
    if (rescheduled.status !== "rescheduled" || new Date(rescheduled.start_time).toISOString() !== rescheduledTime) {
      throw new Error(`Reschedule failed: status=${rescheduled.status}, time=${rescheduled.start_time}`);
    }

    // 4. Verify original slot is now freed up for booking
    const originalSlotNowAvailable = await appointmentService.bookConsultation({
      name: "Thomas Jefferson",
      email: "thomas@monticello-ventures.com",
      startTime: initialTime,
    });
    if (!originalSlotNowAvailable.success) {
      throw new Error("Freed slot could not be booked after rescheduling");
    }

    // 5. Complete
    const completed = await appointmentService.updateStatus(testApptId, "completed");
    if (completed.status !== "completed") {
      throw new Error(`Expected status 'completed', got '${completed.status}'`);
    }
  });

  // 4. RFC 5545 .ics iCalendar Compliance
  await runTest("RFC 5545 .ics iCalendar Compliance & Format Verification", async () => {
    const payload = {
      id: "99999999-9999-9999-9999-999999999999",
      title: "Discovery Session: Nova Robotics",
      startTime: "2026-11-12T10:00:00.000Z",
      endTime: "2026-11-12T10:45:00.000Z",
      customerName: "Dr. Maya Lin",
      customerEmail: "maya@novarobotics.ai",
      meetingLink: "https://meet.impact-enterprise.com/discovery-novarobotics",
      notes: "Autonomous agent teleoperation roadmap",
    };

    const ics = calendarService.generateIcs(payload);

    if (!ics.startsWith("BEGIN:VCALENDAR") || !ics.endsWith("END:VCALENDAR")) {
      throw new Error("ICS missing valid VCALENDAR wrapper tags");
    }
    if (!ics.includes("VERSION:2.0") || !ics.includes("METHOD:REQUEST")) {
      throw new Error("ICS missing mandatory VERSION or METHOD headers");
    }
    if (!ics.includes("BEGIN:VEVENT") || !ics.includes("END:VEVENT")) {
      throw new Error("ICS missing valid VEVENT block");
    }
    if (!ics.includes("UID:appointment-99999999-9999-9999-9999-999999999999@impact-enterprise.com")) {
      throw new Error("ICS missing standard UID field");
    }
    if (!ics.includes("DTSTART:20261112T100000Z") || !ics.includes("DTEND:20261112T104500Z")) {
      throw new Error("ICS timestamps not properly formatted in UTC (YYYYMMDDTHHMMSSZ)");
    }
    if (!ics.includes("ORGANIZER;CN=IMPACT Enterprise Engineering")) {
      throw new Error("ICS missing verified ORGANIZER signature");
    }
  });

  // 5. Google Calendar 1-Click Template URL Generation
  await runTest("Google Calendar 1-Click Template URL Generation", async () => {
    const payload = {
      id: "test-id-1234",
      title: "Technical Discovery Consultation",
      startTime: "2026-11-15T14:00:00.000Z",
      endTime: "2026-11-15T14:45:00.000Z",
      customerName: "Alice Walker",
      customerEmail: "alice@walker.com",
      meetingLink: "https://meet.impact-enterprise.com/discovery-alice",
    };

    const url = calendarService.generateGoogleCalendarUrl(payload);

    if (!url.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE")) {
      throw new Error("Invalid Google Calendar template URL base");
    }
    if (!url.includes("dates=20261115T140000Z%2F20261115T144500Z")) {
      throw new Error(`Google Calendar dates parameter malformed in: ${url}`);
    }
    if (!url.includes("location=https%3A%2F%2Fmeet.impact-enterprise.com%2Fdiscovery-alice")) {
      throw new Error("Google Calendar location meeting link missing");
    }
  });

  // 6. AI Tools & Function Calling Integration (bookAppointment & checkAvailability)
  await runTest("AI Tool Execution: checkAppointmentAvailability & bookAppointment", async () => {
    // 1. checkAppointmentAvailability tool
    const checkRes = await toolDispatcher.executeTool("checkAppointmentAvailability", {
      preferredDate: "2026-11-18",
      timezone: "UTC",
    });

    if (!checkRes.success) {
      throw new Error(`checkAppointmentAvailability failed: ${checkRes.error}`);
    }
    const checkData = checkRes.data as any;
    if (!Array.isArray(checkData.availableSlots) || checkData.availableSlots.length === 0) {
      throw new Error("checkAppointmentAvailability returned 0 available slots");
    }

    // 2. bookAppointment tool
    const bookRes = await toolDispatcher.executeTool("bookAppointment", {
      name: "Satoshi Nakamoto",
      email: "satoshi@bitcoin-ledger.org",
      startTime: "2026-11-18T16:00:00.000Z",
      timezone: "UTC",
      notes: "Decentralized consensus and cryptographic state machines",
    });

    if (!bookRes.success) {
      throw new Error(`bookAppointment tool failed: ${bookRes.error}`);
    }
    const bookData = bookRes.data as any;
    if (!bookData.appointmentId || !bookData.meetingLink || !bookData.googleCalendarUrl) {
      throw new Error("bookAppointment missing confirmation payload details");
    }

    // Verify persisted in PostgreSQL
    const dbAppt = await db.query("SELECT * FROM appointments WHERE id = $1;", [bookData.appointmentId]);
    if (dbAppt.rows.length === 0) {
      throw new Error("Appointment booked by AI tool was not found in PostgreSQL");
    }
  });

  // 7. Public Availability, Booking, and ICS Download Endpoints
  await runTest("Public APIs: /availability, /book, and /[id]/ics", async () => {
    // A. Availability API
    const availRes = await fetch(`${BASE_URL}/api/appointments/availability?date=2026-11-25`);
    if (availRes.status !== 200) {
      throw new Error(`Availability API failed: HTTP ${availRes.status}`);
    }
    const availData = await availRes.json();
    if (!availData.success || !Array.isArray(availData.data.availableSlots)) {
      throw new Error("Malformed availability API response");
    }

    // B. Booking API
    const randomOffsetDays = 40 + Math.floor(Math.random() * 200);
    const futureDate = new Date(Date.now() + randomOffsetDays * 86400000);
    futureDate.setUTCHours(10, 0, 0, 0);
    const futureStartTime = futureDate.toISOString();

    const bookRes = await fetch(`${BASE_URL}/api/appointments/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Grace Hopper",
        email: `grace-${Date.now()}@compiler-foundation.org`,
        startTime: futureStartTime,
        timezone: "UTC",
        notes: "Automated code analysis & compiler pipelines",
      }),
    });

    if (bookRes.status !== 201) {
      const errBody = await bookRes.text();
      throw new Error(`Booking API failed: HTTP ${bookRes.status}: ${errBody}`);
    }
    const bookData = await bookRes.json();
    apiApptId = bookData.data.appointmentId;

    // C. ICS Download API
    const icsRes = await fetch(`${BASE_URL}/api/appointments/${apiApptId}/ics`);
    if (icsRes.status !== 200) {
      throw new Error(`ICS download failed: HTTP ${icsRes.status}`);
    }
    const contentType = icsRes.headers.get("content-type");
    if (!contentType?.includes("text/calendar")) {
      throw new Error(`Expected text/calendar content-type, got '${contentType}'`);
    }
    const icsText = await icsRes.text();
    if (!icsText.includes("BEGIN:VCALENDAR") || !icsText.includes(apiApptId)) {
      throw new Error("Downloaded ICS payload is corrupted or missing appointment ID");
    }
  });

  // 8. Admin API Security & RBAC Enforcement
  await runTest("Admin API RBAC Gate: appointments:view and appointments:manage", async () => {
    // 1. Unauthenticated request to /api/admin/appointments -> 401
    const unauthRes = await fetch(`${BASE_URL}/api/admin/appointments`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got HTTP ${unauthRes.status}`);
    }

    // 2. VIEWER requesting appointments listing -> 200 OK
    const viewerRes = await fetch(`${BASE_URL}/api/admin/appointments`, {
      headers: { Authorization: `Bearer ${viewerToken}` },
    });
    if (viewerRes.status !== 200) {
      throw new Error(`Viewer should have appointments:view permission, got HTTP ${viewerRes.status}`);
    }

    // 3. VIEWER attempting to update appointment status -> 403 Forbidden
    const viewerStatusRes = await fetch(`${BASE_URL}/api/admin/appointments/${apiApptId}/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${viewerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (viewerStatusRes.status !== 403) {
      throw new Error(`Viewer should NOT have appointments:manage permission, got HTTP ${viewerStatusRes.status}`);
    }

    // 4. SUPER_ADMIN updating status -> 200 OK
    const adminStatusRes = await fetch(`${BASE_URL}/api/admin/appointments/${apiApptId}/status`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "rescheduled" }),
    });
    if (adminStatusRes.status !== 200) {
      throw new Error(`Admin should be permitted to update status, got HTTP ${adminStatusRes.status}`);
    }
  });

  // 9. Internal Notifications Persistence
  await runTest("Internal Notifications Telemetry in notifications Table", async () => {
    const notifRes = await db.query(
      `SELECT type, priority, title, message, payload
       FROM notifications
       WHERE type = 'APPOINTMENT_SCHEDULED'
       ORDER BY created_at DESC
       LIMIT 5;`
    );

    if (notifRes.rows.length === 0) {
      throw new Error("No APPOINTMENT_SCHEDULED notification recorded in database");
    }

    const latest = notifRes.rows[0];
    if (latest.priority !== "high") {
      throw new Error(`Expected 'high' priority notification, got '${latest.priority}'`);
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`Total Appointment Tests: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log("-------------------------------------------------------\n");

  if (failedCount > 0) {
    console.error("Failed Tests:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(`  ✖ ${r.name}: ${r.error}`));
    return false;
  }

  console.log("\x1b[32mALL APPOINTMENTS & CALENDAR BOOKING TESTS PASSED!\x1b[0m\n");
  return true;
}

if (require.main === module) {
  runAllAppointmentTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal test execution crash:", err);
      process.exit(1);
    });
}
