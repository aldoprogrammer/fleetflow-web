import { apiClient } from "./client";
import type { UserRole } from "@/lib/auth/types";

export interface PortalUserSummary {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  merchant: { companyName: string } | null;
  driver: { fullName: string } | null;
}

export async function listPortalUsers(): Promise<PortalUserSummary[]> {
  const response = await apiClient.get<PortalUserSummary[]>("/users");
  return response.data;
}
