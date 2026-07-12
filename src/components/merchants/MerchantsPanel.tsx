"use client";

import { useEffect, useState, type ReactElement } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { listMerchants, type MerchantSummary } from "@/lib/api/merchants";

function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MerchantsPanel(): ReactElement {
  const [merchants, setMerchants] = useState<MerchantSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listMerchants()
      .then(setMerchants)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load merchants."),
      );
  }, []);

  if (error) {
    return (
      <PageSection title="Merchant accounts">
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </PageSection>
    );
  }

  if (!merchants) {
    return (
      <PageSection title="Merchant accounts">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageSection>
    );
  }

  return (
    <PageSection
      title="Merchant accounts"
      description="B2B tenants, prepaid wallet balances, and dispatch billing context."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Wallet balance</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((merchant) => (
              <tr key={merchant.id} className="border-b border-slate-100">
                <td className="px-3 py-3 font-medium text-slate-900">
                  {merchant.companyName}
                </td>
                <td className="px-3 py-3 text-slate-600">{merchant.email}</td>
                <td className="px-3 py-3 font-medium text-slate-900">
                  {formatIdr(merchant.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}
