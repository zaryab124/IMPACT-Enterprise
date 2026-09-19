"use client";

import React, { useState, useEffect } from "react";
import { Building2, Search, Plus, ExternalLink, RefreshCw, X } from "lucide-react";
import { CrmCompany } from "@/packages/growth-os/crm";

export default function CrmCompaniesPage() {
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "",
    website: "",
    city: "",
    country: "",
    size_tier: "ENTERPRISE",
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/companies${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      });
      if (res.ok) {
        setShowAdd(false);
        setNewCompany({ name: "", industry: "", website: "", city: "", country: "", size_tier: "ENTERPRISE" });
        fetchCompanies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-accent" />
            <span>Enterprise Accounts & Companies</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {companies.length} Accounts
            </span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Corporate accounts, client organizations, and strategic partners.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-border text-xs focus:outline-hidden"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-accent mb-2" />
            <span className="text-xs">Loading companies...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">No companies found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/70 text-[11px] font-bold text-brand-muted uppercase">
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Website</th>
                <th className="py-3 px-4">Headquarters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-brand-surface/40">
                  <td className="py-3 px-4 font-bold text-brand-dark">{c.name}</td>
                  <td className="py-3 px-4 text-brand-charcoal">{c.industry || "—"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-surface border border-brand-border">
                      {c.size_tier || "ENTERPRISE"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-accent">
                    {c.website ? (
                      <a href={c.website.startsWith("http") ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {c.website}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="py-3 px-4 text-brand-muted">{[c.city, c.country].filter(Boolean).join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-brand-dark">Add New Company</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-brand-muted" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <input
                placeholder="Company Name *"
                required
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <input
                placeholder="Industry"
                value={newCompany.industry}
                onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <input
                placeholder="Website"
                value={newCompany.website}
                onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-brand-accent text-white font-bold">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
