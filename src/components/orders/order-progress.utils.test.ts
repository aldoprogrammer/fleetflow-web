import {
  MATCHING_MIN_DISPLAY_MS,
  resolveCurrentStepIndex,
  resolveDisplayStatus,
} from "./order-progress.utils";

describe("order-progress.utils", () => {
  const createdAt = "2026-07-12T10:00:00.000Z";
  const createdMs = new Date(createdAt).getTime();

  it("holds ASSIGNED orders in MATCHING for the first 5 seconds", () => {
    expect(
      resolveDisplayStatus(
        "ASSIGNED",
        createdAt,
        createdMs + MATCHING_MIN_DISPLAY_MS - 1,
      ),
    ).toBe("MATCHING");

    expect(
      resolveDisplayStatus("ASSIGNED", createdAt, createdMs + MATCHING_MIN_DISPLAY_MS),
    ).toBe("ASSIGNED");
  });

  it("maps ASSIGNED to driver dispatched step", () => {
    expect(resolveCurrentStepIndex("ASSIGNED")).toBe(2);
    expect(resolveCurrentStepIndex("PICKED_UP")).toBe(3);
  });
});
