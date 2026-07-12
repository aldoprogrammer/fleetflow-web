import { test, expect } from "./fixtures/auth-live";

/** Live API — validates real order matching (requires infra + seed + API worker). */
test.describe("Order matching (live API)", () => {
  test("BIKE order at Jakarta seed coords reaches ASSIGNED", async ({
    liveMerchantPage: page,
  }) => {
    await page.goto("/orders/create");

    await page.getByLabel("Vehicle type required").selectOption("BIKE");
    await page
      .getByLabel("Pickup address")
      .fill("Jl. Thamrin No. 1, Jakarta Pusat");
    await page
      .getByLabel("Delivery address")
      .fill("Jl. Sudirman No. 52, Jakarta Selatan");

    const createResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/v1\/orders\/?$/.test(response.url()),
      { timeout: 15_000 },
    );

    await page.getByRole("button", { name: "Create order" }).click();
    const response = await createResponse;
    expect(response.status()).toBe(201);

    const created = (await response.json()) as { id: string };
    await expect(page).toHaveURL(new RegExp(`/orders/${created.id}$`), {
      timeout: 15_000,
    });

    const tracker = page.locator("main");
    await expect(tracker.getByText("Live Order Tracker")).toBeVisible({
      timeout: 15_000,
    });

    await expect(tracker.getByText(/Driver: (Alex Rivera|Citra Dewi) \(BIKE\)/)).toBeVisible({
      timeout: 20_000,
    });

    const cancelled = tracker.getByText(
      "Order cancelled. No driver was assigned within the matching window.",
    );
    await expect(cancelled).toHaveCount(0);
  });
});
