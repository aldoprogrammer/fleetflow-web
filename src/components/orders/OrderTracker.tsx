"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { XCircle } from "lucide-react";
import { OrderDetailOverview } from "@/components/orders/OrderDetailOverview";
import { OrderProgressStepper } from "@/components/orders/OrderProgressStepper";
import {
  MATCHING_MIN_DISPLAY_MS,
  resolveDisplayStatus,
} from "@/components/orders/order-progress.utils";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { OrderTrackerSkeleton } from "@/components/ui/skeletons/OrderTrackerSkeleton";
import {
  getOrder,
  extractApiErrorMessage,
  type ApiOrderStatus,
  type OrderResponse,
} from "@/lib/api/orders";
import { subscribeOrderUpdates } from "@/lib/realtime/bus";

interface OrderTrackerProps {
  orderId: string;
}

const TERMINAL_STATUSES: ApiOrderStatus[] = ["DELIVERED", "CANCELLED"];

export function OrderTracker({ orderId }: OrderTrackerProps): ReactElement {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayNow, setDisplayNow] = useState(() => Date.now());

  const fetchOrder = useCallback(
    async (background = false): Promise<void> => {
      if (background) {
        setIsRefreshing(true);
      }

      try {
        const next = await getOrder(orderId);
        setOrder(next);
        setError(null);
      } catch (fetchError) {
        setError(extractApiErrorMessage(fetchError));
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [orderId],
  );

  useEffect(() => {
    void fetchOrder(false);
  }, [fetchOrder]);

  useEffect(() => {
    return subscribeOrderUpdates((updatedOrderId) => {
      if (updatedOrderId === orderId) {
        void fetchOrder(true);
      }
    });
  }, [fetchOrder, orderId]);

  // Safety net if SSE is down — keep booking detail fresh while the page is open.
  useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchOrder(true);
    }, 8_000);
    return () => window.clearInterval(timer);
  }, [fetchOrder]);

  useEffect(() => {
    if (!order) return;

    const matchingPhaseEndsAt =
      new Date(order.createdAt).getTime() + MATCHING_MIN_DISPLAY_MS;
    const remainingMs = matchingPhaseEndsAt - Date.now();

    if (remainingMs <= 0) return;

    const timeoutId = window.setTimeout(() => {
      setDisplayNow(Date.now());
    }, remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [order?.createdAt, order?.id, order?.status]);

  const displayStatus = order
    ? resolveDisplayStatus(order.status, order.createdAt, displayNow)
    : null;

  if (isInitialLoading && !error) {
    return <OrderTrackerSkeleton />;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!order) {
    return <OrderTrackerSkeleton />;
  }

  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <OrderProgressStepper status={displayStatus ?? order.status} />
      </section>

      <OrderDetailOverview
        order={order}
        isRefreshing={isRefreshing}
        onOrderUpdated={
          !isCancelled
            ? (next) => {
                setOrder(next);
              }
            : undefined
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {isCancelled ? (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <XCircle className="h-4 w-4" />
            Order cancelled. No driver was assigned within the matching window.
          </div>
        ) : null}

        <OrderTimeline entries={order.timeline} />
      </section>
    </div>
  );
}
