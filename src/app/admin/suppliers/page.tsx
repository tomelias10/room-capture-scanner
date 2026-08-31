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
        <h1>ספקים</h1>
        <p>{suppliers.length} ספקים רשומים</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <SupplierForm />
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>שם</th>
              <th>טלפון</th>
              <th>קטגוריה</th>
              <th>עמלה</th>
              <th>מיקום</th>
              <th>פעיל</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.category}</td>
                <td>{Math.round(s.commissionPct * 100)}%</td>
                <td>
                  {s.lat.toFixed(3)}, {s.lng.toFixed(3)}
                </td>
                <td>{s.active ? "כן" : "לא"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
