import Link from "next/link";
import { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Guides & Articles | Delivery Leads Platform",
  description: "Guides on moving, local and international shipping, and business logistics.",
};

export default function BlogIndexPage() {
  return (
    <main className="page">
      <div className="hero">
        <h1>Guides & Articles</h1>
        <p>Everything worth knowing before you book a delivery or a move.</p>
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
