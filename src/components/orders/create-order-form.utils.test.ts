import {
  buildCreateOrderPayload,
  buildCreateOrderValidationSchema,
  collectCreateOrderValidationMessages,
  normalizeWeightInput,
  parseOptionalWeightKg,
  type CreateOrderFormValues,
} from "./create-order-form.utils";

const validValues: CreateOrderFormValues = {
  merchantId: "merchant-1",
  vehicleTypeRequired: "BIKE",
  parcelContents: ["electronics"],
  packageWeightKg: "",
  pickupAddress: "Jl. Thamrin No. 1, Jakarta Pusat",
  deliveryAddress: "Jl. Sudirman No. 52, Jakarta Selatan",
  pickupLat: -6.2,
  pickupLng: 106.816666,
  deliveryLat: -6.17511,
  deliveryLng: 106.865036,
};

describe("create-order-form.utils", () => {
  describe("normalizeWeightInput", () => {
    it("handles strings, numbers, and empty values", () => {
      expect(normalizeWeightInput(" 4.5 ")).toBe("4.5");
      expect(normalizeWeightInput(12)).toBe("12");
      expect(normalizeWeightInput(null)).toBe("");
      expect(normalizeWeightInput(undefined)).toBe("");
    });
  });

  describe("parseOptionalWeightKg", () => {
    it("parses valid weights from string or number", () => {
      expect(parseOptionalWeightKg("4.5")).toBe(4.5);
      expect(parseOptionalWeightKg(8)).toBe(8);
      expect(parseOptionalWeightKg("")).toBeUndefined();
      expect(parseOptionalWeightKg(0)).toBeUndefined();
      expect(parseOptionalWeightKg("abc")).toBeUndefined();
    });
  });

  describe("buildCreateOrderPayload", () => {
    it("does not throw when packageWeightKg is a number", () => {
      const payload = buildCreateOrderPayload(
        { ...validValues, packageWeightKg: 6.2 },
        false,
      );

      expect(payload.packageWeightKg).toBe(6.2);
      expect(payload.vehicleTypeRequired).toBe("BIKE");
    });

    it("omits weight when blank", () => {
      const payload = buildCreateOrderPayload(validValues, false);
      expect(payload.packageWeightKg).toBeUndefined();
    });

    it("includes merchantId when delegate mode is enabled", () => {
      const payload = buildCreateOrderPayload(validValues, true);
      expect(payload.merchantId).toBe("merchant-1");
    });
  });

  describe("buildCreateOrderValidationSchema", () => {
    it("accepts valid defaults", async () => {
      const schema = buildCreateOrderValidationSchema(false);
      await expect(schema.validate(validValues)).resolves.toBeDefined();
    });

    it("rejects missing pickup address with a friendly message", async () => {
      const schema = buildCreateOrderValidationSchema(false);

      await expect(
        schema.validate({ ...validValues, pickupAddress: "" }),
      ).rejects.toMatchObject({
        message: "Pickup address must be at least 8 characters.",
      });
    });

    it("rejects invalid weight", async () => {
      const schema = buildCreateOrderValidationSchema(false);

      await expect(
        schema.validate({ ...validValues, packageWeightKg: "-1" }),
      ).rejects.toMatchObject({
        message: "Enter a positive weight in kg (max 5000), or leave blank.",
      });
    });

    it("requires merchant when delegate mode is enabled", async () => {
      const schema = buildCreateOrderValidationSchema(true);

      await expect(
        schema.validate({ ...validValues, merchantId: "" }),
      ).rejects.toMatchObject({
        message: "Select a merchant account.",
      });
    });
  });

  describe("collectCreateOrderValidationMessages", () => {
    it("maps field errors to user-facing labels", () => {
      const messages = collectCreateOrderValidationMessages({
        pickupAddress: "Pickup address is required.",
        packageWeightKg: "Enter a positive weight in kg (max 5000), or leave blank.",
      });

      expect(messages).toEqual([
        "Pickup address: Pickup address is required.",
        "Parcel weight: Enter a positive weight in kg (max 5000), or leave blank.",
      ]);
    });
  });
});
