import Link from "next/link";
import { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "מדריכים ומאמרים | פלטפורמת לידים למשלוחים",
  description: "מדריכים על הובלות, משלוחים מקומיים ובינלאומיים ולוגיסטיקה עסקית.",
};

export default function BlogIndexPage() {
  return (
    <main className="page">
      <div className="hero">
        <h1>מדריכים ומאמרים</h1>
        <p>כל מה שכדאי לדעת לפני שמזמינים משלוח או הובלה.</p>
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <h3 style={{ margin: "0 0 4px" }}>{post.title}</h3>
            <p style={{ margin: 0, color: "var(--muted)" }}>{post.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
