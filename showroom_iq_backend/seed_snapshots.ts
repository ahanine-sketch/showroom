import prisma from './src/config/prisma';

async function main() {
  const showroomId = 'e367a946-ebc4-490d-b52c-97fb4f5d2e54';
  const userId = '1c81b892-b8e5-47c1-9eee-daf69e8da052';
  const month = 1; // January
  const year = 2026;

  console.log('🌱 Seeding Professional Snapshots for Jan 2026...');

  // 1. Showroom Snapshot
  await prisma.monthlySnapshot.upsert({
    where: { showroomId_month_year_type: { showroomId, month, year, type: 'SHOWROOM' } },
    update: {},
    create: {
      showroomId,
      type: 'SHOWROOM',
      month,
      year,
      totalCA: 1250000,
      totalDevisCreated: 150,
      totalDevisValidated: 85,
      totalDevisLost: 45,
      totalDevisOpened: 20,
      avgBasket: 14705,
      conservativeCA: 1000000,
      likelyCA: 1200000,
      exceedCA: 1500000,
      caAchievedPct: 104.16,
      avisPositifs: 45,
      avisNegatifs: 2,
      savTickets: 12,
      savPlaintes: 1,
      processWarnings: 2,
      absences: 0,
      retards: 3,
      conges: 0,
      notesPositives: 5,
      notesNegatives: 1,
      totalBonus: 12500,
      salesScore: 95,
      behaviorScore: 88,
      presenceScore: 100,
      bonusScore: 90,
      globalScore: 93,
      frozenAt: new Date('2026-02-01T00:00:00Z'),
      status: 'FROZEN'
    }
  });

  // 2. Commercial Snapshot
  await prisma.monthlySnapshot.upsert({
    where: { userId_month_year_type: { userId, month, year, type: 'COMMERCIAL' } },
    update: {},
    create: {
      userId,
      type: 'COMMERCIAL',
      month,
      year,
      totalCA: 450000,
      totalDevisCreated: 55,
      totalDevisValidated: 32,
      totalDevisLost: 15,
      totalDevisOpened: 8,
      avgBasket: 14062,
      conservativeCA: 350000,
      likelyCA: 400000,
      exceedCA: 500000,
      caAchievedPct: 112.5,
      avisPositifs: 15,
      avisNegatifs: 0,
      savTickets: 5,
      savPlaintes: 0,
      processWarnings: 0,
      absences: 0,
      retards: 1,
      conges: 0,
      notesPositives: 3,
      notesNegatives: 0,
      totalBonus: 4500,
      salesScore: 100,
      behaviorScore: 92,
      presenceScore: 95,
      bonusScore: 100,
      globalScore: 97,
      frozenAt: new Date('2026-02-01T00:00:00Z'),
      status: 'FROZEN'
    }
  });

  console.log('✅ Snapshots created successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
