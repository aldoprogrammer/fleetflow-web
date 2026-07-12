import { apiClient } from "./client";

export interface MerchantSummary {
  id: string;
  companyName: string;
  email: string;
  balance: number;
}

export async function listMerchants(): Promise<MerchantSummary[]> {
  const response = await apiClient.get<MerchantSummary[]>("/merchants");
  return response.data;
}
