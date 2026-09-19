"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  DollarSign,
  Kanban,
  CheckSquare,
  Activity,
  Calendar,
  MessageSquare,
  PhoneCall,
  Megaphone,
  Share2,
  BarChart3,
  Users2,
  Settings,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const CRM_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/crm/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/admin/crm/leads", icon: Users },
  { label: "Contacts", href: "/admin/crm/contacts", icon: Contact },
  { label: "Companies", href: "/admin/crm/companies", icon: Building2 },
  { label: "Deals", href: "/admin/crm/deals", icon: DollarSign },
  { label: "Pipeline", href: "/admin/crm/pipeline", icon: Kanban },
  { label: "Tasks", href: "/admin/crm/tasks", icon: CheckSquare },
  { label: "Activities", href: "/admin/crm/activities", icon: Activity },
  { label: "Calendar", href: "/admin/crm/calendar", icon: Calendar },
  { label: "Messages", href: "/admin/crm/messages", icon: MessageSquare },
  { label: "Calls", href: "/admin/crm/calls", icon: PhoneCall },
  { label: "Campaigns", href: "/admin/crm/campaigns", icon: Megaphone },
  { label: "Social Content", href: "/admin/crm/social-content", icon: Share2 },
  { label: "Analytics", href: "/admin/crm/analytics", icon: BarChart3 },
  { label: "Team", href: "/admin/crm/team", icon: Users2 },
  { label: "Settings", href: "/admin/crm/settings", icon: Settings },
];

export default function CrmPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Platform Branding & Sub-Header */}
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-brand-dark tracking-tight leading-none">
                  IMPACT Growth OS
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-brand-accentSoft text-brand-accent">
                  CRM PORTAL
                </span>
              </div>
              <p className="text-xs font-mono font-medium text-brand-muted mt-1 flex items-center gap-1.5">
                <span>IDEA</span>
                <ArrowRight className="w-2.5 h-2.5" />
                <span>INTELLIGENCE</span>
                <ArrowRight className="w-2.5 h-2.5" />
                <span>AUTOMATION</span>
                <ArrowRight className="w-2.5 h-2.5" />
                <span>PRODUCT</span>
                <ArrowRight className="w-2.5 h-2.5" />
                <span className="font-bold text-brand-accent">IMPACT</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin/crm/leads?add=true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
            >
              <span>+ Add Lead</span>
            </Link>
            <Link
              href="/admin/crm/deals?add=true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-surface text-brand-dark text-xs font-bold hover:bg-brand-accentSoft hover:text-brand-accent transition-colors"
            >
              <span>+ Add Deal</span>
            </Link>
          </div>
        </div>

        {/* 16-Item Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-brand-border overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1 min-w-max">
            {CRM_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/crm/dashboard" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-brand-accent text-white shadow-xs"
                      : "text-brand-charcoal hover:text-brand-accent hover:bg-brand-surface"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main CRM View */}
      <div>{children}</div>
    </div>
  );
}
