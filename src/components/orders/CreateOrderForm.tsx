"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Form, Formik, type FormikHelpers } from "formik";
import { Loader2, MapPin, Package, Scale } from "lucide-react";
import { useId, useState, type ReactElement } from "react";
import * as Yup from "yup";
import {
  PACKAGE_TYPES,
  createOrder,
  extractApiErrorMessage,
  type ApiPackageType,
  type CreateOrderPayload,
} from "@/lib/api/orders";

export const MOCK_MERCHANT_ID = "550e8400-e29b-41d4-a716-446655440001";

interface CreateOrderFormValues {
  merchantId: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageWeight: number | "";
  packageType: ApiPackageType | "";
}

const initialValues: CreateOrderFormValues = {
  merchantId: MOCK_MERCHANT_ID,
  pickupAddress: "",
  deliveryAddress: "",
  packageWeight: "",
  packageType: "",
};

const createOrderSchema = Yup.object({
  merchantId: Yup.string()
    .uuid("Merchant ID must be a valid UUID.")
    .required("Merchant ID is required."),
  pickupAddress: Yup.string()
    .trim()
    .min(8, "Pickup address must be at least 8 characters.")
    .max(240, "Pickup address must be 240 characters or fewer.")
    .required("Pickup address is required."),
  deliveryAddress: Yup.string()
    .trim()
    .min(8, "Delivery address must be at least 8 characters.")
    .max(240, "Delivery address must be 240 characters or fewer.")
    .required("Delivery address is required.")
    .test(
      "addresses-differ",
      "Delivery address must differ from pickup address.",
      function addressesDiffer(value: string | undefined): boolean {
        const pickup = String(this.parent.pickupAddress ?? "");
        if (!value || !pickup) return true;
        return value.trim().toLowerCase() !== pickup.trim().toLowerCase();
      },
    ),
  packageWeight: Yup.mixed<number | "">()
    .required("Package weight is required.")
    .test(
      "is-number",
      "Package weight must be a number.",
      (value) =>
        value !== "" && typeof value === "number" && !Number.isNaN(value),
    )
    .test(
      "min-weight",
      "Package weight must be at least 0.1 kg.",
      (value) => typeof value !== "number" || value >= 0.1,
    )
    .test(
      "max-weight",
      "Package weight cannot exceed 1,000 kg.",
      (value) => typeof value !== "number" || value <= 1000,
    ),
  packageType: Yup.mixed<ApiPackageType | "">()
    .required("Package type is required.")
    .test(
      "valid-type",
      "Select a valid package type.",
      (value): value is ApiPackageType =>
        value !== "" && (PACKAGE_TYPES as readonly string[]).includes(value),
    ),
});

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}): ReactElement {
  const [parent] = useAutoAnimate<HTMLDivElement>({ duration: 200 });

  return (
    <div ref={parent} className="min-h-[1.25rem]" aria-live="polite">
      {message ? (
        <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-rose-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function CreateOrderForm(): ReactElement {
  const formId = useId();
  const [alertParent] = useAutoAnimate<HTMLDivElement>({ duration: 220 });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (
    values: CreateOrderFormValues,
    helpers: FormikHelpers<CreateOrderFormValues>,
  ): Promise<void> => {
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: CreateOrderPayload = {
      merchantId: values.merchantId,
      pickupAddress: values.pickupAddress.trim(),
      deliveryAddress: values.deliveryAddress.trim(),
      packageWeight: Number(values.packageWeight),
      packageType: values.packageType as ApiPackageType,
    };

    try {
      const order = await createOrder(payload);
      setSuccessMessage("Order Created Successfully!");
      helpers.resetForm({ values: initialValues });
      helpers.setStatus({ orderId: order.id });
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <header className="mb-8 space-y-2 border-b border-slate-100 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          FleetFlow Dispatch
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Create order
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Submit a new delivery dispatch to the FleetFlow API. The order will be
          queued for driver matching automatically.
        </p>
      </header>

      <div ref={alertParent} className="mb-6 space-y-3">
        {successMessage ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          >
            {successMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {errorMessage}
          </div>
        ) : null}
      </div>

      <Formik<CreateOrderFormValues>
        initialValues={initialValues}
        validationSchema={createOrderSchema}
        validateOnBlur
        validateOnChange={false}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => (
          <Form noValidate className="space-y-5" aria-busy={isSubmitting}>
            <input type="hidden" name="merchantId" value={values.merchantId} />

            <div className="space-y-1.5">
              <label
                htmlFor={`${formId}-pickup`}
                className="text-sm font-semibold text-slate-800"
              >
                Pickup address
              </label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id={`${formId}-pickup`}
                  name="pickupAddress"
                  type="text"
                  value={values.pickupAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Jl. Thamrin No. 1, Jakarta"
                  autoComplete="street-address"
                  aria-invalid={Boolean(touched.pickupAddress && errors.pickupAddress)}
                  aria-describedby={
                    touched.pickupAddress && errors.pickupAddress
                      ? `${formId}-pickup-error`
                      : undefined
                  }
                  className={[
                    "w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-offset-1",
                    touched.pickupAddress && errors.pickupAddress
                      ? "border-rose-400 focus-visible:ring-rose-400"
                      : "border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/40",
                  ].join(" ")}
                />
              </div>
              <FieldError
                id={`${formId}-pickup-error`}
                message={
                  touched.pickupAddress ? errors.pickupAddress : undefined
                }
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor={`${formId}-delivery`}
                className="text-sm font-semibold text-slate-800"
              >
                Delivery address
              </label>
              <div className="relative">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id={`${formId}-delivery`}
                  name="deliveryAddress"
                  type="text"
                  value={values.deliveryAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Jl. Sudirman No. 52, Jakarta"
                  autoComplete="street-address"
                  aria-invalid={Boolean(
                    touched.deliveryAddress && errors.deliveryAddress,
                  )}
                  aria-describedby={
                    touched.deliveryAddress && errors.deliveryAddress
                      ? `${formId}-delivery-error`
                      : undefined
                  }
                  className={[
                    "w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-offset-1",
                    touched.deliveryAddress && errors.deliveryAddress
                      ? "border-rose-400 focus-visible:ring-rose-400"
                      : "border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/40",
                  ].join(" ")}
                />
              </div>
              <FieldError
                id={`${formId}-delivery-error`}
                message={
                  touched.deliveryAddress ? errors.deliveryAddress : undefined
                }
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-weight`}
                  className="text-sm font-semibold text-slate-800"
                >
                  Package weight (kg)
                </label>
                <div className="relative">
                  <Scale
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <input
                    id={`${formId}-weight`}
                    name="packageWeight"
                    type="number"
                    inputMode="decimal"
                    min={0.1}
                    max={1000}
                    step={0.1}
                    value={values.packageWeight}
                    onChange={(event) => {
                      const next = event.target.value;
                      void setFieldValue(
                        "packageWeight",
                        next === "" ? "" : Number(next),
                      );
                    }}
                    onBlur={handleBlur}
                    placeholder="2.5"
                    aria-invalid={Boolean(
                      touched.packageWeight && errors.packageWeight,
                    )}
                    aria-describedby={
                      touched.packageWeight && errors.packageWeight
                        ? `${formId}-weight-error`
                        : undefined
                    }
                    className={[
                      "w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-offset-1",
                      touched.packageWeight && errors.packageWeight
                        ? "border-rose-400 focus-visible:ring-rose-400"
                        : "border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/40",
                    ].join(" ")}
                  />
                </div>
                <FieldError
                  id={`${formId}-weight-error`}
                  message={
                    touched.packageWeight ? errors.packageWeight : undefined
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={`${formId}-type`}
                  className="text-sm font-semibold text-slate-800"
                >
                  Package type
                </label>
                <div className="relative">
                  <Package
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <select
                    id={`${formId}-type`}
                    name="packageType"
                    value={values.packageType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={Boolean(
                      touched.packageType && errors.packageType,
                    )}
                    aria-describedby={
                      touched.packageType && errors.packageType
                        ? `${formId}-type-error`
                        : undefined
                    }
                    className={[
                      "w-full appearance-none rounded-xl border bg-white py-3 pl-10 pr-8 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-offset-1",
                      touched.packageType && errors.packageType
                        ? "border-rose-400 focus-visible:ring-rose-400"
                        : "border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/40",
                      values.packageType ? "text-slate-900" : "text-slate-400",
                    ].join(" ")}
                  >
                    <option value="" disabled>
                      Select package type
                    </option>
                    {PACKAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <FieldError
                  id={`${formId}-type-error`}
                  message={touched.packageType ? errors.packageType : undefined}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="reset"
                disabled={isSubmitting}
                onClick={() => {
                  setSuccessMessage(null);
                  setErrorMessage(null);
                }}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Creating order…
                  </>
                ) : (
                  "Create order"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
}
