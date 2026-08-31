// Seeds a 30-day organic content calendar rotating across the business's
// own Facebook Page, Instagram, and Google Business Profile - cycling
// through all landing pages plus the blog articles. Run once (or whenever
// you want to queue up another month):
//   npm run content:calendar
import { PrismaClient } from "@prisma/client";
import { LANDING_PAGES } from "../src/lib/landingPages";
import { BLOG_POSTS } from "../src/lib/blog";
import { generateLandingPageCaption, generateBlogCaption } from "../src/lib/social/captions";
import { SITE_URL } from "../src/lib/site";

const prisma = new PrismaClient();

const DAYS = 30;
const PLATFORMS = ["facebook_page", "instagram", "google_business"] as const;

async function main() {
  const startDate = new Date();
  startDate.setHours(9, 0, 0, 0);

  const rows = [];

  for (let i = 0; i < DAYS; i++) {
    const platform = PLATFORMS[i % PLATFORMS.length];
    const scheduledFor = new Date(startDate);
    scheduledFor.setDate(startDate.getDate() + i);

    const isBlogDay = i % 5 === 4;

    if (isBlogDay) {
      const post = BLOG_POSTS[Math.floor(i / 5) % BLOG_POSTS.length];
      rows.push({
        platform,
        content: generateBlogCaption(post),
        linkUrl: `${SITE_URL}/blog/${post.slug}`,
        landingSlug: null,
        imageUrl: platform === "instagram" ? `${SITE_URL}/og-image.jpg` : null,
        scheduledFor,
      });
    } else {
      const page = LANDING_PAGES[i % LANDING_PAGES.length];
      rows.push({
        platform,
        content: generateLandingPageCaption(page, i),
        linkUrl: `${SITE_URL}/lp/${page.slug}`,
        landingSlug: page.slug,
        imageUrl: platform === "instagram" ? `${SITE_URL}/og-image.jpg` : null,
        scheduledFor,
      });
    }
  }

  await prisma.socialPost.createMany({ data: rows });
  console.log(`Queued ${rows.length} organic posts across ${PLATFORMS.length} channels.`);
  console.log(
    "Note: Instagram posts need a real public image URL - replace the og-image.jpg placeholder before they run.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
