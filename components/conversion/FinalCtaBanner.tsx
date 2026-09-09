import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, MessageCircle, Mail } from "lucide-react";

interface FinalCtaBannerProps {
  customSubtitle?: string;
}

export const FinalCtaBanner: React.FC<FinalCtaBannerProps> = ({
  customSubtitle = "Whether you have an idea, a business problem, an inefficient workflow or a product you want to build, IMPACT can help transform it into a working intelligent system.",
}) => {
  return (
    <section className="py-20 lg:py-24 bg-white border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF9F6] border border-brand-border rounded-3xl p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-card">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-border text-brand-accent text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Start Engineering Your Solution
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-brand-dark leading-tight">
            HAVE AN IDEA? <br />
            <span className="text-brand-accent">LET&apos;S TURN IT INTO IMPACT.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
            {customSubtitle}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/start-a-project"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-base shadow-sm hover:shadow-cardHover transition-all text-center uppercase tracking-wide"
            >
              <span>START A PROJECT</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-xl border border-brand-border bg-white hover:bg-brand-surface text-brand-dark font-semibold text-base shadow-xs transition-all text-center uppercase tracking-wide"
            >
              TALK TO IMPACT
            </Link>
          </div>

          {/* Quick Direct WhatsApp & Gmail Access */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href="https://wa.me/923147893907?text=Hello%20IMPACT%20Enterprise,%20I%20would%20like%20to%20discuss%20a%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-brand-dark hover:text-white border border-[#25D366]/30 font-bold text-xs transition-all shadow-xs"
              title="WhatsApp: +92 314 7893907"
            >
              <MessageCircle className="w-4 h-4 fill-current text-[#25D366]" />
              <span>WhatsApp: +92 314 7893907</span>
            </a>
            <a
              href="mailto:impactenterprise527@gmail.com?subject=Project%20Inquiry%20-%20IMPACT%20Enterprise"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-[#EA4335] text-brand-dark hover:text-white border border-red-200 font-bold text-xs transition-all shadow-xs"
              title="Gmail: impactenterprise527@gmail.com"
            >
              <Mail className="w-4 h-4 text-[#EA4335]" />
              <span>impactenterprise527@gmail.com</span>
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-brand-border/60 flex flex-wrap items-center justify-center gap-6 text-xs text-brand-muted font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-teal" />
              Direct Engineering Review
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-teal" />
              100% IP &amp; Code Ownership
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-teal" />
              Clear Architectural Blueprint
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
