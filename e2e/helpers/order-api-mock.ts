import type { Page, Route } from "@playwright/test";

export const mockOrderId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

const mockMerchant = {
  id: "merchant-1",
  companyName: "Acme Commerce Jakarta",
  email: "merchant.admin@acme-commerce.id",
};

const mockParties = {
  merchantContact: {
    displayName: "Acme Merchant Admin",
    email: "merchant.admin@acme-commerce.id",
    role: "MERCHANT_ADMIN",
  },
  createdBy: {
    displayName: "Acme Merchant Admin",
    email: "merchant.admin@acme-commerce.id",
    role: "MERCHANT_ADMIN",
  },
};

const createdOrderBody = {
  id: mockOrderId,
  referenceCode: "#C66AFA",
  displayTitle: "Dispatch to Jl. Sudirman No. 52",
  merchantId: mockMerchant.id,
  merchant: mockMerchant,
  ...mockParties,
  vehicleTypeRequired: "CAR",
  packageDescription: null,
  packageWeightKg: null,
  pickupAddress: "Jl. Thamrin No. 1, Jakarta Pusat",
  deliveryAddress: "Jl. Sudirman No. 52, Jakarta Selatan",
  pickupLat: -6.2,
  pickupLng: 106.816666,
  deliveryLat: -6.17511,
  deliveryLng: 106.865036,
  distanceKm: 6.214,
  status: "PENDING",
  paymentStatus: "UNPAID",
  price: 48250,  timeline: [
    {
      id: "timeline-1",
      status: "DRAFT",
      note: "Order draft created and priced.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "timeline-2",
      status: "PENDING",
      note: "Order queued for driver matching.",
      createdAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
};

const trackedOrderBody = {
  ...createdOrderBody,
  status: "ASSIGNED",
  paymentStatus: "PAID",
  matchDistanceKm: 2.14,
  assignedDriver: {
    id: "driver-1",
    fullName: "Alex Rivera",
    phone: "+628123450001",
    vehicleType: "BIKE",
  },
  timeline: [
    ...createdOrderBody.timeline,
    {
      id: "timeline-3",
      status: "ASSIGNED",
      note: "Driver Alex Rivera assigned.",
      createdAt: new Date().toISOString(),
    },
  ],
};

let mockTripStatus: "ASSIGNED" | "PICKED_UP" | "DELIVERED" = "ASSIGNED";

function buildTrackedOrderBody() {
  if (mockTripStatus === "ASSIGNED") {
    return { ...trackedOrderBody, paymentStatus: "PAID" };
  }

  const base = {
    ...trackedOrderBody,
    status: mockTripStatus,
    paymentStatus: "PAID" as const,
    timeline: [...trackedOrderBody.timeline],
  };

  if (mockTripStatus === "PICKED_UP") {
    base.timeline.push({
      id: "timeline-4",
      status: "PICKED_UP",
      note: "Parcel picked up — trip in progress.",
      createdAt: new Date().toISOString(),
    });
  }

  if (mockTripStatus === "DELIVERED") {
    base.timeline.push(
      {
        id: "timeline-4",
        status: "PICKED_UP",
        note: "Parcel picked up — trip in progress.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "timeline-5",
        status: "DELIVERED",
        note: "Delivery completed successfully.",
        createdAt: new Date().toISOString(),
      },
    );
  }

  return base;
}

export async function mockOrdersApi(page: Page): Promise<void> {
  mockTripStatus = "ASSIGNED";

  await page.route(/\/v1\/(orders|merchants)(?:\/|$)/, async (route: Route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === "GET" && /\/v1\/merchants\/?$/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "merchant-1",
            companyName: "Acme Commerce Jakarta",
            email: "merchant.admin@acme-commerce.id",
          },
        ]),
      });
      return;
    }

    if (method === "POST" && /\/v1\/orders\/estimate\/?$/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          price: 48250,
          distanceKm: 6.214,
          currency: "IDR",
        }),
      });
      return;
    }

    if (method === "POST" && /\/v1\/orders\/?$/.test(url)) {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(createdOrderBody),
      });
      return;
    }

    if (method === "GET" && url.includes(mockOrderId)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildTrackedOrderBody()),
      });
      return;
    }

    if (method === "POST" && url.includes(`${mockOrderId}/pickup`)) {
      mockTripStatus = "PICKED_UP";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildTrackedOrderBody()),
      });
      return;
    }

    if (method === "POST" && url.includes(`${mockOrderId}/deliver`)) {
      mockTripStatus = "DELIVERED";
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(buildTrackedOrderBody()),
      });
      return;
    }

    await route.continue();
  });
}
