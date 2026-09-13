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
  isActive: boolean;
}

interface TestSearchResult {
  query: string;
  isOutOfScope: boolean;
  confidenceScore: number;
  documents: {
    document: KnowledgeDocument;
    score: number;
    matchedTerms: string[];
  }[];
  guardrailMessage?: string;
}

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
          setSelectedDoc((prev) => prev ?? data.documents[0]);
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

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    setTesting(true);
    try {
      const res = await fetch(`/api/knowledge/search?q=${encodeURIComponent(testQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setTestResult(data.data);
      }
    } catch (err) {
      console.error("Search test failed:", err);
    } finally {
      setTesting(false);
    }
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

  const categories = [
    "ALL",
    "SERVICES",
    "CASE_STUDIES",
    "LEADERSHIP",
    "POLICIES",
    "CONTACT",
    "FAQ",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Governance & Anti-Hallucination
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            IMPACT Knowledge Base
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Curated, verified corporate truths used to ground Gemini AI sales conversations with zero hallucination.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-charcoal hover:text-brand-accent hover:border-brand-accent transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Knowledge</span>
        </button>
      </div>

      {/* Interactive Anti-Hallucination & Retrieval Testing Console */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-accent mb-2">
          <Sparkles className="w-4 h-4" />
          Realtime Semantic Query Tester
        </div>
        <p className="text-xs text-brand-muted mb-4">
          Test queries against the knowledge retrieval engine to verify exact document matching, anti-hallucination guardrails, and out-of-scope detection.
        </p>

        <form onSubmit={handleTestSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g. 'What is the pricing for custom AI agents?' or 'What did you build for the restaurant?' or 'What's the weather in Tokyo?'"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent font-medium"
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
          <div className="mt-4 p-4 rounded-xl border border-brand-border bg-brand-surface text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-dark">Query Evaluation Result:</span>
              <div className="flex items-center gap-2">
                {testResult.isOutOfScope ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold font-mono">
                    OUT OF SCOPE (GUARDRAIL ACTIVE)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold font-mono">
                    GROUNDED (CONFIDENCE: {testResult.confidenceScore}%)
                  </span>
                )}
              </div>
            </div>

            {testResult.isOutOfScope ? (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                {testResult.guardrailMessage}
              </div>
            ) : (
              <div>
                <span className="text-brand-muted">Retrieved Grounding Documents:</span>
                <div className="mt-1.5 space-y-1.5">
                  {testResult.documents.map((d, i) => (
                    <div
                      key={d.document.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-brand-border font-mono"
                    >
                      <span className="font-semibold text-brand-dark">
                        #{i + 1} {d.document.title} ({d.document.category})
                      </span>
                      <span className="text-brand-accent font-bold">
                        Score: {d.score} | Terms: [{d.matchedTerms.join(", ")}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Pills & Local Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-brand-accent text-white shadow-xs"
                  : "bg-white border border-brand-border text-brand-charcoal hover:bg-brand-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter documents..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-brand-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent"
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
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono text-brand-muted">
                      v{doc.version}
                    </span>
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
                      {selectedDoc.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Source
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-brand-dark tracking-tight">
                    {selectedDoc.title}
                  </h2>
                  <p className="text-xs text-brand-muted mt-0.5 font-mono">
                    Source: {selectedDoc.source}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-brand-surface border border-brand-border">
                    ID: {selectedDoc.id}
                  </span>
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

              {/* Key Points & Metadata */}
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
    </div>
  );
}
