"use client";

import { useEffect, useState, type ReactElement } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ROLE_LABELS } from "@/lib/auth/types";
import { listPortalUsers, type PortalUserSummary } from "@/lib/api/users";

export function UsersAdminPanel(): ReactElement {
  const [users, setUsers] = useState<PortalUserSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listPortalUsers()
      .then(setUsers)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load users."),
      );
  }, []);

  if (error) {
    return (
      <PageSection title="User management">
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </PageSection>
    );
  }

  if (!users) {
    return (
      <PageSection title="User management">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageSection>
    );
  }

  return (
    <PageSection
      title="User management"
      description="Enterprise RBAC directory for all six FleetFlow portal roles."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Scope</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100">
                <td className="px-3 py-3">
                  <p className="font-medium text-slate-900">{user.displayName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-3 py-3 text-slate-700">
                  {ROLE_LABELS[user.role]}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {user.merchant?.companyName ??
                    user.driver?.fullName ??
                    "Platform"}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge value={user.isActive ? "ACTIVE" : "INACTIVE"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}
