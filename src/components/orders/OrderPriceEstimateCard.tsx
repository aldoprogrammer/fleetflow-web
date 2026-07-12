"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Loader2, Receipt } from "lucide-react";
import {
  estimateOrderPrice,
  type ApiVehicleType,
  type OrderPriceEstimate,
} from "@/lib/api/orders";
import { formatIdr } from "@/lib/orders/display";

interface OrderPriceEstimateCardProps {
  vehicleTypeRequired: ApiVehicleType | "";
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
}

export function OrderPriceEstimateCard({
  vehicleTypeRequired,
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
}: OrderPriceEstimateCardProps): ReactElement {
  const [estimate, setEstimate] = useState<OrderPriceEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const canEstimate = vehicleTypeRequired !== "";

  useEffect(() => {
    if (!canEstimate) {
      setEstimate(null);
      setHasError(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      setHasError(false);
      void estimateOrderPrice({
        vehicleTypeRequired,
        pickupLat,
        pickupLng,
        deliveryLat,
        deliveryLng,
      })
        .then((result) => {
          setEstimate(result);
          setHasError(false);
        })
        .catch(() => {
          setEstimate(null);
          setHasError(true);
        })
        .finally(() => setIsLoading(false));
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [canEstimate, vehicleTypeRequired, pickupLat, pickupLng, deliveryLat, deliveryLng]);

  return (
    <div className="rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 shadow-lg shadow-emerald-900/5 ring-1 ring-emerald-100">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-emerald-600 p-3 text-white shadow-sm">
          <Receipt className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
            Estimated fare
          </p>

          {!canEstimate ? (
            <p className="mt-2 text-sm text-slate-600">
              Select a vehicle type to calculate distance-based pricing.
            </p>
          ) : isLoading ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-900">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating quote…
            </div>
          ) : estimate ? (
            <>
              <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-950">
                {formatIdr(estimate.price)}
              </p>
              <p className="mt-2 text-sm text-emerald-900/85">
                ~{estimate.distanceKm} km · {vehicleTypeRequired} · debited when a driver is
                assigned
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-rose-700">
              {hasError
                ? "Could not load estimate. Check your session and try again."
                : "Adjust pickup and delivery to refresh the quote."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
