"use client";

import React from "react";
import { Settings, Shield, Sliders, Database } from "lucide-react";
import { LEAD_STATUSES } from "@/packages/growth-os/crm";
import { IMPACT_SERVICES } from "@/packages/growth-os/constants";

export default function CrmSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand-accent" />
          <span>CRM Configuration & Schema Settings</span>
        </h2>
        <p className="text-xs text-brand-muted mt-0.5">Pipeline stages, acquisition channels, and service interest categories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
            Standard Lead Status Lifecycle (8 Stages)
          </h3>
          <div className="space-y-2">
            {LEAD_STATUSES.map((st, i) => (
              <div key={st} className="p-2.5 rounded-xl border border-brand-border bg-brand-surface text-xs flex items-center justify-between">
                <span className="font-bold text-brand-dark">{st}</span>
                <span className="font-mono text-brand-muted text-[11px]">Stage Index {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
            Official Cataloged Services (9 Services)
          </h3>
          <div className="space-y-2">
            {IMPACT_SERVICES.map((s, i) => (
              <div key={s} className="p-2.5 rounded-xl border border-brand-border bg-brand-surface text-xs flex items-center justify-between">
                <span className="font-bold text-brand-dark">{s}</span>
                <span className="font-mono text-emerald-600 font-bold text-[10px]">AUTHORIZED</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
