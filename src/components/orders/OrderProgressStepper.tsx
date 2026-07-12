"use client";

import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  Package,
  Radio,
  Search,
  type LucideIcon,
} from "lucide-react";
import type { ReactElement } from "react";
import type { ApiOrderStatus } from "@/lib/api/orders";
import { resolveCurrentStepIndex } from "@/components/orders/order-progress.utils";

interface OrderProgressStepperProps {
  status: ApiOrderStatus;
}

interface StepDefinition {
  key: string;
  label: string;
  icon: LucideIcon;
}

const STEPS: StepDefinition[] = [
  { key: "placed", label: "Order Placed", icon: ClipboardList },
  { key: "matching", label: "Finding Driver", icon: Search },
  { key: "dispatched", label: "Driver Dispatched", icon: Radio },
  { key: "active", label: "Trip Active", icon: Package },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

function isStepComplete(
  index: number,
  status: ApiOrderStatus,
  currentStepIndex: number,
): boolean {
  if (status === "CANCELLED") return index === 0;
  if (status === "DELIVERED") return true;
  return index < currentStepIndex;
}

function isStepCurrent(
  index: number,
  status: ApiOrderStatus,
  currentStepIndex: number,
): boolean {
  if (status === "CANCELLED" || status === "DELIVERED") return false;
  return index === currentStepIndex;
}

function isAutoProgressStep(status: ApiOrderStatus): boolean {
  return status === "DRAFT" || status === "PENDING" || status === "MATCHING";
}

function countCompletedSteps(status: ApiOrderStatus, currentStepIndex: number): number {
  if (status === "DELIVERED") return STEPS.length;
  if (status === "CANCELLED") return 1;
  return Math.max(0, currentStepIndex);
}

export function OrderProgressStepper({ status }: OrderProgressStepperProps): ReactElement {
  const currentStepIndex = resolveCurrentStepIndex(status);
  const completedCount = countCompletedSteps(status, currentStepIndex);
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-emerald-50/30 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Fulfillment progress
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{completedCount}</span> of{" "}
            <span className="font-semibold text-slate-900">{STEPS.length}</span> stages complete
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
          {progressPercent}%
        </span>
      </div>

      <div
        className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200/80"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ol className="grid grid-cols-5 gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const isComplete = isStepComplete(index, status, currentStepIndex);
          const isCurrent = isStepCurrent(index, status, currentStepIndex);
          const isAutoStep = isCurrent && isAutoProgressStep(status);
          const Icon = step.icon;

          return (
            <li key={step.key} className="relative flex flex-col items-center text-center">
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={[
                    "absolute left-[calc(50%+18px)] top-4 hidden h-0.5 w-[calc(100%-36px)] sm:block",
                    isStepComplete(index + 1, status, currentStepIndex) || isComplete
                      ? "bg-emerald-400"
                      : "bg-slate-200",
                  ].join(" ")}
                />
              ) : null}

              <span
                className={[
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 transition-all sm:h-10 sm:w-10",
                  isComplete
                    ? "bg-emerald-500 text-white ring-emerald-100 shadow-sm"
                    : isCurrent
                      ? isAutoStep
                        ? "bg-sky-500 text-white ring-sky-100 shadow-md"
                        : "bg-white text-sky-600 ring-sky-200 shadow-md"
                      : "bg-white text-slate-300 ring-slate-100",
                ].join(" ")}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
                ) : isAutoStep ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" strokeWidth={2.25} />
                ) : (
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
                )}
              </span>

              <p
                className={[
                  "mt-2 text-[10px] font-semibold leading-tight sm:text-[11px]",
                  isComplete || isCurrent ? "text-slate-900" : "text-slate-400",
                ].join(" ")}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>

      {status === "DELIVERED" ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
          Delivery confirmed successfully.
        </div>
      ) : null}

      {status === "CANCELLED" ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Order cancelled before fulfillment could complete.
        </div>
      ) : null}
    </div>
  );
}
