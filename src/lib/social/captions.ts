// Caption variety so scheduled posts to the business's own channels don't
// look like duplicate spam - rotate the opening line per post.
import { LandingPage } from "@/lib/landingPages";
import { BlogPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const OPENERS = [
  "Shipping cargo?",
  "New guide:",
  "Quick question:",
  "Moving freight?",
  "Update:",
];

export function generateLandingPageCaption(
  page: LandingPage,
  variantIndex: number,
): string {
  const opener = OPENERS[variantIndex % OPENERS.length];
  return `${opener} ${page.h1}\n\n${page.metaDescription}\n\nRequest a quote: ${SITE_URL}/lp/${page.slug}`;
}

export function generateBlogCaption(post: BlogPost): string {
  return `${post.title}\n\n${post.description}\n\nRead the full guide: ${SITE_URL}/blog/${post.slug}`;
}
