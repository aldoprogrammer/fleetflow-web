import type { AuthSession, UserRole } from "@/lib/auth/types";
import { apiClient } from "./client";
import { extractApiErrorMessage } from "./orders";

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export async function login(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>("/auth/login", payload);
  return response.data;
}

export async function fetchProfile(): Promise<AuthSession["user"]> {
  const response = await apiClient.get<AuthSession["user"]>("/auth/me");
  return response.data;
}

export { extractApiErrorMessage };
