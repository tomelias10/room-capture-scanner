import { prisma } from "@/lib/prisma";
import { LeadStatusEditor } from "@/components/LeadStatusEditor";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="page" style={{ maxWidth: 960 }}>
      <div className="hero">
        <h1>Freight Leads</h1>
        <p>{leads.length} leads · private, not indexed, requires authentication</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {leads.map((lead) => (
          <div key={lead.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div>
                <strong>{lead.contactName}</strong>
                {lead.company ? ` · ${lead.company}` : ""}
                <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  {lead.email} · {lead.phone}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "0.85rem", color: "var(--muted)" }}>
                {lead.createdAt.toLocaleString("en-US")}
                <div>
                  Source: {lead.sourceSlug ?? "-"} ({lead.channel})
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.9rem", marginBottom: 12 }}>
              <div>
                <div style={{ color: "var(--muted)" }}>Route</div>
                {lead.originCity ? `${lead.originCity}, ` : ""}
                {lead.originCountry} → {lead.destinationCity ? `${lead.destinationCity}, ` : ""}
                {lead.destinationCountry}
              </div>
              <div>
                <div style={{ color: "var(--muted)" }}>Cargo</div>
                {lead.cargo}
                {lead.quantity ? ` (${lead.quantity})` : ""}
              </div>
              <div>
                <div style={{ color: "var(--muted)" }}>Mode / container / incoterm</div>
                {lead.mode} / {lead.container ?? "-"} / {lead.incoterm ?? "-"}
              </div>
              <div>
                <div style={{ color: "var(--muted)" }}>Weight / CBM / packages</div>
                {lead.weightKg ?? "-"} kg / {lead.cbm ?? "-"} CBM / {lead.packageCount ?? "-"}
              </div>
              {lead.cargoReadyDate && (
                <div>
                  <div style={{ color: "var(--muted)" }}>Cargo ready</div>
                  {lead.cargoReadyDate}
                </div>
              )}
              {lead.sourceUrl && (
                <div>
                  <div style={{ color: "var(--muted)" }}>Source URL</div>
                  <span style={{ wordBreak: "break-all" }}>{lead.sourceUrl}</span>
                </div>
              )}
              {lead.specialRequirements && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ color: "var(--muted)" }}>Special requirements</div>
                  {lead.specialRequirements}
                </div>
              )}
              {lead.notes && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ color: "var(--muted)" }}>Notes from requester</div>
                  {lead.notes}
                </div>
              )}
            </div>

            <LeadStatusEditor leadId={lead.id} status={lead.status} adminNotes={lead.adminNotes} />
          </div>
        ))}

        {leads.length === 0 && <p style={{ color: "var(--muted)" }}>No leads yet.</p>}
      </div>
    </main>
  );
}
