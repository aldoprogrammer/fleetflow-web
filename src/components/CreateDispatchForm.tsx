"use client";

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTypeahead,
} from "@floating-ui/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Form, Formik, type FormikHelpers } from "formik";
import { Check, ChevronDown, Package, Scale, MapPin } from "lucide-react";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import * as Yup from "yup";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export const PACKAGE_TYPES = ["Document", "Parcel", "Bulk"] as const;

export type PackageType = (typeof PACKAGE_TYPES)[number];

export interface CreateDispatchFormValues {
  pickupAddress: string;
  deliveryAddress: string;
  packageWeight: number | "";
  packageType: PackageType | "";
}

export interface CreateDispatchFormProps {
  /** Optional async submit handler for API orchestration. */
  onSubmit?: (values: CreateDispatchFormValues) => Promise<void> | void;
  /** Optional initial values override for edit / prefill flows. */
  initialValues?: Partial<CreateDispatchFormValues>;
  className?: string;
}

interface FormStatus {
  type: "success" | "error";
  message: string;
}

/* -------------------------------------------------------------------------- */
/*                              Validation Schema                             */
/* -------------------------------------------------------------------------- */

const createDispatchSchema = Yup.object({
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
        if (!value || !pickup) {
          return true;
        }
        return value.trim().toLowerCase() !== pickup.trim().toLowerCase();
      },
    ),
  packageWeight: Yup.mixed<number | "">()
    .required("Package weight is required.")
    .test(
      "is-number",
      "Package weight must be a number.",
      (value) => value !== "" && typeof value === "number" && !Number.isNaN(value),
    )
    .test(
      "is-positive",
      "Package weight must be greater than zero.",
      (value) => typeof value !== "number" || value > 0,
    )
    .test(
      "max-weight",
      "Package weight cannot exceed 1,000 kg.",
      (value) => typeof value !== "number" || value <= 1000,
    ),
  packageType: Yup.mixed<PackageType | "">()
    .required("Package type is required.")
    .test(
      "package-type-selected",
      "Package type is required.",
      (value): value is PackageType =>
        value !== "" && (PACKAGE_TYPES as readonly string[]).includes(value),
    ),
}) satisfies Yup.ObjectSchema<CreateDispatchFormValues>;

const DEFAULT_VALUES: CreateDispatchFormValues = {
  pickupAddress: "",
  deliveryAddress: "",
  packageWeight: "",
  packageType: "",
};

/* -------------------------------------------------------------------------- */
/*                         Accessible Field Primitives                        */
/* -------------------------------------------------------------------------- */

interface FieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({ id, message }: FieldErrorProps): ReactElement {
  const [errorParent] = useAutoAnimate<HTMLDivElement>({
    duration: 220,
    easing: "ease-out",
  });

  return (
    <div
      ref={errorParent}
      className="min-h-[1.25rem]"
      aria-live="polite"
      aria-atomic="true"
    >
      {message ? (
        <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-rose-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  touched?: boolean;
  icon: ReactElement;
  onChange: (value: string) => void;
  onBlur: () => void;
  autoComplete?: string;
}

function TextField({
  id,
  name,
  label,
  value,
  placeholder,
  error,
  touched,
  icon,
  onChange,
  onBlur,
  autoComplete,
}: TextFieldProps): ReactElement {
  const errorId = `${id}-error`;
  const showError = Boolean(touched && error);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
          aria-hidden="true"
        >
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          className={[
            "w-full rounded-xl border bg-white py-3 pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition",
            "placeholder:text-slate-400",
            "focus-visible:ring-2 focus-visible:ring-offset-1",
            showError
              ? "border-rose-400 focus-visible:ring-rose-400"
              : "border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/40",
          ].join(" ")}
        />
      </div>
      <FieldError id={errorId} message={showError ? error : undefined} />
    </div>
  );
}

interface NumberFieldProps {
  id: string;
  name: string;
  label: string;
  value: number | "";
  error?: string;
  touched?: boolean;
  onChange: (value: number | "") => void;
  onBlur: () => void;
}

function NumberField({
  id,
  name,
  label,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: NumberFieldProps): ReactElement {
  const errorId = `${id}-error`;
  const showError = Boolean(touched && error);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative">
        <span
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
          aria-hidden="true"
        >
          <Scale className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          min={0.1}
          max={1000}
          step={0.1}
          value={value}
          placeholder="e.g. 2.5"
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? "" : Number(next));
          }}
          onBlur={onBlur}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          className={[
            "w-full rounded-xl border bg-white py-3 pl-10 pr-12 text-sm text-slate-900 shadow-sm outline-none transition",
            "placeholder:text-slate-400",
            "focus-visible:ring-2 focus-visible:ring-offset-1",
            showError
              ? "border-rose-400 focus-visible:ring-rose-400"
              : "border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/40",
          ].join(" ")}
        />
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-400">
          kg
        </span>
      </div>
      <FieldError id={errorId} message={showError ? error : undefined} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*              Package Type Select (Headless UI + Floating UI)               */
/* -------------------------------------------------------------------------- */

interface PackageTypeSelectProps {
  id: string;
  value: PackageType | "";
  error?: string;
  touched?: boolean;
  onChange: (value: PackageType) => void;
  onBlur: () => void;
}

function PackageTypeSelect({
  id,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: PackageTypeSelectProps): ReactElement {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const listboxId = `${id}-listbox`;
  const showError = Boolean(touched && error);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const selectedIndex = useMemo(() => {
    if (!value) {
      return null;
    }
    const index = PACKAGE_TYPES.indexOf(value);
    return index >= 0 ? index : null;
  }, [value]);

  const optionsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef([...PACKAGE_TYPES]);

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ fallbackAxisSideDirection: "start", padding: 12 }),
      shift({ padding: 12 }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight, 280)}px`,
          });
        },
      }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const listNav = useListNavigation(context, {
    listRef: optionsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch: (index) => {
      if (open) {
        setActiveIndex(index);
        return;
      }
      const matched = PACKAGE_TYPES[index];
      if (matched) {
        onChange(matched);
      }
    },
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNav,
    typeahead,
  ]);

  const handleSelect = useCallback(
    (next: PackageType) => {
      onChange(next);
      setOpen(false);
      setActiveIndex(null);
      onBlur();
    },
    [onBlur, onChange],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-sm font-semibold text-slate-800">
        Package Type
      </span>

      <Listbox
        value={value === "" ? undefined : value}
        onChange={(next: PackageType) => {
          handleSelect(next);
        }}
      >
        <div className="relative">
          <ListboxButton
            id={id}
            ref={refs.setReference}
            aria-labelledby={labelId}
            aria-invalid={showError}
            aria-describedby={showError ? errorId : undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? listboxId : undefined}
            className={[
              "relative flex w-full items-center justify-between rounded-xl border bg-white py-3 pl-10 pr-3 text-left text-sm shadow-sm outline-none transition",
              "focus-visible:ring-2 focus-visible:ring-offset-1",
              showError
                ? "border-rose-400 focus-visible:ring-rose-400"
                : "border-slate-200 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/40",
              value ? "text-slate-900" : "text-slate-400",
            ].join(" ")}
            {...getReferenceProps({
              onBlur,
              onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
                if (event.key === "Escape" && open) {
                  event.preventDefault();
                  setOpen(false);
                }
              },
            })}
          >
            <span
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
              aria-hidden="true"
            >
              <Package className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="truncate">
              {value || "Select package type"}
            </span>
            <ChevronDown
              className={[
                "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                open ? "rotate-180" : "rotate-0",
              ].join(" ")}
              aria-hidden="true"
            />
          </ListboxButton>

          {open ? (
            <FloatingPortal>
              <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                <ListboxOptions
                  id={listboxId}
                  static
                  modal={false}
                  ref={refs.setFloating}
                  style={floatingStyles}
                  className="z-50 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg outline-none ring-1 ring-black/5"
                  {...getFloatingProps()}
                >
                  {PACKAGE_TYPES.map((option, index) => {
                    const isActive = activeIndex === index;
                    const isSelected = value === option;

                    return (
                      <ListboxOption
                        key={option}
                        value={option}
                        className="outline-none data-[focus]:bg-emerald-50"
                      >
                        {({ focus }) => (
                          <div
                            ref={(node) => {
                              optionsRef.current[index] = node;
                            }}
                            role="option"
                            aria-selected={isSelected}
                            tabIndex={isActive ? 0 : -1}
                            className={[
                              "flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition-colors",
                              focus || isActive
                                ? "bg-emerald-50 text-emerald-900"
                                : "text-slate-700",
                            ].join(" ")}
                            {...getItemProps({
                              onClick() {
                                handleSelect(option);
                              },
                            })}
                          >
                            <span className="font-medium">{option}</span>
                            {isSelected ? (
                              <Check
                                className="h-4 w-4 text-emerald-600"
                                aria-hidden="true"
                              />
                            ) : (
                              <span className="h-4 w-4" aria-hidden="true" />
                            )}
                          </div>
                        )}
                      </ListboxOption>
                    );
                  })}
                </ListboxOptions>
              </FloatingFocusManager>
            </FloatingPortal>
          ) : null}
        </div>
      </Listbox>

      <FieldError id={errorId} message={showError ? error : undefined} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Form Component                           */
/* -------------------------------------------------------------------------- */

export function CreateDispatchForm({
  onSubmit,
  initialValues,
  className,
}: CreateDispatchFormProps): ReactElement {
  const formId = useId();
  const [sectionsParent] = useAutoAnimate<HTMLDivElement>({
    duration: 260,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  });
  const [statusParent] = useAutoAnimate<HTMLDivElement>({
    duration: 220,
    easing: "ease-out",
  });

  const mergedInitialValues = useMemo<CreateDispatchFormValues>(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
    }),
    [initialValues],
  );

  const handleSubmit = useCallback(
    async (
      values: CreateDispatchFormValues,
      helpers: FormikHelpers<CreateDispatchFormValues>,
    ) => {
      try {
        await onSubmit?.(values);
        helpers.setStatus({
          type: "success",
          message: "Dispatch order created successfully.",
        });
        helpers.resetForm({ values: mergedInitialValues });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create dispatch order. Please try again.";
        helpers.setStatus({ type: "error", message });
      } finally {
        helpers.setSubmitting(false);
      }
    },
    [mergedInitialValues, onSubmit],
  );

  return (
    <section
      aria-labelledby={`${formId}-title`}
      className={[
        "mx-auto w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-sm sm:p-8",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="mb-8 space-y-2 border-b border-slate-100 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          FleetFlow Dispatch
        </p>
        <h2
          id={`${formId}-title`}
          className="text-2xl font-semibold tracking-tight text-slate-900"
        >
          Create delivery dispatch
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-slate-600">
          Capture pickup, delivery, and package details to enqueue a new courier
          assignment. All fields are validated before submission.
        </p>
      </header>

      <Formik<CreateDispatchFormValues>
        initialValues={mergedInitialValues}
        validationSchema={createDispatchSchema}
        validateOnBlur
        validateOnChange={false}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          status,
          handleBlur,
          setFieldValue,
          setFieldTouched,
          setStatus,
        }) => {
          const formStatus = status as FormStatus | undefined;

          return (
          <Form noValidate className="space-y-6" aria-busy={isSubmitting}>
            <div ref={sectionsParent} className="space-y-5">
              <TextField
                id={`${formId}-pickup`}
                name="pickupAddress"
                label="Pickup Address"
                value={values.pickupAddress}
                placeholder="Street, building, city"
                error={errors.pickupAddress}
                touched={touched.pickupAddress}
                icon={<MapPin className="h-4 w-4" strokeWidth={1.75} />}
                autoComplete="street-address"
                onChange={(next) => {
                  void setFieldValue("pickupAddress", next);
                  if (formStatus) {
                    setStatus(undefined);
                  }
                }}
                onBlur={() => {
                  void setFieldTouched("pickupAddress", true);
                  handleBlur("pickupAddress");
                }}
              />

              <TextField
                id={`${formId}-delivery`}
                name="deliveryAddress"
                label="Delivery Address"
                value={values.deliveryAddress}
                placeholder="Street, building, city"
                error={errors.deliveryAddress}
                touched={touched.deliveryAddress}
                icon={<MapPin className="h-4 w-4" strokeWidth={1.75} />}
                autoComplete="street-address"
                onChange={(next) => {
                  void setFieldValue("deliveryAddress", next);
                  if (formStatus) {
                    setStatus(undefined);
                  }
                }}
                onBlur={() => {
                  void setFieldTouched("deliveryAddress", true);
                  handleBlur("deliveryAddress");
                }}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <NumberField
                  id={`${formId}-weight`}
                  name="packageWeight"
                  label="Package Weight"
                  value={values.packageWeight}
                  error={errors.packageWeight}
                  touched={touched.packageWeight}
                  onChange={(next) => {
                    void setFieldValue("packageWeight", next);
                    if (formStatus) {
                      setStatus(undefined);
                    }
                  }}
                  onBlur={() => {
                    void setFieldTouched("packageWeight", true);
                    handleBlur("packageWeight");
                  }}
                />

                <PackageTypeSelect
                  id={`${formId}-package-type`}
                  value={values.packageType}
                  error={errors.packageType}
                  touched={touched.packageType}
                  onChange={(next) => {
                    void setFieldValue("packageType", next, true);
                    if (formStatus) {
                      setStatus(undefined);
                    }
                  }}
                  onBlur={() => {
                    void setFieldTouched("packageType", true);
                  }}
                />
              </div>
            </div>

            <div ref={statusParent} className="min-h-[1.5rem]">
              {formStatus?.message ? (
                <div
                  role={formStatus.type === "error" ? "alert" : "status"}
                  className={[
                    "rounded-xl border px-4 py-3 text-sm font-medium",
                    formStatus.type === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800",
                  ].join(" ")}
                >
                  {formStatus.message}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="reset"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setStatus(undefined)}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating dispatch…" : "Create dispatch"}
              </button>
            </div>
          </Form>
          );
        }}
      </Formik>
    </section>
  );
}

export default CreateDispatchForm;
