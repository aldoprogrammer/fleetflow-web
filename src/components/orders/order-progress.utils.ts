import type { ApiOrderStatus } from "@/lib/api/orders";

export const MATCHING_MIN_DISPLAY_MS = 5_000;

export function resolveDisplayStatus(
  status: ApiOrderStatus,
  orderCreatedAt: string,
  now: number,
): ApiOrderStatus {
  const matchingPhaseEndsAt =
    new Date(orderCreatedAt).getTime() + MATCHING_MIN_DISPLAY_MS;

  if (
    now < matchingPhaseEndsAt &&
    (status === "DRAFT" ||
      status === "PENDING" ||
      status === "MATCHING" ||
      status === "ASSIGNED")
  ) {
    return status === "DRAFT" || status === "PENDING" ? "PENDING" : "MATCHING";
  }

  return status;
}

export function resolveCurrentStepIndex(status: ApiOrderStatus): number {
  switch (status) {
    case "DRAFT":
    case "PENDING":
      return 0;
    case "MATCHING":
      return 1;
    case "ASSIGNED":
      return 2;
    case "PICKED_UP":
      return 3;
    case "DELIVERED":
      return 5;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}
