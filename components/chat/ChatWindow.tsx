"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { UIMessage, QuickSuggestion, LeadFormData } from "./types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { LeadCaptureCard } from "./LeadCaptureCard";
import { HumanHandoffModal } from "./HumanHandoffModal";
import {
  Send,
  Sparkles,
  X,
  RotateCcw,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  FileText,
  AlertCircle,
  PhoneCall,
} from "lucide-react";

interface ChatWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  onOpenVoice?: () => void;
}

const STORAGE_KEY = "impact_chat_conversation_id";

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onClose,
  onMinimize,
  onOpenVoice,
}) => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showLeadCard, setShowLeadCard] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickSuggestions: QuickSuggestion[] = [
    { label: "AI Voice Agents", query: "Tell me about your sub-400ms voice and telephone agents." },
    { label: "Pricing Policy", query: "What is your pricing model for custom software and AI?" },
    { label: "Restaurant Platform", query: "Tell me about your Restaurant Technology Platform case study." },
    { label: "Start A Project", query: "How do we get a custom discovery proposal for our project?" },
  ];

  const initializeWelcome = useCallback(() => {
    setMessages([
      {
        id: "welcome-1",
        role: "model",
        content:
          "Hello! I am IMPACT AI, your Technical Sales & Solutions Consultant for IMPACT Enterprise.\n\nWe engineer production-grade AI intelligent agents, workflow automations, and custom full-stack digital products.\n\nHow can we help accelerate your business goals today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const loadHistory = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/chat/history?conversationId=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const loaded: UIMessage[] = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }));
          setMessages(loaded);
          return;
        }
      }
    } catch (err) {
      console.warn("Failed to load history, resetting welcome message:", err);
    }
    initializeWelcome();
  }, [initializeWelcome]);

  // Rehydrate conversation from localStorage or initialize new
  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      setConversationId(savedId);
      loadHistory(savedId);
    } else {
      initializeWelcome();
    }
  }, [loadHistory, initializeWelcome]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showLeadCard]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setErrorMsg(null);
    setInputText("");

    const userMsg: UIMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId: conversationId || undefined,
          channel: "website_chat",
        }),
      });

      if (!res.ok) {
        let errorDetail = `Server returned HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.error?.message) {
            errorDetail = errJson.error.message;
          } else if (typeof errJson.error === "string") {
            errorDetail = errJson.error;
          }
        } catch {}

        // If stale session caused error, reset local storage
        if (res.status === 400 || res.status === 404) {
          localStorage.removeItem(STORAGE_KEY);
          setConversationId(null);
        }
        throw new Error(errorDetail);
      }

      const payload = await res.json();
      if (!payload.success || !payload.data) {
        throw new Error("Invalid response format from chat server");
      }

      const turn = payload.data;
      if (turn.conversationId && turn.conversationId !== conversationId) {
        setConversationId(turn.conversationId);
        localStorage.setItem(STORAGE_KEY, turn.conversationId);
      }

      const aiMsg: UIMessage = {
        id: turn.messageId || `ai-${Date.now()}`,
        role: "model",
        content: turn.reply,
        timestamp: turn.timestamp,
        citations: turn.citations,
        isMock: turn.isMock,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If user asks about proposal or pricing, prompt lead capture
      const lower = text.toLowerCase();
      if (
        lower.includes("quote") ||
        lower.includes("proposal") ||
        lower.includes("price") ||
        lower.includes("contact me") ||
        lower.includes("start a project")
      ) {
        setShowLeadCard(true);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const msg =
        err?.message && typeof err.message === "string" && !err.message.includes("Failed to fetch")
          ? err.message
          : "Failed to connect with IMPACT AI. Please retry or connect via WhatsApp.";
      setErrorMsg(msg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setShowLeadCard(false);
    initializeWelcome();
  };

  const handleLeadSubmit = async (formData: LeadFormData) => {
    const formatted = `[LEAD INTAKE SUBMISSION] Name: ${formData.name} | Email: ${formData.email} | Phone: ${formData.phone || "N/A"} | Company: ${formData.company || "N/A"}`;
    await handleSendMessage(formatted);
  };

  const handleHandoffRequest = async (channel: string) => {
    setShowHandoffModal(false);
    await handleSendMessage(`[HUMAN HANDOFF REQUESTED] Prospective client requested escalation via ${channel}.`);
  };

  return (
    <div className="flex flex-col h-[560px] sm:h-[620px] w-full max-w-[420px] bg-[#FAF9F6] border border-brand-border rounded-2xl shadow-2xl overflow-hidden animate-fadeIn font-sans">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-brand-border flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-accent flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-brand-dark tracking-tight">IMPACT AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-brand-muted">
              Gemini 2.5 • Grounded in Knowledge Base
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Voice Call button */}
          {onOpenVoice && (
            <button
              type="button"
              onClick={onOpenVoice}
              className="p-1.5 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              title="Start Realtime Voice Call (Gemini Live)"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
          )}

          {/* Human Handoff button */}
          <button
            type="button"
            onClick={() => setShowHandoffModal(true)}
            className="p-1.5 rounded-lg text-brand-charcoal hover:text-brand-accent hover:bg-brand-surface transition-colors"
            title="Request Human Takeover"
          >
            <UserCheck className="w-4 h-4" />
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            onClick={handleResetSession}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Minimize */}
          <button
            type="button"
            onClick={onMinimize}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
            title="Minimize Chat"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isTyping && <TypingIndicator />}

        {showLeadCard && (
          <LeadCaptureCard
            onSubmit={handleLeadSubmit}
            onDismiss={() => setShowLeadCard(false)}
          />
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 3 && !isTyping && (
        <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 border-t border-brand-border/40 bg-white/60">
          {quickSuggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSendMessage(s.query)}
              className="px-2.5 py-1 rounded-full bg-white border border-brand-border text-[10px] font-bold text-brand-charcoal hover:text-brand-accent hover:border-brand-accent transition-all whitespace-nowrap shadow-2xs"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <footer className="p-3 bg-white border-t border-brand-border shrink-0 space-y-2">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about AI, automation, or custom software..."
            className="flex-1 max-h-24 resize-none rounded-xl border border-brand-border px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent font-medium bg-brand-surface/40 leading-relaxed"
          />

          <button
            type="button"
            disabled={!inputText.trim() || isTyping}
            onClick={() => handleSendMessage()}
            className="p-2 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-brand-accent shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-brand-muted px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-accent" />
            Zero Hallucination Grounding
          </span>
          <span>Shift+Enter for new line</span>
        </div>
      </footer>

      {/* Human Handoff Modal */}
      <HumanHandoffModal
        isOpen={showHandoffModal}
        onClose={() => setShowHandoffModal(false)}
        onRequestHandoff={handleHandoffRequest}
      />
    </div>
  );
};
