import { notFound } from "next/navigation";
import { LANDING_PAGES, getLandingPage } from "@/lib/landingPages";
import { LeadForm } from "@/components/LeadForm";

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export default function LandingPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = getLandingPage(params.slug);
  if (!page) notFound();

  return (
    <main className="page">
      <div className="hero">
        <h1>{page.shipmentType.headline(page.city.name)}</h1>
        <p>השאירו פרטים וספק מקומי מאומת יחזור אליכם עם הצעת מחיר.</p>
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
