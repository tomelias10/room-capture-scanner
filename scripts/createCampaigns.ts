// Launches (paused) Facebook + Google Ads campaigns for the hub and route
// landing pages (service pages aren't tied to one location, so they're
// left out of automated geo-targeted campaigns - run those manually in
// Ads Manager if wanted). Run with: npm run ads:launch
//
// Requires FACEBOOK_* and GOOGLE_ADS_* env vars (see .env.example) and a
// GEO_TARGET_CONSTANTS entry per page for Google Ads (see googleAds.ts).
import { LANDING_PAGES } from "../src/lib/landingPages";
import { createFacebookCampaign, FacebookGeoTarget } from "../src/lib/ads/facebookAds";
import { createGoogleCampaign } from "../src/lib/ads/googleAds";
import { HUB_COORDS, COUNTRY_ISO } from "../src/lib/ads/geoTargets";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DAILY_BUDGET_CENTS = 2000; // 20.00 in the ad account's currency
const DAILY_BUDGET_MICROS = 20_000_000; // 20.00

// Fill in real Google geo target constants per landing page slug before
// running the Google Ads part (see comment in src/lib/ads/googleAds.ts).
const GEO_TARGET_CONSTANTS: Record<string, string> = {
  // "new-york-freight-forwarding": "geoTargetConstants/<look up the real ID>",
};

function facebookGeoFor(page: (typeof LANDING_PAGES)[number]): FacebookGeoTarget | null {
  if (page.pageType === "hub") {
    const hubId = page.slug.replace("-freight-forwarding", "");
    const coords = HUB_COORDS[hubId];
    return coords ? { type: "radius", ...coords, radiusKm: 30 } : null;
  }
  if (page.pageType === "route" && page.prefill?.destinationCountry) {
    const code = COUNTRY_ISO[page.prefill.destinationCountry];
    return code ? { type: "countries", countryCodes: [code] } : null;
  }
  return null;
}

async function main() {
  const onlyFacebook = process.argv.includes("--facebook-only");
  const onlyGoogle = process.argv.includes("--google-only");

  const targetablePages = LANDING_PAGES.filter((p) => p.pageType !== "service");

  for (const page of targetablePages) {
    const name = page.h1;
    const landingPageUrl = `${SITE_URL}/lp/${page.slug}`;

    if (!onlyGoogle) {
      const geo = facebookGeoFor(page);
      if (!geo) {
        console.warn(`[facebook] skipping ${name}: no geo target metadata`);
      } else {
        try {
          const result = await createFacebookCampaign({
            name,
            headline: page.h1,
            landingPageUrl,
            geo,
            dailyBudgetCents: DAILY_BUDGET_CENTS,
          });
          console.log(`[facebook] ${name} ->`, result);
        } catch (err) {
          console.error(`[facebook] ${name} failed:`, err);
        }
      }
    }

    if (!onlyFacebook) {
      const geoTarget = GEO_TARGET_CONSTANTS[page.slug];
      if (!geoTarget) {
        console.warn(`[google] skipping ${name}: no geo target constant configured for ${page.slug}`);
        continue;
      }
      try {
        const result = await createGoogleCampaign({
          name,
          landingPageUrl,
          headline: page.h1,
          description: page.metaDescription,
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
