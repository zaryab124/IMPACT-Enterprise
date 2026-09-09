"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, ArrowRight, CheckCircle2, Sparkles, Send, RefreshCcw, AlertCircle, ShieldCheck, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name || !email || !message) {
      setErrorMessage("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Connect with IMPACT
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-brand-dark leading-tight">
            LET&apos;S BUILD SOMETHING THAT MATTERS.
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-brand-muted leading-relaxed">
            Whether you have an idea, an inefficient workflow, or an enterprise platform to engineer, our team is ready to review your requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Project Intake Promotion */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-brand-border rounded-3xl p-8 shadow-card">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand-accent mb-2">
                Recommended Path
              </div>
              <h2 className="text-2xl font-bold text-brand-dark mb-3">
                Have a project or technical requirement?
              </h2>
              <p className="text-sm text-brand-muted leading-relaxed mb-6">
                Use our guided 7-step project intake. It helps you outline your project category, business goals, current situation, and timeline in under 2 minutes.
              </p>
              <Link
                href="/start-a-project"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all"
              >
                <span>LAUNCH PROJECT INTAKE FORM</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-brand-border rounded-3xl p-8 shadow-card space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle">
                Direct Channels &amp; Instant Access
              </div>

              {/* WhatsApp Direct */}
              <div className="p-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs">
                      <MessageCircle className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-brand-dark text-sm">WhatsApp Direct</div>
                      <div className="text-xs font-mono text-brand-muted">+92 314 7893907</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#128C7E]">
                    Fastest
                  </span>
                </div>
                <a
                  href="https://wa.me/923147893907?text=Hello%20IMPACT%20Enterprise,%20I%20would%20like%20to%20discuss%20a%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>

              {/* Gmail Direct */}
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#EA4335] text-white flex items-center justify-center shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-brand-dark text-sm">Direct Gmail</div>
                      <div className="text-xs font-mono text-brand-muted truncate max-w-[170px]">
                        impactenterprise527@gmail.com
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#EA4335]">
                    Official
                  </span>
                </div>
                <a
                  href="mailto:impactenterprise527@gmail.com?subject=Project%20Inquiry%20-%20IMPACT%20Enterprise"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#EA4335] hover:bg-[#D93025] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send via Gmail</span>
                </a>
              </div>

              <div className="flex items-start gap-3 text-xs text-brand-charcoal pt-3 border-t border-brand-border">
                <ShieldCheck className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-brand-dark">Confidentiality Assured</div>
                  <div className="text-brand-muted">Mutual NDAs provided upon request for all proprietary concepts.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: General Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-card">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-dark">
                  Send a General Message
                </h2>
                <p className="text-sm text-brand-muted mt-1">
                  For general business partnerships, speaking, or quick questions.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border text-center animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-brand-teal mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    Message Sent Successfully
                  </h3>
                  <p className="text-sm text-brand-muted max-w-sm mx-auto mb-6">
                    Thank you for contacting IMPACT Technologies. A member of our team will review your message and reply via email.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                    className="px-5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-dark hover:bg-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Partnership inquiry, technology consulting..."
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can IMPACT assist you?"
                      className="w-full p-4 rounded-xl border border-brand-border bg-white text-brand-dark text-sm focus:border-brand-accent focus:ring-1 focus:ring-brand-accent resize-y"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-brand-dark hover:bg-brand-accent text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>SEND INQUIRY</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
