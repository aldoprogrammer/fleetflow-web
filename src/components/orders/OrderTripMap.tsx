"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { configureLeafletIcons } from "@/lib/maps/leaflet-icons";
import type { ApiOrderStatus, AssignedDriverSummary } from "@/lib/api/orders";

export interface OrderTripMapProps {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  pickupLabel?: string;
  deliveryLabel?: string;
  status: ApiOrderStatus;
  driver?: AssignedDriverSummary | null;
  height?: number;
}

type LeafletModule = typeof import("leaflet");

function divIcon(
  L: LeafletModule,
  color: string,
  glyph: string,
  title: string,
): import("leaflet").DivIcon {
  return L.divIcon({
    className: "fleetflow-trip-marker",
    html: `<div title="${title}" style="width:32px;height:32px;border-radius:9999px;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,23,42,.28);border:2px solid #fff;color:#fff;font-size:14px;line-height:1">${glyph}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function OrderTripMap({
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
  pickupLabel = "Pickup",
  deliveryLabel = "Destination",
  status,
  driver,
  height = 280,
}: OrderTripMapProps): ReactElement {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let disposed = false;

    async function mount(): Promise<void> {
      if (!mapRef.current || mapInstance.current) {
        return;
      }

      const L = (await import("leaflet")) as LeafletModule;
      if (disposed || !mapRef.current) {
        return;
      }

      configureLeafletIcons(L);

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
      });
      mapInstance.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(map);

      const pickup = L.latLng(pickupLat, pickupLng);
      const delivery = L.latLng(deliveryLat, deliveryLng);
      const bounds = L.latLngBounds([pickup, delivery]);

      L.marker(pickup, {
        icon: divIcon(L, "#F59E0B", "P", pickupLabel),
      })
        .addTo(map)
        .bindPopup(`<strong>Pickup</strong><br/>${pickupLabel}`);

      L.marker(delivery, {
        icon: divIcon(L, "#0F766E", "D", deliveryLabel),
      })
        .addTo(map)
        .bindPopup(`<strong>Destination</strong><br/>${deliveryLabel}`);

      L.polyline([pickup, delivery], {
        color: "#0F766E",
        weight: 3.5,
        opacity: 0.85,
      }).addTo(map);

      if (
        driver &&
        typeof driver.currentLat === "number" &&
        typeof driver.currentLng === "number" &&
        Number.isFinite(driver.currentLat) &&
        Number.isFinite(driver.currentLng) &&
        status !== "CANCELLED"
      ) {
        const driverPos = L.latLng(driver.currentLat, driver.currentLng);
        bounds.extend(driverPos);
        L.marker(driverPos, {
          icon: divIcon(L, "#0284C7", "A", driver.fullName),
        })
          .addTo(map)
          .bindPopup(
            `<strong>${driver.fullName}</strong><br/>${driver.vehicleType} · last known location`,
          );
      }

      map.fitBounds(bounds.pad(0.2));
      window.setTimeout(() => {
        map.invalidateSize();
      }, 50);
    }

    void mount();

    return () => {
      disposed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [
    pickupLat,
    pickupLng,
    deliveryLat,
    deliveryLng,
    pickupLabel,
    deliveryLabel,
    status,
    driver?.id,
    driver?.currentLat,
    driver?.currentLng,
    driver?.fullName,
    driver?.vehicleType,
  ]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Trip map
          </p>
          <p className="text-sm font-semibold text-slate-900">
            Pickup, destination
            {driver ? ", and driver position" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pickup
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-700" /> Destination
          </span>
          {driver ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-600" /> Driver
            </span>
          ) : null}
        </div>
      </div>
      <div ref={mapRef} style={{ height }} className="w-full bg-slate-100" />
    </section>
  );
}
