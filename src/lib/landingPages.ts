// Config-driven landing pages: every (city x shipment type) combination
// gets its own route at /lp/[slug] without duplicating any code.
// Extend CITIES / SHIPMENT_TYPES to add more pages or other countries.

export type City = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type ShipmentType = {
  id: string;
  label: string;
  headline: (city: string) => string;
};

export const CITIES: City[] = [
  { id: "tel-aviv", name: "תל אביב", lat: 32.0853, lng: 34.7818 },
  { id: "jerusalem", name: "ירושלים", lat: 31.7683, lng: 35.2137 },
  { id: "haifa", name: "חיפה", lat: 32.794, lng: 34.9896 },
  { id: "beer-sheva", name: "באר שבע", lat: 31.253, lng: 34.7915 },
  { id: "netanya", name: "נתניה", lat: 32.3215, lng: 34.8532 },
  { id: "ashdod", name: "אשדוד", lat: 31.8044, lng: 34.6553 },
  { id: "rishon-lezion", name: "ראשון לציון", lat: 31.973, lng: 34.7925 },
  { id: "petah-tikva", name: "פתח תקווה", lat: 32.084, lng: 34.8878 },
  { id: "holon", name: "חולון", lat: 32.0117, lng: 34.7736 },
  { id: "ramat-gan", name: "רמת גן", lat: 32.0684, lng: 34.8248 },
];

export const SHIPMENT_TYPES: ShipmentType[] = [
  {
    id: "local-delivery",
    label: "משלוחים מקומיים",
    headline: (city) => `משלוחים מקומיים מהירים ב${city}`,
  },
  {
    id: "apartment-moving",
    label: "הובלת דירה",
    headline: (city) => `הובלת דירה מקצועית ב${city}`,
  },
  {
    id: "international-shipping",
    label: "משלוחים בינלאומיים",
    headline: (city) => `משלוחים בינלאומיים מ${city} לכל העולם`,
  },
  {
    id: "furniture-delivery",
    label: "משלוחי רהיטים",
    headline: (city) => `משלוחי רהיטים וציוד כבד ב${city}`,
  },
  {
    id: "business-delivery",
    label: "משלוחים עסקיים (B2B)",
    headline: (city) => `פתרונות משלוחים עסקיים ב${city}`,
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
