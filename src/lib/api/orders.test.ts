import { AxiosError } from "axios";
import { extractApiErrorMessage } from "./orders";

describe("extractApiErrorMessage", () => {
  it("returns API message from axios error payload", () => {
    const error = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: {} } as never,
        data: {
          success: false,
          statusCode: 400,
          message: "Insufficient merchant balance.",
          timestamp: new Date().toISOString(),
        },
      },
    );

    expect(extractApiErrorMessage(error)).toBe(
      "Insufficient merchant balance.",
    );
  });

  it("joins array validation messages", () => {
    const error = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: { headers: {} } as never,
        data: {
          message: ["pickupAddress is required", "vehicleTypeRequired is required"],
        },
      },
    );

    expect(extractApiErrorMessage(error)).toBe(
      "pickupAddress is required, vehicleTypeRequired is required",
    );
  });

  it("falls back for unknown errors", () => {
    expect(extractApiErrorMessage(new Error("network down"))).toBe("network down");
    expect(extractApiErrorMessage(null)).toBe(
      "Unable to process the order request.",
    );
  });
});
