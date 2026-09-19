"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, RefreshCw } from "lucide-react";

export default function CrmCalendarPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data.appointments || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-accent" />
            <span>Consultation Calendar & Appointments</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {appointments.length} Consultations
            </span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Scheduled client strategy sessions and technical architecture reviews.</p>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted text-xs">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">No scheduled consultations found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/70 text-[11px] font-bold text-brand-muted uppercase">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Scheduled Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Meeting Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-brand-surface/40">
                  <td className="py-3 px-4 font-bold text-brand-dark">{a.title}</td>
                  <td className="py-3 px-4 font-mono text-brand-charcoal">{new Date(a.start_time).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-brand-surface border border-brand-border">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-accent truncate max-w-xs">{a.meeting_link || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
