"use client";

import { useEffect, useState, type ReactElement } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listLedgerTransactions, type LedgerTransaction } from "@/lib/api/ledger";

function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LedgerPanel(): ReactElement {
  const [transactions, setTransactions] = useState<LedgerTransaction[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listLedgerTransactions()
      .then(setTransactions)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load ledger."),
      );
  }, []);

  if (error) {
    return (
      <PageSection title="Ledger & settlements">
        <p role="alert" className="text-sm text-rose-600">
          {error}
        </p>
      </PageSection>
    );
  }

  if (!transactions) {
    return (
      <PageSection title="Ledger & settlements">
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageSection>
    );
  }

  return (
    <PageSection
      title="Ledger & settlements"
      description="Merchant debits, driver payouts, and platform settlement audit trail."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Party</th>
              <th className="px-3 py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-100">
                <td className="px-3 py-3">
                  <StatusBadge value={tx.type} />
                </td>
                <td className="px-3 py-3 font-medium text-slate-900">
                  {formatIdr(tx.amount)}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {tx.merchant?.companyName ?? tx.driver?.fullName ?? "—"}
                </td>
                <td className="px-3 py-3 text-slate-600">{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}
