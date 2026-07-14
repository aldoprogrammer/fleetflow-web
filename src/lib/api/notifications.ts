import { apiClient } from "@/lib/api/client";

export type ApiNotificationType =
  | "ORDER_ASSIGNED"
  | "ORDER_PICKED_UP"
  | "ORDER_DELIVERED"
  | "ORDER_CANCELLED";

export interface ApiNotification {
  id: string;
  type: ApiNotificationType;
  title: string;
  body: string;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
  isRead: boolean;
}

export async function listNotifications(options?: {
  unreadOnly?: boolean;
}): Promise<ApiNotification[]> {
  const { data } = await apiClient.get<ApiNotification[]>("/notifications", {
    params: options?.unreadOnly ? { unreadOnly: true } : undefined,
  });
  return data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>(
    "/notifications/unread-count",
  );
  return data.count;
}

export async function markNotificationRead(
  id: string,
): Promise<ApiNotification> {
  const { data } = await apiClient.patch<ApiNotification>(
    `/notifications/${id}/read`,
  );
  return data;
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const { data } = await apiClient.post<{ updated: number }>(
    "/notifications/read-all",
  );
  return data;
}

export function extractNotificationApiError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === "string"
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Notification request failed.";
}
