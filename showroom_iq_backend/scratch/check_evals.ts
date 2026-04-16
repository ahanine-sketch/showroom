import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const evaluations = await prisma.processEvaluation.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  console.log(JSON.stringify(evaluations, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
