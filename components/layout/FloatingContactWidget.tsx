'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, MessageCircle, X, ChevronUp, Sparkles, Phone } from 'lucide-react';

export const FloatingContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const whatsappNumber = '+92 314 7893907';
  const whatsappUrl = 'https://wa.me/923147893907?text=Hello%20IMPACT%20Enterprise,%20I%20would%20like%20to%20discuss%20a%20project.';
  const gmailAddress = 'impactenterprise527@gmail.com';
  const mailtoUrl = `mailto:${gmailAddress}?subject=Project%20Inquiry%20-%20IMPACT%20Enterprise&body=Hello%20IMPACT%20Team,%0D%0A%0D%0AI%20would%20like%20to%20discuss%20a%20project.%0D%0A%0D%0AName:%20%0D%0ACompany:%20%0D%0ARequirements:%20`;
  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${gmailAddress}&su=Project+Inquiry+-+IMPACT+Enterprise`;

  return (
    <aside aria-label="Quick Contact Assistance" className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2.5 font-sans">
      {/* Expanded Quick Contact Panel */}
      {isOpen ? (
        <div className="bg-white/95 backdrop-blur-md border border-brand-border rounded-2xl p-4 shadow-2xl w-72 sm:w-80 transition-all duration-300 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Direct Contact
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-surface transition-colors"
              aria-label="Minimize contact buttons"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-brand-muted mb-3 leading-relaxed">
            Connect directly with executive leadership for inquiries, architecture advice, or project scoping.
          </p>

          <div className="space-y-2">
            {/* WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] border border-[#25D366]/30 text-brand-dark hover:text-white transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:bg-white group-hover:text-[#25D366] transition-colors">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Chat on WhatsApp</div>
                  <div className="text-[11px] font-mono text-brand-muted group-hover:text-white/90">
                    {whatsappNumber}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/20 group-hover:bg-white/25 text-[#128C7E] group-hover:text-white transition-colors">
                Instant
              </span>
            </a>

            {/* Gmail Button */}
            <a
              href={mailtoUrl}
              className="group flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-[#EA4335] border border-red-200 text-brand-dark hover:text-white transition-all shadow-xs"
              onClick={(e) => {
                // Also open Gmail web in new tab if user prefers webmail
                if (typeof window !== 'undefined' && window.innerWidth > 768) {
                  // standard mailto triggers client; web link as backup
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EA4335] text-white flex items-center justify-center shadow-xs group-hover:bg-white group-hover:text-[#EA4335] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Email via Gmail</div>
                  <div className="text-[10px] font-mono text-brand-muted group-hover:text-white/90 truncate max-w-[150px]">
                    {gmailAddress}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 group-hover:bg-white/25 text-[#EA4335] group-hover:text-white transition-colors">
                Direct
              </span>
            </a>

            {/* Branch Operations: Ansar Abbas Jafri */}
            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-emerald-300 shadow-xs flex-shrink-0 bg-slate-100">
                  <Image
                    src="/team/ansar-abbas-jafri.jpg"
                    alt="Ansar Abbas Jafri"
                    fill
                    className="object-cover object-top"
                    sizes="32px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-brand-dark leading-tight truncate">Ansar Abbas Jafri</div>
                  <div className="text-[10px] text-emerald-800 font-medium leading-tight">Branch Manager</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href="tel:+923336457747"
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-all shadow-xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Direct</span>
                </a>
                <a
                  href="https://wa.me/923336457747?text=Hello%20Ansar%20Abbas%20Jafri,%20I%20would%20like%20to%20connect%20regarding%20IMPACT%20Enterprise."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[11px] font-medium transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <div className="text-[10px] font-mono text-brand-muted text-center mt-1">+92 333 6457747</div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-brand-border/60 text-center">
            <a
              href={gmailWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-brand-accent hover:underline font-medium"
            >
              Open in Gmail Web App ↗
            </a>
          </div>
        </div>
      ) : (
        /* Minimized Floating Buttons Pill */
        <div className="flex items-center gap-2">
          {/* Quick WhatsApp Pill */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold shadow-lg hover:scale-105 transition-all"
            title={`Chat on WhatsApp: ${whatsappNumber}`}
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Quick Gmail Pill */}
          <a
            href={mailtoUrl}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#EA4335] text-white text-xs font-bold shadow-lg hover:scale-105 transition-all"
            title={`Email: ${gmailAddress}`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Gmail</span>
          </a>

          {/* Re-expand Toggle Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-full bg-brand-dark text-white flex items-center justify-center shadow-lg hover:bg-brand-charcoal transition-all"
            aria-label="Open contact widget"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      )}
    </aside>
  );
};
