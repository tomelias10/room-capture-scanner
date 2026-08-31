// Sample suppliers so the lead-matching flow works out of the box.
// Run with: npm run db:seed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const suppliers = [
  { name: "מהיר שילוחים", phone: "0501111111", category: "local-delivery", commissionPct: 0.1, lat: 32.0853, lng: 34.7818 },
  { name: "הובלות דוד", phone: "0502222222", category: "apartment-moving", commissionPct: 0.12, lat: 32.0853, lng: 34.7818 },
  { name: "גלובל קארגו", phone: "0503333333", category: "international-shipping", commissionPct: 0.08, lat: 32.0853, lng: 34.7818 },
  { name: "רהיטי אקספרס", phone: "0504444444", category: "furniture-delivery", commissionPct: 0.1, lat: 31.7683, lng: 35.2137 },
  { name: "B2B לוגיסטיקס", phone: "0505555555", category: "business-delivery", commissionPct: 0.15, lat: 32.794, lng: 34.9896 },
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
