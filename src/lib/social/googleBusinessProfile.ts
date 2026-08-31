// Publishes a "Google Post" update to the business's own Google Business
// Profile listing, via the official Business Profile API. This shows up
// organically on the business's Google Maps/Search listing - free, and
// entirely within Google's own rules for a listing you manage.
//
// One-time setup (can't be automated - Google requires human OAuth consent):
// 1. Create an OAuth2 client in Google Cloud Console (scope:
//    https://www.googleapis.com/auth/business.manage) and enable the
//    "Business Profile API" / "My Business API".
// 2. Complete the OAuth consent flow once as the profile owner to obtain a
//    refresh token, and set GOOGLE_BUSINESS_CLIENT_ID/SECRET/REFRESH_TOKEN.
// 3. Find your account/location IDs (accounts.list / accounts.locations.list)
//    and set GOOGLE_BUSINESS_ACCOUNT_ID / GOOGLE_BUSINESS_LOCATION_ID.

async function getAccessToken(): Promise<string> {
  const client_id = process.env.GOOGLE_BUSINESS_CLIENT_ID;
  const client_secret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const refresh_token = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;

  if (!client_id || !client_secret || !refresh_token) {
    throw new Error(
      "Missing GOOGLE_BUSINESS_CLIENT_ID / GOOGLE_BUSINESS_CLIENT_SECRET / GOOGLE_BUSINESS_REFRESH_TOKEN",
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google OAuth token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token as string;
}

export async function postGoogleBusinessUpdate(input: {
  summary: string;
  ctaUrl?: string;
}): Promise<{ name: string }> {
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;

  if (!accountId || !locationId) {
    throw new Error(
      "Missing GOOGLE_BUSINESS_ACCOUNT_ID / GOOGLE_BUSINESS_LOCATION_ID",
    );
  }

  const accessToken = await getAccessToken();

  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/localPosts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        languageCode: "he",
        topicType: "STANDARD",
        summary: input.summary,
        ...(input.ctaUrl
          ? { callToAction: { actionType: "LEARN_MORE", url: input.ctaUrl } }
          : {}),
      }),
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google Business post failed: ${JSON.stringify(data)}`);
  }
  return { name: data.name };
}
