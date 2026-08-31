import { notFound } from "next/navigation";
import { Metadata } from "next";
import { LANDING_PAGES, getLandingPage } from "@/lib/landingPages";
import { LeadForm } from "@/components/LeadForm";
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

  const title = page.shipmentType.headline(page.city.name);
  const description = page.shipmentType.description(page.city.name);
  const url = `${SITE_URL}/lp/${page.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, locale: "he_IL" },
  };
}

export default function LandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = getLandingPage(params.slug);
  if (!page) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.shipmentType.headline(page.city.name),
    description: page.shipmentType.description(page.city.name),
    areaServed: { "@type": "City", name: page.city.name },
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="page">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="hero">
        <h1>{page.shipmentType.headline(page.city.name)}</h1>
        <p>{page.shipmentType.description(page.city.name)}</p>
      </div>
      <div className="card">
        <LeadForm
          slug={page.slug}
          region={page.city.name}
          shipmentType={page.shipmentType.id}
        />
      </div>
    </main>
  );
}
