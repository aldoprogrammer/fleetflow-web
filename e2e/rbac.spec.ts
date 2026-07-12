import { test, expect } from "./fixtures/auth-mock";

test.describe("RBAC enforcement", () => {
  test("merchant cannot open fleet module", async ({ authenticatedPage: page }) => {
    await page.goto("/fleet");
    await expect(page).toHaveURL(/\/forbidden/);
    await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  });

  test("merchant sidebar hides admin modules", async ({ authenticatedPage: page }) => {
    await page.goto("/dashboard");
    const sidebar = page.locator("aside");
    await expect(sidebar.getByRole("link", { name: "Create order", exact: true })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Users" })).toHaveCount(0);
    await expect(sidebar.getByRole("link", { name: "Fleet control" })).toHaveCount(0);
  });
});
