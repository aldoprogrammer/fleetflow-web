import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function QuickActionSkeleton(): ReactElement {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full max-w-sm" />
      </div>
      <Skeleton className="h-9 w-24 shrink-0 rounded-xl" />
    </div>
  );
}
