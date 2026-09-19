"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Tag,
  DollarSign,
  Activity,
  FileText,
  CheckSquare,
  MessageSquare,
  PhoneCall,
  Paperclip,
  Plus,
  Edit,
  UserCheck,
  RefreshCw,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Send,
  Trash2,
} from "lucide-react";
import { CrmLead, LeadStatus, LEAD_STATUSES } from "@/packages/growth-os/crm";
import { IMPACT_SERVICES } from "@/packages/growth-os/constants";

interface FullLeadData {
  lead: CrmLead;
  activities: any[];
  notes: any[];
  tasks: any[];
  tags: string[];
  messages: any[];
  calls: any[];
  deals: any[];
  attachments: any[];
}

export default function CrmLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<FullLeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "timeline" | "notes" | "tasks" | "deals" | "messages" | "calls" | "files"
  >("timeline");

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form states
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  const [editForm, setEditForm] = useState<Partial<CrmLead>>({});
  const [taskForm, setTaskForm] = useState({
    title: "",
    priority: "MEDIUM",
    due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });
  const [dealForm, setDealForm] = useState({
    title: "",
    amount: 10000,
    currency: "USD",
  });
  const [scheduleDate, setScheduleDate] = useState("");

  const fetchLeadDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/leads/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load lead details (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (json.success && json.lead) {
        setData(json);
        setEditForm(json.lead);
        if (json.lead.next_follow_up) {
          setScheduleDate(new Date(json.lead.next_follow_up).toISOString().slice(0, 16));
        }
      } else {
        throw new Error(json.error?.message || "Lead record not found");
      }
    } catch (err: any) {
      setError(err.message || "Error loading lead record");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  // Actions
  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_status: newStatus }),
      });
      if (res.ok) {
        await fetchLeadDetails();
      } else {
        const err = await res.json();
        alert(`Status change failed: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteSubmitting(true);
    try {
      const res = await fetch("/api/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: id,
          content: noteContent.trim(),
        }),
      });
      if (res.ok) {
        setNoteContent("");
        await fetchLeadDetails();
      } else {
        const err = await res.json();
        alert(`Failed to add note: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Note error: ${err.message}`);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/crm/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: id,
          title: taskForm.title,
          priority: taskForm.priority,
          due_date: new Date(taskForm.due_date).toISOString(),
        }),
      });
      if (res.ok) {
        setShowTaskModal(false);
        setTaskForm({
          title: "",
          priority: "MEDIUM",
          due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        });
        await fetchLeadDetails();
      } else {
        const err = await res.json();
        alert(`Task creation failed: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Task error: ${err.message}`);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: id,
          title: dealForm.title,
          amount: Number(dealForm.amount),
          currency: dealForm.currency,
          service_interest: data?.lead.service_interest,
        }),
      });
      if (res.ok) {
        setShowDealModal(false);
        setDealForm({ title: "", amount: 10000, currency: "USD" });
        await fetchLeadDetails();
      } else {
        const err = await res.json();
        alert(`Deal creation failed: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Deal error: ${err.message}`);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          next_follow_up: scheduleDate ? new Date(scheduleDate).toISOString() : null,
        }),
      });
      if (res.ok) {
        setShowScheduleModal(false);
        await fetchLeadDetails();
      } else {
        const err = await res.json();
        alert(`Schedule update failed: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Schedule error: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/crm/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        await fetchLeadDetails();
      } else {
        const err = await res.json();
        alert(`Save failed: ${err.error?.message || "Error"}`);
      }
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-brand-muted space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-accent" />
        <p className="text-xs font-medium">Retrieving 360° lead record and activity history...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-red-900">Lead Record Not Found</h3>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
        <Link
          href="/admin/crm/leads"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Leads Directory</span>
        </Link>
      </div>
    );
  }

  const { lead, activities, notes, tasks, tags, messages, calls, deals, attachments } = data;
  const fullName = `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Lead Record";

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/crm/leads"
              className="p-2 rounded-xl border border-brand-border hover:bg-brand-surface text-brand-charcoal transition-colors"
              title="Back to Leads"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-black text-brand-dark tracking-tight leading-none">
                  {fullName}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                    lead.lead_status === "WON"
                      ? "bg-emerald-100 text-emerald-800"
                      : lead.lead_status === "QUALIFIED"
                      ? "bg-blue-100 text-blue-800"
                      : lead.lead_status === "LOST"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {lead.lead_status || (lead as any).stage || "NEW"}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-surface border border-brand-border text-brand-charcoal">
                  Score: {lead.lead_score ?? 0}/100
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-1">
                {lead.job_title ? `${lead.job_title} at ` : ""}
                <span className="font-bold text-brand-charcoal">{lead.company || "Direct Individual"}</span>
                {lead.city || lead.country ? ` • ${[lead.city, lead.country].filter(Boolean).join(", ")}` : ""}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={lead.lead_status || "NEW"}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className="px-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-dark focus:outline-hidden"
            >
              {LEAD_STATUSES.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Follow-up</span>
            </button>

            <button
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>

            <button
              onClick={() => setShowDealModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Create Deal</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Profile & Summary) | Right Column (Tabs: Timeline, Notes, Tasks, Deals, etc.) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead 360° Profile Card */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Contact Information
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-muted flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </span>
                <a href={`mailto:${lead.email}`} className="font-bold text-brand-accent hover:underline">
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </span>
                  <span className="font-mono text-brand-dark">{lead.phone}</span>
                </div>
              )}
              {lead.whatsapp && (
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </span>
                  <span className="font-mono text-emerald-600 font-bold">{lead.whatsapp}</span>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </span>
                  <a
                    href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-accent hover:underline truncate max-w-[150px]"
                  >
                    {lead.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>

            <hr className="border-brand-border" />

            <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
              Service & Sales Attribution
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Service Interest</span>
                <span className="font-bold text-brand-dark px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border">
                  {lead.service_interest || "AI models"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Acquisition Source</span>
                <span className="font-bold text-brand-charcoal capitalize">{lead.source || "Website"}</span>
              </div>
              {lead.campaign && (
                <div className="flex items-center justify-between">
                  <span className="text-brand-muted">Campaign</span>
                  <span className="text-brand-dark font-medium truncate max-w-[160px]">{lead.campaign}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Next Follow-Up</span>
                <span className="font-bold text-brand-charcoal">
                  {lead.next_follow_up
                    ? new Date(lead.next_follow_up).toLocaleDateString()
                    : "None scheduled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Assigned Rep</span>
                <span className="font-bold text-brand-dark">
                  {lead.assigned_salesperson ? "Active Agent" : "Unassigned"}
                </span>
              </div>
            </div>

            {tags.length > 0 && (
              <>
                <hr className="border-brand-border" />
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border text-[11px] font-bold text-brand-charcoal flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-brand-muted" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: 7 Tabs Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Navigation */}
          <div className="bg-white border border-brand-border rounded-2xl p-2 shadow-xs overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 min-w-max">
              {[
                { key: "timeline", label: "Timeline", icon: Activity, count: activities.length },
                { key: "notes", label: "Notes", icon: FileText, count: notes.length },
                { key: "tasks", label: "Tasks", icon: CheckSquare, count: tasks.length },
                { key: "deals", label: "Deals", icon: DollarSign, count: deals.length },
                { key: "messages", label: "Messages", icon: MessageSquare, count: messages.length },
                { key: "calls", label: "Calls", icon: PhoneCall, count: calls.length },
                { key: "files", label: "Files", icon: Paperclip, count: attachments.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-brand-accent text-white shadow-xs"
                        : "text-brand-charcoal hover:bg-brand-surface"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive ? "bg-white/20 text-white" : "bg-brand-surface text-brand-muted"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs min-h-[400px]">
            {/* 1. Timeline Tab */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brand-dark">Complete Lead History & Audit Trail</h3>
                  <span className="text-xs font-mono text-brand-muted">{activities.length} Recorded Events</span>
                </div>

                {activities.length === 0 ? (
                  <div className="p-12 text-center text-brand-muted text-xs">
                    No activity recorded yet for this lead.
                  </div>
                ) : (
                  <div className="relative border-l-2 border-brand-border ml-3 space-y-6 pt-2">
                    {activities.map((act) => (
                      <div key={act.id} className="relative pl-6 space-y-1">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-brand-surface border-2 border-brand-accent flex items-center justify-center" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-brand-dark">{act.subject}</span>
                          <span className="font-mono text-brand-muted text-[11px]">
                            {new Date(act.performed_at || act.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-brand-charcoal leading-relaxed">{act.description}</p>
                        {act.first_name && (
                          <span className="text-[10px] text-brand-muted block font-medium">
                            By {act.first_name} {act.last_name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Notes Tab */}
            {activeTab === "notes" && (
              <div className="space-y-6">
                <form onSubmit={handleAddNote} className="space-y-3">
                  <label className="text-xs font-bold text-brand-dark block">Add Internal Collaborative Note</label>
                  <textarea
                    rows={3}
                    placeholder="Type notes, meeting takeaways, or next steps..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:border-brand-accent"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={noteSubmitting || !noteContent.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{noteSubmitting ? "Saving..." : "Save Note"}</span>
                    </button>
                  </div>
                </form>

                <hr className="border-brand-border" />

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                    Note History ({notes.length})
                  </h4>
                  {notes.length === 0 ? (
                    <p className="text-xs text-brand-muted text-center py-6">No notes added yet.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-brand-surface border border-brand-border text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-brand-muted">
                          <span>{n.first_name ? `${n.first_name} ${n.last_name}` : "Team Member"}</span>
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-brand-dark whitespace-pre-wrap leading-relaxed">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. Tasks Tab */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brand-dark">Associated Follow-up Tasks</h3>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-12">No tasks assigned to this lead.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-brand-border bg-white hover:bg-brand-surface transition-colors flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-brand-dark block">{t.title}</span>
                          <span className="text-[11px] text-brand-muted font-mono block">
                            Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No deadline"}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            t.priority === "URGENT"
                              ? "bg-rose-100 text-rose-800"
                              : t.priority === "HIGH"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Deals Tab */}
            {activeTab === "deals" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-brand-dark">Sales Pipeline Opportunities</h3>
                  <button
                    onClick={() => setShowDealModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create Deal</span>
                  </button>
                </div>

                {deals.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-12">No deals linked to this lead yet.</p>
                ) : (
                  <div className="space-y-2">
                    {deals.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 rounded-xl border border-brand-border bg-white hover:bg-brand-surface transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-brand-dark block">{d.title}</span>
                          <span className="text-[11px] text-brand-muted capitalize block">
                            Status: {d.status} • {d.currency} {Number(d.amount).toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold">
                          ${Number(d.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Messages Tab */}
            {activeTab === "messages" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-brand-dark">Omnichannel Communication History</h3>
                {messages.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-12">No communication messages logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {messages.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl border border-brand-border bg-brand-surface text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-brand-muted">
                          <span>Channel: {m.channel} ({m.direction})</span>
                          <span>{new Date(m.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-brand-dark">{m.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. Calls Tab */}
            {activeTab === "calls" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-brand-dark">Voice Telephony & Call Logs</h3>
                {calls.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-12">No voice calls recorded for this lead.</p>
                ) : (
                  <div className="space-y-2">
                    {calls.map((c) => (
                      <div key={c.id} className="p-3 rounded-xl border border-brand-border bg-white text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-brand-muted">
                          <span>Duration: {c.duration_seconds}s • Disposition: {c.disposition}</span>
                          <span>{new Date(c.started_at).toLocaleString()}</span>
                        </div>
                        {c.summary && <p className="text-brand-dark text-xs">{c.summary}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. Files Tab */}
            {activeTab === "files" && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-brand-dark">Attachments & Documents</h3>
                {attachments.length === 0 ? (
                  <p className="text-xs text-brand-muted text-center py-12">No files or attachments uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((f) => (
                      <div key={f.id} className="p-3 rounded-xl border border-brand-border bg-white flex items-center justify-between text-xs">
                        <span className="font-bold text-brand-dark">{f.file_name}</span>
                        <span className="text-brand-muted font-mono">{f.file_size_bytes} bytes</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark">Create Lead Task</h3>
              <button onClick={() => setShowTaskModal(false)}>
                <X className="w-4 h-4 text-brand-muted" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g., Send Make.com Architecture Diagram"
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deal Creation Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark">Create New Deal Opportunity</h3>
              <button onClick={() => setShowDealModal(false)}>
                <X className="w-4 h-4 text-brand-muted" />
              </button>
            </div>
            <form onSubmit={handleCreateDeal} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={dealForm.title}
                  onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                  placeholder="e.g., Enterprise AI Agent License"
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Amount *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={dealForm.amount}
                    onChange={(e) => setDealForm({ ...dealForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">Currency</label>
                  <select
                    value={dealForm.currency}
                    onChange={(e) => setDealForm({ ...dealForm, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowDealModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Follow-up Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark">Schedule Follow-up Cadence</h3>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-4 h-4 text-brand-muted" />
              </button>
            </div>
            <form onSubmit={handleScheduleFollowUp} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-brand-muted uppercase block mb-1">
                  Next Follow-up Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border text-xs focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-brand-border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark">Edit Lead Record</h3>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-4 h-4 text-brand-muted" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-brand-muted block mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.first_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-muted block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.last_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-muted block mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-muted block mb-1">Company</label>
                  <input
                    type="text"
                    value={editForm.company || ""}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-muted block mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editForm.job_title || ""}
                    onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-brand-border"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-muted block mb-1">Lead Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editForm.lead_score ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, lead_score: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-brand-border"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-muted block mb-1">Service Interest</label>
                <select
                  value={editForm.service_interest || ""}
                  onChange={(e) => setEditForm({ ...editForm, service_interest: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-brand-border"
                >
                  {IMPACT_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-brand-border font-bold text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-brand-accent text-white font-bold hover:bg-brand-accentHover"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
