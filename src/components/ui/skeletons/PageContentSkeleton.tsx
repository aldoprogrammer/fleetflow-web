import type { ReactElement } from "react";
import { DashboardSkeleton } from "@/components/ui/skeletons/DashboardSkeleton";
import { ModulePageSkeleton } from "@/components/ui/skeletons/ModulePageSkeleton";
import { OrderTrackerSkeleton } from "@/components/ui/skeletons/OrderTrackerSkeleton";

export function PageContentSkeleton({ pathname }: { pathname: string }): ReactElement {
  if (pathname === "/dashboard") {
    return <DashboardSkeleton />;
  }

  if (
    pathname.startsWith("/orders/") &&
    pathname !== "/orders/create" &&
    pathname !== "/orders/track"
  ) {
    return <OrderTrackerSkeleton />;
  }

  if (pathname === "/orders/create" || pathname === "/orders/track") {
    return <ModulePageSkeleton />;
  }

  return <ModulePageSkeleton />;
}
