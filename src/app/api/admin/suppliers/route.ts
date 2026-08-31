import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const supplierSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  category: z.string().min(1),
  country: z.string().min(1),
  commissionPct: z.number().min(0).max(1),
  lat: z.number(),
  lng: z.number(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = supplierSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({ data: parsed.data });
  return NextResponse.json(supplier, { status: 201 });
}
