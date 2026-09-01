import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { freightRequestSchema, createFreightLead } from "@/lib/leads";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

// The human form and any programmatic caller (REST or MCP) all send this
// same shape, plus an optional honeypot field only a bot would fill.
const requestSchema = freightRequestSchema.extend({
  sourceSlug: z.string().max(200).optional(),
  sourceUrl: z.string().url().max(500).optional(),
  website: z.string().max(200).optional(), // honeypot
  channel: z.enum(["web", "api"]).default("api"),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`freight-request:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data, or consent was not given" },
      { status: 400 },
    );
  }

  const { sourceSlug, sourceUrl, website, channel, ...data } = parsed.data;

  // Honeypot tripped - silently accept without creating a lead, so bots
  // don't learn their submission was rejected.
  if (website && website.trim().length > 0) {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  const lead = await createFreightLead(data, { sourceSlug, sourceUrl, channel });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
