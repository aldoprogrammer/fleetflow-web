"use client";

import { useEffect } from "react";
import { connectRealtimeStream } from "@/lib/realtime/notification-stream";
import {
  emitOrderUpdated,
  emitRealtimeNotification,
  isRealtimeNotification,
  isRealtimeOrderUpdated,
} from "@/lib/realtime/bus";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth-store";

const RECONNECT_MS = 3_000;

const REALTIME_PERMISSIONS = [
  PERMISSIONS.NOTIFICATIONS_READ,
  PERMISSIONS.ORDERS_READ_ALL,
  PERMISSIONS.ORDERS_READ_OWN,
  PERMISSIONS.ORDERS_READ_ASSIGNED,
] as const;

export function RealtimeSync(): null {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);
  const canUseRealtime = Boolean(
    session?.user.permissions.some((permission) =>
      REALTIME_PERMISSIONS.includes(
        permission as (typeof REALTIME_PERMISSIONS)[number],
      ),
    ),
  );

  useEffect(() => {
    if (!isHydrated || !session?.accessToken || !canUseRealtime) {
      return;
    }

    let cancelled = false;
    let reconnectTimer: number | undefined;
    let activeController: AbortController | null = null;
    const token = session.accessToken;

    const connect = (): void => {
      if (cancelled) {
        return;
      }

      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      void connectRealtimeStream(
        token,
        (payload) => {
          if (isRealtimeNotification(payload)) {
            emitRealtimeNotification(payload);
            return;
          }
          if (isRealtimeOrderUpdated(payload)) {
            emitOrderUpdated(payload.orderId, payload.reason);
          }
        },
        controller.signal,
      )
        .catch(() => {
          // Network / auth failures — reconnect below.
        })
        .finally(() => {
          if (cancelled || controller.signal.aborted) {
            return;
          }
          reconnectTimer = window.setTimeout(connect, RECONNECT_MS);
        });
    };

    connect();

    return () => {
      cancelled = true;
      activeController?.abort();
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
    };
  }, [isHydrated, session?.accessToken, canUseRealtime]);

  return null;
}
