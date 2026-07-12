"use client";

import { useEffect, useState, type ReactElement } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listDrivers, type DriverSummary } from "@/lib/api/fleet";

export function DriversPanel(): ReactElement {
  const [drivers, setDrivers] = useState<DriverSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listDrivers()
      .then(setDrivers)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load drivers."),
      );
  }, []);

  if (error) {
    return (
      <PageSection title="Driver partners">
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </PageSection>
    );
  }

  if (!drivers) {
    return (
      <PageSection title="Driver partners">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageSection>
    );
  }

  return (
    <PageSection
      title="Driver partners"
      description="Onboarding roster, vehicle compliance, and live shift status."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Vehicle</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium text-slate-900">
                  {driver.fullName}
                </td>
                <td className="px-3 py-3 text-slate-600">{driver.phone}</td>
                <td className="px-3 py-3">
                  {driver.vehicleType} · {driver.plateNumber}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge value={driver.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}
