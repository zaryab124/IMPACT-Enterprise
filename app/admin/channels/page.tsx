"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Mail,
  Phone,
  Radio,
  Send,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

interface ChannelConfig {
  channel: "whatsapp" | "email" | "web_chat" | "phone_sms";
  enabled: boolean;
  providerName: string;
  isConfigured: boolean;
  isLive: boolean;
  statusText: string;
}

interface DeliveryRecord {
  id: string;
  conversation_id: string | null;
  channel: "whatsapp" | "email" | "web_chat" | "phone_sms";
  recipient: string;
  sender: string | null;
  direction: "inbound" | "outbound";
  content: string;
  provider: string;
  provider_message_id: string | null;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  error_details: string | null;
  latency_ms: number | null;
  created_at: string;
}

interface DiagnosticsData {
  channels: ChannelConfig[];
  total24hDeliveries: number;
  total24hFailed: number;
  overallDeliveryRate: number;
}

export default function AdminChannelsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  // Test dispatch state
  const [targetChannel, setTargetChannel] = useState<"whatsapp" | "email" | "phone_sms">("whatsapp");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const fetchChannelData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        channelFilter === "all"
          ? "/api/admin/channels/status"
          : `/api/admin/channels/status?channel=${channelFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load channel data (${res.status})`);
      const data = await res.json();
      setDiagnostics(data.diagnostics);
      setDeliveries(data.recentDeliveries || []);
    } catch (err: any) {
      setError(err.message || "Failed to connect to channel diagnostics");
    } finally {
      setLoading(false);
    }
  }, [channelFilter]);

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !content) return;

    setSending(true);
    setDispatchResult(null);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: targetChannel,
          recipient,
          content,
          subject: targetChannel === "email" ? subject || "Test Notification" : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setDispatchResult({
          success: false,
          message: data.error?.message || "Delivery rejected by external provider",
          details: data.delivery,
        });
      } else {
        setDispatchResult({
          success: true,
          message: `Message dispatched successfully via ${data.delivery?.provider || targetChannel}!`,
          details: data.delivery,
        });
        setContent("");
        fetchChannelData();
      }
    } catch (err: any) {
      setDispatchResult({
        success: false,
        message: err.message || "Network error while sending message",
      });
    } finally {
      setSending(false);
    }
  };

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case "whatsapp":
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case "email":
        return <Mail className="w-5 h-5 text-sky-400" />;
      case "phone_sms":
        return <Phone className="w-5 h-5 text-purple-400" />;
      default:
        return <Radio className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Omnichannel Communications Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Phase 10
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Meta WhatsApp Cloud API, transactional email, phone SMS alerts, and delivery audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchChannelData()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics */}
      {diagnostics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              24h Deliveries
            </span>
            <div className="text-2xl font-bold text-white mt-1">
              {diagnostics.total24hDeliveries}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Inbound & Outbound</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Delivery Success
            </span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {diagnostics.overallDeliveryRate}%
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Provider Verified</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Failed Messages
            </span>
            <div className="text-2xl font-bold text-rose-400 mt-1">
              {diagnostics.total24hFailed}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Zero False Success</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Channel Status
            </span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              {diagnostics.channels.filter((c) => c.enabled).length} / 4
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Active Adapters</span>
          </div>
        </div>
      )}

      {/* Channel Adapter Status Cards */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Integrated Communication Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {diagnostics?.channels.map((c) => (
            <div
              key={c.channel}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    {getChannelIcon(c.channel)}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      c.isLive
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                        : "bg-amber-950/60 text-amber-300 border-amber-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c.isLive ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    {c.isLive ? "Live API" : "Mock Simulator"}
                  </span>
                </div>

                <h3 className="text-white font-semibold capitalize text-base">
                  {c.channel.replace("_", " ")}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{c.providerName}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-xs text-slate-500 block truncate">{c.statusText}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Test Message Dispatch + Delivery Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Test Dispatch Console */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">Direct Message Dispatch</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Test outbound message delivery across connected channels with real-time delivery receipt verification.
          </p>

          <form onSubmit={handleSendTestMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Channel</label>
              <div className="grid grid-cols-3 gap-2">
                {(["whatsapp", "email", "phone_sms"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setTargetChannel(ch)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition text-center capitalize ${
                      targetChannel === ch
                        ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {ch.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {targetChannel === "email" ? "Recipient Email" : "Recipient Phone Number (E.164)"}
              </label>
              <input
                type={targetChannel === "email" ? "email" : "text"}
                required
                placeholder={
                  targetChannel === "email" ? "prospect@enterprise.com" : "+1 415 555 2671"
                }
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>

            {targetChannel === "email" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Subject</label>
                <input
                  type="text"
                  placeholder="IMPACT Consultation Follow-Up"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Message Body</label>
              <textarea
                required
                rows={4}
                placeholder="Enter message content to dispatch..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !recipient || !content}
              className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-sm transition flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying with Provider...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Dispatch Outbound Message
                </>
              )}
            </button>
          </form>

          {dispatchResult && (
            <div
              className={`mt-4 p-4 rounded-lg border text-xs ${
                dispatchResult.success
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-rose-950/40 border-rose-800 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {dispatchResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{dispatchResult.message}</span>
              </div>
              {dispatchResult.details && (
                <div className="mt-2 pt-2 border-t border-slate-800 font-mono text-[11px] opacity-80 space-y-1">
                  <div>Status: {dispatchResult.details.status}</div>
                  {dispatchResult.details.providerMessageId && (
                    <div>ID: {dispatchResult.details.providerMessageId}</div>
                  )}
                  {dispatchResult.details.latencyMs && (
                    <div>Latency: {dispatchResult.details.latencyMs}ms</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Delivery Audit Log Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white">Live Message Delivery Audit</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time log of inbound webhooks and outbound deliveries with latency tracking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Channels</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone_sms">Phone SMS</option>
                <option value="web_chat">Web Chat</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Direction</th>
                  <th className="py-2.5 px-3 font-medium">Channel</th>
                  <th className="py-2.5 px-3 font-medium">Recipient / Sender</th>
                  <th className="py-2.5 px-3 font-medium">Content Preview</th>
                  <th className="py-2.5 px-3 font-medium">Status</th>
                  <th className="py-2.5 px-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No delivery records found for selected filter.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            del.direction === "outbound" ? "text-cyan-400" : "text-amber-400"
                          }`}
                        >
                          {del.direction === "outbound" ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          )}
                          {del.direction}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap capitalize text-slate-300">
                        {del.channel.replace("_", " ")}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-300">
                        {del.direction === "outbound" ? del.recipient : del.sender}
                      </td>

                      <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-400">
                        {del.content}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            del.status === "delivered" || del.status === "read"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : del.status === "failed"
                              ? "bg-rose-950 text-rose-400 border border-rose-800"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {del.status === "delivered" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : del.status === "failed" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {del.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono">
                        {new Date(del.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
