"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useNavigationStore } from "@/stores/navigation-store";

export function useAppNavigation() {
  const router = useRouter();
  const pendingHref = useNavigationStore((s) => s.pendingHref);
  const setPendingHref = useNavigationStore((s) => s.setPendingHref);

  const push = useCallback(
    (href: string) => {
      setPendingHref(href);
      router.push(href);
    },
    [router, setPendingHref],
  );

  const replace = useCallback(
    (href: string) => {
      setPendingHref(href);
      router.replace(href);
    },
    [router, setPendingHref],
  );

  return {
    push,
    replace,
    isNavigating: pendingHref !== null,
  };
}
