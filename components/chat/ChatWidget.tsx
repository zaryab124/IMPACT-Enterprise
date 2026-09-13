"use client";

import React, { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { VoiceModal } from "../voice/VoiceModal";
import { Sparkles, MessageCircle, Mail, PhoneCall } from "lucide-react";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const whatsappNumber = "+92 314 7893907";
  const whatsappUrl =
    "https://wa.me/923147893907?text=Hello%20IMPACT%20Enterprise,%20I%20would%20like%20to%20discuss%20a%20project.";
  const gmailAddress = "impactenterprise527@gmail.com";
  const mailtoUrl = `mailto:${gmailAddress}?subject=Project%20Inquiry%20-%20IMPACT%20Enterprise`;

  return (
    <>
      {/* Mobile Backdrop to allow tapping anywhere outside to close and explore website */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity animate-fadeIn"
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="IMPACT AI Sales & Communication Agent"
        className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans"
      >
        {/* Expanded Interactive AI Chat Window */}
        {isOpen ? (
          <>
            <ChatWindow
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsOpen(false)}
              onOpenVoice={() => setIsVoiceOpen(true)}
            />
            {/* Quick-Dismiss Floating Action Pill */}
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-brand-dark hover:bg-black text-white text-xs font-bold shadow-xl hover:scale-105 transition-all cursor-pointer border border-white/20"
              title="Close chat window and explore website"
            >
              <span>✕ Close Chat & Explore Website</span>
            </button>
          </>
        ) : (
          /* Floating Launcher Pills */
          <div className="flex items-center gap-2 animate-fadeIn">
            {/* Realtime Voice Call Quick Pill */}
            <button
              onClick={() => setIsVoiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg hover:scale-105 transition-all"
              title="Realtime Voice Call with IMPACT AI (Gemini Live)"
              aria-label="Start Voice Call with IMPACT AI"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Call</span>
            </button>

            {/* Direct WhatsApp Quick Pill */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-lg hover:scale-105 transition-all"
              title={`Direct WhatsApp: ${whatsappNumber}`}
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Direct Gmail Quick Pill */}
            <a
              href={mailtoUrl}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-[#EA4335] hover:bg-[#D93025] text-white text-xs font-bold shadow-lg hover:scale-105 transition-all"
              title={`Direct Email: ${gmailAddress}`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gmail</span>
            </a>

            {/* Primary AI Sales Consultant Launcher Button */}
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-black shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              aria-label="Open AI Sales Consultant"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span className="tracking-tight">Chat with IMPACT AI</span>
            </button>
          </div>
        )}
      </aside>

      {/* Realtime Voice Call Overlay Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </>
  );
};
