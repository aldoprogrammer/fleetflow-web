import { test, expect, type Page } from "@playwright/test";
import { ROLE_LABELS, type UserRole } from "../../src/lib/auth/types";

const LIVE_ROLE_MATRIX: Array<{
  role: UserRole;
  allowed: string[];
  forbidden: string[];
}> = [
  {
    role: "MERCHANT_ADMIN",
    allowed: ["/orders/create"],
    forbidden: ["/fleet", "/admin/users"],
  },
  {
    role: "FLEET_OPERATOR",
    allowed: ["/fleet", "/drivers"],
    forbidden: ["/orders/create", "/merchants"],
  },
  {
    role: "DRIVER_PARTNER",
    allowed: ["/orders/track"],
    forbidden: ["/orders/create", "/fleet"],
  },
  {
    role: "REGIONAL_MANAGER",
    allowed: ["/merchants", "/ledger"],
    forbidden: ["/orders/create", "/admin/users"],
  },
  {
    role: "HEAD_OF_WAREHOUSE",
    allowed: ["/fleet", "/ledger"],
    forbidden: ["/drivers", "/orders/create"],
  },
  {
    role: "SUPERADMIN",
    allowed: ["/admin/users", "/merchants", "/orders/create"],
    forbidden: [],
  },
];

async function loginAsRole(page: Page, role: UserRole): Promise<void> {
  await page.goto("/login");
  await page.getByRole("button", { name: "Demo access" }).click();

  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/v1/auth/login") &&
      response.request().method() === "POST",
    { timeout: 15_000 },
  );

  await page.getByRole("button", { name: ROLE_LABELS[role] }).click();
  const response = await loginResponse;
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/dashboard|\/operations\/orders|\/orders\/track/, {
    timeout: 30_000,
  });
}

/** Live API — validates portal RBAC against real auth cookies. */
test.describe("Portal RBAC (live API)", () => {
  for (const entry of LIVE_ROLE_MATRIX) {
    test(`${entry.role} route access`, async ({ page }) => {
      await loginAsRole(page, entry.role);

      for (const path of entry.allowed) {
        await page.goto(path);
        await expect(page).not.toHaveURL(/\/forbidden/, { timeout: 10_000 });
      }

      for (const path of entry.forbidden) {
        await page.goto(path);
        await expect(page).toHaveURL(/\/forbidden/, { timeout: 10_000 });
      }
    });
  }
});
