"use client";

import React, { useState, useEffect } from "react";
import { Building2, RefreshCw, Mail, Phone, Globe } from "lucide-react";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  source: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error(`Failed to load customers (${res.status})`);
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Verified customer profiles captured across all engagement channels
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-dark hover:bg-brand-surface transition-all shadow-xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-accent" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-brand-border text-xs font-bold text-brand-muted uppercase tracking-wider">
          Total Customers: {customers.length}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-brand-muted">
            Querying customer records...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-muted">
            No customers registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-surface/60 border-b border-brand-border text-brand-subtle font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Channel Source</th>
                  <th className="py-3 px-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-surface/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-dark">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-brand-charcoal">{c.email}</td>
                    <td className="py-3 px-4 font-mono text-brand-muted">{c.phone || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-surface border border-brand-border uppercase">
                        {c.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-brand-subtle">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
