import type { ReactElement } from "react";

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  ON_TRIP: "bg-sky-50 text-sky-700 ring-sky-200",
  OFFLINE: "bg-slate-100 text-slate-600 ring-slate-200",
  ASSIGNED: "bg-sky-50 text-sky-700 ring-sky-200",
  MATCHING: "bg-amber-50 text-amber-700 ring-amber-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
  PICKED_UP: "bg-violet-50 text-violet-700 ring-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  UNPAID: "bg-amber-50 text-amber-700 ring-amber-200",
  NOT_CHARGED: "bg-slate-100 text-slate-600 ring-slate-200",
  CREDIT: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  DEBIT: "bg-rose-50 text-rose-700 ring-rose-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ value }: { value?: string | null }): ReactElement | null {
  if (!value) {
    return null;
  }

  const style =
    STATUS_STYLES[value] ?? "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${style}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
