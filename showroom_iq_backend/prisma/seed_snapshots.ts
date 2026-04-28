import prisma from '../src/config/prisma';

async function main() {
  console.log('🌱 Seeding snapshots for BAZI MOHAMMED and OUTLET Rabat...');

  const userId = '1c81b892-b8e5-47c1-9eee-daf69e8da052'; // BAZI MOHAMMED
  const showroomId = 'e367a946-ebc4-490d-b52c-97fb4f5d2e54'; // Magasin OUTLET Rabat
  const month = 1; // January
  const year = 2026;

  // 1. Commercial Snapshot
  await prisma.monthlySnapshot.upsert({
    where: {
      userId_month_year_type: {
        userId,
        month,
        year,
        type: 'COMMERCIAL'
      }
    },
    update: {
      totalCA: 65000,
      totalDevisCreated: 20,
      totalDevisValidated: 12,
      totalDevisLost: 4,
      totalDevisOpened: 4,
      avgBasket: 5416.67,
      conservativeCA: 35000,
      likelyCA: 60000,
      exceedCA: 90000,
      caAchievedPct: 108.33,
      avisPositifs: 5,
      avisNegatifs: 0,
      savTickets: 1,
      savPlaintes: 0,
      processWarnings: 0,
      absences: 0,
      retards: 1,
      conges: 0,
      notesPositives: 8,
      notesNegatives: 0,
      totalBonus: 1200,
      salesScore: 85,
      behaviorScore: 95,
      presenceScore: 90,
      bonusScore: 5,
      globalScore: 88,
      frozenAt: new Date(),
      status: 'FROZEN'
    },
    create: {
      userId,
      type: 'COMMERCIAL',
      month,
      year,
      totalCA: 65000,
      totalDevisCreated: 20,
      totalDevisValidated: 12,
      totalDevisLost: 4,
      totalDevisOpened: 4,
      avgBasket: 5416.67,
      conservativeCA: 35000,
      likelyCA: 60000,
      exceedCA: 90000,
      caAchievedPct: 108.33,
      avisPositifs: 5,
      avisNegatifs: 0,
      savTickets: 1,
      savPlaintes: 0,
      processWarnings: 0,
      absences: 0,
      retards: 1,
      conges: 0,
      notesPositives: 8,
      notesNegatives: 0,
      totalBonus: 1200,
      salesScore: 85,
      behaviorScore: 95,
      presenceScore: 90,
      bonusScore: 5,
      globalScore: 88,
      frozenAt: new Date(),
      status: 'FROZEN'
    }
  });

  // 2. Showroom Snapshot
  await prisma.monthlySnapshot.upsert({
    where: {
      showroomId_month_year_type: {
        showroomId,
        month,
        year,
        type: 'SHOWROOM'
      }
    },
    update: {
      totalCA: 450000,
      totalDevisCreated: 150,
      totalDevisValidated: 90,
      totalDevisLost: 30,
      totalDevisOpened: 30,
      avgBasket: 5000,
      conservativeCA: 350000,
      likelyCA: 500000,
      exceedCA: 750000,
      caAchievedPct: 90,
      avisPositifs: 45,
      avisNegatifs: 2,
      savTickets: 15,
      savPlaintes: 1,
      processWarnings: 3,
      absences: 2,
      retards: 8,
      conges: 5,
      notesPositives: 120,
      notesNegatives: 10,
      totalBonus: 8500,
      salesScore: 78,
      behaviorScore: 82,
      presenceScore: 75,
      bonusScore: 0,
      globalScore: 79,
      frozenAt: new Date(),
      status: 'FROZEN'
    },
    create: {
      showroomId,
      type: 'SHOWROOM',
      month,
      year,
      totalCA: 450000,
      totalDevisCreated: 150,
      totalDevisValidated: 90,
      totalDevisLost: 30,
      totalDevisOpened: 30,
      avgBasket: 5000,
      conservativeCA: 350000,
      likelyCA: 500000,
      exceedCA: 750000,
      caAchievedPct: 90,
      avisPositifs: 45,
      avisNegatifs: 2,
      savTickets: 15,
      savPlaintes: 1,
      processWarnings: 3,
      absences: 2,
      retards: 8,
      conges: 5,
      notesPositives: 120,
      notesNegatives: 10,
      totalBonus: 8500,
      salesScore: 78,
      behaviorScore: 82,
      presenceScore: 75,
      bonusScore: 0,
      globalScore: 79,
      frozenAt: new Date(),
      status: 'FROZEN'
    }
  });

  // 3. Add Bonus History for verification
  await prisma.bonusHistory.deleteMany({ where: { userId, month, year } });
  await prisma.bonusHistory.create({
    data: {
      userId,
      amount: 1200,
      description: 'Performance Exceptionnelle Janvier (Snapshot Test)',
      month,
      year,
      date: new Date(2026, 0, 15)
    }
  });

  console.log('✅ Snapshots seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
