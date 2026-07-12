"use client";

import { MapPin } from "lucide-react";
import { useState, type ReactElement } from "react";
import { LocationMapModal } from "@/components/maps/LocationMapModal";
import type { LatLng } from "@/components/maps/MapPicker";

interface AddressLocationFieldProps {
  label: string;
  addressId: string;
  addressName: string;
  addressValue: string;
  lat: number;
  lng: number;
  error?: string;
  touched?: boolean;
  onAddressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddressBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onLocationSelect: (address: string, position: LatLng) => void;
  defaultCenter?: LatLng;
}

export function AddressLocationField({
  label,
  addressId,
  addressName,
  addressValue,
  lat,
  lng,
  error,
  touched,
  onAddressChange,
  onAddressBlur,
  onLocationSelect,
  defaultCenter,
}: AddressLocationFieldProps): ReactElement {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={addressId} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
        >
          <MapPin className="h-3.5 w-3.5" />
          Pick on map
        </button>
      </div>

      <div className="relative mt-1.5">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={addressId}
          name={addressName}
          value={addressValue}
          onChange={onAddressChange}
          onBlur={onAddressBlur}
          placeholder="Street address or search via map"
          className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        />
      </div>

      {touched && error ? (
        <p role="alert" className="mt-1.5 text-sm font-medium text-rose-600">
          {error}
        </p>
      ) : null}

      <LocationMapModal
        open={isMapOpen}
        title={`Select ${label.toLowerCase()}`}
        description="Search, click the map, then confirm to auto-fill address and coordinates."
        value={hasCoordinates ? { lat, lng } : null}
        defaultCenter={defaultCenter}
        onClose={() => setIsMapOpen(false)}
        onConfirm={(position, mapLabel) => {
          onLocationSelect(mapLabel ?? addressValue, position);
        }}
      />
    </div>
  );
}
