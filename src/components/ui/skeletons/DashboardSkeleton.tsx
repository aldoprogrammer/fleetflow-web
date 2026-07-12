import type { ReactElement } from "react";
import { MetricCardSkeleton } from "@/components/ui/skeletons/MetricCardSkeleton";
import { QuickActionSkeleton } from "@/components/ui/skeletons/QuickActionSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton(): ReactElement {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading dashboard">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <QuickActionSkeleton />
          <QuickActionSkeleton />
        </div>
      </div>
    </div>
  );
}
