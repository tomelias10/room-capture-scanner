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
      country: form.get("country"),
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
    <form onSubmit={handleSubmit} className="lead-form">
      <label>
        Supplier name
        <input name="name" required />
      </label>
      <label>
        Phone
        <input name="phone" required />
      </label>
      <label>
        Category
        <select name="category" required defaultValue="">
          <option value="" disabled>
            Select a shipment type
          </option>
          {SHIPMENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Country
        <input name="country" required placeholder="e.g. United States" />
      </label>
      <label>
        Commission (%)
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
        {status === "saving" ? "Saving..." : "Add supplier"}
      </button>
      {status === "error" && <p className="lead-form-error">Save failed</p>}
    </form>
  );
}
