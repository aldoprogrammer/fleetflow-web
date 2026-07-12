import {
  canManageOrderOperations,
  resolveActiveOperation,
  resolvePaymentDescription,
} from "@/lib/orders/operations";

describe("order operations", () => {
  const assignedOrder = {
    id: "order-1",
    status: "ASSIGNED" as const,
    assignedDriver: { id: "driver-1", fullName: "Alex", phone: "+62", vehicleType: "BIKE" as const },
    price: 50000,
    paymentStatus: "PAID" as const,
  };

  it("allows ops roles to manage fulfillment actions", () => {
    expect(
      canManageOrderOperations(["orders:read:all"], assignedOrder as never, null),
    ).toBe(true);
  });

  it("exposes only pickup action when assigned", () => {
    expect(resolveActiveOperation("ASSIGNED")?.action).toBe("confirm_pickup");
    expect(resolveActiveOperation("PICKED_UP")?.action).toBe("mark_delivered");
    expect(resolveActiveOperation("DELIVERED")).toBeNull();
  });

  it("keeps settlement copy for billing card", () => {
    expect(resolvePaymentDescription("PAID", 50000)).toContain("debited");
  });
});
