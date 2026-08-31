import Link from "next/link";
import { LANDING_PAGES } from "@/lib/landingPages";

export default function HomePage() {
  return (
    <main className="page">
      <div className="hero">
        <h1>Delivery Leads Platform</h1>
        <p>
          {LANDING_PAGES.length} city + shipment-type landing pages for
          testing and linking from campaigns.
        </p>
        <p>
          <Link href="/blog">Guides & articles →</Link>
        </p>
      </div>
      <div className="index-list">
        {LANDING_PAGES.map((p) => (
          <Link key={p.slug} href={`/lp/${p.slug}`}>
            {p.shipmentType.label} · {p.city.name}, {p.city.country}
          </Link>
        ))}
      </div>
    </main>
  );
}
