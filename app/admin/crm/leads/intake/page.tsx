"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  PlusCircle,
  Copy,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { CANONICAL_LEAD_SOURCES } from "@/packages/growth-os/crm/services/leadIntakeService";
import { IMPACT_SERVICES } from "@/packages/growth-os/constants";

export default function LeadIntakeDashboardPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState("");
  const [search, setSearch] = useState("");

  // Test modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testForm, setTestForm] = useState({
    first_name: "Sarah",
    last_name: "Connor",
    email: "sarah@cyberdyne.ai",
    phone: "+1-555-0199",
    whatsapp: "+1-555-0199",
    company: "Cyberdyne Systems",
    source: "website",
    campaign: "Autumn 2026 AI Scale",
    landing_page: "/solutions/ai-agents",
    referrer: "https://google.com",
    service_interest: "AI agents",
    problem_statement: "Looking to deploy autonomous customer service agents to handle support queues.",
  });
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchIntakeLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "/api/leads/intake?limit=100";
      if (sourceFilter) url += `&source=${encodeURIComponent(sourceFilter)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
      } else {
        setError(data.error || "Failed to load intake leads");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading intake leads");
    } finally {
      setLoading(false);
    }
  }, [sourceFilter]);

  useEffect(() => {
    fetchIntakeLeads();
  }, [fetchIntakeLeads]);

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setTestResponse(null);
      const res = await fetch("/api/leads/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testForm),
      });
      const data = await res.json();
      setTestResponse(data);
      if (res.ok) {
        fetchIntakeLeads();
      }
    } catch (err: any) {
      setTestResponse({ success: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const fullName = `${l.first_name || ""} ${l.last_name || ""}`.toLowerCase();
    const company = (l.company || "").toLowerCase();
    const email = (l.email || "").toLowerCase();
    const campaign = (l.campaign || "").toLowerCase();
    return (
      fullName.includes(term) ||
      company.includes(term) ||
      email.includes(term) ||
      campaign.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Inbox className="w-7 h-7 text-indigo-400" />
            Lead Intake & Attribution Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Unified omnichannel prospect ingestion, 4-tier deduplication, and attribution tracking across 10 sources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition"
          >
            <PlusCircle className="w-4 h-4" />
            Test Intake Engine
          </button>
          <button
            onClick={fetchIntakeLeads}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition"
            title="Refresh Leads"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Source Quick-Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSourceFilter("")}
          className={`p-3 rounded-lg border text-left transition ${
            sourceFilter === ""
              ? "bg-indigo-600/20 border-indigo-500/50 text-white"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
          }`}
        >
          <div className="text-xs uppercase font-semibold text-slate-400">All Sources</div>
          <div className="text-xl font-bold text-white mt-1">{leads.length}</div>
        </button>
        {CANONICAL_LEAD_SOURCES.slice(0, 4).map((src) => {
          const count = leads.filter((l) => l.source === src).length;
          return (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`p-3 rounded-lg border text-left transition ${
                sourceFilter === src
                  ? "bg-indigo-600/20 border-indigo-500/50 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <div className="text-xs uppercase font-semibold capitalize text-slate-400">
                {src.replace(/_/g, " ")}
              </div>
              <div className="text-xl font-bold text-white mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by contact, company, email, or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All 10 Canonical Sources</option>
            {CANONICAL_LEAD_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">New Lead & Company</th>
                <th className="px-6 py-4">Lead Source</th>
                <th className="px-6 py-4">Campaign & Landing Page</th>
                <th className="px-6 py-4">Service Requested</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Assigned User</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading inbound leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No leads found matching current intake criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {lead.first_name || lead.last_name
                          ? `${lead.first_name || ""} ${lead.last_name || ""}`.trim()
                          : "Anonymous Prospect"}
                        {lead.is_duplicate_merge && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Merged Touchpoint
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{lead.company || lead.email || "No company"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
                        {(lead.source || "website").replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium text-slate-200">{lead.campaign || "Direct / Organic"}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{lead.landing_page || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-300 font-medium">{lead.service_interest || "AI agents"}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {lead.assigned_first_name ? (
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{lead.assigned_first_name} {lead.assigned_last_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/crm/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
                      >
                        View Lead
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Intake Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Inbound Lead Intake Testbed
              </h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTestSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={testForm.first_name}
                    onChange={(e) => setTestForm({ ...testForm, first_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={testForm.last_name}
                    onChange={(e) => setTestForm({ ...testForm, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email</label>
                  <input
                    type="text"
                    value={testForm.email}
                    onChange={(e) => setTestForm({ ...testForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={testForm.phone}
                    onChange={(e) => setTestForm({ ...testForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Lead Source</label>
                  <select
                    value={testForm.source}
                    onChange={(e) => setTestForm({ ...testForm, source: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 capitalize"
                  >
                    {CANONICAL_LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Service Requested</label>
                  <select
                    value={testForm.service_interest}
                    onChange={(e) => setTestForm({ ...testForm, service_interest: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {IMPACT_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Campaign</label>
                <input
                  type="text"
                  value={testForm.campaign}
                  onChange={(e) => setTestForm({ ...testForm, campaign: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {testResponse && (
                <div
                  className={`p-3 rounded-lg text-xs font-mono border ${
                    testResponse.success
                      ? testResponse.isDuplicate
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  <div className="font-bold mb-1">
                    {testResponse.success
                      ? testResponse.isDuplicate
                        ? "Duplicate Detected & Merged"
                        : "Lead Created Successfully"
                      : "Submission Error"}
                  </div>
                  <div>{testResponse.message || testResponse.error}</div>
                  {testResponse.leadId && <div>Lead ID: {testResponse.leadId}</div>}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Submit to Intake API"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
