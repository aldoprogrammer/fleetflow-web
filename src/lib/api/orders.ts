import axios, { type AxiosError } from "axios";
import { env } from "@/lib/env";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

export const PACKAGE_TYPES = ["DOCUMENT", "PARCEL", "BULK"] as const;
export type ApiPackageType = (typeof PACKAGE_TYPES)[number];

export interface CreateOrderPayload {
  merchantId: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageWeight: number;
  packageType: ApiPackageType;
}

export interface OrderResponse {
  id: string;
  merchantId: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageWeight: number;
  packageType: ApiPackageType;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>("/orders", payload);
  return response.data;
}

export function extractApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string | string[];
      detail?: string;
    }>;

    const data = axiosError.response?.data;
    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }
    if (typeof data?.message === "string") {
      return data.message;
    }
    if (typeof data?.detail === "string") {
      return data.detail;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create order. Please try again.";
}
