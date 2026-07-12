import axios from "axios";
import { env } from "@/lib/env";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

let accessTokenGetter: (() => string | null) | null = null;

export function registerAccessTokenGetter(getter: () => string | null): void {
  accessTokenGetter = getter;
}

apiClient.interceptors.request.use((config) => {
  const token = accessTokenGetter?.() ?? null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    delete config.headers["x-api-key"];
  } else {
    config.headers["x-api-key"] = env.apiKey;
    delete config.headers.Authorization;
  }

  return config;
});
