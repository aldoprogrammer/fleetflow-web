import { test, expect } from "@playwright/test";

test.describe("Operations portal", () => {
  test("redirects home to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("login page shows demo role picker", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Demo access" }).click();

    await expect(page.getByText("One-click access for stakeholder demos")).toBeVisible();
    await expect(page.getByRole("button", { name: "Merchant Admin" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Super Admin" })).toBeVisible();
  });
});
