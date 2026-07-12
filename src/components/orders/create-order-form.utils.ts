import type { FormikErrors, FormikTouched } from "formik";
import * as Yup from "yup";
import { formatParcelContents } from "@/components/orders/ParcelContentsField";
import {
  VEHICLE_TYPES,
  type ApiVehicleType,
  type CreateOrderPayload,
} from "@/lib/api/orders";

export interface CreateOrderFormValues {
  merchantId: string;
  vehicleTypeRequired: ApiVehicleType | "";
  parcelContents: string[];
  packageWeightKg: string | number;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
}

export const CREATE_ORDER_FIELD_LABELS: Record<keyof CreateOrderFormValues, string> = {
  merchantId: "Merchant account",
  vehicleTypeRequired: "Vehicle type",
  parcelContents: "Parcel contents",
  packageWeightKg: "Parcel weight",
  pickupAddress: "Pickup address",
  deliveryAddress: "Delivery address",
  pickupLat: "Pickup location",
  pickupLng: "Pickup location",
  deliveryLat: "Delivery location",
  deliveryLng: "Delivery location",
};

export function normalizeWeightInput(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function parseOptionalWeightKg(value: unknown): number | undefined {
  const normalized = normalizeWeightInput(value);
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function buildCreateOrderValidationSchema(needsMerchantSelect: boolean) {
  return Yup.object({
    merchantId: needsMerchantSelect
      ? Yup.string().required("Select a merchant account.")
      : Yup.string(),
    vehicleTypeRequired: Yup.mixed<ApiVehicleType | "">()
      .required("Vehicle type is required.")
      .test(
        "valid-vehicle",
        "Select a valid vehicle type.",
        (value): value is ApiVehicleType =>
          value !== "" && (VEHICLE_TYPES as readonly string[]).includes(value),
      ),
    pickupAddress: Yup.string()
      .trim()
      .min(8, "Pickup address must be at least 8 characters.")
      .max(240)
      .required("Pickup address is required."),
    parcelContents: Yup.array().of(Yup.string()),
    packageWeightKg: Yup.mixed<string | number>()
      .transform((_value, originalValue) => normalizeWeightInput(originalValue))
      .test(
        "valid-weight",
        "Enter a positive weight in kg (max 5000), or leave blank.",
        (value) => {
          const normalized = normalizeWeightInput(value);
          if (!normalized) return true;
          const parsed = Number(normalized);
          return Number.isFinite(parsed) && parsed > 0 && parsed <= 5000;
        },
      ),
    deliveryAddress: Yup.string()
      .trim()
      .min(8, "Delivery address must be at least 8 characters.")
      .max(240)
      .required("Delivery address is required."),
    pickupLat: Yup.number().min(-90).max(90).required(),
    pickupLng: Yup.number().min(-180).max(180).required(),
    deliveryLat: Yup.number().min(-90).max(90).required(),
    deliveryLng: Yup.number().min(-180).max(180).required(),
  });
}

export function collectCreateOrderValidationMessages(
  errors: FormikErrors<CreateOrderFormValues>,
): string[] {
  const messages: string[] = [];

  for (const [field, message] of Object.entries(errors)) {
    if (!message || typeof message !== "string") continue;
    const label =
      CREATE_ORDER_FIELD_LABELS[field as keyof CreateOrderFormValues] ?? field;
    if (!messages.some((item) => item.startsWith(`${label}:`))) {
      messages.push(`${label}: ${message}`);
    }
  }

  return messages;
}

export function touchAllCreateOrderFields(): FormikTouched<CreateOrderFormValues> {
  return {
    merchantId: true,
    vehicleTypeRequired: true,
    parcelContents: true,
    packageWeightKg: true,
    pickupAddress: true,
    deliveryAddress: true,
    pickupLat: true,
    pickupLng: true,
    deliveryLat: true,
    deliveryLng: true,
  };
}

export function buildCreateOrderPayload(
  values: CreateOrderFormValues,
  needsMerchantSelect: boolean,
): CreateOrderPayload {
  const payload: CreateOrderPayload = {
    vehicleTypeRequired: values.vehicleTypeRequired as ApiVehicleType,
    pickupAddress: values.pickupAddress.trim(),
    deliveryAddress: values.deliveryAddress.trim(),
    pickupLat: values.pickupLat,
    pickupLng: values.pickupLng,
    deliveryLat: values.deliveryLat,
    deliveryLng: values.deliveryLng,
  };

  if (needsMerchantSelect && values.merchantId) {
    payload.merchantId = values.merchantId;
  }

  const packageDescription = formatParcelContents(values.parcelContents);
  if (packageDescription) {
    payload.packageDescription = packageDescription;
  }

  const weightKg = parseOptionalWeightKg(values.packageWeightKg);
  if (weightKg !== undefined) {
    payload.packageWeightKg = weightKg;
  }

  return payload;
}
