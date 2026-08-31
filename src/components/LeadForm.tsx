"use client";

import { useState } from "react";

export function LeadForm({
  slug,
  region,
  shipmentType,
}: {
  slug: string;
  region: string;
  shipmentType: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg(null);

    const form = new FormData(e.currentTarget);
    const consent = form.get("consent") === "on";
    if (!consent) {
      setStatus("error");
      setErrorMsg("Please accept to be contacted before continuing.");
      return;
    }

    const payload = {
      name: form.get("name"),
      phone: form.get("phone"),
      email: form.get("email") || undefined,
      address: form.get("address") || undefined,
      region,
      shipmentType,
      source: slug,
      consent,
    };

    try {
      const res = await fetch("/api/leads", {
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
        Thanks! We received your details and will get back to you shortly
        with a quote.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lead-form">
      <label>
        Full name
        <input name="name" required minLength={2} />
      </label>
      <label>
        Phone (with country code, e.g. +1 555 123 4567)
        <input name="phone" required pattern="^\+?[0-9\-\s()]{6,}$" />
      </label>
      <label>
        Email (optional)
        <input name="email" type="email" />
      </label>
      <label>
        Address (optional, helps us match a nearby provider)
        <input name="address" />
      </label>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        I agree to be contacted by phone/message about a quote for this
        request
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending..." : "Get a quote"}
      </button>
      {status === "error" && <p className="lead-form-error">{errorMsg}</p>}
    </form>
  );
}
