"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Search } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAppNavigation } from "@/hooks/useAppNavigation";

export function OrderTrackForm(): ReactElement {
  const { push, isNavigating } = useAppNavigation();
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed || isNavigating) return;
    push(`/orders/${trimmed}`);
  };

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Track order</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter an order UUID to open the live fulfillment tracker.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-60"
          />
        </div>
        <SubmitButton
          loading={isNavigating}
          loadingLabel="Opening"
          className="inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          Open
        </SubmitButton>
      </form>
    </section>
  );
}
