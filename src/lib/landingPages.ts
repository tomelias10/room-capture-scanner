// Landing page catalogue. Every page targets genuine buyer-intent search
// queries (freight forwarder / shipping quote / a specific trade lane) -
// not a mechanical city x category cross-product. Three page types:
//
//   hub     - "Freight Forwarding in {City}" for a major logistics hub
//   route   - "Shipping from China to {Country}" for a specific trade lane
//   service - a mode/incoterm-specific buyer-intent page (FCL, LCL, DDP...)
//
// Add a page by adding one entry to LANDING_PAGES. Content is real and
// general (port/airport roles, mode trade-offs) - no invented prices,
// transit times, or claims of a local office we don't have.

import { MODES, INCOTERMS } from "@/lib/mode-types";

export type Faq = { q: string; a: string };

export type Prefill = {
  originCountry?: string;
  destinationCountry?: string;
  mode?: (typeof MODES)[number];
  incoterm?: (typeof INCOTERMS)[number];
};

export type LandingPage = {
  slug: string;
  pageType: "hub" | "route" | "service";
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  faqs: Faq[];
  targetQueries: string[];
  prefill?: Prefill;
};

// Shared FAQ knowledge base - reused across pages so the same accurate
// answer doesn't get rewritten (and drift) 25 times.
const FAQ = {
  quoteInfo: {
    q: "What information do you need to give me a freight quote?",
    a: "At minimum: origin and destination (country and city or port), what the cargo is, its weight and volume (or CBM), your preferred shipping mode, and roughly when it will be ready to move. The more of that you can provide up front, the faster we can come back with options.",
  },
  fclVsLcl: {
    q: "Should I ship FCL or LCL?",
    a: "FCL (Full Container Load) makes sense once your cargo fills roughly half a container or more - you pay for the whole container but nothing is shared or consolidated. LCL (Less than Container Load) is usually more cost-effective for smaller shipments, since you only pay for the space you use, though it typically takes longer because your cargo is consolidated with other shippers' goods.",
  },
  airVsSea: {
    q: "Should I ship by air or by sea?",
    a: "Sea freight is the standard choice for larger, less time-sensitive shipments - it's far cheaper per kilogram but slower. Air freight costs more but is much faster and better suited to urgent, high-value, or lightweight cargo. Many shippers use sea freight for routine restocking and air freight for time-critical orders.",
  },
  incoterms: {
    q: "What's the difference between EXW, FOB, and DDP?",
    a: "These Incoterms define who's responsible for what along the shipment. Under EXW (Ex Works), the buyer arranges and pays for everything from the seller's door onward. Under FOB (Free on Board), the seller handles export and loading at the origin port, then the buyer takes over. Under DDP (Delivered Duty Paid), the seller handles the entire journey, including destination customs and duties - it's the lowest-effort option for the buyer, but usually the most expensive.",
  },
  documents: {
    q: "What documents are usually needed for an international shipment?",
    a: "It depends on the cargo and the countries involved, but a commercial invoice, packing list, and bill of lading (or air waybill) are standard for most shipments. Depending on the goods and destination, a certificate of origin or product-specific certificates may also be required. We'll confirm exactly what's needed once we know your cargo and route.",
  },
  cargoReady: {
    q: "What does \"cargo ready date\" mean?",
    a: "It's the date your goods will actually be packed and available for collection or drop-off - not the date you'd like them to arrive. Giving an accurate cargo-ready date helps us plan the right routing and give you a realistic outlook.",
  },
} satisfies Record<string, Faq>;

const HUBS: {
  id: string;
  city: string;
  country: string;
  blurb: string[];
}[] = [
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    blurb: [
      "New York is one of the busiest freight gateways on the US East Coast, served by the Port of New York and New Jersey and international air cargo capacity at JFK.",
      "It's a common entry and exit point for cargo moving between Europe, the Americas, and beyond, with strong onward trucking and rail connections across the Northeast.",
    ],
  },
  {
    id: "los-angeles",
    city: "Los Angeles",
    country: "United States",
    blurb: [
      "Los Angeles and neighboring Long Beach together form the largest container port complex in the United States, and the primary US gateway for Trans-Pacific trade from Asia.",
      "Cargo landing here typically moves onward by rail or truck to distribution hubs across the country, making it a natural entry point for imports from China and East Asia.",
    ],
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    blurb: [
      "London sits at the center of UK trade, with air cargo capacity at Heathrow and sea freight typically routed through nearby ports like Felixstowe and Southampton.",
      "As a major financial and commercial hub, it's a common destination for both B2B freight and e-commerce shipments entering the UK market.",
    ],
  },
  {
    id: "rotterdam",
    city: "Rotterdam",
    country: "Netherlands",
    blurb: [
      "Rotterdam is the largest seaport in Europe and a primary gateway for cargo entering the EU by sea, with extensive barge, rail, and road connections deep into the continent.",
      "Its scale and connectivity make it a common choice for shippers looking to distribute goods across Western and Central Europe from a single port of entry.",
    ],
  },
  {
    id: "hamburg",
    city: "Hamburg",
    country: "Germany",
    blurb: [
      "Hamburg is Germany's largest port and a key gateway for cargo moving into Central and Eastern Europe, with strong rail links deep inland.",
      "It's a frequent choice for shipments destined for German industry and onward distribution across the EU.",
    ],
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    blurb: [
      "Dubai, anchored by Jebel Ali Port and Al Maktoum/Dubai International airports, is one of the busiest logistics and transshipment hubs in the Middle East.",
      "It's a common staging point for cargo moving between Asia, Africa, and Europe, as well as a significant destination market in its own right.",
    ],
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    blurb: [
      "Singapore is one of the world's busiest transshipment ports and the primary logistics hub for Southeast Asia.",
      "Its position on major East-West shipping lanes makes it a natural routing point for cargo moving between Asia, Europe, and Oceania.",
    ],
  },
  {
    id: "hong-kong",
    city: "Hong Kong",
    country: "Hong Kong",
    blurb: [
      "Hong Kong has long served as a trade gateway to and from mainland China, with major container port facilities and one of the world's busiest air cargo hubs.",
      "It remains a common routing and consolidation point for cargo moving in and out of the Pearl River Delta manufacturing region.",
    ],
  },
  {
    id: "shanghai",
    city: "Shanghai",
    country: "China",
    blurb: [
      "Shanghai is the world's busiest container port and the primary export gateway for goods manufactured across eastern China.",
      "For most shippers sourcing from China, cargo either originates near Shanghai or is consolidated there before heading overseas.",
    ],
  },
  {
    id: "mumbai",
    city: "Mumbai",
    country: "India",
    blurb: [
      "Mumbai, served by the nearby Jawaharlal Nehru Port, is one of India's key gateways for international trade.",
      "It's a common origin point for cargo exported from western India, and a major entry point for imports into the Indian market.",
    ],
  },
];

const ROUTE_DESTINATIONS: {
  id: string;
  country: string;
  blurb: string[];
  faqExtra?: Faq;
}[] = [
  {
    id: "united-states",
    country: "United States",
    blurb: [
      "Shipping from China to the United States is one of the highest-volume trade lanes in the world, typically moving by sea freight into West Coast ports like Los Angeles/Long Beach, or by air for time-sensitive cargo.",
      "US customs entry requires accurate commodity classification (HS codes) and, depending on the goods, may involve other agencies beyond standard customs clearance.",
    ],
  },
  {
    id: "united-kingdom",
    country: "United Kingdom",
    blurb: [
      "Shipments from China to the UK typically move by sea to ports like Felixstowe or Southampton, or by air into Heathrow for faster delivery.",
      "Since Brexit, UK-bound cargo from China is cleared through standard UK customs procedures rather than EU customs, which is worth confirming with your forwarder if you're used to shipping into the EU.",
    ],
  },
  {
    id: "germany",
    country: "Germany",
    blurb: [
      "China-to-Germany freight commonly enters the EU via Hamburg or Rotterdam by sea, or directly by air into Frankfurt, before onward distribution across Germany and neighboring countries.",
      "As an EU member state, goods cleared into Germany benefit from free onward movement across the rest of the EU single market.",
    ],
  },
  {
    id: "netherlands",
    country: "Netherlands",
    blurb: [
      "Cargo shipped from China to the Netherlands typically arrives at Rotterdam, Europe's largest port, which is a common choice for shippers who need strong onward connectivity across the EU.",
      "The Netherlands' logistics infrastructure makes it a popular entry point even for cargo whose final destination is elsewhere in Europe.",
    ],
  },
  {
    id: "france",
    country: "France",
    blurb: [
      "Shipping from China to France typically moves by sea into Le Havre or Marseille, or by air into Paris (CDG), depending on urgency and cargo type.",
      "As with other EU destinations, customs clearance follows standard EU import procedures once the shipment is cleared at any EU port of entry.",
    ],
  },
  {
    id: "uae",
    country: "United Arab Emirates",
    blurb: [
      "China-to-UAE shipments often route through Jebel Ali Port in Dubai, a major transshipment hub, making the UAE both a significant destination market and a common staging point for onward distribution across the Middle East and Africa.",
      "Sea freight is standard for larger shipments, with air freight into Dubai available for urgent cargo.",
    ],
  },
  {
    id: "saudi-arabia",
    country: "Saudi Arabia",
    blurb: [
      "Freight from China to Saudi Arabia typically moves by sea into Jeddah or Dammam, or by air for urgent shipments, serving one of the largest consumer and industrial markets in the Gulf region.",
      "Certain product categories require Saudi-specific certification (such as SASO conformity), which is worth confirming early in the process.",
    ],
  },
  {
    id: "australia",
    country: "Australia",
    blurb: [
      "China-to-Australia freight is a major trade lane, typically moving by sea into ports like Sydney or Melbourne, with air freight available for time-sensitive cargo.",
      "Australian customs and biosecurity rules are notably strict, particularly for anything involving wood packaging, food, or organic materials.",
    ],
  },
  {
    id: "canada",
    country: "Canada",
    blurb: [
      "Shipping from China to Canada commonly enters via the Port of Vancouver on the West Coast, with onward rail connections across the country, or by air into major hubs like Toronto.",
      "Canadian customs procedures are broadly similar to those in the US, though the two countries' import rules and duty rates are administered separately.",
    ],
  },
  {
    id: "india",
    country: "India",
    blurb: [
      "China-to-India freight typically moves by sea into ports like Mumbai (via Jawaharlal Nehru Port) or Chennai, with air freight an option for smaller, urgent shipments.",
      "Import duties and documentation requirements can vary significantly by product category, so early classification of your goods is particularly useful on this lane.",
    ],
  },
];

const SERVICES: {
  id: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  faqs: Faq[];
  targetQueries: string[];
  prefill?: Prefill;
}[] = [
  {
    id: "freight-forwarder",
    h1: "International Freight Forwarder",
    metaTitle: "International Freight Forwarder - Request a Quote",
    metaDescription:
      "Submit your shipment details and get connected with freight options for sea, air, and road cargo moving internationally.",
    intro: [
      "A freight forwarder arranges the movement of cargo on your behalf - booking space with carriers, handling documentation, and coordinating the journey from origin to destination, without owning the ships, planes, or trucks itself.",
      "Whether you're shipping a single pallet or a full container, tell us your route and cargo details and we'll review the options for moving it.",
    ],
    faqs: [FAQ.quoteInfo, FAQ.fclVsLcl, FAQ.documents],
    targetQueries: ["freight forwarder", "international freight", "freight quote"],
  },
  {
    id: "air-freight-quote",
    h1: "Air Freight Quote",
    metaTitle: "Air Freight Quote - Fast International Shipping",
    metaDescription:
      "Request an air freight quote for time-sensitive or high-value cargo moving internationally.",
    intro: [
      "Air freight is the fastest way to move cargo internationally, and the standard choice when time matters more than cost - urgent orders, high-value goods, or shipments too time-sensitive for sea freight.",
      "Tell us your route, cargo weight and dimensions, and how soon it needs to move, and we'll review air freight options for your shipment.",
    ],
    faqs: [FAQ.airVsSea, FAQ.quoteInfo, FAQ.documents],
    targetQueries: ["air freight quote", "international air freight", "urgent cargo shipping"],
    prefill: { mode: "air" },
  },
  {
    id: "fcl-shipping",
    h1: "FCL Shipping (Full Container Load)",
    metaTitle: "FCL Shipping Quote - Full Container Load",
    metaDescription:
      "Request a quote for a full container load (FCL) sea freight shipment.",
    intro: [
      "FCL - Full Container Load - means your cargo has an entire shipping container to itself, rather than being consolidated with other shippers' goods. It's generally the more cost-effective and predictable option once your cargo fills roughly half a container or more.",
      "Tell us your route, container size preference, and cargo details, and we'll review FCL options for your shipment.",
    ],
    faqs: [FAQ.fclVsLcl, FAQ.incoterms, FAQ.cargoReady],
    targetQueries: ["FCL shipping", "full container load quote", "container shipping quote"],
    prefill: { mode: "sea", },
  },
  {
    id: "lcl-shipping",
    h1: "LCL Shipping (Less than Container Load)",
    metaTitle: "LCL Shipping Quote - Less than Container Load",
    metaDescription:
      "Request a quote for a consolidated (LCL) sea freight shipment - pay only for the space your cargo needs.",
    intro: [
      "LCL - Less than Container Load - lets you ship smaller quantities of cargo by sharing container space with other shippers, so you only pay for the volume you actually use.",
      "It's typically the more economical option for shipments that don't fill half a container, though transit times can be longer due to consolidation and deconsolidation at each end.",
    ],
    faqs: [FAQ.fclVsLcl, FAQ.quoteInfo, FAQ.documents],
    targetQueries: ["LCL shipping", "less than container load quote", "consolidated cargo shipping"],
    prefill: { mode: "sea" },
  },
  {
    id: "ddp-shipping",
    h1: "DDP Shipping Explained",
    metaTitle: "DDP Shipping Quote - Delivered Duty Paid",
    metaDescription:
      "Request a DDP (Delivered Duty Paid) freight quote - we handle the shipment through to destination customs clearance.",
    intro: [
      "DDP - Delivered Duty Paid - is the Incoterm under which the seller (or their forwarder) takes responsibility for the entire journey, including destination customs clearance and duties, so the buyer simply receives the goods.",
      "It's often the lowest-effort option for buyers who don't want to deal with customs themselves, though it typically costs more than terms like FOB or EXW where the buyer takes on more of the process.",
    ],
    faqs: [FAQ.incoterms, FAQ.documents, FAQ.quoteInfo],
    targetQueries: ["DDP shipping", "delivered duty paid quote", "DDP freight forwarder"],
    prefill: { incoterm: "DDP" },
  },
];

export const LANDING_PAGES: LandingPage[] = [
  ...HUBS.map((h): LandingPage => ({
    slug: `${h.id}-freight-forwarding`,
    pageType: "hub",
    h1: `Freight Forwarding in ${h.city}`,
    metaTitle: `Freight Forwarding in ${h.city}, ${h.country} - Request a Quote`,
    metaDescription: `Shipping cargo to or from ${h.city}? Submit your shipment details and get connected with freight forwarding options.`,
    intro: h.blurb,
    faqs: [FAQ.quoteInfo, FAQ.fclVsLcl, FAQ.airVsSea],
    targetQueries: [`freight forwarder ${h.city.toLowerCase()}`, `shipping quote ${h.city.toLowerCase()}`, "international freight"],
    prefill: { originCountry: h.country },
  })),
  ...ROUTE_DESTINATIONS.map((r): LandingPage => ({
    slug: `china-to-${r.id}-shipping`,
    pageType: "route",
    h1: `Shipping from China to ${r.country}`,
    metaTitle: `Shipping from China to ${r.country} - Freight Quote`,
    metaDescription: `Get a freight quote for shipments from China to ${r.country} - sea, air, FCL, and LCL options.`,
    intro: r.blurb,
    faqs: [FAQ.quoteInfo, FAQ.incoterms, r.faqExtra ?? FAQ.documents],
    targetQueries: [
      `shipping from china to ${r.country.toLowerCase()}`,
      `china freight forwarder`,
      `china to ${r.country.toLowerCase()} freight`,
    ],
    prefill: { originCountry: "China", destinationCountry: r.country },
  })),
  ...SERVICES.map((s): LandingPage => ({
    slug: s.id,
    pageType: "service",
    h1: s.h1,
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    intro: s.intro,
    faqs: s.faqs,
    targetQueries: s.targetQueries,
    prefill: s.prefill,
  })),
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return LANDING_PAGES.find((p) => p.slug === slug);
}
