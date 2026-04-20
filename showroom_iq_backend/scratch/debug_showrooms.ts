import { PrismaClient } from '@prisma/client';
import { ShowroomScoringService } from '../src/services/ShowroomScoringService';

const prisma = new PrismaClient();

async function debugShowrooms() {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    console.log(`Debug with Scoring Service for ${currentMonth}/${currentYear}...`);
    const showrooms = await prisma.showroom.findMany({ select: { id: true, name: true } });

    for (const s of showrooms) {
      console.log(`Calculating performance for: ${s.name} (${s.id})`);
      try {
        const performance = await ShowroomScoringService.calculatePerformance(s.id, currentMonth, currentYear);
        console.log(`- Performance: ${performance}`);
      } catch (err: any) {
        console.error(`- ERROR in ShowroomScoringService for ${s.name}:`, err.message);
        if (err.stack) console.error(err.stack);
      }
    }

  } catch (error) {
    console.error('Fatal Debug Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugShowrooms();
