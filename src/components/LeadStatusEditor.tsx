"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUSES } from "@/lib/leadStatus";

export function LeadStatusEditor({
  leadId,
  status,
  adminNotes,
}: {
  leadId: string;
  status: string;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [notesValue, setNotesValue] = useState(adminNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function update(data: { status?: string; adminNotes?: string }) {
    setSaving(true);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <select
        value={status}
        disabled={saving}
        onChange={(e) => update({ status: e.target.value })}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <textarea
        rows={2}
        placeholder="Internal notes..."
        value={notesValue}
        onChange={(e) => setNotesValue(e.target.value)}
        onBlur={() => update({ adminNotes: notesValue })}
      />
    </div>
  );
}
