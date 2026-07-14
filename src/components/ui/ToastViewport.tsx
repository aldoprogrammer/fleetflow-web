"use client";

import { AppLink } from "@/components/ui/AppLink";
import { useToastStore } from "@/stores/toast-store";
import { BellRing, X } from "lucide-react";
import { type ReactElement } from "react";

export function ToastViewport(): ReactElement | null {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg shadow-slate-900/15 ring-1 ring-emerald-900/5 transition duration-300"
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-emerald-50 p-2 text-emerald-700">
              <BellRing className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              <p className="mt-1 text-sm text-slate-600">{toast.body}</p>
              {toast.href ? (
                <AppLink
                  href={toast.href}
                  onClick={() => dismiss(toast.id)}
                  className="mt-2 inline-flex text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Open order
                </AppLink>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
