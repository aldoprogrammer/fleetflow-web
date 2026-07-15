"use client";

import {
  Building2,
  MapPin,
  Navigation,
  Package,
  Phone,
  Receipt,
  Truck,
  UserCircle2,
  UserPen,
  Weight,
} from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderOperationsPanel } from "@/components/orders/OrderOperationsPanel";
import { OrderProofPhotosPanel } from "@/components/orders/OrderProofPhotosPanel";
import { OrderTripMap } from "@/components/orders/OrderTripMap";
import type { OrderResponse } from "@/lib/api/orders";
import {
  formatDateTime,
  formatIdr,
  formatOrderReference,
  formatOrderTitle,
  formatRoleLabel,
  resolveOrderPaymentStatus,
} from "@/lib/orders/display";
import { resolvePaymentDescription } from "@/lib/orders/operations";

interface OrderDetailOverviewProps {
  order: OrderResponse;
  isRefreshing?: boolean;
  onOrderUpdated?: (order: OrderResponse) => void;
}

interface InfoCardProps {
  icon: ReactNode;
  label: string;
  title: string;
  subtitle?: string;
  accent?: "emerald" | "sky" | "violet" | "amber" | "slate";
}

const ACCENT_STYLES = {
  emerald: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white text-emerald-700",
  sky: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-white text-sky-700",
  violet: "border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white text-violet-700",
  amber: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white text-amber-700",
  slate: "border-slate-200/80 bg-gradient-to-br from-slate-50/90 to-white text-slate-700",
} as const;

function InfoCard({
  icon,
  label,
  title,
  subtitle,
  accent = "slate",
}: InfoCardProps): ReactElement {
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${ACCENT_STYLES[accent]}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-white/90 p-2 shadow-sm">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-80">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{title}</p>
          {subtitle ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function PartyCard({
  label,
  party,
  icon,
  accent,
}: {
  label: string;
  party: { displayName: string; email: string; role: string } | null | undefined;
  icon: ReactNode;
  accent: InfoCardProps["accent"];
}): ReactElement {
  if (!party) {
    return (
      <InfoCard
        icon={icon}
        label={label}
        title="Not recorded"
        subtitle="Created via merchant API integration"
        accent={accent}
      />
    );
  }

  return (
    <InfoCard
      icon={icon}
      label={label}
      title={party.displayName}
      subtitle={`${party.email} · ${formatRoleLabel(party.role)}`}
      accent={accent}
    />
  );
}

export function OrderDetailOverview({
  order,
  isRefreshing = false,
  onOrderUpdated,
}: OrderDetailOverviewProps): ReactElement {
  const reference = order.referenceCode || formatOrderReference(order.id);
  const title =
    order.displayTitle ||
    formatOrderTitle({
      packageDescription: order.packageDescription,
      deliveryAddress: order.deliveryAddress,
    });
  const paymentStatus = order.paymentStatus ?? resolveOrderPaymentStatus(order.status);
  const routeKm = order.distanceKm ?? 0;
  const packageLabel =
    order.packageDescription?.trim() || "General parcel — no item list provided";
  const weightLabel =
    order.packageWeightKg && order.packageWeightKg > 0
      ? `${order.packageWeightKg} kg`
      : "Weight not specified";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      <div className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 px-6 py-7 text-white sm:px-8 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.28),transparent_42%)]"
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3">
              <StatusBadge value={order.status} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/90">
              Live dispatch
            </p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-emerald-100/85">
              Created {formatDateTime(order.createdAt)}
              {isRefreshing ? " · syncing…" : ""}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50 ring-1 ring-white/15">
                {order.vehicleTypeRequired}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50 ring-1 ring-white/15">
                {routeKm > 0 ? `${routeKm.toFixed(2)} km route` : "Route pending"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-left ring-1 ring-white/15 backdrop-blur-sm lg:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/80">
                Order ID
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-white">
                {reference}
              </p>
              <p className="mt-1 max-w-[16rem] truncate font-mono text-[11px] text-emerald-100/70">
                {order.id}
              </p>
            </div>
            <div className="flex flex-wrap items-stretch gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/80">
                  Payment
                </p>
                <div className="mt-2">
                  <StatusBadge value={paymentStatus} />
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 px-4 py-3 ring-1 ring-emerald-300/30 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
                  Fare
                </p>
                <p className="mt-1 text-2xl font-bold text-white">{formatIdr(order.price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-b border-slate-100 p-5 sm:p-6">
        <OrderTripMap
          pickupLat={order.pickupLat}
          pickupLng={order.pickupLng}
          deliveryLat={order.deliveryLat}
          deliveryLng={order.deliveryLng}
          pickupLabel={order.pickupAddress}
          deliveryLabel={order.deliveryAddress}
          status={order.status}
          driver={order.assignedDriver}
        />
        {onOrderUpdated ? (
          <OrderOperationsPanel order={order} onUpdated={onOrderUpdated} />
        ) : null}
        <OrderProofPhotosPanel order={order} onOrderUpdated={onOrderUpdated} />
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        <InfoCard
          icon={<Building2 className="h-5 w-5" />}
          label="Merchant"
          title={order.merchant?.companyName ?? "Merchant"}
          subtitle={order.merchant?.email ?? order.merchantId}
          accent="emerald"
        />

        <PartyCard
          label="Account manager"
          party={order.merchantContact}
          icon={<UserCircle2 className="h-5 w-5" />}
          accent="sky"
        />

        <PartyCard
          label="Created by"
          party={order.createdBy}
          icon={<UserPen className="h-5 w-5" />}
          accent="violet"
        />

        <InfoCard
          icon={<MapPin className="h-5 w-5" />}
          label="Pickup"
          title={order.pickupAddress.split(",")[0]?.trim() || order.pickupAddress}
          subtitle={order.pickupAddress}
          accent="amber"
        />

        <InfoCard
          icon={<Navigation className="h-5 w-5" />}
          label="Destination"
          title={order.deliveryAddress.split(",")[0]?.trim() || order.deliveryAddress}
          subtitle={order.deliveryAddress}
          accent="sky"
        />

        <InfoCard
          icon={<Package className="h-5 w-5" />}
          label="Parcel"
          title={packageLabel}
          subtitle={weightLabel}
          accent="violet"
        />

        <InfoCard
          icon={<Receipt className="h-5 w-5" />}
          label="Billing"
          title={formatIdr(order.price)}
          subtitle={resolvePaymentDescription(paymentStatus, order.price)}
          accent="emerald"
        />

        {order.assignedDriver ? (
          <InfoCard
            icon={<Truck className="h-5 w-5" />}
            label="Assigned driver"
            title={order.assignedDriver.fullName}
            subtitle={`${order.assignedDriver.vehicleType}${order.matchDistanceKm ? ` · ${order.matchDistanceKm.toFixed(2)} km from pickup` : ""}`}
            accent="sky"
          />
        ) : (
          <InfoCard
            icon={<Truck className="h-5 w-5" />}
            label="Assigned driver"
            title="Matching in progress"
            subtitle="Driver details appear once dispatch is confirmed"
            accent="slate"
          />
        )}

        {order.assignedDriver ? (
          <InfoCard
            icon={<Phone className="h-5 w-5" />}
            label="Driver contact"
            title={order.assignedDriver.phone}
            subtitle="Reach out for pickup coordination"
            accent="amber"
          />
        ) : (
          <InfoCard
            icon={<Weight className="h-5 w-5" />}
            label="Vehicle required"
            title={order.vehicleTypeRequired}
            subtitle="Fleet matcher filters by vehicle type and proximity"
            accent="slate"
          />
        )}
      </div>
    </div>
  );
}
