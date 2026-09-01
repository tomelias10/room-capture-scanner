// The single freight-lead pipeline. The landing-page form, the REST
// endpoint, and the MCP tool all call createFreightLead() so there is
// exactly one validation path and one database write path - never two
// parallel lead systems.
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/whatsapp";
import { MODES, CONTAINERS, INCOTERMS } from "@/lib/mode-types";

// Field descriptions double as documentation for human devs and as the
// schema an MCP client/agent sees when it introspects the
// create_freight_request tool - see src/app/api/mcp/route.ts.
export const freightRequestSchema = z.object({
  // Contact
  contactName: z.string().trim().min(2).max(200).describe("Full name of the contact person"),
  company: z.string().trim().max(200).optional().describe("Company name, if shipping on behalf of a business"),
  email: z.string().trim().email().describe("Business email address to send the quote to"),
  phone: z.string().trim().min(6).max(40).describe("Phone or WhatsApp number, with country code"),

  // Shipment
  originCountry: z.string().trim().min(2).max(100).describe("Country the cargo ships from"),
  originCity: z.string().trim().max(100).optional().describe("Origin city or port, if known"),
  destinationCountry: z.string().trim().min(2).max(100).describe("Country the cargo ships to"),
  destinationCity: z.string().trim().max(100).optional().describe("Destination city or port, if known"),
  cargo: z.string().trim().min(2).max(300).describe("What the cargo is, e.g. 'furniture' or 'electronics components'"),
  quantity: z.string().trim().max(100).optional().describe("Quantity, e.g. '200 units' or '10 pallets'"),
  weightKg: z.number().positive().max(1_000_000).optional().describe("Total shipment weight in kilograms"),
  cbm: z.number().positive().max(100_000).optional().describe("Total shipment volume in cubic meters (CBM)"),
  packageCount: z.number().int().positive().max(1_000_000).optional().describe("Number of pallets or cartons"),
  mode: z.enum(MODES).describe("Preferred shipping mode: sea, air, road, rail, or not_sure"),
  container: z.enum(CONTAINERS).optional().describe("Container type for sea freight: LCL, 20GP, 40GP, 40HQ, or not_sure"),
  incoterm: z.enum(INCOTERMS).optional().describe("Incoterm: EXW, FCA, FOB, CIF, DAP, DDP, or not_sure"),
  cargoReadyDate: z.string().trim().max(40).optional().describe("Date the cargo will be ready for collection"),
  specialRequirements: z.string().trim().max(1000).optional().describe("Special handling needs, e.g. temperature control or hazardous goods"),
  notes: z.string().trim().max(2000).optional().describe("Any other relevant details"),

  consent: z.literal(true).describe("Must be true - confirms the contact agreed to be reached about this request"),
});

export type FreightRequestInput = z.infer<typeof freightRequestSchema>;

export async function createFreightLead(
  data: FreightRequestInput,
  meta: { sourceSlug?: string; sourceUrl?: string; channel: "web" | "api" | "mcp" },
) {
  const lead = await prisma.lead.create({
    data: {
      contactName: data.contactName,
      company: data.company,
      email: data.email,
      phone: data.phone,
      originCountry: data.originCountry,
      originCity: data.originCity,
      destinationCountry: data.destinationCountry,
      destinationCity: data.destinationCity,
      cargo: data.cargo,
      quantity: data.quantity,
      weightKg: data.weightKg,
      cbm: data.cbm,
      packageCount: data.packageCount,
      mode: data.mode,
      container: data.container,
      incoterm: data.incoterm,
      cargoReadyDate: data.cargoReadyDate,
      specialRequirements: data.specialRequirements,
      notes: data.notes,
      consent: true,
      sourceSlug: meta.sourceSlug,
      sourceUrl: meta.sourceUrl,
      channel: meta.channel,
    },
  });

  notifyNewLead({
    contactName: data.contactName,
    company: data.company,
    email: data.email,
    phone: data.phone,
    route: `${data.originCountry} → ${data.destinationCountry}`,
    cargo: data.cargo,
    mode: data.mode,
    channel: meta.channel,
  }).catch((err) => console.error("notifyNewLead failed", err));

  return lead;
}
