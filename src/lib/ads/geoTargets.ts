// Real-world geo metadata used only for paid ad targeting (Facebook radius
// targeting, Google Ads geo target constants) - kept separate from
// landingPages.ts, which is about page content, not ad platform mechanics.

// Approximate city center coordinates for hub-page radius targeting.
export const HUB_COORDS: Record<string, { lat: number; lng: number }> = {
  "new-york": { lat: 40.7128, lng: -74.006 },
  "los-angeles": { lat: 34.0522, lng: -118.2437 },
  london: { lat: 51.5074, lng: -0.1278 },
  rotterdam: { lat: 51.9244, lng: 4.4777 },
  hamburg: { lat: 53.5511, lng: 9.9937 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  "hong-kong": { lat: 22.3193, lng: 114.1694 },
  shanghai: { lat: 31.2304, lng: 121.4737 },
  mumbai: { lat: 19.076, lng: 72.8777 },
};

// ISO 3166-1 alpha-2 codes for country-level targeting on route pages.
export const COUNTRY_ISO: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  Germany: "DE",
  Netherlands: "NL",
  France: "FR",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  Australia: "AU",
  Canada: "CA",
  India: "IN",
  China: "CN",
  Singapore: "SG",
  "Hong Kong": "HK",
};
