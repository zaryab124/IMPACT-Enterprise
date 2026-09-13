"use client";

import React from "react";
import { UIMessage } from "./types";
import { Sparkles, ShieldCheck, User, AlertCircle } from "lucide-react";

interface MessageBubbleProps {
  message: UIMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2 animate-fadeIn">
        <div className="px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-[11px] font-mono text-brand-muted flex items-center gap-1.5 shadow-2xs">
          <AlertCircle className="w-3 h-3 text-brand-accent" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2.5 max-w-[90%] sm:max-w-[85%] ${
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      } animate-fadeIn`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs mt-1 ${
          isUser
            ? "bg-brand-dark text-white"
            : "bg-brand-accent text-white"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col gap-1.5">
        <div
          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
            isUser
              ? "bg-brand-accent text-white rounded-tr-sm font-medium"
              : "bg-white border border-brand-border text-brand-charcoal rounded-tl-sm font-sans"
          }`}
        >
          {/* Mock indicator if applicable */}
          {!isUser && message.isMock && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold mb-2">
              <span>DEVELOPMENT MOCK: Gemini AI Engine</span>
            </div>
          )}

          {/* Formatted Message Body */}
          <div className="whitespace-pre-line space-y-2">
            {message.content.replace("[DEVELOPMENT MOCK: Gemini AI Engine]\n", "")}
          </div>

          {/* Citations Pill Bar */}
          {!isUser && message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-brand-border/60">
              <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-brand-muted uppercase mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Citations</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {message.citations.map((cite, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-[10px] font-mono text-brand-accent"
                  >
                    {cite}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={`text-[9px] font-mono text-brand-muted ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};
