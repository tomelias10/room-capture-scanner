// Geocoding + nearest-supplier matching.
// Requires GOOGLE_MAPS_API_KEY (Geocoding API enabled) in the environment.

export type Coordinates = { lat: number; lng: number };

export async function geocodeAddress(
  address: string,
): Promise<Coordinates | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set, skipping geocoding");
    return null;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  const location = data?.results?.[0]?.geometry?.location;
  if (!location) return null;

  return { lat: location.lat, lng: location.lng };
}

// Great-circle distance in km between two coordinates.
export function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestByDistance<T extends Coordinates>(
  origin: Coordinates,
  candidates: T[],
): T | null {
  if (candidates.length === 0) return null;
  return candidates.reduce((closest, current) =>
    haversineKm(origin, current) < haversineKm(origin, closest)
      ? current
      : closest,
  );
}
