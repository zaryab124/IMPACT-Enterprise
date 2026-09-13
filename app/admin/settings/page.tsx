"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, AlertCircle, CheckCircle2, Save, Cpu, Sparkles } from "lucide-react";

interface SettingsData {
  aiModel: string;
  voiceLatencyTargetMs: number;
  handoffUrgentThresholdScore: number;
  allowedChannels: string[];
  maintenanceMode: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    aiModel: "gemini-2.5-flash",
    voiceLatencyTargetMs: 400,
    handoffUrgentThresholdScore: 85,
    allowedChannels: ["web_chat", "whatsapp", "voice", "email"],
    maintenanceMode: false,
  });

  const [currentUserRoles, setCurrentUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        if (!res.ok) throw new Error(`Settings access error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.user?.roles) setCurrentUserRoles(data.user.roles);
      })
      .catch((err) => {
        setStatusMessage({ type: "error", text: err.message || "Failed to load settings." });
      })
      .finally(() => setLoading(false));
  }, []);

  const isSuperAdmin = currentUserRoles.includes("SUPER_ADMIN");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Failed to update settings (HTTP ${res.status})`);
      }

      setStatusMessage({ type: "success", text: "System settings saved successfully!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-brand-dark tracking-tight">
          System & AI Configuration
        </h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Manage AI models, voice latency limits, human handoff triggers, and platform policies
        </p>
      </div>

      {!isSuperAdmin && !loading && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Read-Only Mode:</strong> Your account role ({currentUserRoles.join(", ")}) has read-only access to settings. Only <strong className="font-mono">SUPER_ADMIN</strong> users are authorized to modify system parameters.
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-6">
        <div className="border-b border-brand-border pb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-accent" />
            <span>AI Reasoning & Voice Engine</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-brand-dark uppercase tracking-wider mb-1.5">
              Gemini Model
            </label>
            <select
              disabled={!isSuperAdmin || loading}
              value={settings.aiModel}
              onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-surface text-brand-dark font-mono outline-none focus:border-brand-accent disabled:opacity-60"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Low-latency sales chat)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Deep architectural reasoning)</option>
              <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Experimental)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-brand-dark uppercase tracking-wider mb-1.5">
              Voice Latency Target (ms)
            </label>
            <input
              type="number"
              disabled={!isSuperAdmin || loading}
              value={settings.voiceLatencyTargetMs}
              onChange={(e) => setSettings({ ...settings, voiceLatencyTargetMs: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-surface text-brand-dark font-mono outline-none focus:border-brand-accent disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-dark uppercase tracking-wider mb-1.5">
              Urgent Handoff Lead Score Threshold
            </label>
            <input
              type="number"
              disabled={!isSuperAdmin || loading}
              value={settings.handoffUrgentThresholdScore}
              onChange={(e) => setSettings({ ...settings, handoffUrgentThresholdScore: Number(e.target.value) })}
              className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-brand-surface text-brand-dark font-mono outline-none focus:border-brand-accent disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-bold text-brand-dark uppercase tracking-wider mb-1.5">
              Active Engagement Channels
            </label>
            <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-muted font-mono">
              {settings.allowedChannels.join(", ")}
            </div>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="pt-4 border-t border-brand-border flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save System Settings"}</span>
            </button>
          </div>
        )}
      </form>

      {/* Platform Security & Hardening Posture */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-card space-y-6">
        <div className="border-b border-brand-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Platform Security & Production Defense Posture</span>
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Automated defense layers protecting against brute force, prompt injections, and cross-site attacks
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
            All Shields Operational
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border space-y-1.5">
            <div className="flex items-center justify-between font-bold text-brand-dark">
              <span>Sliding Window Rate Limiter</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Enforced across auth (5 req/min), AI chat & voice (30 req/min), and API endpoints.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border space-y-1.5">
            <div className="flex items-center justify-between font-bold text-brand-dark">
              <span>Content Security Policy (CSP)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Enforced with frame-ancestors none and explicit WebGL/WSS allowances.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border space-y-1.5">
            <div className="flex items-center justify-between font-bold text-brand-dark">
              <span>Strict Transport Security (HSTS)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              63,072,000s (2-year) preload with full subdomain coverage.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border space-y-1.5">
            <div className="flex items-center justify-between font-bold text-brand-dark">
              <span>CORS Policy & Preflight</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Origin whitelist locking API access to verified IMPACT domains and localhost.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border space-y-1.5">
            <div className="flex items-center justify-between font-bold text-brand-dark">
              <span>CSRF State Mutation Guard</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              Origin/Referer verification on POST/PUT/DELETE; webhook signatures isolated.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border space-y-1.5">
            <div className="flex items-center justify-between font-bold text-brand-dark">
              <span>Input Sanitization & Injection Defense</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-brand-muted leading-relaxed">
              XSS stripping, SQL injection heuristic quarantine, and strict JSON Schema validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
