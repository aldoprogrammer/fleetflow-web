"use client";

import { AppLink } from "@/components/ui/AppLink";
import { PageSection } from "@/components/ui/PageSection";
import {
  extractNotificationApiError,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/api/notifications";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth-store";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactElement } from "react";

export function NotificationsPageContent(): ReactElement {
  const permissions = useAuthStore((s) => s.session?.user.permissions ?? []);
  const canRead = permissions.includes(PERMISSIONS.NOTIFICATIONS_READ);
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (!canRead) return;
    setLoading(true);
    try {
      setItems(await listNotifications());
      setError(null);
    } catch (err) {
      setError(extractNotificationApiError(err));
    } finally {
      setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 5000);
    return () => window.clearInterval(id);
  }, [refresh]);

  if (!canRead) {
    return (
      <PageSection
        title="Notifications"
        description="You do not have permission to view notifications."
      >
        <p className="text-sm text-slate-600">Contact a platform admin.</p>
      </PageSection>
    );
  }

  const unread = items.filter((item) => !item.isRead);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Order lifecycle alerts from assign through delivery.
          </p>
        </div>
        {unread.length > 0 ? (
          <button
            type="button"
            onClick={() => void markAllNotificationsRead().then(() => refresh())}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        ) : null}
      </div>

      <PageSection>
        {loading && items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notifications...
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mb-4 text-sm text-rose-600">
            {error}
          </p>
        ) : null}

        {items.length === 0 && !loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-800">Inbox empty</p>
            <p className="mt-1 text-sm text-slate-500">
              Assigned, picked up, delivered, and cancelled events appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <AppLink
                  href={
                    item.orderId ? `/orders/${item.orderId}` : "/notifications"
                  }
                  onClick={() => {
                    if (!item.isRead) {
                      void markNotificationRead(item.id).then(() => refresh());
                    }
                  }}
                  className={`block rounded-2xl border px-4 py-4 transition hover:border-emerald-200 ${
                    item.isRead
                      ? "border-slate-200 bg-white"
                      : "border-emerald-100 bg-emerald-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {item.type.replaceAll("_", " ")} ·{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!item.isRead ? (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" />
                    ) : null}
                  </div>
                </AppLink>
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </div>
  );
}
