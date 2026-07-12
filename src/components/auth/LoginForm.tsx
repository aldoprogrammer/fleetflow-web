"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactElement } from "react";
import { ArrowRight, KeyRound, Lock, Mail, Shield, Sparkles } from "lucide-react";
import { DemoAccountPicker } from "@/components/auth/DemoAccountPicker";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/auth/types";
import { extractApiErrorMessage } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";

type LoginTab = "credentials" | "demo";

export function LoginForm(): ReactElement {
  const { replace } = useAppNavigation();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [tab, setTab] = useState<LoginTab>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("MERCHANT_ADMIN");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const submitLogin = async (
    nextEmail: string,
    nextPassword: string,
    nextRole: UserRole,
  ): Promise<void> => {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(nextEmail.trim(), nextPassword, nextRole);
      const next = searchParams.get("next");
      replace(next?.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await submitLogin(email, password, role);
  };

  const applyDemo = async (demoEmail: string): Promise<void> => {
    const account = DEMO_ACCOUNTS.find((item) => item.email === demoEmail);
    if (!account) return;

    setTab("demo");
    setEmail(account.email);
    setPassword(account.password);
    setRole(account.role);
    setSelectedDemo(account.email);
    setError(null);
    await submitLogin(account.email, account.password, account.role);
  };

  return (
    <div className="w-full max-w-xl">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-600">
          Secure sign-in
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Authenticate with your enterprise identity or launch a guided demo role.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-100/80 p-1">
        <button
          type="button"
          onClick={() => setTab("credentials")}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            tab === "credentials"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <KeyRound className="h-4 w-4" />
          Credentials
        </button>
        <button
          type="button"
          onClick={() => setTab("demo")}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
            tab === "demo"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Demo access
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        {error ? (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </div>
        ) : null}

        {tab === "credentials" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="role" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </label>
              <div className="relative mt-2">
                <Shield className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  {USER_ROLES.map((item) => (
                    <option key={item} value={item}>
                      {ROLE_LABELS[item]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Work email
              </label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            <SubmitButton
              loading={isSubmitting}
              loadingLabel="Signing in..."
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </SubmitButton>
          </form>
        ) : (
          <DemoAccountPicker
            selectedEmail={selectedDemo}
            isSubmitting={isSubmitting}
            onSelect={applyDemo}
          />
        )}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Protected by JWT session, role-based access control, and encrypted transport.
      </p>
    </div>
  );
}
