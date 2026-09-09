import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

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
