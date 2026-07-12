"use client";

import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { canAccessPath } from "@/lib/auth/access";
import { PageContentSkeleton } from "@/components/ui/skeletons/PageContentSkeleton";
import { useAuthStore } from "@/stores/auth-store";
import { ForbiddenPanel } from "./ForbiddenPanel";

interface RouteGuardProps {
  children: ReactNode;
}

const BYPASS_PATHS = new Set(["/forbidden"]);
const EMPTY_PERMISSIONS: readonly string[] = [];

export function RouteGuard({ children }: RouteGuardProps): ReactElement {
  const pathname = usePathname();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const permissions = useAuthStore(
    (s) => s.session?.user.permissions ?? EMPTY_PERMISSIONS,
  );

  if (!isHydrated) {
    return <PageContentSkeleton pathname={pathname} />;
  }

  if (BYPASS_PATHS.has(pathname)) {
    return <>{children}</>;
  }

  if (!canAccessPath(pathname, permissions)) {
    return <ForbiddenPanel />;
  }

  return <>{children}</>;
}
