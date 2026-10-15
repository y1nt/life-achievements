import { PrismaClient } from "@prisma/client";
import { catalog } from "../src/lib/catalog";
const db = new PrismaClient();
async function main() {
  for (const a of catalog)
    await db.achievement.upsert({ where: { id: a.id }, update: a, create: a });
  console.log(`Initialized ${catalog.length} achievements.`);
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
