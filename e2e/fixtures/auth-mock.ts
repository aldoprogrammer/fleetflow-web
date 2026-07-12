import { test as base, expect, type Page, type Route } from "@playwright/test";

const mockSession = {
  accessToken: "e2e-test-token",
  expiresIn: 3600,
  tokenType: "Bearer" as const,
  user: {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    email: "merchant.admin@acme-commerce.id",
    role: "MERCHANT_ADMIN",
    displayName: "Acme Merchant Admin",
    merchantId: "merchant-1",
    permissions: ["orders:create", "orders:read:own"],
  },
};

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.route("**/v1/auth/login", async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSession),
      });
    });

    await page.goto("/login");
    await page.getByRole("button", { name: "Demo access" }).click();

    const loginResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/v1/auth/login") &&
        response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "Merchant Admin" }).click();
    await loginResponse;
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    await use(page);
  },
});

export { expect };
