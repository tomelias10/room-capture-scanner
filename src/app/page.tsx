import Link from "next/link";
import { LANDING_PAGES } from "@/lib/landingPages";

export default function HomePage() {
  return (
    <main className="page">
      <div className="hero">
        <h1>פלטפורמת לידים למשלוחים</h1>
        <p>
          {LANDING_PAGES.length} דפי נחיתה ממוקדי עיר וסוג משלוח, לבדיקה
          ולקישור מקמפיינים ממומנים.
        </p>
        <p>
          <Link href="/blog">מדריכים ומאמרים →</Link>
        </p>
      </div>
      <div className="index-list">
        {LANDING_PAGES.map((p) => (
          <Link key={p.slug} href={`/lp/${p.slug}`}>
            {p.shipmentType.label} · {p.city.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
