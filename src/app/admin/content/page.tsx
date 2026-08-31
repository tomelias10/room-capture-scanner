import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const posts = await prisma.socialPost.findMany({
    orderBy: { scheduledFor: "desc" },
    take: 200,
  });

  return (
    <main className="page">
      <div className="hero">
        <h1>Organic content calendar</h1>
        <p>
          {posts.length} posts scheduled for your own Facebook Page,
          Instagram, and Google Business Profile.
        </p>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Scheduled for</th>
              <th>Channel</th>
              <th>Content</th>
              <th>Status</th>
              <th>Posted at</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.scheduledFor.toLocaleString("en-US")}</td>
                <td>{post.platform}</td>
                <td style={{ maxWidth: 360, whiteSpace: "pre-wrap" }}>
                  {post.content.slice(0, 120)}
                  {post.content.length > 120 ? "…" : ""}
                </td>
                <td>{post.status}</td>
                <td>{post.postedAt ? post.postedAt.toLocaleString("en-US") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
