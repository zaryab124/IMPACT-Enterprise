"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-100 text-rose-800">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-xl font-black text-brand-dark tracking-tight">Access Restricted</h1>
          <p className="text-xs text-brand-muted leading-relaxed">
            Your account does not have the required role permissions to access this administrative section.
          </p>
        </div>

        {user && (
          <div className="p-4 rounded-2xl bg-brand-surface border border-brand-border text-left text-xs space-y-1">
            <div className="flex items-center justify-between text-brand-muted">
              <span>Authenticated User</span>
              <span className="font-bold text-brand-dark">{user.email}</span>
            </div>
            <div className="flex items-center justify-between text-brand-muted">
              <span>Assigned Role(s)</span>
              <span className="font-mono font-bold text-brand-accent">{user.roles?.join(", ") || "None"}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/admin/crm/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-dark text-white text-xs font-bold hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>CRM Dashboard</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-brand-surface transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch User</span>
          </button>
        </div>
      </div>
    </div>
  );
}
