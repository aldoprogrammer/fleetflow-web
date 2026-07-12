"use client";

import { useEffect, useState, type ReactElement } from "react";
import { AppLink } from "@/components/ui/AppLink";
import { PageSection } from "@/components/ui/PageSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchFleetOverview, type FleetOverview } from "@/lib/api/fleet";

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}): ReactElement {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function FleetControlPanel(): ReactElement {
  const [overview, setOverview] = useState<FleetOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchFleetOverview()
      .then(setOverview)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load fleet data."),
      );
  }, []);

  if (error) {
    return (
      <PageSection title="Fleet control">
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </PageSection>
    );
  }

  if (!overview) {
    return (
      <PageSection title="Fleet control">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      </PageSection>
    );
  }

  return (
    <div className="space-y-6">
      <PageSection
        title="Fleet control"
        description="Live dispatch queue, driver availability, and matching radius telemetry."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile
            label="Available drivers"
            value={overview.driverStatus.available}
          />
          <MetricTile label="On trip" value={overview.driverStatus.onTrip} />
          <MetricTile label="Offline" value={overview.driverStatus.offline} />
          <MetricTile
            label="Active dispatch"
            value={overview.activeDispatch}
            hint={`Match radius ${overview.matchRadiusKm} km`}
          />
        </div>
      </PageSection>

      <PageSection title="Driver roster" description="Courier partners with live status and coordinates.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">Driver</th>
                <th className="px-3 py-3">Vehicle</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Location</th>
              </tr>
            </thead>
            <tbody>
              {overview.drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{driver.fullName}</p>
                    <p className="text-xs text-slate-500">{driver.phone}</p>
                  </td>
                  <td className="px-3 py-3">
                    {driver.vehicleType} · {driver.plateNumber}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge value={driver.status} />
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {driver.currentLat.toFixed(4)}, {driver.currentLng.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Manage partner onboarding in{" "}
          <AppLink href="/drivers" className="font-medium text-emerald-700">
            Drivers
          </AppLink>
          .
        </p>
      </PageSection>
    </div>
  );
}
