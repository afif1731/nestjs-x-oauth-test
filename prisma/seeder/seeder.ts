import { PrismaClient } from '@prisma/client';

import { accounts } from './seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ARA 6.0 Database');

  try {
    await accounts();
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(error => {
    // console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });