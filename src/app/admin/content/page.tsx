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
        <h1>לוח תוכן אורגני</h1>
        <p>
          {posts.length} פוסטים מתוזמנים לעמוד הפייסבוק, האינסטגרם ופרופיל
          העסק בגוגל שבבעלותכם.
        </p>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>מתוזמן ל</th>
              <th>ערוץ</th>
              <th>תוכן</th>
              <th>סטטוס</th>
              <th>פורסם ב</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.scheduledFor.toLocaleString("he-IL")}</td>
                <td>{post.platform}</td>
                <td style={{ maxWidth: 360, whiteSpace: "pre-wrap" }}>
                  {post.content.slice(0, 120)}
                  {post.content.length > 120 ? "…" : ""}
                </td>
                <td>{post.status}</td>
                <td>{post.postedAt ? post.postedAt.toLocaleString("he-IL") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
