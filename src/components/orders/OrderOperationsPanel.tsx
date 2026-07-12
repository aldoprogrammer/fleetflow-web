"use client";

import { useState, type ReactElement } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="mt-4 max-w-lg overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-white">
          {isOpsUser ? "Dispatch operations" : "Trip actions"}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-emerald-100/80" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-emerald-100/80" />
        )}
      </button>

      {isOpen ? (
        <div className="border-t border-white/10 px-4 pb-4 pt-3">
          {isOpsUser ? (
            <p className="rounded-xl border border-emerald-300/25 bg-emerald-500/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-50/90">
              Manual confirmations update trip status from the dispatch console. Live map syncs
              on the driver&apos;s next location ping.
            </p>
          ) : null}

          <div className={isOpsUser ? "mt-3" : undefined}>
            <p className="text-sm font-semibold text-white">{activeOperation.title}</p>
            <p className="mt-1 text-sm text-emerald-100/80">{activeOperation.description}</p>

            <div className="mt-3 border-t border-white/10 pt-3">
              <SubmitButton
                type="button"
                loading={isSubmitting}
                loadingLabel={loadingLabel}
                onClick={() => void handleAction(activeOperation.action)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {activeOperation.buttonLabel}
              </SubmitButton>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-rose-300/30 bg-rose-500/15 px-3 py-2 text-sm text-rose-100"
            >
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
