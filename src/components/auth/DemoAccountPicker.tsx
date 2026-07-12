"use client";

import { Loader2 } from "lucide-react";
import type { ReactElement } from "react";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo-accounts";
import { ROLE_LABELS } from "@/lib/auth/types";

interface DemoAccountPickerProps {
  selectedEmail: string | null;
  isSubmitting: boolean;
  onSelect: (email: string) => void;
}

export function DemoAccountPicker({
  selectedEmail,
  isSubmitting,
  onSelect,
}: DemoAccountPickerProps): ReactElement {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        One-click access for stakeholder demos. Credentials are prefilled and signed in
        automatically.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_ACCOUNTS.map((account) => {
          const isSelected = selectedEmail === account.email;

          return (
            <button
              key={account.email}
              type="button"
              disabled={isSubmitting}
              onClick={() => onSelect(account.email)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-200 disabled:opacity-60 ${
                isSelected
                  ? "border-emerald-500/60 bg-emerald-50/80 shadow-md shadow-emerald-100"
                  : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${account.tone}`}
              />

              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white ${account.tone}`}
                >
                  {account.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {ROLE_LABELS[account.role]}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {account.description}
                  </p>
                  <p className="mt-2 truncate font-mono text-[10px] text-slate-400">
                    {account.email}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
                <span className={isSelected ? "text-emerald-700" : "text-slate-500"}>
                  {isSelected ? "Selected persona" : "Launch workspace"}
                </span>
                {isSubmitting && isSelected ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
