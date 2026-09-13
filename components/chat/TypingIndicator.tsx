"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-2 max-w-[85%] animate-fadeIn">
      <div className="w-7 h-7 rounded-lg bg-brand-accent flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
      </div>

      <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white border border-brand-border shadow-xs text-xs text-brand-charcoal space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-brand-muted">
          <span>Reasoning with Gemini</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
};
