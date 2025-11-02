/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { DEFAULT_CONTAINER_KINDS } from '../src/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Get all users
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('No users found. Container kinds will be initialized when users register or login.');
    return;
  }

  // Initialize container kinds for each user
  for (const user of users) {
    const existingCount = await prisma.containerKind.count({
      where: { userId: user.id }
    });

    if (existingCount === 0) {
      await prisma.containerKind.createMany({
        data: DEFAULT_CONTAINER_KINDS.map(kind => ({
          ...kind,
          userId: user.id,
          tareWeight: kind.tareWeight,
          totalVolume: kind.totalVolume
        })),
        skipDuplicates: true
      });
      console.log(`Initialized default container kinds for user ${user.email}`);
    } else {
      console.log(`User ${user.email} already has ${existingCount} container kinds. Skipping.`);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

