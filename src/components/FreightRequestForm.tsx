"use client";

import { useState } from "react";
import { MODES, CONTAINERS, INCOTERMS } from "@/lib/mode-types";
import type { Prefill } from "@/lib/landingPages";

const MODE_LABELS: Record<(typeof MODES)[number], string> = {
  sea: "Sea",
  air: "Air",
  road: "Road",
  rail: "Rail",
  not_sure: "Not sure",
};

export function FreightRequestForm({
  slug,
  prefill,
}: {
  slug: string;
  prefill?: Prefill;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    // Honeypot: real visitors never see or fill this field.
    if ((form.get("website") as string)?.trim()) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    setErrorMsg(null);

    const consent = form.get("consent") === "on";
    if (!consent) {
      setStatus("error");
      setErrorMsg("Please accept to be contacted before continuing.");
      return;
    }

    const num = (name: string) => {
      const v = form.get(name);
      if (!v || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const str = (name: string) => {
      const v = (form.get(name) as string)?.trim();
      return v ? v : undefined;
    };

    const payload = {
      contactName: form.get("contactName"),
      company: str("company"),
      email: form.get("email"),
      phone: form.get("phone"),
      originCountry: form.get("originCountry"),
      originCity: str("originCity"),
      destinationCountry: form.get("destinationCountry"),
      destinationCity: str("destinationCity"),
      cargo: form.get("cargo"),
      quantity: str("quantity"),
      weightKg: num("weightKg"),
      cbm: num("cbm"),
      packageCount: num("packageCount"),
      mode: form.get("mode"),
      container: str("container"),
      incoterm: str("incoterm"),
      cargoReadyDate: str("cargoReadyDate"),
      specialRequirements: str("specialRequirements"),
      notes: str("notes"),
      consent,
      sourceSlug: slug,
      sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      channel: "web",
    };

    try {
      const res = await fetch("/api/freight-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (status === "sent") {
    return (
      <p className="lead-form-success">
        Thanks! Your freight request has been received. We&apos;ll review it
        and get back to you shortly.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lead-form">
      {/* Honeypot - hidden from real visitors, tempting to bots */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <h3>Contact</h3>
      <label>
        Full name
        <input name="contactName" required minLength={2} />
      </label>
      <label>
        Company (optional)
        <input name="company" />
      </label>
      <label>
        Business email
        <input name="email" type="email" required />
      </label>
      <label>
        Phone / WhatsApp
        <input name="phone" required pattern="^\+?[0-9\-\s()]{6,}$" />
      </label>

      <h3>Shipment</h3>
      <div className="form-row">
        <label>
          Origin country
          <input name="originCountry" required defaultValue={prefill?.originCountry} />
        </label>
        <label>
          Origin city / port (optional)
          <input name="originCity" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Destination country
          <input name="destinationCountry" required defaultValue={prefill?.destinationCountry} />
        </label>
        <label>
          Destination city / port (optional)
          <input name="destinationCity" />
        </label>
      </div>
      <label>
        Cargo / commodity
        <input name="cargo" required placeholder="e.g. Furniture, electronics, machine parts" />
      </label>
      <div className="form-row">
        <label>
          Quantity (optional)
          <input name="quantity" placeholder="e.g. 200 units" />
        </label>
        <label>
          Total weight, kg (optional)
          <input name="weightKg" type="number" min={0} step="any" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Volume, CBM (optional)
          <input name="cbm" type="number" min={0} step="any" />
        </label>
        <label>
          Pallets / cartons (optional)
          <input name="packageCount" type="number" min={0} step={1} />
        </label>
      </div>
      <label>
        Shipping mode
        <select name="mode" required defaultValue={prefill?.mode ?? ""}>
          <option value="" disabled>
            Select a mode
          </option>
          {MODES.map((m) => (
            <option key={m} value={m}>
              {MODE_LABELS[m]}
            </option>
          ))}
        </select>
      </label>
      <div className="form-row">
        <label>
          Container (optional)
          <select name="container" defaultValue="">
            <option value="">Not applicable</option>
            {CONTAINERS.map((c) => (
              <option key={c} value={c}>
                {c === "not_sure" ? "Not sure" : c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Incoterm (optional)
          <select name="incoterm" defaultValue={prefill?.incoterm ?? ""}>
            <option value="">Not applicable</option>
            {INCOTERMS.map((i) => (
              <option key={i} value={i}>
                {i === "not_sure" ? "Not sure" : i}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Cargo ready date (optional)
        <input name="cargoReadyDate" placeholder="e.g. 2026-10-15 or 'in 3 weeks'" />
      </label>
      <label>
        Special requirements (optional)
        <input name="specialRequirements" placeholder="e.g. temperature control, hazardous goods" />
      </label>
      <label>
        Additional notes (optional)
        <textarea name="notes" rows={3} />
      </label>

      <label className="consent">
        <input type="checkbox" name="consent" required />
        I agree to be contacted by phone/email/WhatsApp about this freight
        request
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Request a Freight Quote"}
      </button>
      {status === "error" && <p className="lead-form-error">{errorMsg}</p>}
    </form>
  );
}
