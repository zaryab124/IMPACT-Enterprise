"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Search,
  Tag,
  ShieldCheck,
  AlertCircle,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Plus,
  Edit3,
  Archive,
  Check,
  X,
  Layers,
} from "lucide-react";

interface KnowledgeDocument {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string;
  version: number;
  metadata: {
    tags: string[];
    summary: string;
    timeline?: string;
    keyPoints?: string[];
    [key: string]: any;
  };
  reviewStatus?: "APPROVED" | "UNDER_REVIEW" | "ARCHIVED";
  isActive: boolean;
}

interface TestSearchResult {
  query: string;
  isOutOfScope: boolean;
  isRestrictedTopic?: boolean;
  confidenceScore: number;
  documents: {
    document: KnowledgeDocument;
    score: number;
    matchedTerms: string[];
  }[];
  guardrailMessage?: string;
}

const ALL_15_CATEGORIES = [
  "ALL",
  "COMPANY",
  "SERVICES",
  "SERVICE_DESCRIPTIONS",
  "TARGET_INDUSTRIES",
  "TARGET_CUSTOMERS",
  "FAQS",
  "TEAM",
  "PROJECTS",
  "CASE_STUDIES",
  "BRAND_GUIDELINES",
  "CONTACT_INFORMATION",
  "SALES_POLICIES",
  "PRICING_RULES",
  "APPROVED_CLAIMS",
  "RESTRICTED_CLAIMS",
];

export default function AdminKnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // Search Engine Tester state
  const [testQuery, setTestQuery] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestSearchResult | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: "COMPANY",
    title: "",
    content: "",
    source: "",
    summary: "",
    tags: "",
  });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        selectedCategory === "ALL"
          ? "/api/admin/knowledge"
          : `/api/admin/knowledge?category=${selectedCategory}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        if (data.documents && data.documents.length > 0) {
          setSelectedDoc((prev) => {
            const stillExists = data.documents.find((d: any) => d.id === prev?.id);
            return stillExists || data.documents[0];
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch knowledge documents:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleTestSearch = async (queryToRun?: string) => {
    const q = queryToRun ?? testQuery;
    if (!q.trim()) return;
    setTestQuery(q);
    setTesting(true);
    try {
      const res = await fetch("/api/knowledge/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (res.ok) {
        const json = await res.json();
        setTestResult(json.data);
      }
    } catch (err) {
      console.error("Search test failed:", err);
    } finally {
      setTesting(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          title: formData.title,
          content: formData.content,
          source: formData.source,
          metadata: {
            summary: formData.summary,
            tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          },
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ category: "COMPANY", title: "", content: "", source: "", summary: "", tags: "" });
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Failed to create document:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/knowledge/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          source: formData.source,
          metadata: {
            ...selectedDoc.metadata,
            summary: formData.summary,
            tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          },
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Failed to edit document:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveDocument = async (id: string) => {
    if (!confirm("Are you sure you want to archive this knowledge document?")) return;
    try {
      const res = await fetch(`/api/admin/knowledge/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Failed to archive document:", err);
    }
  };

  const handleToggleReview = async (id: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "APPROVED" ? "UNDER_REVIEW" : "APPROVED";
    try {
      const res = await fetch(`/api/admin/knowledge/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error("Failed to update review status:", err);
    }
  };

  const openEditModal = (doc: KnowledgeDocument) => {
    setFormData({
      category: doc.category,
      title: doc.title,
      content: doc.content,
      source: doc.source,
      summary: doc.metadata.summary || "",
      tags: doc.metadata.tags ? doc.metadata.tags.join(", ") : "",
    });
    setShowEditModal(true);
  };

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q) ||
      doc.metadata.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Phase 4 Knowledge Governance & Anti-Hallucination
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            IMPACT Enterprise AI Knowledge Base
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Official 15-category corporate source of truth used to ground future AI agents with zero hallucination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormData({ category: "COMPANY", title: "", content: "", source: "", summary: "", tags: "" });
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Record</span>
          </button>
          <button
            onClick={fetchDocuments}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-charcoal hover:text-brand-accent hover:border-brand-accent transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Interactive Anti-Hallucination & Retrieval Testing Console */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-accent">
            <Sparkles className="w-4 h-4" />
            Realtime Retrieval & Anti-Hallucination Tester
          </div>
          <div className="text-[11px] font-mono text-brand-muted">
            Model: Grounded Knowledge Engine
          </div>
        </div>

        {/* 3 Smoke Test Action Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-brand-muted mr-1">Run Smoke Tests:</span>
          <button
            type="button"
            onClick={() => handleTestSearch("What services does IMPACT Enterprise provide?")}
            className="px-3 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs font-medium text-brand-dark hover:border-brand-accent hover:text-brand-accent transition-all"
          >
            1. What services does IMPACT Enterprise provide?
          </button>
          <button
            type="button"
            onClick={() => handleTestSearch("What is IMPACT Enterprise?")}
            className="px-3 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs font-medium text-brand-dark hover:border-brand-accent hover:text-brand-accent transition-all"
          >
            2. What is IMPACT Enterprise?
          </button>
          <button
            type="button"
            onClick={() => handleTestSearch("What information is unavailable?")}
            className="px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 hover:bg-red-100 transition-all"
          >
            3. What information is unavailable?
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTestSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Ask the knowledge base any enterprise question..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-accent focus:border-transparent font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={testing || !testQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test Retrieval"}
          </button>
        </form>

        {testResult && (
          <div className="p-4 rounded-xl border border-brand-border bg-brand-surface text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-dark">Query Evaluation Result:</span>
              <div className="flex items-center gap-2">
                {testResult.isOutOfScope ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold font-mono">
                    OUT OF SCOPE (GUARDRAIL ACTIVE)
                  </span>
                ) : testResult.isRestrictedTopic ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold font-mono">
                    RESTRICTED CLAIMS BOUNDARY VERIFIED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold font-mono">
                    GROUNDED (CONFIDENCE: {testResult.confidenceScore}%)
                  </span>
                )}
              </div>
            </div>

            {testResult.guardrailMessage && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium whitespace-pre-line leading-relaxed">
                {testResult.guardrailMessage}
              </div>
            )}

            {testResult.documents && testResult.documents.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-brand-muted font-bold block">Retrieved Passages:</span>
                {testResult.documents.map((d, i) => (
                  <div
                    key={d.document.id}
                    className="p-3 rounded-lg bg-white border border-brand-border space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-dark">
                        #{i + 1} {d.document.title} ({d.document.category})
                      </span>
                      <span className="text-brand-accent font-bold font-mono text-[10px]">
                        Source: {d.document.source} | Score: {d.score}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-charcoal whitespace-pre-line line-clamp-3">
                      {d.document.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 15 Category Pills & Search Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {ALL_15_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-brand-accent text-white shadow-xs"
                  : "bg-white border border-brand-border text-brand-charcoal hover:bg-brand-surface"
              }`}
            >
              {cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by title, content, or tag..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-accent font-medium"
          />
        </div>
      </div>

      {/* Two Column Layout: Document List + Document Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (Col 5) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-brand-muted bg-white rounded-2xl border border-brand-border">
              Loading knowledge documents...
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-xs text-brand-muted bg-white rounded-2xl border border-brand-border">
              No matching knowledge documents found.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-brand-accent ring-2 ring-brand-accentSoft shadow-xs"
                      : "bg-white border-brand-border hover:border-brand-accent/40 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border text-[10px] font-mono font-bold text-brand-accent uppercase">
                      {doc.category.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-surface text-brand-muted font-bold">
                        v{doc.version}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          doc.reviewStatus === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {doc.reviewStatus || "APPROVED"}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-xs text-brand-dark line-clamp-1 mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-[11px] text-brand-muted line-clamp-2 leading-relaxed">
                    {doc.metadata.summary || doc.content}
                  </p>
                  <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                    {doc.metadata.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-brand-surface text-[9px] font-mono text-brand-charcoal"
                      >
                        <Tag className="w-2.5 h-2.5 text-brand-muted" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Document Inspector (Col 7) */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-brand-border">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-brand-accentSoft text-brand-accent text-xs font-mono font-bold uppercase">
                      {selectedDoc.category.replace(/_/g, " ")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Source v{selectedDoc.version}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-brand-dark tracking-tight">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-xs text-brand-muted mt-0.5 font-mono">
                    Source: {selectedDoc.source}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedDoc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-charcoal hover:text-brand-accent hover:border-brand-accent shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleReview(selectedDoc.id, selectedDoc.reviewStatus)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-charcoal hover:text-brand-accent shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleArchiveDocument(selectedDoc.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100 shadow-xs"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                </div>
              </div>

              {/* Verified Content */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">
                  Verified Grounding Text
                </h4>
                <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-charcoal leading-relaxed whitespace-pre-line font-mono">
                  {selectedDoc.content}
                </div>
              </div>

              {/* Key Facts */}
              {selectedDoc.metadata.keyPoints && selectedDoc.metadata.keyPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">
                    Key Grounding Facts
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedDoc.metadata.keyPoints.map((kp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-brand-charcoal">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0 mt-0.5" />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {selectedDoc.metadata.tags && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">
                    Indexed Semantic Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoc.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs font-mono text-brand-charcoal font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white border border-brand-border rounded-2xl text-xs text-brand-muted">
              Select a knowledge document from the left to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-brand-border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-black text-brand-dark">
                {showAddModal ? "Add Knowledge Record" : `Edit Record (v${selectedDoc?.version ?? 1} → v${(selectedDoc?.version ?? 1) + 1})`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-brand-muted hover:text-brand-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleCreateDocument : handleEditDocument} className="space-y-3 text-xs">
              {showAddModal && (
                <div>
                  <label className="font-bold text-brand-dark block mb-1">Category (15 Categories)</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border"
                  >
                    {ALL_15_CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-brand-dark block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border"
                  placeholder="e.g. Official Service Catalog"
                />
              </div>

              <div>
                <label className="font-bold text-brand-dark block mb-1">Source / Reference</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border font-mono"
                  placeholder="e.g. IMPACT Operations Manual v2.0"
                />
              </div>

              <div>
                <label className="font-bold text-brand-dark block mb-1">Verified Content</label>
                <textarea
                  required
                  rows={5}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border font-mono leading-relaxed"
                  placeholder="Enter official verified company text..."
                />
              </div>

              <div>
                <label className="font-bold text-brand-dark block mb-1">Summary</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border"
                  placeholder="Concise summary for AI search"
                />
              </div>

              <div>
                <label className="font-bold text-brand-dark block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border font-mono"
                  placeholder="services, catalog, official"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover"
                >
                  {actionLoading ? "Saving..." : showAddModal ? "Create Record" : "Save Updates (Increment Version)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
