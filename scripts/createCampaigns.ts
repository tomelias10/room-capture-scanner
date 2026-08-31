// Launches (paused) Facebook + Google Ads campaigns for every landing page.
// Run with: npm run ads:launch
//
// Requires FACEBOOK_* and GOOGLE_ADS_* env vars (see .env.example) and a
// GEO_TARGET_CONSTANTS entry per city for Google Ads (see googleAds.ts).
import { LANDING_PAGES } from "../src/lib/landingPages";
import { createFacebookCampaign } from "../src/lib/ads/facebookAds";
import { createGoogleCampaign } from "../src/lib/ads/googleAds";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DAILY_BUDGET_CENTS = 2000; // 20.00 in the ad account's currency
const DAILY_BUDGET_MICROS = 20_000_000; // 20.00

// Fill in real Google geo target constants per city before running the
// Google Ads part (see comment in src/lib/ads/googleAds.ts).
const GEO_TARGET_CONSTANTS: Record<string, string> = {
  // "tel-aviv": "geoTargetConstants/1000080",
};

async function main() {
  const onlyFacebook = process.argv.includes("--facebook-only");
  const onlyGoogle = process.argv.includes("--google-only");

  for (const page of LANDING_PAGES) {
    const name = `${page.shipmentType.label} - ${page.city.name}`;
    const landingPageUrl = `${SITE_URL}/lp/${page.slug}`;
    const headline = page.shipmentType.headline(page.city.name);

    if (!onlyGoogle) {
      try {
        const result = await createFacebookCampaign({
          name,
          headline,
          landingPageUrl,
          lat: page.city.lat,
          lng: page.city.lng,
          radiusKm: 20,
          dailyBudgetCents: DAILY_BUDGET_CENTS,
        });
        console.log(`[facebook] ${name} ->`, result);
      } catch (err) {
        console.error(`[facebook] ${name} failed:`, err);
      }
    }

    if (!onlyFacebook) {
      const geoTarget = GEO_TARGET_CONSTANTS[page.city.id];
      if (!geoTarget) {
        console.warn(`[google] skipping ${name}: no geo target constant configured for ${page.city.id}`);
        continue;
      }
      try {
        const result = await createGoogleCampaign({
          name,
          landingPageUrl,
          headline,
          description: "השאירו פרטים וקבלו הצעת מחיר תוך דקות ממספר ספקים.",
          geoTargetConstant: geoTarget,
          dailyBudgetMicros: DAILY_BUDGET_MICROS,
        });
        console.log(`[google] ${name} ->`, result);
      } catch (err) {
        console.error(`[google] ${name} failed:`, err);
      }
    }
  }
}

main().then(() => process.exit(0));
