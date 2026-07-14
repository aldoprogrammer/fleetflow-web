"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { AppLink } from "@/components/ui/AppLink";
import { PageSection } from "@/components/ui/PageSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listOrders, type OrderListItem } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/auth-store";

const ACTIVE_STATUSES = new Set(["ASSIGNED", "PICKED_UP", "MATCHING", "PENDING"]);
const POLL_MS = 5_000;

export function DriverAssignedOrdersPanel(): ReactElement {
  const session = useAuthStore((state) => state.session);
  const [orders, setOrders] = useState<OrderListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const items = await listOrders();
      setOrders(items.filter((order) => ACTIVE_STATUSES.has(order.status)));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load trips.");
    }
  }, []);

  useEffect(() => {
    if (!session?.user.driverId) {
      return;
    }

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, POLL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [load, session?.user.driverId]);

  if (!session?.user.driverId) {
    return (
      <PageSection title="Your trips">
        <p className="text-sm text-slate-600">Sign in as a driver partner to view assigned trips.</p>
      </PageSection>
    );
  }

  if (error) {
    return (
      <PageSection title="Your trips">
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </PageSection>
    );
  }

  if (!orders) {
    return (
      <PageSection title="Your trips">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </PageSection>
    );
  }

  return (
    <PageSection
      title="Your assigned trips"
      description="Open a trip to confirm pickup and mark delivery complete. List refreshes every 5 seconds."
    >
      {orders.length === 0 ? (
        <p className="text-sm text-slate-600">No active trips right now.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AppLink
                  href={`/orders/${order.id}`}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {order.id.slice(0, 8)}…
                </AppLink>
                <StatusBadge value={order.status} />
              </div>
              <p className="mt-2 text-sm text-slate-700 line-clamp-1">
                {order.pickupAddress}
              </p>
              <p className="text-xs text-slate-500 line-clamp-1">
                → {order.deliveryAddress}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageSection>
  );
}
