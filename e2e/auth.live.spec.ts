import { test, expect } from "@playwright/test";
import { DEMO_PASSWORD } from "../../src/lib/auth/demo-accounts";

/** Live API — validates login errors and session against real backend. */
test.describe("Auth (live API)", () => {
  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Work email").fill("merchant.admin@acme-commerce.id");
    await page.getByLabel("Password").fill("wrong-password-123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("merchant demo login reaches dashboard with create order nav", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Demo access" }).click();

    const loginResponse = page.waitForResponse((response) =>
      response.url().includes("/v1/auth/login"),
    );

    await page.getByRole("button", { name: "Merchant Admin" }).click();
    const response = await loginResponse;
    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      user: { permissions: string[] };
    };
    expect(body.user.permissions).toContain("orders:create");

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
    await expect(
      page.locator("aside").getByRole("link", { name: "Create order", exact: true }),
    ).toBeVisible();
  });

  test("credentials tab signs in with seed password", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Work email").fill("fleet.operator@fleetflow.dev");
    await page.getByLabel("Password").fill(DEMO_PASSWORD);
    await page.getByLabel("Role").selectOption("FLEET_OPERATOR");

    const loginResponse = page.waitForResponse((response) =>
      response.url().includes("/v1/auth/login"),
    );
    await page.getByRole("button", { name: "Sign in" }).click();

    expect((await loginResponse).status()).toBe(200);
    await expect(page).toHaveURL(/\/operations\/orders/, { timeout: 30_000 });
  });
});
