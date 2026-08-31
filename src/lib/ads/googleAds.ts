// Creates a geo-targeted Search campaign for one landing page using the
// official google-ads-api client library.
//
// Geo targeting on Google Ads uses numeric "geo target constant" IDs, not
// raw lat/lng — look yours up at
// https://developers.google.com/google-ads/api/data/geotargets (or via
// GeoTargetConstantService.SuggestGeoTargetConstants) and pass the
// resource name (e.g. "geoTargetConstants/1000080" for Tel Aviv) below.
//
// Safety: the campaign is created PAUSED. Review in the Google Ads UI and
// enable it manually — this script never spends money on its own.
import { GoogleAdsApi, enums } from "google-ads-api";

export type GoogleCampaignInput = {
  name: string;
  landingPageUrl: string;
  headline: string;
  description: string;
  geoTargetConstant: string; // e.g. "geoTargetConstants/1000080"
  dailyBudgetMicros: number; // 1 currency unit = 1,000,000 micros
};

function getClient() {
  const client_id = process.env.GOOGLE_ADS_CLIENT_ID;
  const client_secret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const developer_token = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const refresh_token = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const customer_id = process.env.GOOGLE_ADS_CUSTOMER_ID;

  if (!client_id || !client_secret || !developer_token || !refresh_token || !customer_id) {
    throw new Error("Missing GOOGLE_ADS_* environment variables");
  }

  const client = new GoogleAdsApi({ client_id, client_secret, developer_token });
  const customer = client.Customer({ customer_id, refresh_token });
  return customer;
}

export async function createGoogleCampaign(input: GoogleCampaignInput) {
  const customer = getClient();

  const { results: budgetResults } = await customer.campaignBudgets.create([
    {
      name: `${input.name} - budget`,
      amount_micros: input.dailyBudgetMicros,
      delivery_method: enums.BudgetDeliveryMethod.STANDARD,
    },
  ]);
  const budgetResourceName = budgetResults[0].resource_name as string;

  const { results: campaignResults } = await customer.campaigns.create([
    {
      name: `${input.name} - campaign`,
      status: enums.CampaignStatus.PAUSED,
      advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
      campaign_budget: budgetResourceName,
      network_settings: { target_google_search: true, target_search_network: true },
      manual_cpc: {},
    },
  ]);
  const campaignResourceName = campaignResults[0].resource_name as string;

  await customer.campaignCriteria.create([
    {
      campaign: campaignResourceName,
      location: { geo_target_constant: input.geoTargetConstant },
    },
  ]);

  const { results: adGroupResults } = await customer.adGroups.create([
    {
      name: `${input.name} - ad group`,
      campaign: campaignResourceName,
      status: enums.AdGroupStatus.ENABLED,
    },
  ]);
  const adGroupResourceName = adGroupResults[0].resource_name as string;

  await customer.adGroupAds.create([
    {
      ad_group: adGroupResourceName,
      status: enums.AdGroupAdStatus.PAUSED,
      ad: {
        final_urls: [input.landingPageUrl],
        responsive_search_ad: {
          headlines: [{ text: input.headline }],
          descriptions: [{ text: input.description }],
        },
      },
    },
  ]);

  return { campaign: campaignResourceName, adGroup: adGroupResourceName };
}
