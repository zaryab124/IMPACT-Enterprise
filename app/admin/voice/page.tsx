"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mic,
  PhoneCall,
  Volume2,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CheckSquare,
  Square,
  Search,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Target,
  ListTodo,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { CallRecordingRecord, CallRecordingAnalytics } from "@/packages/database/repositories/callRecordingRepository";

export default function AdminVoiceIntelligencePage() {
  const [recordings, setRecordings] = useState<CallRecordingRecord[]>([]);
  const [analytics, setAnalytics] = useState<CallRecordingAnalytics | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer / Selected Call Dossier
  const [selectedCall, setSelectedCall] = useState<CallRecordingRecord | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackTime, setAudioPlaybackTime] = useState(0);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (sentimentFilter !== "all") params.append("sentiment", sentimentFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/voice/recordings?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("You must be logged in with administrative privileges.");
        }
        throw new Error("Failed to load call recordings");
      }

      const data = await res.json();
      if (data.success) {
        setRecordings(data.recordings || []);
        setTotal(data.total || 0);
        setAnalytics(data.analytics || null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load voice intelligence data");
    } finally {
      setLoading(false);
    }
  }, [sentimentFilter, searchQuery]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  // Audio player simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio && selectedCall) {
      interval = setInterval(() => {
        setAudioPlaybackTime((t) => {
          if (t >= selectedCall.duration_seconds) {
            setIsPlayingAudio(false);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, selectedCall]);

  const handleToggleActionItem = async (recordingId: string, index: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/voice/recordings/${recordingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionItemIndex: index,
          completed: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success && data.recording) {
        setSelectedCall(data.recording);
        setRecordings((prev) =>
          prev.map((r) => (r.id === recordingId ? data.recording : r))
        );
      }
    } catch (err) {
      console.error("Failed to toggle action item:", err);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Positive
          </span>
        );
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Urgent / Escalation
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Negative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-600 border border-gray-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Neutral
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 border border-purple-600/20">
              <Mic className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-brand-dark tracking-tight">
              Voice Intelligence & Call Recordings
            </h1>
          </div>
          <p className="text-sm text-brand-muted mt-1">
            Autonomous post-call speech diarization, sentiment tracking, action item extraction, and BANT qualification.
          </p>
        </div>

        <button
          onClick={fetchRecordings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
            Calls Analyzed
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-dark">
              {analytics?.totalCallsAnalyzed ?? total}
            </span>
            <span className="text-xs text-brand-muted">recorded sessions</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
            Average Sentiment
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {analytics?.positiveSentimentPercentage ?? 85}%
            </span>
            <span className="text-xs text-brand-muted">positive reception</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
            Action Items Generated
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600">
              {analytics?.totalActionItems ?? 0}
            </span>
            <span className="text-xs text-brand-muted">
              ({analytics?.completedActionItems ?? 0} completed)
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-xs flex flex-col gap-1">
          <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">
            Voice-to-Lead Conversions
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand-accent">
              {analytics?.leadsConvertedViaVoice ?? 0}
            </span>
            <span className="text-xs text-brand-muted">qualified in CRM</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by caller, email, or summary keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-brand-surface rounded-xl border border-brand-border outline-none focus:border-brand-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-brand-muted font-medium">Sentiment:</span>
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="text-xs bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-brand-dark outline-none cursor-pointer"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Recordings Table */}
      <div className="bg-white border border-brand-border rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h2 className="text-sm font-black text-brand-dark tracking-tight">
            Call Recording Dossiers ({total})
          </h2>
          <span className="text-xs font-mono text-brand-muted">
            Auto-synced with Gemini Live sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-surface text-brand-muted uppercase font-mono text-[10px] tracking-wider border-b border-brand-border">
              <tr>
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3">Caller / Customer</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Sentiment</th>
                <th className="px-6 py-3">Key Topics</th>
                <th className="px-6 py-3">Action Items</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {recordings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brand-muted italic">
                    {loading ? "Loading call recordings..." : "No voice call recordings found matching criteria."}
                  </td>
                </tr>
              ) : (
                recordings.map((r) => (
                  <tr key={r.id} className="hover:bg-brand-surface/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-brand-charcoal font-medium">
                      {new Date(r.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-dark">
                        {r.customer_name || "Enterprise Prospect"}
                      </div>
                      <div className="text-brand-muted text-[11px]">
                        {r.customer_email || r.customer_phone || "Voice Call Visitor"}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-brand-dark">
                      {formatSeconds(r.duration_seconds)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSentimentBadge(r.overall_sentiment)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(r.key_topics || []).slice(0, 2).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[10px]"
                          >
                            {t}
                          </span>
                        ))}
                        {(r.key_topics || []).length > 2 && (
                          <span className="text-[10px] text-gray-400">
                            +{(r.key_topics || []).length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold">
                        {(r.action_items || []).length} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCall(r);
                          setIsPlayingAudio(false);
                          setAudioPlaybackTime(0);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent font-bold text-xs transition-colors"
                      >
                        <span>View Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Dossier Modal / Drawer */}
      {selectedCall && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-brand-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-accent text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-brand-dark tracking-tight">
                    Call Intelligence Dossier
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-brand-muted">
                    <span>Session: {selectedCall.voice_session_id}</span>
                    <span>•</span>
                    <span>{new Date(selectedCall.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCall(null);
                  setIsPlayingAudio(false);
                }}
                className="p-2 rounded-xl hover:bg-white text-gray-400 hover:text-brand-dark transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-brand-charcoal">
              {/* Audio Player Simulation Track */}
              <div className="p-4 rounded-2xl bg-black text-white flex flex-col gap-3">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Volume2 className="w-3.5 h-3.5 text-brand-accent" />
                    Recorded Call Audio (Linear PCM 24kHz)
                  </span>
                  <span className="font-mono text-emerald-400">
                    {formatSeconds(audioPlaybackTime)} / {formatSeconds(selectedCall.duration_seconds)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="p-3 rounded-full bg-brand-accent hover:bg-brand-accentHover text-white shadow-md transition-all shrink-0"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  {/* Waveform track */}
                  <div className="flex-1 h-8 bg-white/10 rounded-lg overflow-hidden flex items-center gap-1 px-2">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const progress = audioPlaybackTime / Math.max(1, selectedCall.duration_seconds);
                      const isPlayed = i / 48 <= progress;
                      const barHeight = Math.sin(i * 0.5) * 12 + 14;
                      return (
                        <div
                          key={i}
                          style={{ height: `${barHeight}px` }}
                          className={`w-1 rounded-full transition-colors ${
                            isPlayed ? "bg-brand-accent" : "bg-white/20"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-accent" />
                    <span className="font-extrabold text-sm text-brand-dark">
                      AI Executive Summary
                    </span>
                  </div>
                  {getSentimentBadge(selectedCall.overall_sentiment)}
                </div>
                <p className="text-xs text-brand-charcoal whitespace-pre-line leading-relaxed">
                  {selectedCall.executive_summary || "No summary available."}
                </p>
              </div>

              {/* Action Items Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-purple-600" />
                    <span className="font-extrabold text-sm text-brand-dark">
                      Action Items & Follow-ups
                    </span>
                  </div>
                  <span className="text-[11px] text-brand-muted">
                    {(selectedCall.action_items || []).filter((i) => i.completed).length} of{" "}
                    {(selectedCall.action_items || []).length} completed
                  </span>
                </div>

                <div className="space-y-2">
                  {(selectedCall.action_items || []).length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No action items detected.</p>
                  ) : (
                    (selectedCall.action_items || []).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleActionItem(selectedCall.id, idx, item.completed)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          item.completed
                            ? "bg-emerald-50/60 border-emerald-200 text-gray-500 line-through"
                            : "bg-white border-brand-border hover:bg-brand-surface"
                        }`}
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.task}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-brand-muted">
                            <span>Owner: {item.owner}</span>
                            <span>•</span>
                            <span className="uppercase font-bold text-purple-600">{item.priority} priority</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* BANT Qualification Scorecard */}
              <div className="p-4 rounded-2xl bg-white border border-brand-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-accent" />
                    <span className="font-extrabold text-sm text-brand-dark">
                      BANT Qualification Insights
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-accent/10 text-brand-accent">
                    Score: {selectedCall.bant_insights?.score ?? 70}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border">
                    <span className="text-[10px] font-bold uppercase text-brand-muted">Budget</span>
                    <p className="text-xs font-medium text-brand-dark mt-0.5">
                      {selectedCall.bant_insights?.budget || "N/A"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border">
                    <span className="text-[10px] font-bold uppercase text-brand-muted">Authority</span>
                    <p className="text-xs font-medium text-brand-dark mt-0.5">
                      {selectedCall.bant_insights?.authority || "N/A"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border">
                    <span className="text-[10px] font-bold uppercase text-brand-muted">Need</span>
                    <p className="text-xs font-medium text-brand-dark mt-0.5">
                      {selectedCall.bant_insights?.need || "N/A"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border">
                    <span className="text-[10px] font-bold uppercase text-brand-muted">Timeline</span>
                    <p className="text-xs font-medium text-brand-dark mt-0.5">
                      {selectedCall.bant_insights?.timeline || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Diarized Conversation Transcript */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-dark" />
                  <span className="font-extrabold text-sm text-brand-dark">
                    Diarized Spoken Transcript
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border space-y-3 max-h-60 overflow-y-auto">
                  {(selectedCall.diarized_transcript || []).map((turn, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        turn.speaker === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[10px] text-brand-muted">
                        <span className="font-bold">
                          {turn.speaker === "user" ? "Prospective Client" : "IMPACT AI"}
                        </span>
                        {turn.sentiment && (
                          <span className="px-1.5 py-0.2 rounded bg-white text-[9px] uppercase font-mono">
                            {turn.sentiment}
                          </span>
                        )}
                      </div>
                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs ${
                          turn.speaker === "user"
                            ? "bg-brand-accent text-white rounded-tr-none"
                            : "bg-white text-brand-charcoal rounded-tl-none border border-brand-border shadow-2xs"
                        }`}
                      >
                        {turn.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
