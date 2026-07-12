"use client";

import { Package } from "lucide-react";
import type { ReactElement } from "react";

export const PARCEL_CONTENT_OPTIONS = [
  { id: "electronics", label: "Electronics / gadgets" },
  { id: "fashion", label: "Fashion & apparel" },
  { id: "documents", label: "Documents & files" },
  { id: "food", label: "Food & beverages" },
  { id: "cosmetics", label: "Cosmetics / personal care" },
  { id: "fragile", label: "Fragile — handle with care" },
  { id: "bulky", label: "Bulky / furniture" },
  { id: "medical", label: "Medical supplies" },
] as const;

export function formatParcelContents(selectedIds: string[]): string {
  const labels = PARCEL_CONTENT_OPTIONS.filter((option) =>
    selectedIds.includes(option.id),
  ).map((option) => option.label);

  return labels.join(" · ");
}

interface ParcelContentsFieldProps {
  formId: string;
  selectedIds: string[];
  onChange: (next: string[]) => void;
  onBlur?: () => void;
}

export function ParcelContentsField({
  formId,
  selectedIds,
  onChange,
  onBlur,
}: ParcelContentsFieldProps): ReactElement {
  const toggleOption = (id: string): void => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    onChange(next);
    onBlur?.();
  };

  const summary = formatParcelContents(selectedIds);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-slate-500" />
        <label className="text-sm font-semibold text-slate-800">
          Parcel contents <span className="font-normal text-slate-500">(optional)</span>
        </label>
      </div>
      <p className="mt-1 text-xs text-slate-500">Select one or more categories for quick demo setup.</p>

      <div
        id={`${formId}-parcel-contents`}
        className="mt-3 flex flex-wrap gap-2"
        role="group"
        aria-label="Parcel contents"
      >
        {PARCEL_CONTENT_OPTIONS.map((option) => {
          const isSelected = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleOption(option.id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                isSelected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {summary ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Selected: <span className="font-medium text-slate-900">{summary}</span>
        </p>
      ) : null}
    </div>
  );
}
