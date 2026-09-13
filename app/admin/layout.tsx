"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  ShieldCheck,
  Inbox,
  Sparkles,
  BookOpen,
  Mic,
  Radio,
  BarChart3,
} from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!isLoginPage) {
      fetch("/api/auth/me")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Unauthenticated");
        })
        .then((data) => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {
          // If unauthenticated, redirect to login
          router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
        });
    }
  }, [isLoginPage, pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Leads CRM", href: "/admin/leads", icon: Users },
    { label: "Customers", href: "/admin/customers", icon: Building2 },
    { label: "Conversations", href: "/admin/conversations", icon: MessageSquare },
    { label: "Appointments", href: "/admin/appointments", icon: Calendar },
    { label: "Voice Intelligence", href: "/admin/voice", icon: Mic },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Channels", href: "/admin/channels", icon: Radio },
    { label: "Knowledge Base", href: "/admin/knowledge", icon: BookOpen },
    { label: "Settings", href: "/admin/settings", icon: Settings },
    { label: "Web Inquiries", href: "/requests", icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Platform Name */}
            <div className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm text-brand-dark tracking-tight leading-none">
                    IMPACT AI
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-widest text-brand-muted uppercase mt-0.5">
                    CONTROL CENTER
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-brand-accentSoft text-brand-accent"
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

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-surface border border-brand-border text-xs">
                  <div className="flex flex-col text-right">
                    <span className="font-bold text-brand-dark leading-tight">{user.firstName} {user.lastName}</span>
                    <span className="text-[10px] font-mono text-brand-muted">{user.roles.join(", ")}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold text-brand-charcoal hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
