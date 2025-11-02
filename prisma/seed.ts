/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Note: Default container kinds are now automatically initialized
  // when the ContainerTypeView loads if the table is empty.
  // This happens via the getAllContainerKinds endpoint.
  
  console.log('Seed completed!');
  console.log('Note: Container kinds will be automatically initialized when the ContainerTypeView is accessed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

