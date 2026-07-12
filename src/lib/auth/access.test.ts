import { getPermissionsForRole } from "./permissions";
import {
  canAccessPath,
  getDefaultPathForRole,
  getNavItemsForPermissions,
} from "./access";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "./types";

const ROUTE_MATRIX: Array<{
  role: UserRole;
  allowed: string[];
  denied: string[];
}> = [
  {
    role: "MERCHANT_ADMIN",
    allowed: ["/dashboard", "/orders/create", "/orders/track"],
    denied: ["/fleet", "/merchants", "/ledger", "/admin/users"],
  },
  {
    role: "FLEET_OPERATOR",
    allowed: ["/operations/orders", "/fleet", "/drivers"],
    denied: ["/orders/create", "/merchants", "/ledger", "/admin/users"],
  },
  {
    role: "DRIVER_PARTNER",
    allowed: ["/dashboard", "/orders/track"],
    denied: ["/orders/create", "/fleet", "/merchants", "/admin/users"],
  },
  {
    role: "REGIONAL_MANAGER",
    allowed: [
      "/operations/orders",
      "/fleet",
      "/drivers",
      "/merchants",
      "/ledger",
    ],
    denied: ["/orders/create", "/admin/users"],
  },
  {
    role: "HEAD_OF_WAREHOUSE",
    allowed: ["/operations/orders", "/fleet", "/ledger"],
    denied: ["/orders/create", "/drivers", "/merchants", "/admin/users"],
  },
  {
    role: "SUPERADMIN",
    allowed: [
      "/dashboard",
      "/orders/create",
      "/operations/orders",
      "/fleet",
      "/drivers",
      "/merchants",
      "/ledger",
      "/admin/users",
    ],
    denied: [],
  },
];

describe("access control", () => {
  it.each(ROUTE_MATRIX)(
    "$role route permissions match business rules",
    ({ role, allowed, denied }) => {
      const permissions = getPermissionsForRole(role);

      for (const path of allowed) {
        expect(canAccessPath(path, permissions)).toBe(true);
      }
      for (const path of denied) {
        expect(canAccessPath(path, permissions)).toBe(false);
      }
    },
  );

  it("default landing path follows role capabilities", () => {
    expect(getDefaultPathForRole("MERCHANT_ADMIN")).toBe("/dashboard");
    expect(getDefaultPathForRole("FLEET_OPERATOR")).toBe("/operations/orders");
    expect(getDefaultPathForRole("DRIVER_PARTNER")).toBe("/orders/track");
  });

  it("superadmin nav exposes admin modules", () => {
    const nav = getNavItemsForPermissions(getPermissionsForRole("SUPERADMIN"));
    const hrefs = nav.map((item) => item.href);

    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/admin/users",
        "/ledger",
        "/merchants",
        "/orders/create",
      ]),
    );
  });

  it("merchant nav hides operations admin items", () => {
    const nav = getNavItemsForPermissions(
      getPermissionsForRole("MERCHANT_ADMIN"),
    );
    const hrefs = nav.map((item) => item.href);

    expect(hrefs).not.toContain("/fleet");
    expect(hrefs).not.toContain("/admin/users");
    expect(hrefs).toContain("/orders/create");
  });

  it("all roles have labels for login UI", () => {
    for (const role of USER_ROLES) {
      expect(ROLE_LABELS[role].length).toBeGreaterThan(0);
    }
  });
});
