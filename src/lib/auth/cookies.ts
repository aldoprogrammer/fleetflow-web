import type { UserRole } from "./types";
import { AUTH_COOKIE, RBAC_COOKIE } from "./session";

export { AUTH_COOKIE, RBAC_COOKIE } from "./session";

export function setAuthCookie(token: string, maxAgeSeconds: number): void {
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function setRbacCookie(role: UserRole, maxAgeSeconds: number): void {
  const payload = btoa(JSON.stringify({ role }));
  document.cookie = `${RBAC_COOKIE}=${encodeURIComponent(payload)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthCookies(): void {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${RBAC_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
