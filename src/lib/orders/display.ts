import type { ApiOrderPaymentStatus, ApiOrderStatus } from "@/lib/api/orders";

export function resolveOrderPaymentStatus(
  status: ApiOrderStatus,
): ApiOrderPaymentStatus {
  if (status === "ASSIGNED" || status === "PICKED_UP" || status === "DELIVERED") {
    return "PAID";
  }
  if (status === "CANCELLED") {
    return "NOT_CHARGED";
  }
  return "UNPAID";
}

export function formatOrderReference(orderId: string): string {
  const compact = orderId.replace(/-/g, "");
  return `#${compact.slice(-6).toUpperCase()}`;
}

export function formatOrderTitle(input: {
  packageDescription?: string | null;
  deliveryAddress: string;
}): string {
  const description = input.packageDescription?.trim();
  if (description) {
    return description.length > 64 ? `${description.slice(0, 61)}…` : description;
  }

  const destination =
    input.deliveryAddress.split(",")[0]?.trim() || input.deliveryAddress.trim();
  return `Dispatch to ${destination}`;
}

export function formatRoleLabel(role: string): string {
  return role.replace(/_/g, " ");
}

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
