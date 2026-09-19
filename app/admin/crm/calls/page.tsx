"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Mic,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  PhoneForwarded,
} from "lucide-react";

export default function CrmCallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCall, setSelectedCall] = useState<any | null>(null);

  const fetchCalls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/crm/calls?limit=100");
      const data = await res.json();
      if (data.success) {
        setCalls(data.calls || []);
      } else {
        setError(data.error || "Failed to load call history");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading call history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const filteredCalls = calls.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    const phone = (c.phone_number || "").toLowerCase();
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    const company = (c.company || "").toLowerCase();
    const summary = (c.summary || "").toLowerCase();
    return phone.includes(term) || name.includes(term) || company.includes(term) || summary.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-indigo-400" />
            AI Call Agent & Voice CRM History
          </h1>
          <p className="text-sm text-slate-400">
            Chronological log of AI conversational inbound calls, transcript diarization, sentiment, and CRM sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCalls}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition"
            title="Refresh Calls"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase">Total Calls Processed</div>
          <div className="text-2xl font-bold text-white mt-1">{calls.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase">Avg Call Duration</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {calls.length > 0
              ? `${Math.round(calls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / calls.length)}s`
              : "0s"}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase">Escalations to Human</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {calls.filter((c) => c.escalation_requested).length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase">Recording Consent Rate</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {calls.length > 0
              ? `${Math.round((calls.filter((c) => c.recording_consent).length / calls.length) * 100)}%`
              : "100%"}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search calls by phone number, contact name, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Caller & Lead</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Service Interest</th>
                <th className="px-6 py-4">Sentiment</th>
                <th className="px-6 py-4">Compliance Controls</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading voice call logs...
                  </td>
                </tr>
              ) : filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No voice calls logged matching current search.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {call.first_name || call.last_name
                          ? `${call.first_name || ""} ${call.last_name || ""}`.trim()
                          : call.phone_number}
                      </div>
                      <div className="text-xs text-slate-400">{call.company || call.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {call.duration_seconds}s
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-200">
                      {call.service_interest || "Call agents"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase font-mono ${
                          call.sentiment === "positive"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : call.sentiment === "negative"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {call.sentiment || "neutral"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {call.disclosure_given && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" title="AI Disclosure Stated">
                            AI Disclosed
                          </span>
                        )}
                        {call.recording_consent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" title="Recording Consent Granted">
                            Consent ✓
                          </span>
                        )}
                        {call.escalation_requested && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                            <PhoneForwarded className="w-2.5 h-2.5" />
                            Escalated
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(call.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCall(call)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Transcript
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transcript Detail Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-indigo-400" />
                  Call Transcript & Intelligence Summary
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Caller: {selectedCall.phone_number} • Duration: {selectedCall.duration_seconds}s
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Executive Summary */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <div className="text-xs uppercase font-semibold text-slate-400">Executive Summary</div>
              <p className="text-xs text-slate-200">{selectedCall.summary}</p>
              <div className="text-xs text-indigo-400 pt-1">
                <strong>Recommended Next Action:</strong> {selectedCall.next_action}
              </div>
            </div>

            {/* Diarized Turns */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <div className="text-xs uppercase font-semibold text-slate-400">Diarized Transcript Turns</div>
              {Array.isArray(selectedCall.transcript_turns) && selectedCall.transcript_turns.length > 0 ? (
                selectedCall.transcript_turns.map((turn: any, i: number) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-lg text-xs ${
                      turn.speaker === "agent"
                        ? "bg-indigo-950/40 border border-indigo-900/50 text-indigo-200"
                        : "bg-slate-800/60 border border-slate-700/60 text-slate-200"
                    }`}
                  >
                    <div className="font-bold text-[10px] uppercase text-slate-400 mb-0.5">
                      {turn.speaker === "agent" ? "🤖 IMPACT AI" : "👤 Caller"}
                    </div>
                    <div>{turn.text}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">No detailed speech turns recorded.</div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedCall(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
