export type OrderUpdateReason = "status" | "photos" | "assigned";

export interface RealtimeNotificationPayload {
  notificationId: string;
  userId: string;
  driverId: string | null;
  orderId: string | null;
  type: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface RealtimeOrderUpdatedPayload {
  kind: "order.updated";
  orderId: string;
  merchantId: string;
  driverId: string | null;
  reason: OrderUpdateReason;
  updatedAt: string;
}

export type RealtimeStreamPayload =
  | RealtimeNotificationPayload
  | RealtimeOrderUpdatedPayload
  | { kind: "connected"; userId: string };

export function isRealtimeNotification(
  payload: RealtimeStreamPayload,
): payload is RealtimeNotificationPayload {
  return (
    "notificationId" in payload &&
    typeof payload.notificationId === "string"
  );
}

export function isRealtimeOrderUpdated(
  payload: RealtimeStreamPayload,
): payload is RealtimeOrderUpdatedPayload {
  return payload.kind === "order.updated";
}

type OrderHandler = (orderId: string, reason?: OrderUpdateReason) => void;
type VoidHandler = () => void;
type NotificationHandler = (payload: RealtimeNotificationPayload) => void;

const orderHandlers = new Set<OrderHandler>();
const listHandlers = new Set<VoidHandler>();
const notificationHandlers = new Set<NotificationHandler>();

export function subscribeOrderUpdates(handler: OrderHandler): () => void {
  orderHandlers.add(handler);
  return () => orderHandlers.delete(handler);
}

export function subscribeOrdersList(handler: VoidHandler): () => void {
  listHandlers.add(handler);
  return () => listHandlers.delete(handler);
}

export function subscribeRealtimeNotifications(
  handler: NotificationHandler,
): () => void {
  notificationHandlers.add(handler);
  return () => notificationHandlers.delete(handler);
}

export function emitOrderUpdated(
  orderId: string,
  reason?: OrderUpdateReason,
): void {
  for (const handler of orderHandlers) {
    handler(orderId, reason);
  }
  for (const handler of listHandlers) {
    handler();
  }
}

export function emitRealtimeNotification(
  payload: RealtimeNotificationPayload,
): void {
  for (const handler of notificationHandlers) {
    handler(payload);
  }
  if (payload.orderId) {
    emitOrderUpdated(payload.orderId, "status");
  }
}
