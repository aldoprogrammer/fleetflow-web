import { getPermissionsForRole } from "./permissions";
import type { UserRole } from "./types";

export const AUTH_COOKIE = "fleetflow_token";
export const RBAC_COOKIE = "fleetflow_rbac";

export interface RbacCookiePayload {
  role: UserRole;
}

export function parseRbacCookie(value: string | undefined): RbacCookiePayload | null {
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);
    const json = atob(decoded);
    const payload = JSON.parse(json) as RbacCookiePayload;
    if (!payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getPermissionsFromRbacCookie(value: string | undefined): string[] {
  const payload = parseRbacCookie(value);
  if (!payload) return [];
  return [...getPermissionsForRole(payload.role)];
}

export function encodeRbacCookieValue(role: UserRole): string {
  return encodeURIComponent(btoa(JSON.stringify({ role } satisfies RbacCookiePayload)));
}
