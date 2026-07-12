import type { UserRole } from "./types";

export const PERMISSIONS = {
  ORDERS_CREATE: "orders:create",
  ORDERS_READ_OWN: "orders:read:own",
  ORDERS_READ_ASSIGNED: "orders:read:assigned",
  ORDERS_READ_ALL: "orders:read:all",
  ORDERS_CANCEL: "orders:cancel",
  USERS_MANAGE: "users:manage",
  MERCHANTS_MANAGE: "merchants:manage",
  DRIVERS_MANAGE: "drivers:manage",
  FLEET_MANAGE: "fleet:manage",
  LEDGER_READ: "ledger:read",
  LEDGER_MANAGE: "ledger:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  SUPERADMIN: ALL_PERMISSIONS,
  REGIONAL_MANAGER: [
    PERMISSIONS.ORDERS_READ_ALL,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.DRIVERS_MANAGE,
    PERMISSIONS.FLEET_MANAGE,
    PERMISSIONS.LEDGER_READ,
    PERMISSIONS.MERCHANTS_MANAGE,
  ],
  HEAD_OF_WAREHOUSE: [
    PERMISSIONS.ORDERS_READ_ALL,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.FLEET_MANAGE,
    PERMISSIONS.LEDGER_READ,
  ],
  FLEET_OPERATOR: [
    PERMISSIONS.ORDERS_READ_ALL,
    PERMISSIONS.DRIVERS_MANAGE,
    PERMISSIONS.FLEET_MANAGE,
  ],
  MERCHANT_ADMIN: [PERMISSIONS.ORDERS_CREATE, PERMISSIONS.ORDERS_READ_OWN],
  DRIVER_PARTNER: [PERMISSIONS.ORDERS_READ_ASSIGNED],
};

export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}
