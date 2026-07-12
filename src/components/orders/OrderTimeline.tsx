"use client";

import {
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FileText,
  Package,
  Radio,
  Search,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { useId, useState, type ReactElement } from "react";import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ApiOrderStatus, OrderTimelineItem } from "@/lib/api/orders";

interface OrderTimelineProps {
  entries: OrderTimelineItem[];
}

interface TimelineMeta {
  icon: LucideIcon;
  accent: string;
  dot: string;
  card: string;
}

const TIMELINE_META: Record<ApiOrderStatus, TimelineMeta> = {
  DRAFT: {
    icon: FileText,
    accent: "text-slate-600",
    dot: "bg-slate-400 ring-slate-100",
    card: "border-slate-200 bg-gradient-to-br from-slate-50 to-white",
  },
  PENDING: {
    icon: CircleDot,
    accent: "text-amber-700",
    dot: "bg-amber-500 ring-amber-100",
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white",
  },
  MATCHING: {
    icon: Search,
    accent: "text-amber-700",
    dot: "bg-amber-500 ring-amber-100",
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white",
  },
  ASSIGNED: {
    icon: Radio,
    accent: "text-sky-700",
    dot: "bg-sky-500 ring-sky-100",
    card: "border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-white",
  },
  PICKED_UP: {
    icon: Package,
    accent: "text-violet-700",
    dot: "bg-violet-500 ring-violet-100",
    card: "border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-white",
  },
  DELIVERED: {
    icon: CheckCircle2,
    accent: "text-emerald-700",
    dot: "bg-emerald-500 ring-emerald-100",
    card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white",
  },
  CANCELLED: {
    icon: XCircle,
    accent: "text-rose-700",
    dot: "bg-rose-500 ring-rose-100",
    card: "border-rose-200/80 bg-gradient-to-br from-rose-50/80 to-white",
  },
};

const FALLBACK_META: TimelineMeta = {
  icon: Truck,
  accent: "text-slate-600",
  dot: "bg-slate-400 ring-slate-100",
  card: "border-slate-200 bg-gradient-to-br from-slate-50 to-white",
};

function formatTimelineDate(iso: string): { date: string; time: string } {
  const value = new Date(iso);
  return {
    date: value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: value.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function OrderTimeline({ entries }: OrderTimelineProps): ReactElement {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
        No timeline events yet.
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Event log
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900 sm:text-lg">
            Fulfillment timeline
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {isOpen ? "Hide detailed audit trail" : "Show detailed audit trail"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {entries.length} events
          </span>
          <ChevronDown
            className={[
              "h-5 w-5 text-slate-500 transition-transform",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </div>
      </button>

      {isOpen ? (
        <ol id={panelId} className="relative mt-5 space-y-0">        {entries.map((entry, index) => {
          const meta = TIMELINE_META[entry.status] ?? FALLBACK_META;
          const Icon = meta.icon;
          const isLast = index === entries.length - 1;
          const { date, time } = formatTimelineDate(entry.createdAt);

          return (
            <li key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-gradient-to-b from-slate-200 to-slate-100"
                />
              ) : null}

              <span
                className={[
                  "relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4",
                  meta.dot,
                  isLast ? "shadow-sm" : "",
                ].join(" ")}
              >
                <Icon className={`h-4 w-4 text-white`} strokeWidth={2.25} />
              </span>

              <article
                className={[
                  "min-w-0 flex-1 rounded-xl border px-4 py-3 shadow-sm transition-shadow",
                  meta.card,
                  isLast ? "ring-1 ring-slate-200/80" : "",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <StatusBadge value={entry.status} />
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">{date}</p>
                    <p className={`text-sm font-semibold ${meta.accent}`}>{time}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-700">{entry.note}</p>
              </article>
            </li>
          );
        })}
        </ol>
      ) : null}
    </div>
  );
}