export interface GeocodingResult {
  lat: number;
  lng: number;
  label: string;
}

interface NominatimSearchItem {
  display_name: string;
  lat: string;
  lon: string;
}

interface NominatimReverseResponse {
  display_name?: string;
}

const NOMINATIM_HEADERS = {
  Accept: "application/json",
};

export async function searchPlaces(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "id");

  const response = await fetch(url.toString(), { headers: NOMINATIM_HEADERS });
  if (!response.ok) return [];

  const data = (await response.json()) as NominatimSearchItem[];
  return data.map((item) => ({
    lat: Number.parseFloat(item.lat),
    lng: Number.parseFloat(item.lon),
    label: item.display_name,
  }));
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));

  const response = await fetch(url.toString(), { headers: NOMINATIM_HEADERS });
  if (!response.ok) return null;

  const data = (await response.json()) as NominatimReverseResponse;
  return data.display_name ?? null;
}
