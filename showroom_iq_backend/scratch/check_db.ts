
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const BAZI_ID = 'a2751377-a20b-4de8-8b75-8700f8c65768';
  
  console.log('--- MARCH 2026 ---');
  const marchReviews = await prisma.clientReview.findMany({
    where: { userId: BAZI_ID, date: { gte: new Date(2026, 2, 1), lte: new Date(2026, 2, 31, 23, 59, 59) } }
  });
  console.log('March Reviews:', marchReviews.length);
  marchReviews.forEach(r => console.log(`- ${r.name} (${r.date.toISOString()})`));

  const marchProcess = await prisma.processEvaluation.findMany({
    where: { userId: BAZI_ID, date: { gte: new Date(2026, 2, 1), lte: new Date(2026, 2, 31, 23, 59, 59) } }
  });
  console.log('March Process:', marchProcess.length);
  marchProcess.forEach(p => console.log(`- ${p.notes} (${p.date.toISOString()})`));

  console.log('\n--- FEBRUARY 2026 ---');
  const febReviews = await prisma.clientReview.findMany({
    where: { userId: BAZI_ID, date: { gte: new Date(2026, 1, 1), lte: new Date(2026, 1, 28, 23, 59, 59) } }
  });
  console.log('Feb Reviews:', febReviews.length);
  febReviews.forEach(r => console.log(`- ${r.name} (${r.date.toISOString()})`));

  const febProcess = await prisma.processEvaluation.findMany({
    where: { userId: BAZI_ID, date: { gte: new Date(2026, 1, 1), lte: new Date(2026, 1, 28, 23, 59, 59) } }
  });
  console.log('Feb Process:', febProcess.length);
  febProcess.forEach(p => console.log(`- ${p.notes} (${p.date.toISOString()})`));
}

check().catch(console.error).finally(() => prisma.$disconnect());
