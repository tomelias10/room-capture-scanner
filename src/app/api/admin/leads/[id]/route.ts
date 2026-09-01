import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { STATUSES } from "@/lib/leadStatus";

const updateSchema = z.object({
  status: z.enum(STATUSES).optional(),
  adminNotes: z.string().max(5000).optional(),
});

// Protected by src/middleware.ts (matcher includes /api/admin/:path*).
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(lead);
}
