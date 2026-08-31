// Posts to a Facebook Page the business owns and administers, via the
// official Graph API and a Page Access Token. This is standard business
// page management - not automated posting into groups or other people's
// timelines, which stays out of scope for legal/ToS reasons.
//
// Requires FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID.

export async function postToFacebookPage(input: {
  message: string;
  link?: string;
  imageUrl?: string;
}): Promise<{ id: string }> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!token || !pageId) {
    throw new Error("Missing FACEBOOK_PAGE_ACCESS_TOKEN / FACEBOOK_PAGE_ID");
  }

  const endpoint = input.imageUrl
    ? `https://graph.facebook.com/v20.0/${pageId}/photos`
    : `https://graph.facebook.com/v20.0/${pageId}/feed`;

  const body = input.imageUrl
    ? { url: input.imageUrl, caption: input.message, access_token: token }
    : {
        message: input.message,
        ...(input.link ? { link: input.link } : {}),
        access_token: token,
      };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Facebook Page post failed: ${JSON.stringify(data)}`);
  }
  return { id: data.id ?? data.post_id };
}
