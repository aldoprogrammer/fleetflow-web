import { test, expect } from "./fixtures/auth-mock";
import { mockOrderId, mockOrdersApi } from "./helpers/order-api-mock";

/** UI-only: mocked API — does NOT validate driver matching business logic. */
test.describe("Order create UI (mocked API)", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await mockOrdersApi(page);
  });

  test("create order page renders behind auth", async ({ authenticatedPage: page }) => {
    await page.goto("/orders/create");

    await expect(
      page.getByRole("heading", { name: "Create dispatch order" }),
    ).toBeVisible();
    await expect(page.getByLabel("Vehicle type required")).toBeVisible();
  });

  test("submits order and opens tracker", async ({ authenticatedPage: page }) => {
    await page.goto("/orders/create");

    await page.getByLabel("Vehicle type required").selectOption("CAR");
    await page.getByLabel("Pickup address").fill("Jl. Thamrin No. 1, Jakarta Pusat");
    await page
      .getByLabel("Delivery address")
      .fill("Jl. Sudirman No. 52, Jakarta Selatan");

    const createResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/v1\/orders\/?$/.test(response.url()),
      { timeout: 10_000 },
    );

    await page.getByRole("button", { name: "Create order" }).click();
    const response = await createResponse;
    expect(response.status()).toBe(201);

    await expect(page).toHaveURL(new RegExp(`/orders/${mockOrderId}$`), {
      timeout: 15_000,
    });

    const tracker = page.locator("main");
    await expect(tracker.getByText("Live Order Tracker")).toBeVisible({
      timeout: 15_000,
    });
    await expect(tracker.getByText(`Order ${mockOrderId}`)).toBeVisible();
    await expect(tracker.getByText("Driver: Alex Rivera (BIKE)")).toBeVisible();
  });

  test("shows validation summary when required addresses are cleared", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/orders/create");

    await page.getByLabel("Pickup address").fill("");
    await page.getByLabel("Delivery address").fill("");
    await page.getByRole("button", { name: "Create order" }).click();

    await expect(
      page.getByText("Please complete the required fields:"),
    ).toBeVisible();
    await expect(page.getByText(/Pickup address: Pickup address is required\./)).toBeVisible();
    await expect(page.getByText(/Delivery address: Delivery address is required\./)).toBeVisible();
  });

  test("submits with prefilled defaults and optional parcel weight", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/orders/create");

    await page.getByLabel(/Parcel weight/).fill("6.2");

    const createResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /\/v1\/orders\/?$/.test(response.url()),
      { timeout: 10_000 },
    );

    await page.getByRole("button", { name: "Create order" }).click();
    const response = await createResponse;
    expect(response.status()).toBe(201);

    const requestBody = response.request().postDataJSON() as {
      packageWeightKg?: number;
      vehicleTypeRequired: string;
    };
    expect(requestBody.packageWeightKg).toBe(6.2);
    expect(requestBody.vehicleTypeRequired).toBe("BIKE");
  });
});
