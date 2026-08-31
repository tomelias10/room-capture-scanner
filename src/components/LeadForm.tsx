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
      setErrorMsg("יש לאשר קבלת פנייה כדי להמשיך.");
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
        throw new Error(data.error || "שליחה נכשלה");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "שליחה נכשלה");
    }
  }

  if (status === "sent") {
    return (
      <p className="lead-form-success">
        תודה! קיבלנו את הפרטים ונחזור אליך בהקדם עם הצעת מחיר.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lead-form" dir="rtl">
      <label>
        שם מלא
        <input name="name" required minLength={2} />
      </label>
      <label>
        טלפון
        <input name="phone" required pattern="^0[0-9\-\s]{8,}$" />
      </label>
      <label>
        אימייל (לא חובה)
        <input name="email" type="email" />
      </label>
      <label>
        כתובת (אופציונלי, עוזר להתאים ספק קרוב)
        <input name="address" />
      </label>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        אני מאשר/ת קבלת פנייה טלפונית/הודעה לגבי הצעת מחיר בנושא זה
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "שולח..." : "קבל הצעת מחיר"}
      </button>
      {status === "error" && <p className="lead-form-error">{errorMsg}</p>}
    </form>
  );
}
