# Delivery Leads Platform

A system that connects customers looking for delivery/moving services with
suppliers, earning a commission on every deal. This is a **global** platform
- leads can come from any country. Leads arrive through **explicit opt-in**
(consent) on landing pages, not through scraping or automated posting into
groups/forums - that would violate those platforms' terms of service and,
depending on the lead's jurisdiction, spam laws (e.g. GDPR in the EU,
CAN-SPAM in the US, CASL in Canada, Israel's Telecom Law Amendment 40) - so
it's intentionally not supported here.

## What's here

- **50 landing pages** (`/lp/[slug]`) - a combination of 10 major cities
  across different countries × 5 shipment types, defined in
  `src/lib/landingPages.ts`. Adding another city/country or shipment type
  is a one-line change; the backend itself isn't limited to this list -
  any lead, from any country, is accepted and matched.
- **Lead form with a required consent checkbox** - it can't be submitted
  without explicit opt-in.
- **Automatic supplier matching** - `POST /api/leads` geocodes the address
  (Google Geocoding API) and finds the closest active supplier in the same
  category, preferring a match in the lead's own country and falling back
  to a global search if none exists yet.
- **Instant WhatsApp notification** on every new lead, via Meta's official
  WhatsApp Cloud API (`src/lib/whatsapp.ts`).
- **Automated paid campaigns** on Facebook/Instagram and Google Ads, via
  the official SDKs (`src/lib/ads/`), launched with `npm run ads:launch`.
  Every campaign is created **PAUSED** on purpose - review and enable it
  manually in Ads Manager so no ad spend happens without human oversight.
- **Admin dashboard** - `/admin/leads` (leads + commissions),
  `/admin/suppliers` (supplier list + add form), and `/admin/content`
  (organic content calendar).

## Organic marketing (no ad budget)

This entire section only posts to channels **you own** - your business
Facebook/Instagram Page and your Google Business Profile - via each
platform's official API. This is fundamentally different from a bot that
posts into other people's groups/forums (which stays out of scope, budget
or not - see above): this is just normal management of your own digital
assets, like any business does.

- **SEO** - each of the 50 landing pages has a unique `<title>`/meta
  description and `Service` JSON-LD, there's a `/blog` with 5 real, useful
  guides (not thin content) linking back to the relevant landing pages, and
  automatic `sitemap.xml`/`robots.txt` (`src/app/sitemap.ts`,
  `src/app/robots.ts`) - free, compounding organic traffic from Google.
- **Content calendar** - `npm run content:calendar` generates 30 days of
  scheduled posts (cycling through the 50 landing pages and 5 guides, with
  varied phrasing so it doesn't read as duplicate content) into the
  `SocialPost` table.
- **Publishing** - `npm run content:post` publishes every post whose time
  has come, to your Facebook Page (`src/lib/social/facebookPage.ts`),
  Instagram (`src/lib/social/instagram.ts`), or Google Business Profile
  (`src/lib/social/googleBusinessProfile.ts`). Run it on a schedule (cron,
  a Vercel Cron Job, a GitHub Actions scheduled workflow) - e.g. hourly -
  and every due post publishes automatically.
- **Important**: Instagram posts need a real image - `generateContentCalendar`
  defaults to a `/og-image.jpg` placeholder that must be replaced with real
  images before those posts actually run.

What was intentionally **not** built, and why:

- **Automated listing on marketplaces like Craigslist, Yad2, or Facebook
  Marketplace** - none of these have an official API for posting listings
  on behalf of a third party like this. A bot that impersonates a user to
  post there would violate their terms of service, the same problem as
  posting into groups. If you want a presence there, it requires manual
  posting or each platform's own official advertising product for
  businesses.

## Running locally

```bash
npm install
cp .env.example .env   # fill in your keys
npm run db:push        # creates the database from prisma/schema.prisma
npm run db:seed        # seeds a few sample suppliers
npm run dev
```

The site runs on `http://localhost:3000`. The home page links to all 50
landing pages, and `/admin/leads` + `/admin/suppliers` show the data.

## API keys to fill in `.env`

| Variable | Where to get it |
|---|---|
| `GOOGLE_MAPS_API_KEY` | Google Cloud Console, enable the Geocoding API |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `ADMIN_WHATSAPP_NUMBER` | Meta Business Manager → WhatsApp → API Setup |
| `FACEBOOK_ACCESS_TOKEN`, `FACEBOOK_AD_ACCOUNT_ID`, `FACEBOOK_PAGE_ID` | Meta Business Manager → Marketing API |
| `GOOGLE_ADS_*` | Google Ads API — [official guide](https://developers.google.com/google-ads/api/docs/get-started) |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Meta Business Manager → your Page → Page access tokens |
| `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID` | An Instagram professional account linked to your Facebook Page |
| `GOOGLE_BUSINESS_*` | Business Profile API — full setup steps in `src/lib/social/googleBusinessProfile.ts` |

Before running `npm run ads:launch` for Google, fill in
`GEO_TARGET_CONSTANTS` in `scripts/createCampaigns.ts` with the numeric
Google Ads location ID for each city (find yours in the
[official geo targets list](https://developers.google.com/google-ads/api/data/geotargets)
or via `GeoTargetConstantService`).

## Before production

- **Auth** on `/admin/*` pages - currently open to anyone who knows the URL.
- Move from SQLite to Postgres (`DATABASE_URL` + change `provider` in
  `schema.prisma`).
- An approved WhatsApp template (`new_lead_alert`) if you want to notify
  outside the 24h session window with the customer/admin number.
- Rate limiting on `POST /api/leads` to prevent form spam.
- Since leads and suppliers can be in any country, check which consent/
  marketing regulations apply where your customers actually are (GDPR,
  CAN-SPAM, CASL, etc.) - the required consent checkbox here is a baseline,
  not a substitute for jurisdiction-specific legal review.
