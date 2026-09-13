import { ExportType } from "../types";

/**
 * Escapes a field according to RFC 4180 specifications.
 * If the field contains commas, double quotes, or line breaks, it is enclosed in double quotes.
 * Existing double quotes are escaped by doubling them.
 */
export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let str: string;
  if (typeof value === "object") {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }

  // Check if quoting is needed
  const needsQuotes = /[",\r\n]/.test(str);
  if (needsQuotes) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generates an RFC 4180-compliant CSV string from headers and array of records.
 */
export function formatCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvField).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}

/**
 * Maps database rows to exportable CSV datasets based on entity type.
 */
export function buildCsvExport(type: ExportType, records: any[] = []): { csv: string; rowCount: number } {
  const safeRecords = Array.isArray(records) ? records : [];

  switch (type) {
    case "leads": {
      const headers = [
        "Lead ID",
        "Customer Name",
        "Customer Email",
        "Stage",
        "BANT Score",
        "Budget Range",
        "Timeline",
        "Decision Maker Status",
        "Problem Statement",
        "Proposed Solution",
        "Created At",
      ];
      const rows = safeRecords.map((r) => [
        r.id || "",
        r.customer_name || "",
        r.customer_email || "",
        r.stage || "",
        r.score ?? 0,
        r.budget_range || "",
        r.timeline || "",
        r.decision_maker_status || "",
        r.problem_statement || "",
        r.proposed_solution || "",
        r.created_at ? new Date(r.created_at).toISOString() : "",
      ]);
      return { csv: formatCsv(headers, rows), rowCount: rows.length };
    }

    case "conversations": {
      const headers = [
        "Conversation ID",
        "Customer Name",
        "Customer Email",
        "Channel",
        "Status",
        "Message Count",
        "Created At",
        "Updated At",
      ];
      const rows = safeRecords.map((r) => [
        r.id || "",
        r.customer_name || "",
        r.customer_email || "",
        r.channel || "",
        r.status || "",
        r.message_count ?? 0,
        r.created_at ? new Date(r.created_at).toISOString() : "",
        r.updated_at ? new Date(r.updated_at).toISOString() : "",
      ]);
      return { csv: formatCsv(headers, rows), rowCount: rows.length };
    }

    case "appointments": {
      const headers = [
        "Appointment ID",
        "Customer Name",
        "Customer Email",
        "Title",
        "Status",
        "Start Time",
        "End Time",
        "Timezone",
        "Meeting Link",
        "Created At",
      ];
      const rows = safeRecords.map((r) => [
        r.id || "",
        r.customer_name || "",
        r.customer_email || "",
        r.title || "",
        r.status || "",
        r.start_time ? new Date(r.start_time).toISOString() : "",
        r.end_time ? new Date(r.end_time).toISOString() : "",
        r.timezone || "UTC",
        r.meeting_link || "",
        r.created_at ? new Date(r.created_at).toISOString() : "",
      ]);
      return { csv: formatCsv(headers, rows), rowCount: rows.length };
    }

    case "voice": {
      const headers = [
        "Recording ID",
        "Voice Session ID",
        "Customer Name",
        "Customer Email",
        "Duration (Sec)",
        "Overall Sentiment",
        "Sentiment Score",
        "Key Topics",
        "Action Items Count",
        "Created At",
      ];
      const rows = safeRecords.map((r) => [
        r.id || "",
        r.voice_session_id || "",
        r.customer_name || "",
        r.customer_email || "",
        r.duration_seconds ?? 0,
        r.overall_sentiment || "",
        r.sentiment_score ?? 0,
        Array.isArray(r.key_topics) ? r.key_topics.join("; ") : "",
        Array.isArray(r.action_items) ? r.action_items.length : 0,
        r.created_at ? new Date(r.created_at).toISOString() : "",
      ]);
      return { csv: formatCsv(headers, rows), rowCount: rows.length };
    }

    default:
      throw new Error(`Unsupported export type: ${type}`);
  }
}
