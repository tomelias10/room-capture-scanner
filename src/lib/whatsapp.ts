// Instant WhatsApp notification via the official Meta WhatsApp Cloud API.
// Requires WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and ADMIN_WHATSAPP_NUMBER.
//
// Note: outside a 24h customer-service session window, Cloud API requires a
// pre-approved message template rather than free-form text. Create a
// "new_lead_alert" template in Meta Business Manager and swap the body below
// for a template call (see commented example) once you have one approved.

export async function notifyNewLead(details: {
  name: string;
  phone: string;
  region: string;
  shipmentType: string;
  supplierName?: string;
}) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;

  if (!token || !phoneNumberId || !adminNumber) {
    console.warn("WhatsApp env vars not set, skipping lead notification");
    return;
  }

  const text = [
    "ליד חדש!",
    `שם: ${details.name}`,
    `טלפון: ${details.phone}`,
    `אזור: ${details.region}`,
    `סוג משלוח: ${details.shipmentType}`,
    details.supplierName ? `ספק מותאם: ${details.supplierName}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: adminNumber,
        type: "text",
        text: { body: text },

        // Template alternative once "new_lead_alert" is approved:
        // type: "template",
        // template: {
        //   name: "new_lead_alert",
        //   language: { code: "he" },
        //   components: [{ type: "body", parameters: [...] }],
        // },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("WhatsApp notification failed", res.status, body);
  }
}
