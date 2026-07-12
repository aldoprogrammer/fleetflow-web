"use client";

import { ShieldX } from "lucide-react";
import type { ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { AppLink } from "@/components/ui/AppLink";

export function ForbiddenPanel(): ReactElement {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
        <ShieldX className="h-6 w-6 text-rose-600" />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your role does not have permission to open this module.
        {from ? (
          <>
            {" "}
            Requested path: <span className="font-mono text-xs">{from}</span>
          </>
        ) : null}
      </p>
      <AppLink
        href="/dashboard"
        className="mt-6 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
      >
        Back to dashboard
      </AppLink>
    </section>
  );
}
