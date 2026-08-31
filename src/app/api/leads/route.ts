import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { geocodeAddress, haversineKm, nearestByDistance } from "@/lib/geo";
import { notifyNewLead } from "@/lib/whatsapp";
import { getLandingPage } from "@/lib/landingPages";

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  region: z.string().min(1),
  shipmentType: z.string().min(1),
  source: z.string().min(1),
  // Explicit opt-in is required before we may contact the lead.
  consent: z.literal(true),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "נתונים לא תקינים או שחסר אישור קבלת פנייה" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const page = getLandingPage(data.source);

  // Fall back to the landing page's city coordinates when no address (or no
  // Google Maps API key) is available, so matching still works.
  const geocoded = data.address ? await geocodeAddress(data.address) : null;
  const origin = geocoded ?? (page ? { lat: page.city.lat, lng: page.city.lng } : null);

  const candidateSuppliers = await prisma.supplier.findMany({
    where: { active: true, category: data.shipmentType },
  });

  const supplier = origin
    ? nearestByDistance(origin, candidateSuppliers)
    : candidateSuppliers[0] ?? null;

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email ?? undefined,
      region: data.region,
      shipmentType: data.shipmentType,
      address: data.address ?? undefined,
      lat: origin?.lat,
      lng: origin?.lng,
      consent: true,
      source: data.source,
      ...(supplier
        ? {
            deal: {
              create: {
                supplierId: supplier.id,
                commissionPct: supplier.commissionPct,
              },
            },
          }
        : {}),
    },
    include: { deal: true },
  });

  notifyNewLead({
    name: data.name,
    phone: data.phone,
    region: data.region,
    shipmentType: data.shipmentType,
    supplierName: supplier?.name,
  }).catch((err) => console.error("notifyNewLead failed", err));

  return NextResponse.json(
    {
      id: lead.id,
      matchedSupplier: supplier
        ? { id: supplier.id, name: supplier.name, distanceKm: origin ? haversineKm(origin, supplier) : null }
        : null,
    },
    { status: 201 },
  );
}
