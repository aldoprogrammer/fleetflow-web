"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Form, Formik, type FormikHelpers } from "formik";
import { Building2, Truck, Weight } from "lucide-react";
import { useEffect, useId, useMemo, useState, type ReactElement } from "react";
import { AddressLocationField } from "@/components/orders/AddressLocationField";
import { ParcelContentsField } from "@/components/orders/ParcelContentsField";
import { OrderPriceEstimateCard } from "@/components/orders/OrderPriceEstimateCard";
import {
  buildCreateOrderPayload,
  buildCreateOrderValidationSchema,
  collectCreateOrderValidationMessages,
  normalizeWeightInput,
  touchAllCreateOrderFields,
  type CreateOrderFormValues,
} from "@/components/orders/create-order-form.utils";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { listMerchants, type MerchantSummary } from "@/lib/api/merchants";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { JAKARTA_COORDINATES } from "@/lib/env";
import {
  createOrder,
  extractApiErrorMessage,
} from "@/lib/api/orders";
import { useAuthStore } from "@/stores/auth-store";

const baseInitialValues: CreateOrderFormValues = {
  merchantId: "",
  vehicleTypeRequired: "BIKE",
  parcelContents: ["electronics"],
  packageWeightKg: "",
  pickupAddress: "Jl. Thamrin No. 1, Jakarta Pusat",
  deliveryAddress: "Jl. Sudirman No. 52, Jakarta Selatan",
  pickupLat: JAKARTA_COORDINATES.pickup.latitude,
  pickupLng: JAKARTA_COORDINATES.pickup.longitude,
  deliveryLat: JAKARTA_COORDINATES.delivery.latitude,
  deliveryLng: JAKARTA_COORDINATES.delivery.longitude,
};

function canDelegateMerchant(permissions: readonly string[]): boolean {
  return (
    permissions.includes(PERMISSIONS.MERCHANTS_MANAGE) ||
    permissions.includes(PERMISSIONS.ORDERS_READ_ALL)
  );
}

function FieldError({ message }: { message?: string }): ReactElement | null {
  const [parent] = useAutoAnimate<HTMLDivElement>({ duration: 180 });
  if (!message) return <div ref={parent} className="min-h-[1.25rem]" />;
  return (
    <div ref={parent} className="min-h-[1.25rem]">
      <p role="alert" className="mt-1.5 text-sm font-medium text-rose-600">
        {message}
      </p>
    </div>
  );
}

export function CreateOrderForm(): ReactElement {
  const formId = useId();
  const { push } = useAppNavigation();
  const session = useAuthStore((state) => state.session);
  const [alertParent] = useAutoAnimate<HTMLDivElement>({ duration: 220 });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
  const [isMerchantsLoading, setIsMerchantsLoading] = useState(false);

  const linkedMerchantId = session?.user.merchantId ?? null;
  const permissions = session?.user.permissions ?? [];
  const needsMerchantSelect =
    !linkedMerchantId && canDelegateMerchant(permissions);
  const validationSchema = useMemo(
    () => buildCreateOrderValidationSchema(needsMerchantSelect),
    [needsMerchantSelect],
  );

  useEffect(() => {
    if (!needsMerchantSelect) return;

    setIsMerchantsLoading(true);
    void listMerchants()
      .then((items) => {
        setMerchants(items);
      })
      .catch(() => setMerchants([]))
      .finally(() => setIsMerchantsLoading(false));
  }, [needsMerchantSelect]);

  const handleSubmit = async (
    values: CreateOrderFormValues,
    helpers: FormikHelpers<CreateOrderFormValues>,
  ): Promise<void> => {
    setErrorMessage(null);

    try {
      const order = await createOrder(
        buildCreateOrderPayload(values, needsMerchantSelect),
      );
      push(`/orders/${order.id}`);
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-6 border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900">Create dispatch order</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pick pickup and delivery on the map. Parcel details are optional but help drivers prepare.
        </p>
      </header>

      <div ref={alertParent} className="mb-4">
        {errorMessage ? (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <Formik
        initialValues={{
          ...baseInitialValues,
          merchantId: linkedMerchantId ?? merchants[0]?.id ?? "",
        }}
        enableReinitialize
        validationSchema={validationSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          submitCount,
          handleChange,
          handleBlur,
          setFieldValue,
          setFieldTouched,
          setTouched,
          submitForm,
        }) => {
          const validationMessages =
            submitCount > 0 ? collectCreateOrderValidationMessages(errors) : [];

          return (
            <Form className="space-y-5 pb-2" noValidate>
              {needsMerchantSelect ? (
                <div>
                  <label htmlFor={`${formId}-merchant`} className="text-sm font-semibold text-slate-800">
                    Merchant account
                  </label>
                  <div className="relative mt-1.5">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id={`${formId}-merchant`}
                      name="merchantId"
                      value={values.merchantId}
                      onChange={(event) => {
                        handleChange(event);
                        setErrorMessage(null);
                      }}
                      onBlur={handleBlur}
                      disabled={isMerchantsLoading}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:opacity-60"
                    >
                      <option value="">
                        {isMerchantsLoading ? "Loading merchants..." : "Select merchant"}
                      </option>
                      {merchants.map((merchant) => (
                        <option key={merchant.id} value={merchant.id}>
                          {merchant.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FieldError
                    message={
                      touched.merchantId || submitCount > 0 ? errors.merchantId : undefined
                    }
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor={`${formId}-vehicle`} className="text-sm font-semibold text-slate-800">
                  Vehicle type required
                </label>
                <div className="relative mt-1.5">
                  <Truck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    id={`${formId}-vehicle`}
                    name="vehicleTypeRequired"
                    value={values.vehicleTypeRequired}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    <option value="" disabled>
                      Select vehicle type
                    </option>
                    {["BIKE", "CAR", "TRUCK"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <FieldError
                  message={
                    touched.vehicleTypeRequired || submitCount > 0
                      ? errors.vehicleTypeRequired
                      : undefined
                  }
                />
              </div>

              <ParcelContentsField
                formId={formId}
                selectedIds={values.parcelContents}
                onChange={(next) => void setFieldValue("parcelContents", next)}
                onBlur={() => void setFieldTouched("parcelContents", true)}
              />

              <div>
                <label htmlFor={`${formId}-weight`} className="text-sm font-semibold text-slate-800">
                  Parcel weight (kg) <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <div className="relative mt-1.5">
                  <Weight className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id={`${formId}-weight`}
                    name="packageWeightKg"
                    type="text"
                    inputMode="decimal"
                    value={normalizeWeightInput(values.packageWeightKg)}
                    onChange={(event) => {
                      void setFieldValue("packageWeightKg", event.target.value);
                      setErrorMessage(null);
                    }}
                    onBlur={handleBlur}
                    placeholder="e.g. 4.5"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  />
                </div>
                <FieldError
                  message={
                    touched.packageWeightKg || submitCount > 0
                      ? errors.packageWeightKg
                      : undefined
                  }
                />
              </div>

              <AddressLocationField
                label="Pickup address"
                addressId={`${formId}-pickupAddress`}
                addressName="pickupAddress"
                addressValue={values.pickupAddress}
                lat={values.pickupLat}
                lng={values.pickupLng}
                error={errors.pickupAddress}
                touched={Boolean(touched.pickupAddress) || submitCount > 0}
                onAddressChange={handleChange}
                onAddressBlur={handleBlur}
                defaultCenter={{
                  lat: JAKARTA_COORDINATES.pickup.latitude,
                  lng: JAKARTA_COORDINATES.pickup.longitude,
                }}
                onLocationSelect={(address, position) => {
                  void setFieldValue("pickupAddress", address);
                  void setFieldValue("pickupLat", position.lat);
                  void setFieldValue("pickupLng", position.lng);
                }}
              />

              <AddressLocationField
                label="Delivery address"
                addressId={`${formId}-deliveryAddress`}
                addressName="deliveryAddress"
                addressValue={values.deliveryAddress}
                lat={values.deliveryLat}
                lng={values.deliveryLng}
                error={errors.deliveryAddress}
                touched={Boolean(touched.deliveryAddress) || submitCount > 0}
                onAddressChange={handleChange}
                onAddressBlur={handleBlur}
                defaultCenter={{
                  lat: JAKARTA_COORDINATES.delivery.latitude,
                  lng: JAKARTA_COORDINATES.delivery.longitude,
                }}
                onLocationSelect={(address, position) => {
                  void setFieldValue("deliveryAddress", address);
                  void setFieldValue("deliveryLat", position.lat);
                  void setFieldValue("deliveryLng", position.lng);
                }}
              />

              <OrderPriceEstimateCard
                vehicleTypeRequired={values.vehicleTypeRequired}
                pickupLat={values.pickupLat}
                pickupLng={values.pickupLng}
                deliveryLat={values.deliveryLat}
                deliveryLng={values.deliveryLng}
              />

              {validationMessages.length > 0 ? (
                <div
                  role="alert"
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                >
                  <p className="font-semibold">Please complete the required fields:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {validationMessages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <SubmitButton
                type="button"
                loading={isSubmitting}
                loadingLabel="Creating order..."
                onClick={() => {
                  void setTouched(touchAllCreateOrderFields());
                  void submitForm();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create order
              </SubmitButton>
            </Form>
          );
        }}
      </Formik>
    </section>
  );
}
