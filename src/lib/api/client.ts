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
let onUnauthorized: (() => void) | null = null;

export function registerAccessTokenGetter(getter: () => string | null): void {
  accessTokenGetter = getter;
}

export function registerUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
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

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = String(error.config?.url ?? "");
      const isLogin = url.includes("/auth/login");
      if (!isLogin) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  },
);
