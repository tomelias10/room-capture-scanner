import { prisma } from "@/lib/prisma";
import { SupplierForm } from "@/components/SupplierForm";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="page">
      <div className="hero">
        <h1>Suppliers</h1>
        <p>{suppliers.length} registered suppliers</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <SupplierForm />
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Country</th>
              <th>Commission</th>
              <th>Location</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.category}</td>
                <td>{s.country}</td>
                <td>{Math.round(s.commissionPct * 100)}%</td>
                <td>
                  {s.lat.toFixed(3)}, {s.lng.toFixed(3)}
                </td>
                <td>{s.active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
