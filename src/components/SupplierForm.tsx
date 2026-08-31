"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SHIPMENT_TYPES } from "@/lib/landingPages";

export function SupplierForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("saving");
    const form = new FormData(e.currentTarget);

    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      category: form.get("category"),
      commissionPct: Number(form.get("commissionPct")) / 100,
      lat: Number(form.get("lat")),
      lng: Number(form.get("lng")),
    };

    const res = await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      (e.target as HTMLFormElement).reset();
      setStatus("idle");
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="lead-form" dir="rtl">
      <label>
        שם ספק
        <input name="name" required />
      </label>
      <label>
        טלפון
        <input name="phone" required />
      </label>
      <label>
        קטגוריה
        <select name="category" required defaultValue="">
          <option value="" disabled>
            בחר סוג משלוח
          </option>
          {SHIPMENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        אחוז עמלה (%)
        <input name="commissionPct" type="number" min={0} max={100} step={1} required />
      </label>
      <label>
        Latitude
        <input name="lat" type="number" step="any" required />
      </label>
      <label>
        Longitude
        <input name="lng" type="number" step="any" required />
      </label>
      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "שומר..." : "הוסף ספק"}
      </button>
      {status === "error" && <p className="lead-form-error">שמירה נכשלה</p>}
    </form>
  );
}
