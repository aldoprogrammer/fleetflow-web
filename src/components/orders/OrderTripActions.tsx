"use client";

import { useState, type ReactElement } from "react";
import { Package, Truck } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  deliverOrder,
  pickupOrder,
  extractApiErrorMessage,
  type ApiOrderStatus,
  type OrderResponse,
} from "@/lib/api/orders";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useAuthStore } from "@/stores/auth-store";

interface OrderTripActionsProps {
  order: OrderResponse;
  onUpdated: (order: OrderResponse) => void;
}

function canManageTrip(
  permissions: readonly string[],
  order: OrderResponse,
  driverId: string | null | undefined,
): boolean {
  const isOps =
    permissions.includes(PERMISSIONS.ORDERS_READ_ALL) ||
    permissions.includes(PERMISSIONS.FLEET_MANAGE);
  const isAssignedDriver =
    permissions.includes(PERMISSIONS.ORDERS_READ_ASSIGNED) &&
    driverId &&
    order.assignedDriver?.id === driverId;

  return Boolean(isOps || isAssignedDriver);
}

export function OrderTripActions({
  order,
  onUpdated,
}: OrderTripActionsProps): ReactElement | null {
  const session = useAuthStore((state) => state.session);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const allowed = canManageTrip(
    session.user.permissions,
    order,
    session.user.driverId,
  );

  if (!allowed) return null;

  const status = order.status as ApiOrderStatus;

  if (status !== "ASSIGNED" && status !== "PICKED_UP") return null;

  const handlePickup = async (): Promise<void> => {
    setError(null);
    setIsSubmitting(true);
    try {
      onUpdated(await pickupOrder(order.id));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeliver = async (): Promise<void> => {
    setError(null);
    setIsSubmitting(true);
    try {
      onUpdated(await deliverOrder(order.id));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">Trip actions</p>
      <p className="mt-1 text-xs text-slate-600">
        Confirm pickup and delivery to complete the fulfillment lifecycle.
      </p>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {status === "ASSIGNED" ? (
          <SubmitButton
            type="button"
            loading={isSubmitting}
            loadingLabel="Updating..."
            onClick={() => void handlePickup()}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
          >
            <Package className="h-4 w-4" />
            Confirm pickup
          </SubmitButton>
        ) : null}

        {status === "PICKED_UP" ? (
          <SubmitButton
            type="button"
            loading={isSubmitting}
            loadingLabel="Completing..."
            onClick={() => void handleDeliver()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            <Truck className="h-4 w-4" />
            Mark delivered
          </SubmitButton>
        ) : null}
      </div>
    </div>
  );
}
