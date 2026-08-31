import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { deal: { include: { supplier: true } } },
    take: 200,
  });

  return (
    <main className="page">
      <div className="hero">
        <h1>לידים</h1>
        <p>{leads.length} לידים אחרונים</p>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>תאריך</th>
              <th>שם</th>
              <th>טלפון</th>
              <th>אזור</th>
              <th>סוג משלוח</th>
              <th>מקור</th>
              <th>ספק מותאם</th>
              <th>עמלה משוערת</th>
              <th>סטטוס עסקה</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.createdAt.toLocaleString("he-IL")}</td>
                <td>{lead.name}</td>
                <td>{lead.phone}</td>
                <td>{lead.region}</td>
                <td>{lead.shipmentType}</td>
                <td>{lead.source}</td>
                <td>{lead.deal?.supplier.name ?? "-"}</td>
                <td>
                  {lead.deal
                    ? `${Math.round(lead.deal.commissionPct * 100)}%`
                    : "-"}
                </td>
                <td>{lead.deal?.status ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
