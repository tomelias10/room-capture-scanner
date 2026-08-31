// Publishes every due SocialPost row to its channel. Meant to run on a
// schedule (cron, Vercel Cron Job, GitHub Actions scheduled workflow) -
// e.g. hourly. Only ever posts to accounts/pages the business itself owns.
//   npm run content:post
import { PrismaClient } from "@prisma/client";
import { postToFacebookPage } from "../src/lib/social/facebookPage";
import { postToInstagram } from "../src/lib/social/instagram";
import { postGoogleBusinessUpdate } from "../src/lib/social/googleBusinessProfile";

const prisma = new PrismaClient();

async function main() {
  const due = await prisma.socialPost.findMany({
    where: { status: "pending", scheduledFor: { lte: new Date() } },
    orderBy: { scheduledFor: "asc" },
  });

  console.log(`${due.length} post(s) due`);

  for (const post of due) {
    try {
      let externalId: string;

      switch (post.platform) {
        case "facebook_page": {
          const result = await postToFacebookPage({
            message: post.content,
            link: post.linkUrl ?? undefined,
            imageUrl: post.imageUrl ?? undefined,
          });
          externalId = result.id;
          break;
        }
        case "instagram": {
          if (!post.imageUrl) throw new Error("Instagram post is missing an image URL");
          const result = await postToInstagram({
            imageUrl: post.imageUrl,
            caption: post.content,
          });
          externalId = result.id;
          break;
        }
        case "google_business": {
          const result = await postGoogleBusinessUpdate({
            summary: post.content,
            ctaUrl: post.linkUrl ?? undefined,
          });
          externalId = result.name;
          break;
        }
        default:
          throw new Error(`Unknown platform: ${post.platform}`);
      }

      await prisma.socialPost.update({
        where: { id: post.id },
        data: { status: "posted", externalId, postedAt: new Date() },
      });
      console.log(`[${post.platform}] posted ${post.id} -> ${externalId}`);
    } catch (err) {
      const failureReason = err instanceof Error ? err.message : String(err);
      await prisma.socialPost.update({
        where: { id: post.id },
        data: { status: "failed", failureReason },
      });
      console.error(`[${post.platform}] failed ${post.id}:`, failureReason);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
