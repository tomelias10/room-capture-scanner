// Creates a geo-targeted Facebook/Instagram campaign for one landing page
// using the official Marketing API SDK. Requires a Business Manager ad
// account, a Page, and a system-user access token with ads_management scope.
//
// Safety: everything is created in PAUSED state. Review in Ads Manager and
// activate manually — this script never spends money on its own.
import bizSdk from "facebook-nodejs-business-sdk";

const { AdAccount, Campaign, AdSet, AdCreative, Ad, FacebookAdsApi } = bizSdk;

export type FacebookCampaignInput = {
  name: string;
  headline: string;
  landingPageUrl: string;
  lat: number;
  lng: number;
  radiusKm: number;
  dailyBudgetCents: number; // smallest currency unit, e.g. agorot/cents
};

export async function createFacebookCampaign(input: FacebookCampaignInput) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken || !adAccountId || !pageId) {
    throw new Error(
      "Missing FACEBOOK_ACCESS_TOKEN / FACEBOOK_AD_ACCOUNT_ID / FACEBOOK_PAGE_ID",
    );
  }

  FacebookAdsApi.init(accessToken);
  const account = new AdAccount(`act_${adAccountId}`);

  const campaign = await account.createCampaign([], {
    name: `${input.name} - campaign`,
    objective: "OUTCOME_LEADS",
    status: "PAUSED",
    special_ad_categories: [],
  });

  const adSet = await account.createAdSet([], {
    name: `${input.name} - ad set`,
    campaign_id: campaign.id,
    daily_budget: input.dailyBudgetCents,
    billing_event: "IMPRESSIONS",
    optimization_goal: "LINK_CLICKS",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    targeting: {
      geo_locations: {
        custom_locations: [
          {
            latitude: input.lat,
            longitude: input.lng,
            radius: input.radiusKm,
            distance_unit: "kilometer",
          },
        ],
      },
      age_min: 18,
    },
    status: "PAUSED",
  });

  const creative = await account.createAdCreative([], {
    name: `${input.name} - creative`,
    object_story_spec: {
      page_id: pageId,
      link_data: {
        link: input.landingPageUrl,
        message: input.headline,
        call_to_action: {
          type: "GET_QUOTE",
          value: { link: input.landingPageUrl },
        },
      },
    },
  });

  const ad = await account.createAd([], {
    name: `${input.name} - ad`,
    adset_id: adSet.id,
    creative: { creative_id: creative.id },
    status: "PAUSED",
  });

  return { campaignId: campaign.id, adSetId: adSet.id, adId: ad.id };
}
