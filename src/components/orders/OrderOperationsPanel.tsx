"use client";

import { Package, Truck } from "lucide-react";
import { useState, type ReactElement } from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  deliverOrder,
  pickupOrder,
  extractApiErrorMessage,
  type OrderResponse,
} from "@/lib/api/orders";
import {
  canManageOrderOperations,
  isOperationsRole,
  resolveActiveOperation,
  type OrderOperationAction,
} from "@/lib/orders/operations";
import { useAuthStore } from "@/stores/auth-store";

const MIN_ACTION_FEEDBACK_MS = 450;

interface OrderOperationsPanelProps {
  order: OrderResponse;
  onUpdated: (order: OrderResponse) => void;
}

export function OrderOperationsPanel({
  order,
  onUpdated,
}: OrderOperationsPanelProps): ReactElement | null {
  const session = useAuthStore((state) => state.session);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = session?.user.permissions ?? [];
  const canOperate = session
    ? canManageOrderOperations(permissions, order, session.user.driverId)
    : false;
  const isOpsUser = isOperationsRole(permissions);
  const activeOperation = resolveActiveOperation(order.status);

  if (!activeOperation || !canOperate) {
    return null;
  }

  const handleAction = async (action: OrderOperationAction): Promise<void> => {
    setError(null);
    setIsSubmitting(true);
    const startedAt = Date.now();

    try {
      if (action === "confirm_pickup") {
        onUpdated(await pickupOrder(order.id));
        return;
      }

      onUpdated(await deliverOrder(order.id));
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_ACTION_FEEDBACK_MS) {
        await new Promise((resolve) => {
          window.setTimeout(resolve, MIN_ACTION_FEEDBACK_MS - elapsed);
        });
      }
      setIsSubmitting(false);
    }
  };

  const loadingLabel =
    activeOperation.action === "confirm_pickup"
      ? "Confirming pickup..."
      : "Confirming delivery...";

  const Icon = activeOperation.action === "confirm_pickup" ? Package : Truck;
  const buttonClass =
    activeOperation.action === "confirm_pickup"
      ? "bg-amber-600 hover:bg-amber-500"
      : "bg-emerald-700 hover:bg-emerald-600";

  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {isOpsUser ? "Dispatch operations" : "Trip actions"}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{activeOperation.title}</p>
          <p className="mt-1 max-w-xl text-sm text-slate-600">{activeOperation.description}</p>
          {isOpsUser ? (
            <p className="mt-2 text-xs text-slate-500">
              Ops can advance trip status on behalf of the assigned driver when needed.
            </p>
          ) : null}
        </div>
        <SubmitButton
          type="button"
          loading={isSubmitting}
          loadingLabel={loadingLabel}
          onClick={() => void handleAction(activeOperation.action)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 ${buttonClass}`}
        >
          <Icon className="h-4 w-4" />
          {activeOperation.buttonLabel}
        </SubmitButton>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
