import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactElement } from "react";
import type { DashboardMetric } from "@/lib/dashboard/metrics";

interface MetricCardProps {
  metric: DashboardMetric;
}

export function MetricCard({ metric }: MetricCardProps): ReactElement {
  const Icon = metric.icon;
  const isPositive = metric.sentiment === "positive";
  const TrendIcon = metric.changePercent >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon className="h-5 w-5 text-slate-700" strokeWidth={2} />
        </div>

        <div
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isPositive
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
          }`}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {metric.changePercent > 0 ? "+" : ""}
          {metric.changePercent}%
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {metric.label}
      </p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
        {metric.value}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <p className="text-slate-500">
          {metric.changeLabel}:{" "}
          <span className="font-medium text-slate-700">{metric.previousValue}</span>
        </p>
        <p
          className={`font-medium ${isPositive ? "text-emerald-600" : "text-rose-600"}`}
        >
          {isPositive ? "On track" : "Needs attention"}
        </p>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">{metric.hint}</p>
    </article>
  );
}
