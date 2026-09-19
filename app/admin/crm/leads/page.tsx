"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckSquare,
  Square,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
  Tag,
  X,
  ExternalLink,
  Archive,
  CheckCircle2,
} from "lucide-react";
import { CrmLead, LeadStatus, LEAD_STATUSES } from "@/packages/growth-os/crm";
import { IMPACT_SERVICES } from "@/packages/growth-os/constants";

export default function CrmLeadsPage() {
  const searchParams = useSearchParams();
  const initialOpenAdd = searchParams.get("add") === "true";

  // Data state
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [minScoreFilter, setMinScoreFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof CrmLead>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  // Bulk Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkValue, setBulkValue] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Add Lead Modal state
  const [showAddModal, setShowAddModal] = useState(initialOpenAdd);
  const [submitting, setSubmitting] = useState(false);
  const [newLead, setNewLead] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    company: "",
    job_title: "",
    country: "",
    city: "",
    website: "",
    source: "website",
    campaign: "",
    service_interest: IMPACT_SERVICES[0] || "AI models",
    lead_status: "NEW",
    lead_score: 50,
    notes: "",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", pageSize.toString());
      params.set("offset", ((page - 1) * pageSize).toString());

      const res = await fetch(`/api/crm/leads?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch leads (HTTP ${res.status})`);
      }
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        setTotal(data.total || 0);
      } else {
        throw new Error(data.error?.message || "Failed to load leads");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Client-side additional filtering and sorting for instant responsiveness
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (sourceFilter) {
      result = result.filter((l) => (l.source || "").toLowerCase() === sourceFilter.toLowerCase());
    }
    if (serviceFilter) {
      result = result.filter((l) => (l.service_interest || "").toLowerCase() === serviceFilter.toLowerCase());
    }
    if (countryFilter) {
      result = result.filter((l) => (l.country || "").toLowerCase().includes(countryFilter.toLowerCase()));
    }
    if (minScoreFilter) {
      const min = parseInt(minScoreFilter, 10);
      if (!isNaN(min)) {
        result = result.filter((l) => (l.lead_score ?? 0) >= min);
      }
    }

    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      if (valA < valB) return sortAsc ? -1 : 1;
      return sortAsc ? 1 : -1;
    });

    return result;
  }, [leads, sourceFilter, serviceFilter, countryFilter, minScoreFilter, sortField, sortAsc]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((l) => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkSubmit = async () => {
    if (selectedIds.length === 0 || !bulkAction) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/crm/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          action: bulkAction,
          value: bulkValue,
        }),
      });
      if (res.ok) {
        setSelectedIds([]);
        setBulkAction("");
        setBulkValue("");
        await fetchLeads();
      } else {
        const err = await res.text();
        alert(`Bulk action failed: ${err}`);
      }
    } catch (err: any) {
      alert(`Bulk action error: ${err.message}`);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || "Failed to create lead");
      }
      setShowAddModal(false);
      setNewLead({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        whatsapp: "",
        company: "",
        job_title: "",
        country: "",
        city: "",
        website: "",
        source: "website",
        campaign: "",
        service_interest: IMPACT_SERVICES[0] || "AI models",
        lead_status: "NEW",
        lead_score: 50,
        notes: "",
      });
      await fetchLeads();
    } catch (err: any) {
      alert(`Error creating lead: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-accent" />
              <span>Leads Directory</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
                {total} Records
              </span>
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Comprehensive registry of prospects, qualified contacts, and inbound inquiries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLeads()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-brand-border">
          {/* Search Input */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs text-brand-dark focus:outline-hidden focus:border-brand-accent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs text-brand-charcoal focus:outline-hidden focus:border-brand-accent"
            >
              <option value="">All Statuses</option>
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Service Interest Filter */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs text-brand-charcoal focus:outline-hidden focus:border-brand-accent"
            >
              <option value="">All Services</option>
              {IMPACT_SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs text-brand-charcoal focus:outline-hidden focus:border-brand-accent"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="outreach">Direct Outreach</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          {/* Score Min Filter */}
          <div>
            <input
              type="number"
              placeholder="Min Score (0-100)"
              min={0}
              max={100}
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs text-brand-dark focus:outline-hidden focus:border-brand-accent"
            />
          </div>
        </div>

        {/* Bulk Action Bar (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-brand-surface border border-brand-accent/30 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-dark">
                {selectedIds.length} lead{selectedIds.length > 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-brand-muted hover:text-brand-dark underline"
              >
                Deselect all
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white text-xs font-bold text-brand-charcoal focus:outline-hidden"
              >
                <option value="">Choose Bulk Action...</option>
                <option value="status">Change Status</option>
                <option value="archive">Archive Selected</option>
                <option value="restore">Restore Selected</option>
              </select>

              {bulkAction === "status" && (
                <select
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-brand-border bg-white text-xs font-bold text-brand-charcoal focus:outline-hidden"
                >
                  <option value="">Select Target Status...</option>
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              )}

              <button
                disabled={bulkLoading || !bulkAction || (bulkAction === "status" && !bulkValue)}
                onClick={handleBulkSubmit}
                className="px-3 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors disabled:opacity-50"
              >
                {bulkLoading ? "Applying..." : "Apply Bulk Action"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-accent" />
            <p className="text-xs font-medium">Querying lead records from PostgreSQL...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
            <button
              onClick={() => fetchLeads()}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center text-brand-muted space-y-3">
            <Users className="w-10 h-10 mx-auto text-brand-border" />
            <h3 className="text-sm font-bold text-brand-dark">No Leads Found</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              No lead records match your search or filter parameters. Create a new lead to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Lead</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-border bg-brand-surface/70 text-[11px] font-bold text-brand-muted uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-brand-muted hover:text-brand-dark"
                    >
                      {selectedIds.length === filteredLeads.length ? (
                        <CheckSquare className="w-4 h-4 text-brand-accent" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-brand-dark"
                    onClick={() => {
                      setSortField("first_name");
                      setSortAsc(!sortAsc);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Lead Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Service Interest</th>
                  <th className="py-3 px-4">Status</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-brand-dark"
                    onClick={() => {
                      setSortField("lead_score");
                      setSortAsc(!sortAsc);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-brand-dark"
                    onClick={() => {
                      setSortField("created_at");
                      setSortAsc(!sortAsc);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Created</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedIds.includes(lead.id);
                  const fullName = `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Unnamed Lead";

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-brand-surface/40 transition-colors ${
                        isSelected ? "bg-brand-accentSoft/30" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleSelect(lead.id)}
                          className="text-brand-muted hover:text-brand-dark"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-accent" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-dark">
                        <Link
                          href={`/admin/crm/leads/${lead.id}`}
                          className="hover:text-brand-accent flex items-center gap-1.5"
                        >
                          <span>{fullName}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-brand-charcoal block">
                            {lead.company || "Direct Individual"}
                          </span>
                          {lead.job_title && (
                            <span className="text-[10px] text-brand-muted block">
                              {lead.job_title}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-brand-muted">
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-brand-charcoal">
                            <Mail className="w-3 h-3 text-brand-muted" />
                            <span>{lead.email}</span>
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1 text-[10px] text-brand-muted">
                              <Phone className="w-3 h-3 text-brand-muted" />
                              <span>{lead.phone}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-surface border border-brand-border text-brand-charcoal">
                          {lead.service_interest || "AI models"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            lead.lead_status === "WON"
                              ? "bg-emerald-100 text-emerald-800"
                              : lead.lead_status === "QUALIFIED"
                              ? "bg-blue-100 text-blue-800"
                              : lead.lead_status === "LOST"
                              ? "bg-rose-100 text-rose-800"
                              : lead.lead_status === "PROPOSAL" || lead.lead_status === "NEGOTIATION"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {lead.lead_status || (lead as any).stage || "NEW"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-brand-dark">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              (lead.lead_score ?? 0) >= 80
                                ? "bg-emerald-500"
                                : (lead.lead_score ?? 0) >= 50
                                ? "bg-amber-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <span>{lead.lead_score ?? 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-brand-muted font-mono text-[11px]">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/crm/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-brand-border text-[11px] font-bold text-brand-charcoal hover:text-brand-accent hover:border-brand-accent transition-colors"
                        >
                          <span>View 360°</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="py-3 px-4 border-t border-brand-border bg-brand-surface/30 flex items-center justify-between text-xs text-brand-muted">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} leads
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-lg border border-brand-border disabled:opacity-40 hover:bg-white text-brand-charcoal"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-brand-dark font-bold">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-lg border border-brand-border disabled:opacity-40 hover:bg-white text-brand-charcoal"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-brand-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h3 className="text-base font-bold text-brand-dark">Add New Lead</h3>
                <p className="text-xs text-brand-muted">
                  Create a prospective client record with full 22-field attribution.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-brand-muted hover:text-brand-dark rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLead.first_name}
                    onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLead.last_name}
                    onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={newLead.whatsapp}
                    onChange={(e) => setNewLead({ ...newLead, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newLead.job_title}
                    onChange={(e) => setNewLead({ ...newLead, job_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Service Interest
                  </label>
                  <select
                    value={newLead.service_interest}
                    onChange={(e) => setNewLead({ ...newLead, service_interest: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  >
                    {IMPACT_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newLead.country}
                    onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newLead.lead_status}
                    onChange={(e) => setNewLead({ ...newLead, lead_status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Context, pain points, budget notes..."
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors disabled:opacity-50 shadow-xs"
                >
                  {submitting ? "Saving Lead..." : "Save Lead Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
