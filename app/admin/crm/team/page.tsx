"use client";

import React, { useState, useEffect } from "react";
import { Users2, Shield, UserCheck, Mail } from "lucide-react";

export default function CrmTeamPage() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setTeamMembers([
            { id: data.user.id, name: `${data.user.firstName} ${data.user.lastName}`, email: data.user.email, role: data.user.roles[0], status: "ACTIVE" },
            { id: "seed-rep-1", name: "Sarah SalesManager", email: "sales.manager@impact.enterprise", role: "SALES_MANAGER", status: "ACTIVE" },
            { id: "seed-rep-2", name: "Alex SalesAgent", email: "sales.agent@impact.enterprise", role: "SALES_AGENT", status: "ACTIVE" },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <Users2 className="w-4 h-4 text-brand-accent" />
            <span>Sales & Commercial Team Management</span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Sales representatives, team managers, and role assignments.</p>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface/70 text-[11px] font-bold text-brand-muted uppercase">
              <th className="py-3 px-4">Member Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {teamMembers.map((m) => (
              <tr key={m.id} className="hover:bg-brand-surface/40">
                <td className="py-3 px-4 font-bold text-brand-dark">{m.name}</td>
                <td className="py-3 px-4 text-brand-muted">{m.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-surface border border-brand-border">
                    {m.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
