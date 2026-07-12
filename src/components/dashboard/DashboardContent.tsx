"use client";

import {
  BarChart3,
  Package,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { ReactElement } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { DashboardSkeleton } from "@/components/ui/skeletons/DashboardSkeleton";
import { getNavItemsForPermissions } from "@/lib/auth/access";
import { ROLE_LABELS, type UserRole } from "@/lib/auth/types";
import { ROLE_METRICS } from "@/lib/dashboard/metrics";
import { useAuthStore } from "@/stores/auth-store";

function roleIcon(role: UserRole): ReactElement {
  const className = "h-5 w-5 text-emerald-700";
  switch (role) {
    case "SUPERADMIN":
      return <ShieldCheck className={className} />;
    case "REGIONAL_MANAGER":
      return <BarChart3 className={className} />;
    case "HEAD_OF_WAREHOUSE":
      return <Warehouse className={className} />;
    case "FLEET_OPERATOR":
      return <Truck className={className} />;
    case "MERCHANT_ADMIN":
      return <Package className={className} />;
    case "DRIVER_PARTNER":
      return <Users className={className} />;
  }
}

export function DashboardContent(): ReactElement {
  const user = useAuthStore((s) => s.session?.user);

  if (!user) {
    return <DashboardSkeleton />;
  }

  const metrics = ROLE_METRICS[user.role];
  const quickLinks = getNavItemsForPermissions(user.permissions).filter(
    (item) => item.href !== "/dashboard",
  );

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 p-2.5">{roleIcon(user.role)}</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {ROLE_LABELS[user.role]}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Welcome back, {user.displayName.split(" ")[0]}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              KPI overview with month-over-month comparison and performance signals.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      {quickLinks.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quick actions
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Jump directly into modules available for your role.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {quickLinks.map((item) => (
              <QuickActionCard key={item.href} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
