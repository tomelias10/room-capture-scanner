# SourceLane

A global freight lead-generation site. It is **not** a marketplace, not a
supplier/forwarder directory, and does not do automatic matching. It does
exactly one thing:

```
Google / AI search / direct link
  → visitor lands on a relevant freight page
  → submits a freight requirement
  → gets a clean confirmation
  → the lead is stored privately for manual, internal follow-up
```

Nothing about a lead - name, email, phone, cargo, route - is ever public.
No supplier is contacted automatically. A human reviews every request.

## Public site

- **25 landing pages** (`/lp/[slug]`, `src/lib/landingPages.ts`) across
  three types, each targeting genuine buyer-intent search queries rather
  than a mechanical city × category grid:
  - **10 hub pages** - "Freight Forwarding in {City}" for major logistics
    hubs (New York, Los Angeles, London, Rotterdam, Hamburg, Dubai,
    Singapore, Hong Kong, Shanghai, Mumbai), each with real, general
    information about that city's role in freight (port/airport, typical
    routing) - no invented offices, ratings, or stats.
  - **10 route pages** - "Shipping from China to {Country}" for the ten
    highest-volume destinations, each with lane-specific, general guidance
    (typical ports, customs notes).
  - **5 service pages** - freight-forwarder, air-freight-quote,
    fcl-shipping, lcl-shipping, ddp-shipping - targeting generic
    high-intent terms like "freight forwarder" and "FCL shipping".
  - See the **landing page audit table** below for why this set replaced
    the previous 50-page city × shipment-type grid.
- **One freight request form** (`src/components/FreightRequestForm.tsx`)
  on every landing page, with a single CTA: **Request a Freight Quote**.
  No supplier cards, no directories, no rate/price claims.
- **A few freight guides** (`/blog`) - kept lean on purpose (see
  "What was deprioritized" below).

## The lead pipeline (one, not several)

`src/lib/leads.ts` defines `freightRequestSchema` (zod) and
`createFreightLead()`. Three entry points call it, and only it:

1. **The web form** → `POST /api/freight-request` (`channel: "web"`)
2. **Any external caller** → the same `POST /api/freight-request`
   (`channel: "api"`) - see the machine-readable interface below
3. **An MCP-capable AI agent** → the `create_freight_request` MCP tool
   (`channel: "mcp"`) - see the MCP section below

Every path validates with the same schema, writes to the same `Lead`
table, and triggers the same private WhatsApp notification to
`ADMIN_WHATSAPP_NUMBER`. There is no second lead table and no automatic
forwarding to a supplier - a human decides what happens with each lead
from the admin inbox.

`POST /api/freight-request` also has:
- **Rate limiting** - 5 requests / 10 minutes per IP (`src/lib/rateLimit.ts`,
  in-memory; swap for a shared store like Upstash Redis if you run
  multiple instances).
- **Honeypot spam protection** - a hidden `website` field real visitors
  never see; a bot that fills it gets a fake success response instead of
  a lead being created.

## Admin (private lead inbox)

`/admin/leads` - the only admin surface. For each lead: source page,
source URL, created date, country/route, cargo, contact details, full
shipment info, and a status you can update inline (NEW → CONTACTED →
QUALIFIED → QUOTE_IN_PROGRESS → QUOTE_SENT → WON / LOST), plus a free-text
internal notes field.

**Real authentication**, not obscurity: `src/middleware.ts` enforces HTTP
Basic Auth on `/admin/*` and `/api/admin/*` using `ADMIN_USER` /
`ADMIN_PASSWORD`. If those aren't set, admin returns 503 rather than
opening up. `/admin/` and `/api/` are also disallowed in `robots.txt`.

## Running locally

```bash
npm install
cp .env.example .env         # fill in ADMIN_USER/ADMIN_PASSWORD at minimum
npm run db:push               # creates the database from prisma/schema.prisma
npm run dev
```

Visit `http://localhost:3000`. Submit a freight request from any `/lp/...`
page, then open `http://localhost:3000/admin/leads` (browser will prompt
for the Basic Auth credentials) to see it.

## Production build

```bash
npm run build
npm run start
```

## Machine-readable interface: `POST /api/freight-request`

```json
{
  "contactName": "Jane Doe",
  "company": "Acme Furniture Co",
  "email": "jane@acme.com",
  "phone": "+1 555 123 4567",
  "originCountry": "China",
  "originCity": "Shanghai",
  "destinationCountry": "United States",
  "destinationCity": "Los Angeles",
  "cargo": "Wooden furniture",
  "quantity": "40 pallets",
  "weightKg": 8000,
  "cbm": 45,
  "mode": "sea",
  "container": "40HQ",
  "incoterm": "FOB",
  "cargoReadyDate": "2026-11-01",
  "consent": true
}
```

Returns `201 { "id": "<lead id>" }` on success, `400` on invalid data,
`429` if rate-limited. It never returns lead data back out - write-only,
same as the MCP tool.

## MCP: `create_freight_request`

`src/app/api/mcp/route.ts` runs a minimal remote MCP server (Streamable
HTTP transport, via Vercel's [`mcp-handler`](https://github.com/vercel/mcp-handler))
at `/api/mcp`, exposing exactly **one** tool:

- **`create_freight_request`** - same `freightRequestSchema`, same
  `createFreightLead()` pipeline as the form and the REST endpoint.
  Returns a lead id and a plain-language confirmation. **Write-only**: no
  tool exists to list, search, or fetch leads, and there is no path from
  this tool to `/admin`. Rate-limited the same way as the REST endpoint.

### Why MCP, and not A2A / UCP / AP2

Researched against current official sources (see below) before building
anything:

- **MCP** (Model Context Protocol) is the right fit. Its July 2026 spec
  update made remote servers materially easier to run behind a normal
  HTTP endpoint (Streamable HTTP transport, replacing the old SSE
  transport), which is exactly our shape: a Next.js route an agent can
  call to perform one write action. Low complexity, genuine value for any
  MCP-aware agent.
- **A2A** (Agent2Agent) solves a different problem - two autonomous
  agents discovering each other and delegating multi-step tasks via Agent
  Cards, with 150+ organizations (Microsoft, AWS, Salesforce, SAP, and
  others) building on it as of 2026. A freight request isn't a delegated
  task between agents; it's a single form submission. Not relevant here.
- **UCP** (Universal Commerce Protocol, announced by Google in January
  2026) and **AP2** (Agent Payments Protocol) are both about agentic
  *commerce* - carts, checkout, and payment authorization ("Mandates").
  A freight quote *request* has no cart and no payment step; nothing is
  purchased at this stage. Not relevant here, per the spec's own "only if
  relevant" instruction.
- **A plain REST endpoint remains necessary regardless of MCP** - not
  every agent framework speaks MCP yet, and any HTTP client can already
  call `POST /api/freight-request` today. MCP is additive, not a
  replacement.
- **Abuse prevention**: the MCP route is rate-limited by IP exactly like
  the REST endpoint (`isRateLimited`, `src/lib/rateLimit.ts`). Real
  per-agent authentication (OAuth-based, per the MCP spec's auth
  extension) is a reasonable next step if abuse becomes a problem, but
  wasn't necessary to ship a safe write-only tool today.

Sources consulted: the [MCP 2026-07-28 spec announcement](https://blog.modelcontextprotocol.io/posts/2026-07-28/),
the [Google A2A protocol announcement](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
and [Wikipedia's A2A overview](https://en.wikipedia.org/wiki/Agent2Agent),
Google's [UCP announcement](https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/)
and [AP2 announcement](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol),
and [Vercel's mcp-handler](https://github.com/vercel/mcp-handler).

## GEO (Generative Engine Optimization)

Beyond traditional SEO, every landing page is written to be easy for AI
answer engines and agents to parse directly:

- Clear, single-sentence entity description in the sitewide `Organization`
  + `WebSite` JSON-LD (`src/app/layout.tsx`): who SourceLane is, what the
  service does.
- Each landing page carries `WebPage` + `BreadcrumbList` + `FAQPage`
  JSON-LD (`src/app/lp/[slug]/page.tsx`). Google [deprecated FAQ rich
  results in Search in May 2026](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/),
  but `FAQPage` remains valid Schema.org markup, and Google has said it
  will keep parsing it - useful for AI systems reading the page even
  without a search-result snippet.
- Concise, factual H1s and FAQ answers rather than vague marketing copy,
  so "what is this page for" is unambiguous to a model reading it.
- One stable action per page (`POST /api/freight-request` /
  `create_freight_request`), documented in plain language above, so an
  agent - or a person reading the API - can go from "I need to ship
  cargo" to a completed request without guessing.

## Landing page audit

The previous version of this repo had 50 pages built as a city × 5
generic "shipment type" grid (e.g. "Local Delivery in Tel Aviv") - a
parcel-delivery framing that doesn't match a freight-forwarding lead-gen
business, and several of those combinations had no real differentiation
beyond the city name. They were replaced entirely with the 25 pages
below, each targeting genuine buyer-intent queries. Fewer pages, more
differentiation - per-page content, not just a swapped city name.

| Page | Target query examples | Search intent | KEEP/MERGE/REWRITE |
|---|---|---|---|
| 10× `{city}-freight-forwarding` | "freight forwarder {city}", "shipping quote {city}" | Find a forwarder serving a specific hub | **REWRITE** (replaces old city pages; unique port/airport content per city) |
| 10× `china-to-{country}-shipping` | "shipping from china to {country}", "china freight forwarder" | High-volume trade-lane research | **NEW** (highest-commercial-value pages per the brief's own examples) |
| `freight-forwarder` | "freight forwarder", "international freight" | Generic top-of-funnel | **NEW** |
| `air-freight-quote` | "air freight quote" | Urgent/high-value cargo | **NEW** |
| `fcl-shipping` | "FCL shipping" | Full container shippers | **NEW** |
| `lcl-shipping` | "LCL shipping" | Small/consolidated shippers | **NEW** |
| `ddp-shipping` | "DDP shipping" | Buyers wanting door-to-door | **NEW** |
| Old 50-page city × shipment-type grid | generic "local delivery {city}" etc. | Parcel/moving intent, not freight | **MERGED/REMOVED** - wrong business model |

## What was removed (marketplace/matching functionality)

Per direct instruction, all of the following were removed - not hidden,
removed - because the product is a lead intake form, not a marketplace:

- The `Supplier` and `Deal` Prisma models, and every reference to them
  (automatic nearest-supplier matching, commission tracking, supplier
  rankings, "matched supplier" display).
- `/admin/suppliers` page, `SupplierForm` component, and the
  `POST /api/admin/suppliers` route.
- `src/lib/geo.ts` (Google Maps geocoding + haversine distance matching) -
  no longer needed since there's no automatic matching to power.
- The old `/api/leads` endpoint and generic `LeadForm` (replaced by
  `/api/freight-request` and `FreightRequestForm`).

Kept, since it's marketing infrastructure rather than marketplace
functionality and doesn't appear as part of the product a lead sees:
the Facebook/Google Ads campaign launcher (`scripts/createCampaigns.ts`)
and the organic content calendar (`scripts/generateContentCalendar.ts`,
`/admin/content`) - both updated to point at the new landing pages.

## What was deprioritized

- **The blog** - kept at 5 short, genuinely useful articles (FCL vs LCL,
  Incoterms, air vs sea, required documents, when DDP makes sense) that
  mirror the FAQ content already on the landing pages. No further blog
  content investment - landing pages are the priority, per instruction.
- **Fake locations/claims** - no city offices, no reviews/ratings, no
  transit-time or price numbers that can't be backed up. Where a page
  needed to say something specific (e.g. "Rotterdam is the largest
  seaport in Europe"), it's general, verifiable, public knowledge, not a
  claim about SourceLane's own operations.

## API keys to fill in `.env`

| Variable | Required for |
|---|---|
| `ADMIN_USER`, `ADMIN_PASSWORD` | Admin inbox access (required - admin is locked without them) |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `ADMIN_WHATSAPP_NUMBER` | Instant private lead notifications |
| `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_AD_ACCOUNT_ID`, `FACEBOOK_PAGE_ID` | Paid campaign automation (`npm run ads:launch`), optional |
| `GOOGLE_ADS_*` | Paid campaign automation, optional |
| `FACEBOOK_PAGE_ACCESS_TOKEN`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `GOOGLE_BUSINESS_*` | Organic content calendar, optional |

No paid SEO/keyword tools, analytics products, or hosting upgrades were
used or are required - everything above is either free or something you
already pay for as part of running ads on that platform.

## Remaining blockers / before production

- Deploy behind HTTPS (Basic Auth credentials are sent per-request and
  must not go over plain HTTP).
- Move from SQLite to Postgres for a real deployment (`DATABASE_URL` +
  change `provider` in `prisma/schema.prisma`).
- The in-memory rate limiter resets on redeploy and isn't shared across
  instances - fine for one server, swap for a shared store if you scale out.
- An approved WhatsApp template (`new_lead_alert`) if you want
  notifications outside the 24h session window.
- No analytics wired up yet (landing page view / form started / form
  submitted / lead created) - the brief asked for zero-cost only; a
  simple self-hosted or first-party option (e.g. Plausible self-hosted,
  or just server-side event logging) is the natural next step.
