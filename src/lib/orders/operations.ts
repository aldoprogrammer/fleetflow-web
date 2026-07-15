import type { ApiOrderPaymentStatus, ApiOrderStatus, OrderResponse } from "@/lib/api/orders";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { resolveOrderPaymentStatus } from "@/lib/orders/display";

export type OrderOperationAction = "confirm_pickup" | "mark_delivered";

export interface ActiveOrderOperation {
  action: OrderOperationAction;
  title: string;
  description: string;
  buttonLabel: string;
}

export function canManageOrderOperations(
  permissions: readonly string[],
  order: OrderResponse,
  driverId: string | null | undefined,
): boolean {
  const isOps =
    permissions.includes(PERMISSIONS.ORDERS_READ_ALL) ||
    permissions.includes(PERMISSIONS.FLEET_MANAGE);
  const isAssignedDriver =
    permissions.includes(PERMISSIONS.ORDERS_READ_ASSIGNED) &&
    Boolean(driverId && order.assignedDriver?.id === driverId);

  return isOps || isAssignedDriver;
}

export function isOperationsRole(permissions: readonly string[]): boolean {
  return (
    permissions.includes(PERMISSIONS.ORDERS_READ_ALL) ||
    permissions.includes(PERMISSIONS.FLEET_MANAGE)
  );
}

export function resolvePaymentDescription(
  status: ApiOrderPaymentStatus,
  price: number,
): string {
  switch (status) {
    case "PAID":
      return "Merchant wallet was debited when the driver was assigned.";
    case "UNPAID":
      return "Fare is quoted. Wallet is charged automatically on driver assignment.";
    case "NOT_CHARGED":
      return "No wallet movement — order was cancelled before settlement.";
    default:
      return `Current fare: ${price}`;
  }
}

export function resolveActiveOperation(
  status: ApiOrderStatus,
): ActiveOrderOperation | null {
  if (status === "ASSIGNED") {
    return {
      action: "confirm_pickup",
      title: "Confirm pickup",
      description: "Driver is at merchant — mark pickup once the parcel is loaded.",
      buttonLabel: "Confirm pickup",
    };
  }

  if (status === "PICKED_UP") {
    return {
      action: "mark_delivered",
      title: "Confirm delivery",
      description: "Parcel in transit — mark delivered once drop-off is complete.",
      buttonLabel: "Confirm delivery",
    };
  }

  return null;
}

export function resolvePaymentStatus(order: OrderResponse): ApiOrderPaymentStatus {
  return order.paymentStatus ?? resolveOrderPaymentStatus(order.status);
}

export function canUploadDepartureProof(
  status: ApiOrderStatus,
  permissions: readonly string[],
  order: OrderResponse,
  driverId: string | null | undefined,
): boolean {
  return (
    status === "ASSIGNED" &&
    canManageOrderOperations(permissions, order, driverId)
  );
}

export function canUploadDeliveryProof(
  status: ApiOrderStatus,
  permissions: readonly string[],
  order: OrderResponse,
  driverId: string | null | undefined,
): boolean {
  return (
    status === "PICKED_UP" &&
    canManageOrderOperations(permissions, order, driverId)
  );
}
