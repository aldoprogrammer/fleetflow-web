"use client";

import { useEffect, useState, type ReactElement } from "react";
import { AppLink } from "@/components/ui/AppLink";
import { PageSection } from "@/components/ui/PageSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listOrders, type OrderListItem } from "@/lib/api/orders";

export function OperationsOrdersPanel(): ReactElement {
  const [orders, setOrders] = useState<OrderListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listOrders()
      .then(setOrders)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load orders."),
      );
  }, []);

  if (error) {
    return (
      <PageSection title="All orders">
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </PageSection>
    );
  }

  if (!orders) {
    return (
      <PageSection title="All orders">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageSection>
    );
  }

  return (
    <PageSection
      title="All orders"
      description="Cross-tenant dispatch monitor for operations and platform roles."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Order</th>
              <th className="px-3 py-3">Merchant</th>
              <th className="px-3 py-3">Route</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Driver</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100">
                <td className="px-3 py-3">
                  <AppLink
                    href={`/orders/${order.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {order.id.slice(0, 8)}…
                  </AppLink>
                  <p className="text-xs text-slate-500">{order.vehicleTypeRequired}</p>
                </td>
                <td className="px-3 py-3 text-slate-700">{order.merchantName}</td>
                <td className="px-3 py-3 text-slate-600">
                  <p className="line-clamp-1">{order.pickupAddress}</p>
                  <p className="line-clamp-1 text-xs text-slate-400">
                    → {order.deliveryAddress}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <StatusBadge value={order.status} />
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {order.assignedDriverName ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}
