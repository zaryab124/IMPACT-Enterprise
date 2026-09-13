"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid credentials.");
      }

      // Successful login
      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accentSoft text-brand-accent text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          Enterprise Access Gate
        </div>
        <h2 className="text-3xl font-black tracking-tight text-brand-dark">
          IMPACT Control Center
        </h2>
        <p className="mt-2 text-sm text-brand-muted">
          Authenticated access for IMPACT sales, operational leadership & AI controls
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card border border-brand-border rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-700 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@impact.enterprise"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-sm text-brand-dark transition-all"
                />
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 outline-none text-sm text-brand-dark transition-all"
                />
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-brand-accent hover:bg-brand-accentHover text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Control Center"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Development Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-brand-border">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-subtle mb-3 text-center">
              Development Accounts (Seeded)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials("admin@impact.enterprise", "AdminPassword2026!")}
                className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-left transition-colors"
              >
                <div className="font-bold text-brand-dark">Super Admin</div>
                <div className="text-[10px] text-brand-muted font-mono">admin@impact.enterprise</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("manager@impact.enterprise", "ManagerPassword2026!")}
                className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-left transition-colors"
              >
                <div className="font-bold text-brand-dark">Sales Manager</div>
                <div className="text-[10px] text-brand-muted font-mono">manager@impact.enterprise</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("agent@impact.enterprise", "AgentPassword2026!")}
                className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-left transition-colors"
              >
                <div className="font-bold text-brand-dark">Sales Agent</div>
                <div className="text-[10px] text-brand-muted font-mono">agent@impact.enterprise</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("viewer@impact.enterprise", "ViewerPassword2026!")}
                className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surfaceAlt border border-brand-border text-left transition-colors"
              >
                <div className="font-bold text-brand-dark">Viewer (Read-Only)</div>
                <div className="text-[10px] text-brand-muted font-mono">viewer@impact.enterprise</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs font-semibold text-brand-muted hover:text-brand-dark transition-colors">
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono">Loading security gate...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
