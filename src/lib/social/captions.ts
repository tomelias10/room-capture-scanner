// Caption variety so scheduled posts to the business's own channels don't
// look like duplicate spam - rotate the opening line per post.
import { LandingPageConfig } from "@/lib/landingPages";
import { BlogPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

const OPENERS = [
  "מחפשים",
  "צריכים",
  "יוצאים לדרך עם",
  "השוואת מחירים ל",
  "עדכון:",
];

export function generateLandingPageCaption(
  page: LandingPageConfig,
  variantIndex: number,
): string {
  const opener = OPENERS[variantIndex % OPENERS.length];
  const headline = page.shipmentType.headline(page.city.name);
  const description = page.shipmentType.description(page.city.name);
  return `${opener} ${page.shipmentType.label} ב${page.city.name}?\n\n${headline}\n${description}\n\nלהצעת מחיר: ${SITE_URL}/lp/${page.slug}`;
}

export function generateBlogCaption(post: BlogPost): string {
  return `${post.title}\n\n${post.description}\n\nקראו את המדריך המלא: ${SITE_URL}/blog/${post.slug}`;
}
