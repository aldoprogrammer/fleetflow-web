import { apiClient } from "./client";

export interface LedgerTransaction {
  id: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  description: string;
  createdAt: string;
  merchant: { companyName: string } | null;
  driver: { fullName: string } | null;
}

export async function listLedgerTransactions(): Promise<LedgerTransaction[]> {
  const response = await apiClient.get<LedgerTransaction[]>(
    "/ledger/transactions",
  );
  return response.data;
}
