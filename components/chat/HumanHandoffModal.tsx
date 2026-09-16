"use client";

import React from "react";
import Image from "next/image";
import { X, MessageCircle, Phone, Mail, ShieldAlert, ArrowRight } from "lucide-react";

interface HumanHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestHandoff: (channel: string) => void;
}

export const HumanHandoffModal: React.FC<HumanHandoffModalProps> = ({
  isOpen,
  onClose,
  onRequestHandoff,
}) => {
  if (!isOpen) return null;

  const hqWhatsapp = "https://wa.me/923147893907?text=Hello%20IMPACT%20HQ,%20I%20am%20requesting%20a%20direct%20human%20handoff%20from%20the%20AI%20chat%20agent.";
  const branchWhatsapp = "https://wa.me/923336457747?text=Hello%20Ansar%20Abbas%20Jafri,%20I%20am%20requesting%20a%20direct%20human%20handoff%20from%20the%20AI%20chat%20agent.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2 text-brand-accent font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span className="text-brand-dark">Request Direct Human Takeover</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-brand-muted leading-relaxed">
          Need immediate human review, custom SLA discussions, or executive consultation? Connect directly with our leadership team on WhatsApp or phone.
        </p>

        <div className="space-y-2.5">
          {/* HQ WhatsApp */}
          <a
            href={hqWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRequestHandoff("whatsapp_hq")}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] border border-[#25D366]/30 text-brand-dark hover:text-white transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:bg-white group-hover:text-[#25D366] transition-colors">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight">HQ Executive WhatsApp</div>
                <div className="text-[11px] font-mono text-brand-muted group-hover:text-white/90">
                  +92 314 7893907
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-white transition-colors" />
          </a>

          {/* Regional Operations Phone */}
          <a
            href={branchWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRequestHandoff("whatsapp_branch")}
            className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 text-brand-dark hover:text-white transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-emerald-300 shadow-xs flex-shrink-0 bg-slate-100">
                <Image
                  src="/team/ansar-abbas-jafri.jpg"
                  alt="Ansar Abbas Jafri"
                  fill
                  className="object-cover object-top"
                  sizes="36px"
                />
              </div>
              <div>
                <div className="text-xs font-semibold leading-tight">Branch Manager: Ansar Abbas Jafri</div>
                <div className="text-[11px] font-mono text-brand-muted group-hover:text-white/90">
                  +92 333 6457747
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-white transition-colors" />
          </a>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-brand-muted hover:text-brand-dark transition-colors"
          >
            Continue with AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
