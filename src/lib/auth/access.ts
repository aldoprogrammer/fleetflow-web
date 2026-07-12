import {
  PERMISSIONS,
  getPermissionsForRole,
  type Permission,
} from "./permissions";
import type { UserRole } from "./types";

export type PermissionMode = "all" | "any";

export interface RouteAccessRule {
  pattern: RegExp;
  label: string;
  permissions: readonly Permission[];
  mode: PermissionMode;
}

export interface NavItemConfig {
  href: string;
  label: string;
  icon: string;
  permissions: readonly Permission[];
  mode: PermissionMode;
  group: "core" | "operations" | "admin";
}

export const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  {
    pattern: /^\/dashboard$/,
    label: "Dashboard",
    permissions: [],
    mode: "all",
  },
  {
    pattern: /^\/orders\/create$/,
    label: "Create order",
    permissions: [PERMISSIONS.ORDERS_CREATE],
    mode: "all",
  },
  {
    pattern: /^\/orders\/track$/,
    label: "Track order",
    permissions: [
      PERMISSIONS.ORDERS_READ_OWN,
      PERMISSIONS.ORDERS_READ_ALL,
      PERMISSIONS.ORDERS_READ_ASSIGNED,
    ],
    mode: "any",
  },
  {
    pattern: /^\/orders\/[^/]+$/,
    label: "Order detail",
    permissions: [
      PERMISSIONS.ORDERS_READ_OWN,
      PERMISSIONS.ORDERS_READ_ALL,
      PERMISSIONS.ORDERS_READ_ASSIGNED,
    ],
    mode: "any",
  },
  {
    pattern: /^\/operations\/orders$/,
    label: "All orders",
    permissions: [PERMISSIONS.ORDERS_READ_ALL],
    mode: "all",
  },
  {
    pattern: /^\/fleet$/,
    label: "Fleet control",
    permissions: [PERMISSIONS.FLEET_MANAGE],
    mode: "all",
  },
  {
    pattern: /^\/drivers$/,
    label: "Drivers",
    permissions: [PERMISSIONS.DRIVERS_MANAGE],
    mode: "all",
  },
  {
    pattern: /^\/merchants$/,
    label: "Merchants",
    permissions: [PERMISSIONS.MERCHANTS_MANAGE],
    mode: "all",
  },
  {
    pattern: /^\/ledger$/,
    label: "Ledger",
    permissions: [PERMISSIONS.LEDGER_READ, PERMISSIONS.LEDGER_MANAGE],
    mode: "any",
  },
  {
    pattern: /^\/admin\/users$/,
    label: "User management",
    permissions: [PERMISSIONS.USERS_MANAGE],
    mode: "all",
  },
  {
    pattern: /^\/forbidden$/,
    label: "Forbidden",
    permissions: [],
    mode: "all",
  },
];

export const NAV_ITEMS: NavItemConfig[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    permissions: [],
    mode: "all",
    group: "core",
  },
  {
    href: "/orders/create",
    label: "Create order",
    icon: "create",
    permissions: [PERMISSIONS.ORDERS_CREATE],
    mode: "all",
    group: "core",
  },
  {
    href: "/orders/track",
    label: "Track order",
    icon: "track",
    permissions: [
      PERMISSIONS.ORDERS_READ_OWN,
      PERMISSIONS.ORDERS_READ_ALL,
      PERMISSIONS.ORDERS_READ_ASSIGNED,
    ],
    mode: "any",
    group: "core",
  },
  {
    href: "/operations/orders",
    label: "All orders",
    icon: "orders",
    permissions: [PERMISSIONS.ORDERS_READ_ALL],
    mode: "all",
    group: "operations",
  },
  {
    href: "/fleet",
    label: "Fleet control",
    icon: "fleet",
    permissions: [PERMISSIONS.FLEET_MANAGE],
    mode: "all",
    group: "operations",
  },
  {
    href: "/drivers",
    label: "Drivers",
    icon: "drivers",
    permissions: [PERMISSIONS.DRIVERS_MANAGE],
    mode: "all",
    group: "operations",
  },
  {
    href: "/merchants",
    label: "Merchants",
    icon: "merchants",
    permissions: [PERMISSIONS.MERCHANTS_MANAGE],
    mode: "all",
    group: "operations",
  },
  {
    href: "/ledger",
    label: "Ledger",
    icon: "ledger",
    permissions: [PERMISSIONS.LEDGER_READ, PERMISSIONS.LEDGER_MANAGE],
    mode: "any",
    group: "admin",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: "users",
    permissions: [PERMISSIONS.USERS_MANAGE],
    mode: "all",
    group: "admin",
  },
];

export function permissionsInclude(
  userPermissions: readonly string[],
  required: readonly Permission[],
  mode: PermissionMode,
): boolean {
  if (required.length === 0) return true;

  if (mode === "any") {
    return required.some((permission) => userPermissions.includes(permission));
  }

  return required.every((permission) => userPermissions.includes(permission));
}

export function getPermissionsForUserRole(role: UserRole): readonly Permission[] {
  return getPermissionsForRole(role);
}

export function matchRouteRule(pathname: string): RouteAccessRule | null {
  return ROUTE_ACCESS_RULES.find((rule) => rule.pattern.test(pathname)) ?? null;
}

export function canAccessPath(
  pathname: string,
  userPermissions: readonly string[],
): boolean {
  const rule = matchRouteRule(pathname);
  if (!rule) return false;
  return permissionsInclude(userPermissions, rule.permissions, rule.mode);
}

export function getNavItemsForPermissions(
  userPermissions: readonly string[],
): NavItemConfig[] {
  return NAV_ITEMS.filter((item) =>
    permissionsInclude(userPermissions, item.permissions, item.mode),
  );
}

export function getDefaultPathForRole(role: UserRole): string {
  const permissions = getPermissionsForRole(role);

  if (permissions.includes(PERMISSIONS.ORDERS_CREATE)) {
    return "/dashboard";
  }

  if (permissions.includes(PERMISSIONS.ORDERS_READ_ALL)) {
    return "/operations/orders";
  }

  if (permissions.includes(PERMISSIONS.ORDERS_READ_ASSIGNED)) {
    return "/orders/track";
  }

  return "/dashboard";
}
