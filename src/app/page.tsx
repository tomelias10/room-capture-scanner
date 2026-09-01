import Link from "next/link";
import { LANDING_PAGES } from "@/lib/landingPages";
import { SITE_NAME } from "@/lib/site";

const GROUPS: { type: (typeof LANDING_PAGES)[number]["pageType"]; title: string }[] = [
  { type: "hub", title: "Freight forwarding hubs" },
  { type: "route", title: "Shipping from China" },
  { type: "service", title: "By shipping method" },
];

export default function HomePage() {
  return (
    <main className="page">
      <div className="hero">
        <h1>{SITE_NAME}</h1>
        <p>
          Need to move cargo internationally? Tell us your shipment and get
          connected with freight options - sea, air, FCL, LCL, and more.
        </p>
        <p>
          <a href="#pages">Browse routes and services ↓</a> ·{" "}
          <Link href="/blog">Guides & articles →</Link>
        </p>
      </div>

      <div id="pages">
        {GROUPS.map((group) => {
          const pages = LANDING_PAGES.filter((p) => p.pageType === group.type);
          return (
            <section key={group.type} style={{ marginTop: 28 }}>
              <h2>{group.title}</h2>
              <div className="index-list">
                {pages.map((p) => (
                  <Link key={p.slug} href={`/lp/${p.slug}`}>
                    {p.h1}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
