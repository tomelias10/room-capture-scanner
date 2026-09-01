// Shared shipment-option constants. Kept in their own module (no prisma
// import) so client components (the form) and server-only code (the lead
// pipeline) can both import it safely.
export const MODES = ["sea", "air", "road", "rail", "not_sure"] as const;
export const CONTAINERS = ["LCL", "20GP", "40GP", "40HQ", "not_sure"] as const;
export const INCOTERMS = ["EXW", "FCA", "FOB", "CIF", "DAP", "DDP", "not_sure"] as const;
