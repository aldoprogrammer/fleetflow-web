import { test as base, expect, type Page } from "@playwright/test";

type LiveAuthFixtures = {
  liveMerchantPage: Page;
};

export const test = base.extend<LiveAuthFixtures>({
  liveMerchantPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Demo access" }).click();

    const loginResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/v1/auth/login") &&
        response.request().method() === "POST",
      { timeout: 15_000 },
    );

    await page.getByRole("button", { name: "Merchant Admin" }).click();
    const response = await loginResponse;
    expect(response.status()).toBe(200);
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 30_000 });

    await use(page);
  },
});

export { expect };
