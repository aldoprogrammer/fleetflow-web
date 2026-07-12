"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactElement } from "react";
import { useNavigationStore } from "@/stores/navigation-store";

export function RouteProgressBar(): ReactElement {
  const pathname = usePathname();
  const pendingHref = useNavigationStore((s) => s.pendingHref);
  const setPendingHref = useNavigationStore((s) => s.setPendingHref);
  const isNavigating = pendingHref !== null;

  useEffect(() => {
    setPendingHref(null);
  }, [pathname, setPendingHref]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-emerald-100 transition-opacity duration-150 ${
        isNavigating ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!isNavigating}
    >
      <div className="route-progress-bar h-full w-1/3 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />
    </div>
  );
}
