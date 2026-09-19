"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";

export default function CrmMessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-accent" />
            <span>Omnichannel Messages & Communication</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {conversations.length} Active Conversations
            </span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Inbound and outbound messages across Web, WhatsApp, and Email.</p>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted text-xs">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">No conversations logged yet.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/70 text-[11px] font-bold text-brand-muted uppercase">
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {conversations.map((c) => (
                <tr key={c.id} className="hover:bg-brand-surface/40">
                  <td className="py-3 px-4 font-bold text-brand-dark uppercase">{c.channel}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-surface border border-brand-border uppercase">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal truncate max-w-sm">{c.summary || "Conversation active"}</td>
                  <td className="py-3 px-4 text-brand-muted font-mono">{new Date(c.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
