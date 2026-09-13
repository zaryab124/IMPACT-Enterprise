"use client";

import React, { useState } from "react";
import { LeadFormData } from "./types";
import { Send, CheckCircle2, Sparkles, Building2, Mail, User, Phone } from "lucide-react";

interface LeadCaptureCardProps {
  onSubmit: (data: LeadFormData) => void;
  onDismiss?: () => void;
}

export const LeadCaptureCard: React.FC<LeadCaptureCardProps> = ({ onSubmit, onDismiss }) => {
  const [formData, setFormData] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setSubmitted(true);
    onSubmit(formData);
  };

  if (submitted) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 shadow-xs flex items-center gap-3 animate-fadeIn">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <div className="font-bold">Contact Profile Synced!</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            Our engineering directors have logged your project brief and will follow up shortly.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-brand-accent/40 shadow-card text-xs space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-brand-border">
        <div className="flex items-center gap-1.5 font-bold text-brand-dark">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
          <span>Request Custom Engineering Scope</span>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-[10px] text-brand-muted hover:text-brand-dark transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>

      <p className="text-[11px] text-brand-muted leading-relaxed">
        Provide your details to sync with our technical directors and receive an architectural milestone proposal.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <User className="w-3 h-3 text-brand-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              required
              placeholder="Your Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-brand-border text-xs focus:ring-1 focus:ring-brand-accent focus:outline-none"
            />
          </div>

          <div className="relative">
            <Mail className="w-3 h-3 text-brand-muted absolute left-2.5 top-2.5" />
            <input
              type="email"
              required
              placeholder="Business Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-brand-border text-xs focus:ring-1 focus:ring-brand-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Building2 className="w-3 h-3 text-brand-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Company / Organization"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-brand-border text-xs focus:ring-1 focus:ring-brand-accent focus:outline-none"
            />
          </div>

          <div className="relative">
            <Phone className="w-3 h-3 text-brand-muted absolute left-2.5 top-2.5" />
            <input
              type="tel"
              placeholder="WhatsApp / Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-brand-border text-xs focus:ring-1 focus:ring-brand-accent focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <Send className="w-3 h-3" />
          <span>Connect with Engineering Directors</span>
        </button>
      </form>
    </div>
  );
};
