"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Inbox,
  RefreshCw,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Download,
  Calendar,
  DollarSign,
  Clock,
  Building,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  FileText,
  User,
} from "lucide-react";

interface IntakeRecord {
  id: string;
  submittedAt: string;
  projectType: string;
  goal: string;
  description: string;
  currentSituation: string;
  timeline: string;
  budgetRange: string;
  contact: {
    name: string;
    company: string;
    email: string;
    phone: string;
    country: string;
  };
  status: string;
  source?: string;
}

interface InquiryRecord {
  id: string;
  submittedAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function RequestsDashboardPage() {
  const [activeTab, setActiveTab] = useState<"intake" | "inquiries">("intake");
  const [intakes, setIntakes] = useState<IntakeRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [intakeRes, inquiryRes] = await Promise.all([
        fetch("/api/intake", { cache: "no-store" }),
        fetch("/api/contact", { cache: "no-store" }),
      ]);

      if (intakeRes.ok) {
        const intakeData = await intakeRes.json();
        setIntakes(intakeData.submissions || []);
      }

      if (inquiryRes.ok) {
        const inquiryData = await inquiryRes.json();
        setInquiries(inquiryData.inquiries || []);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error fetching requests data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Polling every 30s if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredIntakes = intakes.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.id?.toLowerCase().includes(q) ||
      item.contact?.name?.toLowerCase().includes(q) ||
      item.contact?.email?.toLowerCase().includes(q) ||
      item.contact?.phone?.toLowerCase().includes(q) ||
      item.contact?.company?.toLowerCase().includes(q) ||
      item.projectType?.toLowerCase().includes(q) ||
      item.goal?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  const filteredInquiries = inquiries.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.id?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q)
    );
  });

  const exportIntakesToCSV = () => {
    if (intakes.length === 0) return;
    const headers = [
      "ID",
      "Submitted At",
      "Client Name",
      "Email",
      "Phone",
      "Company",
      "Project Type",
      "Goal",
      "Timeline",
      "Budget",
      "Description",
    ];

    const rows = intakes.map((i) => [
      `"${i.id}"`,
      `"${i.submittedAt}"`,
      `"${i.contact?.name || ""}"`,
      `"${i.contact?.email || ""}"`,
      `"${i.contact?.phone || ""}"`,
      `"${i.contact?.company || ""}"`,
      `"${i.projectType || ""}"`,
      `"${i.goal || ""}"`,
      `"${i.timeline || ""}"`,
      `"${i.budgetRange || ""}"`,
      `"${(i.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `impact_project_intakes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-brand-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Leadership Client Inbox
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
              CLIENT REQUESTS &amp; INTAKE PORTAL
            </h1>
            <p className="text-sm text-brand-muted mt-1">
              Centralized repository of all project submissions and customer inquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-brand-border text-brand-dark hover:bg-brand-surface text-xs font-bold transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-accent" : ""}`} />
              <span>Refresh Now</span>
            </button>

            <button
              onClick={exportIntakesToCSV}
              disabled={intakes.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* System Location Notice */}
        <div className="mb-8 p-4 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-brand-muted">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-brand-dark">Local File Storage on Server</div>
              <div className="font-mono text-[11px] text-brand-charcoal">
                c:\IMPACT Entreprise\data\intake_submissions.json &amp; inquiries.json
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Last checked: <strong className="font-mono text-brand-dark">{lastRefreshed.toLocaleTimeString()}</strong></span>
            <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-brand-dark">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-brand-border text-brand-accent focus:ring-0"
              />
              Auto-refresh (30s)
            </label>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white border border-brand-border shadow-xs">
            <button
              onClick={() => setActiveTab("intake")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "intake"
                  ? "bg-brand-accent text-white shadow-xs"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Project Intakes</span>
              <span className={`px-2 py-0.2 text-[10px] rounded-full ${activeTab === "intake" ? "bg-white/20 text-white" : "bg-brand-surface text-brand-charcoal"}`}>
                {intakes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("inquiries")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "inquiries"
                  ? "bg-brand-accent text-white shadow-xs"
                  : "text-brand-muted hover:text-brand-dark"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>General Inquiries</span>
              <span className={`px-2 py-0.2 text-[10px] rounded-full ${activeTab === "inquiries" ? "bg-white/20 text-white" : "bg-brand-surface text-brand-charcoal"}`}>
                {inquiries.length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-brand-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client, email, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-brand-border text-xs text-brand-dark placeholder-brand-subtle focus:outline-none focus:border-brand-accent transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Tab 1: Project Intakes List */}
        {activeTab === "intake" && (
          <div className="space-y-4">
            {filteredIntakes.length === 0 ? (
              <div className="bg-white border border-brand-border rounded-3xl p-12 text-center shadow-card">
                <Inbox className="w-10 h-10 text-brand-subtle mx-auto mb-3" />
                <h3 className="text-base font-bold text-brand-dark">No Project Submissions Found</h3>
                <p className="text-xs text-brand-muted mt-1">
                  {searchTerm ? "No results matched your search query." : "Submissions from /start-a-project will appear here automatically."}
                </p>
              </div>
            ) : (
              filteredIntakes.map((record) => {
                const phoneClean = record.contact?.phone ? record.contact.phone.replace(/[^0-9]/g, "") : "";
                const waText = encodeURIComponent(
                  `Hello ${record.contact?.name || "there"}, this is Muhammad Zaryab Hassan from IMPACT Enterprise. We received your project submission (${record.id}) for ${record.projectType}. I would like to schedule a brief discovery discussion regarding your requirements.`
                );
                const emailSubject = encodeURIComponent(`IMPACT Enterprise: Reviewing Your Project (${record.id})`);
                const emailBody = encodeURIComponent(
                  `Hi ${record.contact?.name || "there"},\n\nThank you for reaching out to IMPACT Enterprise regarding your ${record.projectType} requirements.\n\nOur engineering directors have received your project reference ${record.id} and would love to review the architectural scope with you.\n\nBest regards,\nMuhammad Zaryab Hassan (CEO)\nMahad Aziz (CGO)\nIMPACT Enterprise`
                );

                return (
                  <div
                    key={record.id}
                    className="bg-white border border-brand-border rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-cardHover transition-all space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="px-3 py-1 rounded-lg bg-brand-surface border border-brand-border font-mono font-bold text-xs text-brand-dark">
                          {record.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                          {record.status || "Received"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-brand-accentSoft text-brand-accent text-[10px] font-bold uppercase tracking-wider">
                          {record.projectType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-brand-muted">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(record.submittedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left: Client Contact */}
                      <div className="lg:col-span-4 p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-2.5">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-subtle">
                          Client Profile
                        </div>
                        <div className="font-bold text-brand-dark text-base flex items-center gap-1.5">
                          <User className="w-4 h-4 text-brand-accent" />
                          <span>{record.contact?.name || "Unnamed"}</span>
                        </div>
                        <div className="text-xs text-brand-charcoal flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-brand-muted" />
                          <span>{record.contact?.company || "Independent"}</span>
                        </div>
                        <div className="text-xs text-brand-charcoal font-mono flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-brand-muted" />
                          <a href={`mailto:${record.contact?.email}`} className="hover:text-brand-accent hover:underline">
                            {record.contact?.email}
                          </a>
                        </div>
                        {record.contact?.phone && record.contact.phone !== "Not provided" && (
                          <div className="text-xs text-brand-charcoal font-mono flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-brand-muted" />
                            <a href={`tel:${record.contact.phone.replace(/\s+/g, "")}`} className="hover:text-brand-accent">
                              {record.contact.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Middle: Project Scope & Specs */}
                      <div className="lg:col-span-5 space-y-3">
                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-subtle mb-1">
                            Primary Goal &amp; Objective
                          </div>
                          <div className="font-bold text-brand-dark text-sm">
                            {record.goal}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-subtle mb-1">
                            Project Scope Details
                          </div>
                          <p className="text-xs text-brand-muted leading-relaxed bg-brand-surface/60 p-3 rounded-xl border border-brand-border/60">
                            {record.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                          <div className="p-2 rounded-lg bg-brand-surface border border-brand-border">
                            <span className="text-brand-subtle block text-[9px] uppercase font-mono">Situation</span>
                            <span className="font-bold text-brand-dark truncate block">{record.currentSituation}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-brand-surface border border-brand-border">
                            <span className="text-brand-subtle block text-[9px] uppercase font-mono">Timeline</span>
                            <span className="font-bold text-brand-dark truncate block">{record.timeline}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-brand-surface border border-brand-border">
                            <span className="text-brand-subtle block text-[9px] uppercase font-mono">Budget</span>
                            <span className="font-bold text-brand-dark truncate block">{record.budgetRange}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div className="lg:col-span-3 flex flex-col gap-2">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-subtle mb-0.5">
                          Leadership Actions
                        </div>

                        {/* WhatsApp Reply */}
                        {phoneClean ? (
                          <a
                            href={`https://wa.me/${phoneClean}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp Client</span>
                          </a>
                        ) : (
                          <a
                            href={`https://wa.me/923147893907?text=${encodeURIComponent(`Client ${record.contact?.name} (${record.contact?.email}) submitted project ${record.id}: ${record.projectType}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-brand-dark font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Forward on WhatsApp</span>
                          </a>
                        )}

                        {/* Email Reply */}
                        <a
                          href={`mailto:${record.contact?.email}?subject=${emailSubject}&body=${emailBody}`}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-brand-dark hover:bg-brand-accent text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>

                        {/* Direct Call */}
                        {record.contact?.phone && record.contact.phone !== "Not provided" && (
                          <a
                            href={`tel:${record.contact.phone.replace(/\s+/g, "")}`}
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-brand-dark font-bold text-xs transition-all"
                          >
                            <Phone className="w-3.5 h-3.5 text-brand-teal" />
                            <span>Call Phone</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: General Inquiries List */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {filteredInquiries.length === 0 ? (
              <div className="bg-white border border-brand-border rounded-3xl p-12 text-center shadow-card">
                <Mail className="w-10 h-10 text-brand-subtle mx-auto mb-3" />
                <h3 className="text-base font-bold text-brand-dark">No General Inquiries Found</h3>
                <p className="text-xs text-brand-muted mt-1">
                  Messages submitted via /contact form will appear here.
                </p>
              </div>
            ) : (
              filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-white border border-brand-border rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-cardHover transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-brand-border">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-brand-surface border border-brand-border text-brand-dark">
                        {inq.id}
                      </span>
                      <span className="font-bold text-brand-dark text-sm">{inq.subject || "General Inquiry"}</span>
                    </div>
                    <span className="font-mono text-[11px] text-brand-muted">
                      {new Date(inq.submittedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    <div className="md:col-span-4 text-xs space-y-1">
                      <div className="font-bold text-brand-dark">{inq.name}</div>
                      <div className="font-mono text-brand-muted">{inq.email}</div>
                    </div>
                    <div className="md:col-span-6 text-xs text-brand-muted leading-relaxed bg-brand-surface p-3 rounded-xl border border-brand-border">
                      {inq.message}
                    </div>
                    <div className="md:col-span-2">
                      <a
                        href={`mailto:${inq.email}?subject=Re:%20${encodeURIComponent(inq.subject)}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-dark hover:bg-brand-accent text-white text-xs font-bold transition-all"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
