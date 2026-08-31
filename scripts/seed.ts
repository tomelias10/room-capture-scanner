// Sample suppliers across a few countries so the lead-matching flow works
// out of the box. Run with: npm run db:seed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const suppliers = [
  { name: "QuickShip Couriers", phone: "+12125550101", category: "local-delivery", country: "United States", commissionPct: 0.1, lat: 40.7128, lng: -74.006 },
  { name: "London Movers Co", phone: "+442075550102", category: "apartment-moving", country: "United Kingdom", commissionPct: 0.12, lat: 51.5074, lng: -0.1278 },
  { name: "Gulf Cargo Freight", phone: "+971501230103", category: "international-shipping", country: "United Arab Emirates", commissionPct: 0.08, lat: 25.2048, lng: 55.2708 },
  { name: "Express Furniture Movers", phone: "+16475550104", category: "furniture-delivery", country: "Canada", commissionPct: 0.1, lat: 43.6532, lng: -79.3832 },
  { name: "B2B Logistics Partners", phone: "+61285550105", category: "business-delivery", country: "Australia", commissionPct: 0.15, lat: -33.8688, lng: 151.2093 },
];

async function main() {
  for (const s of suppliers) {
    await prisma.supplier.create({ data: s });
  }
  console.log(`Seeded ${suppliers.length} suppliers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
