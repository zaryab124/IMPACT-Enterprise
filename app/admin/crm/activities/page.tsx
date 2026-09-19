"use client";

import React, { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { CrmActivity } from "@/packages/growth-os/crm";

export default function CrmActivitiesPage() {
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-accent" />
            <span>Complete Audit & Activity Timeline</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {activities.length} Events
            </span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Immutable audit trail of all CRM entity transitions.</p>
        </div>
        <button
          onClick={fetchActivities}
          className="p-2 rounded-xl border border-brand-border text-brand-charcoal hover:bg-brand-surface"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted text-xs">Loading activity timeline...</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">No activity recorded yet.</div>
        ) : (
          <div className="relative border-l-2 border-brand-border ml-3 space-y-6">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-6 space-y-1 text-xs">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-surface border-2 border-brand-accent flex items-center justify-center" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-dark">{act.subject}</span>
                  <span className="font-mono text-brand-muted text-[11px]">
                    {new Date(act.performed_at || act.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-brand-charcoal leading-relaxed">{act.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
