// A handful of real, useful freight articles - not a development priority
// (the landing pages are), kept lean. Each links to a few relevant
// landing pages by slug.

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  relatedSlugs: string[]; // LandingPage.slug values
  paragraphs: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "fcl-vs-lcl-shipping",
    title: "FCL vs LCL: which one should you ship?",
    description: "How Full Container Load and Less than Container Load compare, and when each makes sense.",
    publishedAt: "2026-01-15",
    relatedSlugs: ["fcl-shipping", "lcl-shipping"],
    paragraphs: [
      "FCL (Full Container Load) means your cargo has an entire container to itself. It's the more predictable option, and generally more cost-effective once your cargo fills roughly half a container or more, since you're not sharing space or waiting on other shippers.",
      "LCL (Less than Container Load) consolidates your cargo with other shippers' goods in a shared container, so you only pay for the volume you use. It's typically the better economic choice for smaller shipments, but transit times are usually longer because of the extra consolidation and deconsolidation steps at each end.",
      "The crossover point depends on your specific rates and route, but as a rule of thumb: below about half a container's worth of cargo, LCL is usually more economical; above that, FCL usually wins on both cost and simplicity.",
    ],
  },
  {
    slug: "exw-vs-fob-vs-ddp",
    title: "EXW vs FOB vs DDP: understanding Incoterms",
    description: "What the most common Incoterms mean for who handles what - and who pays for it.",
    publishedAt: "2026-02-03",
    relatedSlugs: ["ddp-shipping", "freight-forwarder"],
    paragraphs: [
      "Incoterms define exactly where responsibility for a shipment shifts from seller to buyer. Under EXW (Ex Works), the buyer takes on everything from the seller's door onward - export clearance, main transport, import clearance, delivery. It's the lowest price from the seller, but the most work for the buyer.",
      "Under FOB (Free on Board), the seller handles export clearance and loading the cargo onto the vessel at the origin port; the buyer takes over from there, arranging and paying for the main transport and import side.",
      "Under DDP (Delivered Duty Paid), the seller (or their forwarder) handles the entire journey, including destination customs clearance and duties - the buyer simply receives the goods. It costs more, but it's the simplest option if you don't want to deal with customs yourself.",
    ],
  },
  {
    slug: "air-vs-sea-freight",
    title: "Air freight vs sea freight: how to choose",
    description: "The real trade-offs between speed and cost when deciding how to ship.",
    publishedAt: "2026-02-20",
    relatedSlugs: ["air-freight-quote", "fcl-shipping"],
    paragraphs: [
      "Sea freight is the default for most international cargo - it's far cheaper per kilogram, and well suited to large or heavy shipments that aren't time-critical.",
      "Air freight costs significantly more, but moves in days rather than weeks. It makes sense for urgent orders, high-value or lightweight goods, or when a delay would cost more than the freight itself.",
      "Many businesses use both: sea freight for routine restocking, and air freight as a fallback when something needs to move fast. Knowing your cargo-ready date and how firm your deadline is will usually settle the decision.",
    ],
  },
  {
    slug: "documents-needed-for-international-shipping",
    title: "What documents do you need for an international shipment?",
    description: "The paperwork that comes up on most freight shipments, and what it's for.",
    publishedAt: "2026-03-05",
    relatedSlugs: ["freight-forwarder"],
    paragraphs: [
      "A commercial invoice and packing list are standard on almost every international shipment - they describe what's being shipped, its value, and how it's packed.",
      "A bill of lading (for sea freight) or air waybill (for air freight) is the transport document issued by the carrier, and typically needed to release the cargo at destination.",
      "Depending on the goods and the destination country, you may also need a certificate of origin or product-specific certification. Requirements vary by product and country, so it's worth confirming what applies to your shipment early rather than at the port.",
    ],
  },
  {
    slug: "when-does-ddp-make-sense",
    title: "When does DDP shipping make sense?",
    description: "Delivered Duty Paid shifts the whole journey - including customs - onto the seller. Here's when that's worth it.",
    publishedAt: "2026-03-22",
    relatedSlugs: ["ddp-shipping"],
    paragraphs: [
      "DDP (Delivered Duty Paid) puts the seller or their forwarder in charge of the entire shipment, including destination customs clearance and duty payment - the buyer just receives the goods, no customs involvement required.",
      "It tends to make the most sense for buyers who are unfamiliar with the destination country's import process, or who simply want one predictable, all-in cost rather than dealing with customs brokers themselves.",
      "The trade-off is cost: DDP is usually the most expensive Incoterm, since the seller is pricing in the risk and effort of handling customs on the buyer's behalf. For experienced importers with their own customs setup, terms like FOB or EXW are often more cost-effective.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
