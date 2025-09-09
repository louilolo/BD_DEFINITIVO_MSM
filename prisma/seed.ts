import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  await db.room.createMany({
    data: [
      { name: 'Sala 101', location: 'Bloco A', capacity: 12, openremoteAssetId: 'asset-101' },
      { name: 'Sala 102', location: 'Bloco A', capacity: 8,  openremoteAssetId: 'asset-102' }
    ],
    skipDuplicates: true,
  });
  console.log('Seed ok');
}
main().finally(()=>db.$disconnect());
