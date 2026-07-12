import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function OrderTrackerSkeleton(): ReactElement {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      aria-busy
      aria-label="Loading order tracker"
    >
      <header className="mb-6 border-b border-slate-100 pb-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-7 w-72" />
        <Skeleton className="mt-3 h-4 w-56" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>

      <ol className="space-y-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="relative flex gap-4 pb-8 last:pb-0">
            {index < 4 ? (
              <span className="absolute left-[11px] top-7 h-[calc(100%-12px)] w-0.5 bg-slate-200" />
            ) : null}
            <Skeleton className="relative z-10 h-6 w-6 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 pt-0.5">
              <Skeleton className="h-4 w-36" />
              {index === 1 ? <Skeleton className="h-3 w-44" /> : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <Skeleton className="h-4 w-20" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
