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
        <h1>Leads</h1>
        <p>{leads.length} recent leads</p>
      </div>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Region</th>
              <th>Country</th>
              <th>Shipment type</th>
              <th>Source</th>
              <th>Matched supplier</th>
              <th>Est. commission</th>
              <th>Deal status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.createdAt.toLocaleString("en-US")}</td>
                <td>{lead.name}</td>
                <td>{lead.phone}</td>
                <td>{lead.region}</td>
                <td>{lead.country ?? "-"}</td>
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
