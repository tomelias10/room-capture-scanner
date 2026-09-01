// Minimal remote MCP server (Streamable HTTP transport, via Vercel's
// mcp-handler) exposing exactly one WRITE-ONLY tool: create_freight_request.
// It shares freightRequestSchema + createFreightLead() with the human form
// and the REST endpoint - one lead pipeline, three entry points.
//
// Deliberately does NOT expose any read/list tool. An MCP client can create
// a lead and get back a confirmation id; it can never fetch leads, browse
// other customers' requests, or reach the admin inbox. See README's GEO/
// agent-access section for the research behind this design (why MCP over
// A2A/UCP/AP2 here, and why write-only).
import { createMcpHandler } from "mcp-handler";
import { NextRequest, NextResponse } from "next/server";
import { freightRequestSchema, createFreightLead } from "@/lib/leads";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

const mcpHandler = createMcpHandler((server) => {
  server.registerTool(
    "create_freight_request",
    {
      title: "Create Freight Request",
      description:
        "Submit a freight/cargo shipment requirement to SourceLane for manual review by a human. " +
        "Returns only a confirmation id - this tool cannot read, list, or search any existing leads " +
        "or customer data. Use this when a user wants to request a freight/shipping quote.",
      inputSchema: freightRequestSchema,
    },
    async (args) => {
      const lead = await createFreightLead(args, { channel: "mcp" });
      return {
        content: [
          {
            type: "text",
            text: `Freight request received (id: ${lead.id}). A member of the team will review it and follow up by email/phone - this API does not provide a quote or response time.`,
          },
        ],
      };
    },
  );
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`mcp:${ip}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return mcpHandler(req);
}

export { mcpHandler as GET, mcpHandler as DELETE };
