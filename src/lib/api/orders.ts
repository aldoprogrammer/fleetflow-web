import axios, { type AxiosError } from "axios";
import { apiClient } from "./client";

export const VEHICLE_TYPES = ["BIKE", "CAR", "TRUCK"] as const;
export type ApiVehicleType = (typeof VEHICLE_TYPES)[number];

export type ApiOrderStatus =
  | "DRAFT"
  | "PENDING"
  | "MATCHING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

export interface CreateOrderPayload {
  vehicleTypeRequired: ApiVehicleType;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  merchantId?: string;
  packageDescription?: string;
  packageWeightKg?: number;
}

export interface OrderPartySummary {
  displayName: string;
  email: string;
  role: string;
}

export interface OrderMerchantSummary {
  id: string;
  companyName: string;
  email: string;
}

export interface OrderTimelineItem {
  id: string;
  status: ApiOrderStatus;
  note: string;
  createdAt: string;
}

export interface OrderPhoto {
  id: string;
  type: "DEPARTURE" | "DELIVERY";
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export interface AssignedDriverSummary {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: ApiVehicleType;
  /** Last known GPS (seed location until live ping is added). */
  currentLat?: number;
  currentLng?: number;
}

export type ApiOrderPaymentStatus = "PAID" | "UNPAID" | "NOT_CHARGED";

export interface OrderResponse {
  id: string;
  referenceCode?: string;
  displayTitle?: string;
  merchantId: string;
  merchant?: OrderMerchantSummary;
  merchantContact?: OrderPartySummary | null;
  createdBy?: OrderPartySummary | null;
  vehicleTypeRequired: ApiVehicleType;
  packageDescription?: string | null;
  packageWeightKg?: number | null;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  distanceKm?: number;
  status: ApiOrderStatus;
  paymentStatus?: ApiOrderPaymentStatus;
  price: number;
  matchDistanceKm?: number | null;
  assignedDriver?: AssignedDriverSummary | null;
  timeline: OrderTimelineItem[];
  photos?: OrderPhoto[];
  departurePhotoCount?: number;
  deliveryPhotoCount?: number;
  createdAt: string;
}

interface ApiEnvelope<T> {
  success?: boolean;
  statusCode?: number;
  data?: T;
  message?: string | string[];
}

export interface OrderListItem {
  id: string;
  merchantId: string;
  merchantName: string;
  vehicleTypeRequired: ApiVehicleType;
  pickupAddress: string;
  deliveryAddress: string;
  status: ApiOrderStatus;
  price: number;
  assignedDriverName: string | null;
  createdAt: string;
}

export async function listOrders(): Promise<OrderListItem[]> {
  const response = await apiClient.get<OrderListItem[]>("/orders");
  return response.data;
}

export interface OrderPriceEstimate {
  price: number;
  distanceKm: number;
  currency: "IDR";
}

export interface EstimateOrderPricePayload {
  vehicleTypeRequired: ApiVehicleType;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
}

export async function estimateOrderPrice(
  payload: EstimateOrderPricePayload,
): Promise<OrderPriceEstimate> {
  const response = await apiClient.post<OrderPriceEstimate>(
    "/orders/estimate",
    payload,
  );
  return response.data;
}

export async function deliverOrder(
  orderId: string,
  payload: { overrideReason?: string } = {},
): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>(
    `/orders/${orderId}/deliver`,
    payload,
  );
  return response.data;
}

export async function pickupOrder(
  orderId: string,
  payload: { overrideReason?: string } = {},
): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>(
    `/orders/${orderId}/pickup`,
    payload,
  );
  return response.data;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>("/orders", payload);
  return response.data;
}

export async function getOrder(orderId: string): Promise<OrderResponse> {
  const response = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
  return response.data;
}

export async function uploadOrderPhoto(
  orderId: string,
  type: "DEPARTURE" | "DELIVERY",
  file: File,
): Promise<OrderPhoto> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);

  const response = await apiClient.post<OrderPhoto>(
    `/orders/${orderId}/photos`,
    formData,
  );
  return response.data;
}

export function extractApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>;

    const data = axiosError.response?.data;
    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }
    if (typeof data?.message === "string") {
      return data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to process the order request.";
}
