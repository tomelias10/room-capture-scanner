import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { LANDING_PAGES, getLandingPage } from "@/lib/landingPages";
import { FreightRequestForm } from "@/components/FreightRequestForm";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const page = getLandingPage(params.slug);
  if (!page) return {};

  const url = `${SITE_URL}/lp/${page.slug}`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
    },
  };
}

export default function LandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = getLandingPage(params.slug);
  if (!page) notFound();

  const url = `${SITE_URL}/lp/${page.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: page.h1, item: url },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.h1,
    description: page.metaDescription,
    url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  // FAQPage rich results were deprecated by Google in May 2026, but the
  // schema is still valid markup and helps AI answer engines/agents parse
  // the page's Q&A content directly (see README GEO section).
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="page">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / {page.h1}
      </nav>

      <div className="hero">
        <h1>{page.h1}</h1>
      </div>

      {page.intro.map((p, i) => (
        <p key={i} style={{ lineHeight: 1.7 }}>
          {p}
        </p>
      ))}

      <div className="card" id="request-quote" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Request a Freight Quote</h2>
        <FreightRequestForm slug={page.slug} prefill={page.prefill} />
      </div>

      {page.faqs.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Frequently asked questions</h2>
          <dl className="faq-list">
            {page.faqs.map((f, i) => (
              <div key={i}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </main>
  );
}
