import React from "react";
import Link from "next/link";
import { ImpactLogo } from "../brand/ImpactLogo";
import { ArrowRight, Sparkles, ShieldCheck, Mail, MapPin, MessageCircle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FAF9F6] border-t border-brand-border text-brand-dark pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top conversion card */}
        <div className="bg-white border border-brand-border rounded-2xl p-8 sm:p-12 mb-16 shadow-card hover:shadow-cardHover transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Intelligent Engineering & Automation
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-brand-dark">
                Have an ambitious idea or workflow to automate?
              </h2>
              <p className="mt-3 text-base sm:text-lg text-brand-muted max-w-2xl">
                Let&apos;s turn it into a working, high-impact intelligent product. Take our guided 2-minute project intake to outline your requirements.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-2.5 justify-end">
              <Link
                href="/start-a-project"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-base shadow-sm transition-all text-center"
              >
                <span>START A PROJECT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://wa.me/923147893907?text=Hello%20IMPACT%20Enterprise,%20I%20would%20like%20to%20discuss%20a%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xs transition-all text-center"
                  title="WhatsApp: +92 314 7893907"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:impactenterprise527@gmail.com?subject=Project%20Inquiry%20-%20IMPACT%20Enterprise"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#EA4335] hover:bg-[#D93025] text-white font-bold text-xs shadow-xs transition-all text-center"
                  title="Gmail: impactenterprise527@gmail.com"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-brand-border">
          {/* Col 1: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <ImpactLogo size="lg" showTagline={true} />
            <p className="text-sm text-brand-muted leading-relaxed max-w-sm mt-3">
              <strong className="text-brand-dark font-semibold">IMPACT Technologies</strong> is an AI & intelligent technology company. We engineer AI systems, autonomous agents, workflow automations, and scalable digital products that turn ideas into measurable business impact.
            </p>
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-2">Core Positioning</div>
              <div className="flex flex-wrap gap-1.5 text-xs text-brand-charcoal font-medium">
                <span className="px-2.5 py-1 rounded-md bg-white border border-brand-border">AI</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-brand-border">Agents</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-brand-border">Automation</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-brand-border">Software</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-brand-border">Products</span>
              </div>
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-4">Solutions</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/solutions/ai-agents" className="text-brand-muted hover:text-brand-accent transition-colors">
                  AI & Intelligent Agents
                </Link>
              </li>
              <li>
                <Link href="/solutions/automation" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Business Process Automation
                </Link>
              </li>
              <li>
                <Link href="/solutions/software" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Custom Software & Apps
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Proprietary Digital Products
                </Link>
              </li>
              <li>
                <Link href="/solutions" className="text-brand-muted hover:text-brand-accent transition-colors">
                  All Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Projects */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-4">Case Studies</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/projects/restaurant-technology-platform"
                  className="text-brand-muted hover:text-brand-accent transition-colors font-medium text-brand-charcoal"
                >
                  Restaurant Technology Platform
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Lead & CRM Automation
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Enterprise Knowledge Systems
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-brand-muted hover:text-brand-accent transition-colors">
                  View All Real-World Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-subtle mb-4">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Why IMPACT Exists
                </Link>
              </li>
              <li>
                <Link href="/about#method" className="text-brand-muted hover:text-brand-accent transition-colors">
                  The IMPACT Method™
                </Link>
              </li>
              <li>
                <Link href="/about#leadership" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Executive Leadership
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-brand-muted hover:text-brand-accent transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
              <li>
                <Link href="/start-a-project" className="text-brand-accent font-semibold hover:underline">
                  Start a Project Form
                </Link>
              </li>
              <li>
                <Link href="/requests" className="text-brand-muted hover:text-brand-accent transition-colors flex items-center gap-1.5">
                  <span>Client Requests Portal</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-accentSoft text-brand-accent font-bold uppercase">Portal</span>
                </Link>
              </li>
              <li className="pt-2 border-t border-brand-border/60">
                <a
                  href="https://wa.me/923147893907?text=Hello%20IMPACT%20Enterprise,%20I%20would%20like%20to%20discuss%20a%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#128C7E] hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp: +92 314 7893907</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:impactenterprise527@gmail.com?subject=Project%20Inquiry%20-%20IMPACT%20Enterprise"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA4335] hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>impactenterprise527@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} IMPACT Technologies. All rights reserved.</span>
            <span>•</span>
            <span>Turning Ideas Into Impact.</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-brand-charcoal font-medium">AI • Agents • Automation • Software • Products</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
