"use client";

import { AppLink } from "@/components/ui/AppLink";
import {
  extractNotificationApiError,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/api/notifications";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleString();
}

export function NotificationBell(): ReactElement | null {
  const session = useAuthStore((s) => s.session);
  const permissions = session?.user.permissions ?? [];
  const canRead = permissions.includes(PERMISSIONS.NOTIFICATIONS_READ);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  const refresh = useCallback(async (announce = false): Promise<void> => {
    if (!canRead) return;
    try {
      const [nextItems, count] = await Promise.all([
        listNotifications(),
        getUnreadNotificationCount(),
      ]);

      if (announce) {
        const pushToast = useToastStore.getState().push;
        for (const item of nextItems.filter((n) => !n.isRead)) {
          if (!seenIds.current.has(item.id)) {
            seenIds.current.add(item.id);
            pushToast({
              id: item.id,
              title: item.title,
              body: item.body,
              href: item.orderId ? `/orders/${item.orderId}` : "/notifications",
            });
            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification(item.title, { body: item.body });
              }
            }
          }
        }
      } else {
        for (const item of nextItems) {
          seenIds.current.add(item.id);
        }
      }

      setItems(nextItems.slice(0, 8));
      setUnread(count);
      setError(null);
    } catch (err) {
      setError(extractNotificationApiError(err));
    }
  }, [canRead]);

  useEffect(() => {
    if (!canRead) return;
    void refresh(false);
    const id = window.setInterval(() => {
      void refresh(true);
    }, 4000);
    return () => window.clearInterval(id);
  }, [canRead, refresh]);

  useEffect(() => {
    if (!canRead || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, [canRead]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!canRead) {
    return null;
  }

  const handleOpen = async (): Promise<void> => {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      await refresh(false);
      setLoading(false);
    }
  };

  const handleMarkAll = async (): Promise<void> => {
    setLoading(true);
    try {
      await markAllNotificationsRead();
      await refresh(false);
    } catch (err) {
      setError(extractNotificationApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item: ApiNotification): Promise<void> => {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id);
        await refresh(false);
      } catch (err) {
        setError(extractNotificationApiError(err));
      }
    }
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="relative inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <div className="flex items-center gap-2">
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => void handleMarkAll()}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all
                </button>
              ) : null}
              <AppLink
                href="/notifications"
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                onClick={() => setOpen(false)}
              >
                View all
              </AppLink>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : error ? (
              <p className="px-3 py-4 text-sm text-rose-600">{error}</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              items.map((item) => (
                <AppLink
                  key={item.id}
                  href={item.orderId ? `/orders/${item.orderId}` : "/notifications"}
                  onClick={() => void handleItemClick(item)}
                  className={`block border-b border-slate-50 px-3 py-3 transition hover:bg-slate-50 ${
                    item.isRead ? "bg-white" : "bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    {!item.isRead ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {item.body}
                  </p>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {formatRelative(item.createdAt)}
                  </p>
                </AppLink>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
