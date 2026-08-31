// Config-driven landing pages: every (city x shipment type) combination
// gets its own route at /lp/[slug] without duplicating any code.
// Extend CITIES / SHIPMENT_TYPES to add more cities or countries - the
// platform itself is global, this list just picks which cities get a
// dedicated SEO/ads landing page.

export type City = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
};

export type ShipmentType = {
  id: string;
  label: string;
  headline: (city: string) => string;
  description: (city: string) => string;
};

export const CITIES: City[] = [
  { id: "new-york", name: "New York", country: "United States", lat: 40.7128, lng: -74.006 },
  { id: "london", name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278 },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  { id: "singapore", name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { id: "toronto", name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { id: "sydney", name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093 },
  { id: "berlin", name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405 },
  { id: "mumbai", name: "Mumbai", country: "India", lat: 19.076, lng: 72.8777 },
  { id: "sao-paulo", name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { id: "tokyo", name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
];

export const SHIPMENT_TYPES: ShipmentType[] = [
  {
    id: "local-delivery",
    label: "Local Delivery",
    headline: (city) => `Fast local delivery in ${city}`,
    description: (city) =>
      `Compare quotes from vetted local courier providers in ${city} - get a price in minutes.`,
  },
  {
    id: "apartment-moving",
    label: "Apartment Moving",
    headline: (city) => `Professional apartment moving in ${city}`,
    description: (city) =>
      `Looking to move apartments in ${city}? We'll match you with a local mover that fits your budget.`,
  },
  {
    id: "international-shipping",
    label: "International Shipping",
    headline: (city) => `International shipping from ${city} worldwide`,
    description: (city) =>
      `Ship packages and freight from ${city} anywhere in the world with a vetted logistics provider.`,
  },
  {
    id: "furniture-delivery",
    label: "Furniture Delivery",
    headline: (city) => `Furniture and heavy item delivery in ${city}`,
    description: (city) =>
      `Safe, fairly-priced furniture and heavy equipment delivery in ${city} - compare providers.`,
  },
  {
    id: "business-delivery",
    label: "Business Delivery (B2B)",
    headline: (city) => `Business delivery solutions in ${city}`,
    description: (city) =>
      `Logistics and delivery solutions in ${city} for small and mid-sized businesses.`,
  },
];

export type LandingPageConfig = {
  slug: string;
  city: City;
  shipmentType: ShipmentType;
};

export const LANDING_PAGES: LandingPageConfig[] = CITIES.flatMap((city) =>
  SHIPMENT_TYPES.map((shipmentType) => ({
    slug: `${city.id}-${shipmentType.id}`,
    city,
    shipmentType,
  })),
);

export function getLandingPage(slug: string): LandingPageConfig | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
