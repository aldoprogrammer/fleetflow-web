import { apiClient } from "./client";

export interface DriverSummary {
  id: string;
  fullName: string;
  phone: string;
  status: "AVAILABLE" | "ON_TRIP" | "OFFLINE";
  currentLat: number;
  currentLng: number;
  vehicleType: string;
  plateNumber: string;
}

export interface FleetOverview {
  matchRadiusKm: number;
  driverStatus: {
    available: number;
    onTrip: number;
    offline: number;
  };
  orderStatus: Record<string, number>;
  activeDispatch: number;
  drivers: DriverSummary[];
}

export async function fetchFleetOverview(): Promise<FleetOverview> {
  const response = await apiClient.get<FleetOverview>("/fleet/overview");
  return response.data;
}

export async function listDrivers(): Promise<DriverSummary[]> {
  const response = await apiClient.get<DriverSummary[]>("/drivers");
  return response.data;
}
