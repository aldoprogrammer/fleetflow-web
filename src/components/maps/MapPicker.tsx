"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { reverseGeocode, searchPlaces, type GeocodingResult } from "@/lib/geocoding/nominatim";
import { configureLeafletIcons } from "@/lib/maps/leaflet-icons";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapPickerProps {
  value?: LatLng | null;
  onChange: (position: LatLng, label?: string) => void;
  height?: number;
  onConfirm?: () => void;
  defaultCenter?: LatLng;
  active?: boolean;
}

type LeafletModule = typeof import("leaflet");

function refreshMapSize(map: import("leaflet").Map): void {
  map.invalidateSize({ animate: false, pan: false });
}

export function MapPicker({
  value,
  onChange,
  height = 380,
  onConfirm,
  defaultCenter = { lat: -6.2, lng: 106.816666 },
  active = true,
}: MapPickerProps): ReactElement {
  const [position, setPosition] = useState<LatLng | null>(value ?? null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const placeMarker = useCallback((pos: LatLng, recenter = false): void => {
    const map = mapInstance.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([pos.lat, pos.lng]);
    } else {
      markerRef.current = L.marker([pos.lat, pos.lng]).addTo(map);
    }

    if (recenter) {
      map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 15), { animate: false });
      refreshMapSize(map);
    }
  }, []);

  useEffect(() => {
    if (!value) return;
    if (value.lat === position?.lat && value.lng === position?.lng) return;
    setPosition(value);
    placeMarker(value, true);
  }, [value, position?.lat, position?.lng, placeMarker]);

  useEffect(() => {
    if (!active) return;

    let disposed = false;
    const initialCenter = value ?? defaultCenter;
    const initialPosition = value ?? null;

    const initMap = async (): Promise<void> => {
      if (!mapRef.current || mapInstance.current) return;

      const L = await import("leaflet");
      if (disposed || !mapRef.current) return;

      configureLeafletIcons(L);
      leafletRef.current = L;

      const map = L.map(mapRef.current).setView([initialCenter.lat, initialCenter.lng], 13);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      if (initialPosition) {
        placeMarker(initialPosition, false);
      }

      map.on("click", (event) => {
        const pos = { lat: event.latlng.lat, lng: event.latlng.lng };
        setPosition(pos);
        placeMarker(pos, false);
        void reverseGeocode(pos.lat, pos.lng)
          .then((label) => onChangeRef.current(pos, label ?? undefined))
          .catch(() => onChangeRef.current(pos));
      });

      window.requestAnimationFrame(() => refreshMapSize(map));
      window.setTimeout(() => refreshMapSize(map), 220);
    };

    void initMap();

    return () => {
      disposed = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
      markerRef.current = null;
      leafletRef.current = null;
    };
  }, [active, defaultCenter, placeMarker, value]);

  useEffect(() => {
    if (!active || !mapInstance.current) return;

    const map = mapInstance.current;
    refreshMapSize(map);
    const timeoutId = window.setTimeout(() => refreshMapSize(map), 240);

    return () => window.clearTimeout(timeoutId);
  }, [active]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      void searchPlaces(trimmed)
        .then(setResults)
        .finally(() => setIsSearching(false));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const applySearchResult = (result: GeocodingResult): void => {
    const pos = { lat: result.lat, lng: result.lng };
    setPosition(pos);
    onChange(pos, result.label);
    setResults([]);
    setQuery(result.label);
    placeMarker(pos, true);
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Click the map or search an address.</p>
        {onConfirm ? (
          <button
            type="button"
            onClick={onConfirm}
            disabled={!position}
            className="inline-flex items-center rounded-xl bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
          >
            Use this location
          </button>
        ) : null}
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search place name or address"
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        />
        {isSearching ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        ) : null}
        {results.length > 0 ? (
          <div className="absolute z-[10000] mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white text-sm shadow-lg">
            {results.map((result) => (
              <button
                key={`${result.lat}-${result.lng}-${result.label}`}
                type="button"
                className="w-full px-3 py-2.5 text-left hover:bg-slate-50"
                onClick={() => applySearchResult(result)}
              >
                {result.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="overflow-hidden rounded-xl border border-slate-200"
      />

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <MapPin className="h-4 w-4 text-emerald-700" />
        {position ? (
          <span>
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
        ) : (
          <span className="text-slate-500">No location selected</span>
        )}
      </div>
    </div>
  );
}
