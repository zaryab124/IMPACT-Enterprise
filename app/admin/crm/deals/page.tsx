"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Search, Plus, RefreshCw, Kanban } from "lucide-react";
import { CrmDeal } from "@/packages/growth-os/crm";

export default function CrmDealsPage() {
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/deals");
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const totalValue = deals.reduce((acc, d) => acc + (Number(d.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-accent" />
            <span>Deals & Revenue Pipeline</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {deals.length} Deals (${totalValue.toLocaleString()})
            </span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Commercial proposals, revenue contracts, and deal stages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/crm/pipeline"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Switch to Kanban</span>
          </Link>
          <Link
            href="/admin/crm/pipeline"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </Link>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-accent mb-2" />
            <span className="text-xs">Loading deals...</span>
          </div>
        ) : deals.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">No deals created yet.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/70 text-[11px] font-bold text-brand-muted uppercase">
                <th className="py-3 px-4">Deal Title</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-brand-surface/40">
                  <td className="py-3 px-4 font-bold text-brand-dark">{d.title}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    ${Number(d.amount).toLocaleString()} {d.currency}
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal">{d.service_interest || "AI models"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-brand-surface border border-brand-border">
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-muted font-mono">{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
