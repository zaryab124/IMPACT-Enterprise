"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  RefreshCw,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Download,
  ExternalLink,
  Edit2,
  Building,
  User,
  Phone,
  Mail,
  Filter,
} from "lucide-react";

interface AppointmentItem {
  id: string;
  title: string;
  status: "scheduled" | "confirmed" | "rescheduled" | "cancelled" | "completed";
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
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reschedulingAppt, setReschedulingAppt] = useState<AppointmentItem | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [rescheduleNotes, setRescheduleNotes] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = statusFilter === "all" ? "/api/admin/appointments" : `/api/admin/appointments?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load appointments (${res.status})`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load appointments calendar.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle status update
  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update status");
      }
      fetchAppointments();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Handle reschedule submit
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt || !newDate || !newTime) return;
    setRescheduleLoading(true);
    setRescheduleError("");

    try {
      const isoString = `${newDate}T${newTime}:00.000Z`;
      const res = await fetch(`/api/admin/appointments/${reschedulingAppt.id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStartTime: isoString,
          notes: rescheduleNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reschedule appointment");
      }

      setReschedulingAppt(null);
      fetchAppointments();
    } catch (err: any) {
      setRescheduleError(err.message);
    } finally {
      setRescheduleLoading(false);
    }
  };

  // KPI calculations
  const totalCount = appointments.length;
  const scheduledCount = appointments.filter((a) => a.status === "scheduled").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "rescheduled":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "completed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight">
            Consultations & Calendar Engine
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Real-time discovery sessions, conflict-free bookings, and calendar synchronization
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-dark hover:bg-brand-surface transition-all shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-accent" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-card">
          <div className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">
            Total Consultations
          </div>
          <div className="text-2xl font-black text-brand-dark mt-1">{totalCount}</div>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-card">
          <div className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
            Scheduled (Pending)
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{scheduledCount}</div>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-card">
          <div className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
            Confirmed Sessions
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{confirmedCount}</div>
        </div>
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-card">
          <div className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider">
            Completed Engagements
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-brand-border pb-3 overflow-x-auto">
        {["all", "scheduled", "confirmed", "rescheduled", "completed", "cancelled"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              statusFilter === st
                ? "bg-brand-dark text-white shadow-xs"
                : "text-brand-muted hover:text-brand-dark hover:bg-brand-surface"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-brand-muted">
            Loading consultations and calendar data...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-muted">
            No consultations found for filter: &ldquo;{statusFilter}&rdquo;. Consultations booked by the AI Agent or prospects will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-surface/60 border-b border-brand-border text-brand-subtle font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Session Title</th>
                  <th className="py-3 px-4">Customer & Organization</th>
                  <th className="py-3 px-4">Date & Time (UTC)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Meeting Room</th>
                  <th className="py-3 px-4 text-right">Calendar & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {appointments.map((a) => {
                  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(a.title)}&dates=${a.startTime.replace(/[-:]/g, "").slice(0, 15)}Z/${a.endTime.replace(/[-:]/g, "").slice(0, 15)}Z&details=${encodeURIComponent(a.notes || "")}&location=${encodeURIComponent(a.meetingLink || "")}`;

                  return (
                    <tr key={a.id} className="hover:bg-brand-surface/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-brand-dark flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                          <span>{a.title}</span>
                        </div>
                        {a.notes && (
                          <div className="text-[11px] text-brand-muted mt-0.5 line-clamp-1">
                            {a.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-brand-dark flex items-center gap-1.5">
                          <User className="w-3 h-3 text-brand-muted" />
                          <span>{a.customerName}</span>
                        </div>
                        <div className="text-[11px] text-brand-muted flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            {a.customerEmail}
                          </span>
                          {a.companyName && (
                            <span className="flex items-center gap-1">
                              <Building className="w-2.5 h-2.5" />
                              {a.companyName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="text-brand-dark font-medium">
                          {new Date(a.startTime).toLocaleDateString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-brand-muted">
                          {new Date(a.startTime).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(a.endTime).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({a.timezone})
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getStatusBadge(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {a.meetingLink ? (
                          <a
                            href={a.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-brand-accent hover:underline"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join Video</span>
                          </a>
                        ) : (
                          <span className="text-brand-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Google Calendar Link */}
                          <a
                            href={googleCalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Add to Google Calendar"
                            className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Download ICS */}
                          <a
                            href={`/api/appointments/${a.id}/ics`}
                            download
                            title="Download iCalendar (.ics)"
                            className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Quick Status Confirm */}
                          {a.status === "scheduled" && (
                            <button
                              onClick={() => handleStatusUpdate(a.id, "confirmed")}
                              title="Confirm Appointment"
                              className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick Status Complete */}
                          {a.status === "confirmed" && (
                            <button
                              onClick={() => handleStatusUpdate(a.id, "completed")}
                              title="Mark as Completed"
                              className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Reschedule button */}
                          {a.status !== "cancelled" && a.status !== "completed" && (
                            <button
                              onClick={() => {
                                setReschedulingAppt(a);
                                setNewDate(a.startTime.split("T")[0]);
                                setRescheduleError("");
                              }}
                              title="Reschedule Consultation"
                              className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-accent hover:bg-brand-surface transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Cancel button */}
                          {a.status !== "cancelled" && a.status !== "completed" && (
                            <button
                              onClick={() => handleStatusUpdate(a.id, "cancelled")}
                              title="Cancel Appointment"
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <h3 className="font-bold text-brand-dark text-sm">Reschedule Consultation</h3>
                <p className="text-xs text-brand-muted">{reschedulingAppt.title}</p>
              </div>
              <button
                onClick={() => setReschedulingAppt(null)}
                className="text-brand-muted hover:text-brand-dark p-1"
              >
                ✕
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-brand-dark mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Time (UTC)</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs font-mono"
                >
                  <option value="09:00">09:00 AM UTC</option>
                  <option value="10:00">10:00 AM UTC</option>
                  <option value="11:00">11:00 AM UTC</option>
                  <option value="12:00">12:00 PM UTC</option>
                  <option value="13:00">01:00 PM UTC</option>
                  <option value="14:00">02:00 PM UTC</option>
                  <option value="15:00">03:00 PM UTC</option>
                  <option value="16:00">04:00 PM UTC</option>
                  <option value="17:00">05:00 PM UTC</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-dark mb-1">Reschedule Rationale / Notes</label>
                <textarea
                  rows={2}
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Client requested alternate time slot..."
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingAppt(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:bg-brand-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="px-4 py-1.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-brand-charcoal disabled:opacity-50 transition-all shadow-xs"
                >
                  {rescheduleLoading ? "Checking Conflicts..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
