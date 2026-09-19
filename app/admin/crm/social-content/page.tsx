"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Shield,
  Activity,
  Send,
  Globe,
  Radio,
  Trash2,
  Check,
  Clock,
  ThumbsUp,
  MessageSquare,
  Repeat,
  ExternalLink,
  Bot,
  Zap,
} from "lucide-react";
import { CORE_SERVICES } from "@/packages/growth-os/constants";

interface SocialAccount {
  id: string;
  platform: "linkedin" | "twitter" | "instagram" | "facebook";
  account_name: string;
  account_or_page_id: string;
  masked_token: string;
  connection_status: "CONNECTED" | "EXPIRED" | "REVOKED";
  is_ai_agent_linked: boolean;
  metadata?: {
    handle?: string;
    followers?: string;
    [key: string]: any;
  };
  created_at: string;
}

interface ContentPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  target_platforms?: string[];
  format: string;
  objective: string;
  hook?: string;
  cta?: string;
  hashtags?: string[];
  visual_brief?: string;
  service: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PUBLISHED" | "FAILED" | "REJECTED";
  brand_check?: {
    passed: boolean;
    score: number;
    suggestions: string[];
  };
  ai_model?: string;
  created_at: string;
  published_at?: string;
}

const PLATFORM_CONFIG = {
  linkedin: {
    label: "LinkedIn",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-600 text-white",
    desc: "UGC Articles & B2B Thought Leadership",
    sampleId: "urn:li:organization:impact-enterprise-ai",
    sampleToken: "simulated_oauth_linkedin_token_enterprise_live_999",
  },
  twitter: {
    label: "Twitter / X",
    badge: "bg-neutral-100 text-neutral-800 border-neutral-300",
    iconBg: "bg-neutral-900 text-white",
    desc: "280-char Quick Takes & Dynamic Threads",
    sampleId: "@ImpactEntAI",
    sampleToken: "simulated_bearer_twitter_token_enterprise_live_888",
  },
  instagram: {
    label: "Instagram",
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    iconBg: "bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white",
    desc: "Visual Carousels & Strategic Hashtags",
    sampleId: "ig_impact_enterprise_official",
    sampleToken: "simulated_graph_instagram_token_enterprise_live_777",
  },
  facebook: {
    label: "Facebook",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconBg: "bg-indigo-600 text-white",
    desc: "Page Feed & Global Community Updates",
    sampleId: "fb_impact_enterprise_page_official",
    sampleToken: "simulated_graph_facebook_token_enterprise_live_666",
  },
};

export default function CrmSocialContentPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; latency: number; msg: string } | null>(null);

  // Modal States
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link Form State
  const [linkForm, setLinkForm] = useState({
    platform: "linkedin",
    accountName: "",
    accountOrPageId: "",
    accessToken: "",
    linkToAiAgent: true,
  });

  // AI Generator Form State
  const [genForm, setGenForm] = useState({
    serviceInterest: CORE_SERVICES[0].name,
    capability: "thought_leadership",
    goal: "AUTHORITY",
    format: "post",
    selectedPlatforms: ["linkedin", "twitter", "instagram", "facebook"],
    customPrompt: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, postRes] = await Promise.all([
        fetch("/api/crm/social-accounts"),
        fetch("/api/crm/social-content"),
      ]);

      const accJson = await accRes.json();
      const postJson = await postRes.json();

      if (accJson.success) setAccounts(accJson.data || []);
      if (postJson.success) setPosts(postJson.data || []);
    } catch (err: any) {
      setFeedback(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick-fill simulator token for link modal
  const handleSelectPlatform = (plat: string) => {
    const config = PLATFORM_CONFIG[plat as keyof typeof PLATFORM_CONFIG];
    setLinkForm({
      ...linkForm,
      platform: plat,
      accountName: linkForm.accountName || `IMPACT Enterprise (${config.label})`,
      accountOrPageId: linkForm.accountOrPageId || config.sampleId,
      accessToken: config.sampleToken,
    });
  };

  // Link Social Account Submission
  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/crm/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: linkForm.platform,
          accountName: linkForm.accountName,
          accountOrPageId: linkForm.accountOrPageId,
          accessToken: linkForm.accessToken,
          metadata: { is_ai_agent_linked: linkForm.linkToAiAgent },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`Linked ${linkForm.accountName} successfully with AES-256-GCM encryption!`);
        setShowLinkModal(false);
        fetchData();
      } else {
        setFeedback(`Failed to link account: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle AI Agent Linking
  const handleToggleAiAgentLink = async (account: SocialAccount) => {
    const newStatus = !account.is_ai_agent_linked;
    try {
      const res = await fetch(`/api/crm/social-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_ai_agent_linked: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === account.id ? { ...a, is_ai_agent_linked: newStatus } : a))
        );
        setFeedback(`Updated ${account.account_name}: AI Agent Link set to ${newStatus ? "ACTIVE" : "DISABLED"}`);
      }
    } catch (err: any) {
      setFeedback(`Failed to toggle link: ${err.message}`);
    }
  };

  // Test Connection
  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/crm/social-accounts/${id}/test`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setTestResult({
          id,
          success: true,
          latency: json.data.latencyMs,
          msg: `Connected! Latency: ${json.data.latencyMs}ms. Token Decrypted & Verified.`,
        });
      } else {
        setTestResult({
          id,
          success: false,
          latency: json.data?.latencyMs || 0,
          msg: `Connection error: ${json.data?.error || "Token verification failed"}`,
        });
      }
    } catch (err: any) {
      setTestResult({ id, success: false, latency: 0, msg: `Network ping failed: ${err.message}` });
    } finally {
      setTestingId(null);
    }
  };

  // Disconnect Account
  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to disconnect ${name}?`)) return;
    try {
      const res = await fetch(`/api/crm/social-accounts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Disconnected ${name}`);
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    }
  };

  // Generate Multi-Channel Posts with AI Agent
  const handleGeneratePosts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/crm/social-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceInterest: genForm.serviceInterest,
          capability: genForm.capability,
          goal: genForm.goal,
          format: genForm.format,
          platforms: genForm.selectedPlatforms,
          customPrompt: genForm.customPrompt,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`AI Social Agent generated ${json.posts?.length || 1} posts in PENDING_APPROVAL!`);
        setShowGenerateModal(false);
        fetchData();
      } else {
        setFeedback(`AI Generation failed: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Generation error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve & Publish Post to Linked Accounts
  const handleApproveAndPublish = async (postId: string) => {
    try {
      const res = await fetch(`/api/crm/social-content/${postId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoPublish: true }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(`Post approved and successfully dispatched to linked social account(s)!`);
        fetchData();
      } else {
        setFeedback(`Approval error: ${json.error}`);
      }
    } catch (err: any) {
      setFeedback(`Publishing error: ${err.message}`);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "PENDING") return p.status === "PENDING_APPROVAL";
    if (activeFilter === "APPROVED") return p.status === "APPROVED";
    if (activeFilter === "PUBLISHED") return p.status === "PUBLISHED";
    return true;
  });

  const linkedCount = accounts.filter((a) => a.is_ai_agent_linked && a.connection_status === "CONNECTED").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-accentSoft text-brand-accent">
              <Share2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-brand-dark">Social Media & AI Agent Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              <span>{linkedCount} of 4 Channels Linked to AI Agent</span>
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1.5 max-w-2xl">
            Autonomous multi-channel social copy generation grounded strictly in the 9 IMPACT services.
            All tokens encrypted via AES-256-GCM. Human-in-the-loop review gate strictly enforced.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowLinkModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-dark hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-brand-accent" />
            <span>Link Social Account</span>
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate with AI Agent</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="bg-brand-accentSoft/30 border border-brand-accent/20 rounded-xl p-3.5 flex items-center justify-between text-xs text-brand-dark">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-brand-muted hover:text-brand-dark text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: LINKED SOCIAL MEDIA ACCOUNTS (4 PLATFORMS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-accent" />
            <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wider">
              Connected Social Media Channels
            </h2>
          </div>
          <span className="text-xs text-brand-muted">
            Tokens encrypted in CryptoVault • Never stored in plaintext
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["linkedin", "twitter", "instagram", "facebook"] as const).map((plat) => {
            const config = PLATFORM_CONFIG[plat];
            const account = accounts.find((a) => a.platform.toLowerCase() === plat);
            const isConnected = account && account.connection_status === "CONNECTED";
            const isAgentLinked = account ? account.is_ai_agent_linked : false;

            return (
              <div
                key={plat}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isConnected && isAgentLinked
                    ? "border-brand-accent/40 ring-1 ring-brand-accent/20"
                    : "border-brand-border"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${config.iconBg} shadow-xs`}>
                        {plat === "linkedin" && "in"}
                        {plat === "twitter" && "𝕏"}
                        {plat === "instagram" && "IG"}
                        {plat === "facebook" && "fb"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-dark leading-tight">{config.label}</h3>
                        <p className="text-[11px] text-brand-muted truncate max-w-[140px]">
                          {account ? account.account_name : "Not Connected"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-neutral-50 text-neutral-500 border-neutral-200"
                      }`}
                    >
                      {isConnected ? "CONNECTED" : "UNLINKED"}
                    </span>
                  </div>

                  {/* Account Details */}
                  <div className="mt-4 pt-3 border-t border-brand-border/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-brand-muted text-[11px]">
                      <span>Page / Handle:</span>
                      <span className="font-mono text-brand-dark font-medium truncate max-w-[120px]">
                        {account ? account.account_or_page_id : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-brand-muted text-[11px]">
                      <span>Token Vault:</span>
                      <span className="font-mono text-emerald-700 text-[10px] flex items-center gap-1 font-semibold">
                        <Shield className="w-3 h-3" />
                        {account ? "AES-256-GCM" : "None"}
                      </span>
                    </div>
                  </div>

                  {/* AI Agent Link Control */}
                  {isConnected && (
                    <div className="mt-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-brand-accent" />
                        <span className="text-xs font-semibold text-brand-dark">Link to AI Agent</span>
                      </div>
                      <button
                        onClick={() => handleToggleAiAgentLink(account)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          isAgentLinked ? "bg-brand-accent" : "bg-neutral-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isAgentLinked ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2">
                  {account ? (
                    <>
                      <button
                        onClick={() => handleTestConnection(account.id)}
                        disabled={testingId === account.id}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-brand-border bg-white text-[11px] font-semibold text-brand-dark hover:bg-neutral-50 transition-colors"
                      >
                        <Activity className={`w-3 h-3 text-brand-accent ${testingId === account.id ? "animate-spin" : ""}`} />
                        <span>{testingId === account.id ? "Testing..." : "Test Ping"}</span>
                      </button>
                      <button
                        onClick={() => handleDisconnect(account.id, account.account_name)}
                        title="Disconnect Account"
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleSelectPlatform(plat);
                        setShowLinkModal(true);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Connect {config.label}</span>
                    </button>
                  )}
                </div>

                {/* Inline Test Result Toast */}
                {testResult && testResult.id === account?.id && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-[10px] font-medium ${
                      testResult.success
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {testResult.msg}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: EDITORIAL APPROVAL QUEUE & PUBLISHING GATE */}
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <h2 className="text-base font-bold text-brand-dark">Editorial Review & Publishing Queue</h2>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">
              Every post generated by the AI agent requires explicit human review before dispatching to linked accounts.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl gap-1">
            {[
              { id: "ALL", label: `All (${posts.length})` },
              { id: "PENDING", label: `Pending Review (${posts.filter((p) => p.status === "PENDING_APPROVAL").length})` },
              { id: "APPROVED", label: `Approved (${posts.filter((p) => p.status === "APPROVED").length})` },
              { id: "PUBLISHED", label: `Published (${posts.filter((p) => p.status === "PUBLISHED").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeFilter === tab.id
                    ? "bg-white text-brand-dark shadow-xs"
                    : "text-brand-muted hover:text-brand-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-brand-muted flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-accent" />
            <span>Loading social media queue...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-brand-border rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-accentSoft text-brand-accent flex items-center justify-center mx-auto">
              <Bot className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-brand-dark">No social posts in this category</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
            >
              <Sparkles className="w-3 h-3" />
              <span>Generate New Post with AI Agent</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => {
              const platConfig = PLATFORM_CONFIG[post.platform as keyof typeof PLATFORM_CONFIG] || PLATFORM_CONFIG.linkedin;

              return (
                <div
                  key={post.id}
                  className="bg-neutral-50/50 border border-brand-border rounded-xl p-4.5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Post Badges Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${platConfig.badge}`}>
                          {platConfig.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-neutral-600 border border-neutral-200">
                          {post.service}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : post.status === "APPROVED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : post.status === "PENDING_APPROVAL"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200"
                        }`}
                      >
                        {post.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div>
                      <h4 className="text-xs font-bold text-brand-dark">{post.title}</h4>
                      {post.hook && (
                        <p className="text-xs font-semibold text-brand-accent mt-1 italic">
                          "{post.hook}"
                        </p>
                      )}
                      <p className="text-xs text-neutral-700 mt-1 whitespace-pre-line line-clamp-4">
                        {post.content}
                      </p>
                      {post.cta && (
                        <p className="text-[11px] font-medium text-brand-dark mt-2 bg-white p-2 rounded-lg border border-neutral-200">
                          👉 {post.cta}
                        </p>
                      )}
                    </div>

                    {/* Brand Safety Score */}
                    {post.brand_check && (
                      <div className="flex items-center justify-between text-[11px] text-brand-muted bg-white p-2 rounded-lg border border-brand-border/60">
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Brand Consistency: {post.brand_check.score}/100
                        </span>
                        <span className="text-[10px] font-mono">Model: {post.ai_model || "Gemini"}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-brand-muted font-mono">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>

                    {post.status === "PENDING_APPROVAL" && (
                      <button
                        onClick={() => handleApproveAndPublish(post.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Publish to {platConfig.label}</span>
                      </button>
                    )}

                    {post.status === "PUBLISHED" && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dispatched via Linked Account
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: LINK SOCIAL ACCOUNT */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-brand-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-brand-accent" />
                <h3 className="text-base font-bold text-brand-dark">Link Social Media Account</h3>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-brand-muted hover:text-brand-dark text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkAccount} className="space-y-4 text-xs">
              {/* Select Platform Tabs */}
              <div>
                <label className="block font-semibold text-brand-dark mb-1.5">Platform</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["linkedin", "twitter", "instagram", "facebook"] as const).map((plat) => (
                    <button
                      type="button"
                      key={plat}
                      onClick={() => handleSelectPlatform(plat)}
                      className={`p-2 rounded-xl border text-center font-bold capitalize transition-colors ${
                        linkForm.platform === plat
                          ? "bg-brand-accent text-white border-brand-accent"
                          : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block font-semibold text-brand-dark mb-1">Account Display Name</label>
                <input
                  type="text"
                  required
                  value={linkForm.accountName}
                  onChange={(e) => setLinkForm({ ...linkForm, accountName: e.target.value })}
                  placeholder="e.g. IMPACT Enterprise Global"
                  className="w-full px-3 py-2 rounded-xl border border-brand-border focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-dark"
                />
              </div>

              {/* Page / Handle ID */}
              <div>
                <label className="block font-semibold text-brand-dark mb-1">Handle / Page ID / URN</label>
                <input
                  type="text"
                  required
                  value={linkForm.accountOrPageId}
                  onChange={(e) => setLinkForm({ ...linkForm, accountOrPageId: e.target.value })}
                  placeholder="e.g. @ImpactEntAI or urn:li:organization:12345"
                  className="w-full px-3 py-2 rounded-xl border border-brand-border focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-dark font-mono"
                />
              </div>

              {/* Access Token */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-brand-dark">OAuth Bearer / API Access Token</label>
                  <button
                    type="button"
                    onClick={() => handleSelectPlatform(linkForm.platform)}
                    className="text-[10px] text-brand-accent font-semibold hover:underline"
                  >
                    Load Secure Simulation Token
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={linkForm.accessToken}
                  onChange={(e) => setLinkForm({ ...linkForm, accessToken: e.target.value })}
                  placeholder="Paste OAuth token or use simulation token"
                  className="w-full px-3 py-2 rounded-xl border border-brand-border focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-dark font-mono"
                />
                <p className="text-[10px] text-brand-muted mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Token will be immediately encrypted with AES-256-GCM. Never stored in plaintext.</span>
                </p>
              </div>

              {/* Checkbox Link to AI Agent */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="linkAgentCheck"
                  checked={linkForm.linkToAiAgent}
                  onChange={(e) => setLinkForm({ ...linkForm, linkToAiAgent: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-brand-accent"
                />
                <label htmlFor="linkAgentCheck" className="text-xs font-semibold text-brand-dark cursor-pointer">
                  Automatically link this account to the AI Agent for multi-channel copy generation
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-dark font-bold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-brand-accent text-white font-bold hover:bg-brand-accentHover disabled:opacity-50"
                >
                  {isSubmitting ? "Linking..." : "Connect & Encrypt Token"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATE POST WITH AI AGENT */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-brand-border rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-accent" />
                <h3 className="text-base font-bold text-brand-dark">AI Social Media Content Studio</h3>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="text-brand-muted hover:text-brand-dark text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGeneratePosts} className="space-y-4 text-xs">
              {/* Target Service (9 Official Services) */}
              <div>
                <label className="block font-semibold text-brand-dark mb-1">
                  IMPACT Official Service (Grounded Authority)
                </label>
                <select
                  value={genForm.serviceInterest}
                  onChange={(e) => setGenForm({ ...genForm, serviceInterest: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-brand-border focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-dark"
                >
                  {CORE_SERVICES.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Linked Platforms */}
              <div>
                <label className="block font-semibold text-brand-dark mb-1.5">
                  Target Linked Social Accounts
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["linkedin", "twitter", "instagram", "facebook"] as const).map((plat) => {
                    const isSelected = genForm.selectedPlatforms.includes(plat);
                    return (
                      <label
                        key={plat}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-brand-accentSoft/40 border-brand-accent text-brand-dark font-bold"
                            : "bg-neutral-50 border-neutral-200 text-neutral-600"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newPlats = e.target.checked
                              ? [...genForm.selectedPlatforms, plat]
                              : genForm.selectedPlatforms.filter((p) => p !== plat);
                            setGenForm({ ...genForm, selectedPlatforms: newPlats });
                          }}
                          className="w-3.5 h-3.5 text-brand-accent"
                        />
                        <span className="capitalize text-xs">{PLATFORM_CONFIG[plat].label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Capability & Goal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brand-dark mb-1">Content Capability</label>
                  <select
                    value={genForm.capability}
                    onChange={(e) => setGenForm({ ...genForm, capability: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-dark"
                  >
                    <option value="thought_leadership">Thought Leadership</option>
                    <option value="service_spotlight">Service Spotlight</option>
                    <option value="educational_breakdown">Educational Breakdown</option>
                    <option value="problem_solution_framework">Problem / Solution</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-brand-dark mb-1">Marketing Goal</label>
                  <select
                    value={genForm.goal}
                    onChange={(e) => setGenForm({ ...genForm, goal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-brand-border focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-dark"
                  >
                    <option value="AUTHORITY">Authority</option>
                    <option value="LEAD_GENERATION">Lead Generation</option>
                    <option value="AWARENESS">Awareness</option>
                    <option value="EDUCATION">Education</option>
                  </select>
                </div>
              </div>

              {/* Custom Prompt Context */}
              <div>
                <label className="block font-semibold text-brand-dark mb-1">
                  Custom Strategic Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={genForm.customPrompt}
                  onChange={(e) => setGenForm({ ...genForm, customPrompt: e.target.value })}
                  placeholder="e.g. Focus on enterprise workflow automation and measurable time savings for operations teams."
                  className="w-full px-3 py-2 rounded-xl border border-brand-border focus:outline-hidden focus:ring-1 focus:ring-brand-accent text-brand-dark"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-xl border border-brand-border text-brand-dark font-bold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || genForm.selectedPlatforms.length === 0}
                  className="px-4 py-2 rounded-xl bg-brand-accent text-white font-bold hover:bg-brand-accentHover disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Generating..." : "Generate Grounded Copy"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
