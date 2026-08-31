import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import { LANDING_PAGES } from "@/lib/landingPages";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getBlogPost(decodeURIComponent(params.slug));
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      type: "article",
      locale: "en_US",
    },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(decodeURIComponent(params.slug));
  if (!post) notFound();

  const relatedPages = LANDING_PAGES.filter(
    (p) => p.shipmentType.id === post.relatedShipmentType,
  ).slice(0, 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <main className="page">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="hero">
        <h1>{post.title}</h1>
        <p>{new Date(post.publishedAt).toLocaleDateString("en-US")}</p>
      </div>
      <article className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {post.paragraphs.map((p, i) => (
          <p key={i} style={{ lineHeight: 1.7, margin: 0 }}>
            {p}
          </p>
        ))}
      </article>

      {relatedPages.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0 }}>Get a quote in your area</h3>
          <div className="index-list">
            {relatedPages.map((p) => (
              <Link key={p.slug} href={`/lp/${p.slug}`}>
                {p.shipmentType.label} · {p.city.name}, {p.city.country}
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
