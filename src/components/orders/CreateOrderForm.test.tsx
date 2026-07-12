import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateOrderForm } from "./CreateOrderForm";

jest.mock("@formkit/auto-animate/react", () => ({
  useAutoAnimate: () => [jest.fn()],
}));

const mockPush = jest.fn();
const mockCreateOrder = jest.fn();
const mockListMerchants = jest.fn();

jest.mock("@/hooks/useAppNavigation", () => ({
  useAppNavigation: () => ({
    push: mockPush,
    replace: jest.fn(),
    isNavigating: false,
  }),
}));

jest.mock("@/lib/api/orders", () => ({
  VEHICLE_TYPES: ["BIKE", "CAR", "TRUCK"],
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
  extractApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Request failed",
  estimateOrderPrice: jest.fn().mockResolvedValue({
    price: 48250,
    distanceKm: 6.2,
    currency: "IDR",
  }),
}));

jest.mock("@/lib/api/merchants", () => ({
  listMerchants: () => mockListMerchants(),
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({
      session: {
        accessToken: "test-token",
        user: {
          id: "user-1",
          email: "merchant.admin@acme-commerce.id",
          role: "MERCHANT_ADMIN",
          displayName: "Merchant Admin",
          merchantId: "merchant-1",
          permissions: ["orders:create", "orders:read:own"],
        },
      },
    }),
}));

jest.mock("@/components/orders/AddressLocationField", () => ({
  AddressLocationField: ({
    label,
    addressName,
    addressValue,
    onAddressChange,
    error,
    touched,
  }: {
    label: string;
    addressName: string;
    addressValue: string;
    onAddressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    touched?: boolean;
  }) => (
    <div>
      <label htmlFor={addressName}>{label}</label>
      <input
        id={addressName}
        name={addressName}
        value={addressValue}
        onChange={onAddressChange}
      />
      {touched && error ? <p role="alert">{error}</p> : null}
    </div>
  ),
}));

jest.mock("@/components/orders/OrderPriceEstimateCard", () => ({
  OrderPriceEstimateCard: () => <div data-testid="price-estimate" />,
}));

describe("CreateOrderForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListMerchants.mockResolvedValue([]);
    mockCreateOrder.mockResolvedValue({ id: "order-123" });
  });

  it("submits prefilled defaults without runtime errors", async () => {
    const user = userEvent.setup();
    render(<CreateOrderForm />);

    await user.click(screen.getByRole("button", { name: "Create order" }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    });

    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleTypeRequired: "BIKE",
        pickupAddress: "Jl. Thamrin No. 1, Jakarta Pusat",
        deliveryAddress: "Jl. Sudirman No. 52, Jakarta Selatan",
      }),
    );
    expect(mockPush).toHaveBeenCalledWith("/orders/order-123");
  });

  it("shows friendly validation summary when required fields are cleared", async () => {
    const user = userEvent.setup();
    render(<CreateOrderForm />);

    await user.clear(screen.getByLabelText("Pickup address"));
    await user.clear(screen.getByLabelText("Delivery address"));
    await user.click(screen.getByRole("button", { name: "Create order" }));

    expect(
      await screen.findByText("Please complete the required fields:"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Pickup address: Pickup address is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Delivery address: Delivery address is required\./)).toBeInTheDocument();
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });

  it("submits optional parcel weight and includes it in payload", async () => {
    const user = userEvent.setup();
    render(<CreateOrderForm />);

    await user.type(screen.getByLabelText(/Parcel weight/), "4.5");
    await user.click(screen.getByRole("button", { name: "Create order" }));

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          packageWeightKg: 4.5,
        }),
      );
    });
  });

  it("shows parcel weight validation instead of crashing", async () => {
    const user = userEvent.setup();
    render(<CreateOrderForm />);

    await user.type(screen.getByLabelText(/Parcel weight/), "0");
    await user.click(screen.getByRole("button", { name: "Create order" }));

    expect(
      await screen.findByText(/Parcel weight: Enter a positive weight in kg/),
    ).toBeInTheDocument();
    expect(mockCreateOrder).not.toHaveBeenCalled();
  });
});
