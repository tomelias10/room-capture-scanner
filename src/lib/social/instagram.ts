// Posts to the business's own Instagram professional account, linked to
// its Facebook Page, via the official Instagram Graph API (two-step
// container -> publish flow). Requires an image URL - Instagram does not
// support text-only feed posts.
//
// Requires INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID.

export async function postToInstagram(input: {
  imageUrl: string;
  caption: string;
}): Promise<{ id: string }> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !igUserId) {
    throw new Error(
      "Missing INSTAGRAM_ACCESS_TOKEN / INSTAGRAM_BUSINESS_ACCOUNT_ID",
    );
  }

  const createRes = await fetch(
    `https://graph.facebook.com/v20.0/${igUserId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: input.imageUrl,
        caption: input.caption,
        access_token: token,
      }),
    },
  );
  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(`Instagram media create failed: ${JSON.stringify(createData)}`);
  }

  const publishRes = await fetch(
    `https://graph.facebook.com/v20.0/${igUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: token,
      }),
    },
  );
  const publishData = await publishRes.json();
  if (!publishRes.ok) {
    throw new Error(`Instagram publish failed: ${JSON.stringify(publishData)}`);
  }

  return { id: publishData.id };
}
