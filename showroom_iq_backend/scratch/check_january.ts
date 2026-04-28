import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const snapshots = await prisma.monthlySnapshot.count({
    where: { month: 1, year: 2026 }
  });
  
  const metrics = await prisma.salesMetric.count({
    where: {
      date: {
        gte: new Date('2026-01-01'),
        lte: new Date('2026-01-31T23:59:59Z')
      }
    }
  });

  const evals = await prisma.processEvaluation.count({
    where: {
      date: {
        gte: new Date('2026-01-01'),
        lte: new Date('2026-01-31T23:59:59Z')
      }
    }
  });

  console.log('--- JANUARY 2026 DATA ---');
  console.log('MonthlySnapshots:', snapshots);
  console.log('SalesMetrics:', metrics);
  console.log('ProcessEvaluations:', evals);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
