"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, RefreshCw, AlertTriangle, CheckCircle2, User } from "lucide-react";

interface ConversationItem {
  id: string;
  customer_name: string;
  customer_email: string;
  channel: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConversations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/conversations");
      if (!res.ok) throw new Error(`Failed to load conversations (${res.status})`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "human_handoff_requested") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          🔴 HANDOFF REQUESTED
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-200 uppercase">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-dark tracking-tight">
            Conversations & Sessions
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Multi-channel client dialogue logs across Web Chat, WhatsApp, and Realtime Voice
          </p>
        </div>

        <button
          onClick={fetchConversations}
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
          Total Sessions: {conversations.length}
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-brand-muted">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-muted">
            No conversations started yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-surface/60 border-b border-brand-border text-brand-subtle font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {conversations.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-surface/40 transition-colors">
                    <td className="py-3 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-surface border border-brand-border uppercase">
                        {c.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-brand-dark">{c.customer_name}</div>
                      <div className="text-[11px] font-mono text-brand-muted">{c.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-brand-subtle">
                      {new Date(c.updated_at).toLocaleString()}
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
