// Caption variety so scheduled posts to the business's own channels don't
// look like duplicate spam - rotate the opening line per post.
import { LandingPageConfig } from "@/lib/landingPages";
import { BlogPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const OPENERS = [
  "Looking for",
  "Need",
  "Getting started with",
  "Compare quotes for",
  "Update:",
];

export function generateLandingPageCaption(
  page: LandingPageConfig,
  variantIndex: number,
): string {
  const opener = OPENERS[variantIndex % OPENERS.length];
  const headline = page.shipmentType.headline(page.city.name);
  const description = page.shipmentType.description(page.city.name);
  return `${opener} ${page.shipmentType.label} in ${page.city.name}, ${page.city.country}?\n\n${headline}\n${description}\n\nGet a quote: ${SITE_URL}/lp/${page.slug}`;
}

export function generateBlogCaption(post: BlogPost): string {
  return `${post.title}\n\n${post.description}\n\nRead the full guide: ${SITE_URL}/blog/${post.slug}`;
}
