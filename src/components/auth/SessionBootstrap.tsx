"use client";

import { useEffect } from "react";
import { fetchProfile } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Validates persisted JWT against the API after rehydrate.
 * Stale tokens (e.g. after DB reseed) are cleared so middleware cookies
 * cannot keep the user on /dashboard with silent 401s.
 */
export function SessionBootstrap(): null {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isHydrated || !session?.accessToken) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const profile = await fetchProfile();
        if (cancelled) {
          return;
        }
        const current = useAuthStore.getState().session;
        if (current?.accessToken) {
          useAuthStore.setState({
            session: { ...current, user: profile },
          });
        }
      } catch {
        if (cancelled) {
          return;
        }
        logout();
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (path !== "/login") {
            window.location.replace(
              `/login?reason=session_expired&next=${encodeURIComponent(path)}`,
            );
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, session?.accessToken, logout]);

  return null;
}
