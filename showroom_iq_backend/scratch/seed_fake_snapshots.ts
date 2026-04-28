import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const month = 1;
  const year = 2026;

  // Showrooms
  const showrooms = [
    {
      id: 'e367a946-ebc4-490d-b52c-97fb4f5d2e54', // Magasin OUTLET Rabat
      name: 'Magasin OUTLET Rabat',
      totalCA: 485000,
      conservativeCA: 350000,
      likelyCA: 450000,
      exceedCA: 550000,
      avisPositifs: 5,
      avisNegatifs: 0,
      savTickets: 2,
      savPlaintes: 0,
      absences: 0,
      retards: 1,
      totalBonus: 0,
      salesScore: 42,
      behaviorScore: 28,
      presenceScore: 5,
      bonusScore: 0,
      globalScore: 75
    }
  ];

  // Users
  const users = [
    {
      id: '1c81b892-b8e5-47c1-9eee-daf69e8da052', // BAZI MOHAMMED
      name: 'BAZI MOHAMMED',
      totalCA: 285000,
      conservativeCA: 200000,
      likelyCA: 250000,
      exceedCA: 300000,
      avisPositifs: 8,
      avisNegatifs: 0,
      savTickets: 1,
      savPlaintes: 0,
      absences: 0,
      retards: 0,
      totalBonus: 4500,
      salesScore: 63, // As seen in screenshot
      behaviorScore: 24, // As seen in screenshot
      presenceScore: 5,
      bonusScore: 0, // In screenshot it shows 0
      globalScore: 92 // As seen in screenshot
    },
    {
      id: '86109452-9b7c-466e-8340-4a63c0741836', // HIMICH AISSAM
      name: 'HIMICH AISSAM',
      totalCA: 685000,
      conservativeCA: 500000,
      likelyCA: 600000,
      exceedCA: 700000,
      avisPositifs: 12,
      avisNegatifs: 0,
      savTickets: 0,
      savPlaintes: 0,
      absences: 0,
      retards: 0,
      totalBonus: 5200,
      salesScore: 68,
      behaviorScore: 28,
      presenceScore: 5,
      bonusScore: 5,
      globalScore: 106
    }
  ];

  console.log(`❄️ Seeding snapshots for Janvier 2026 with full data...`);

  for (const s of showrooms) {
    console.log(`   - Showroom: ${s.name} (${s.id})`);
    await prisma.monthlySnapshot.upsert({
      where: { showroomId_month_year_type: { showroomId: s.id, month, year, type: 'SHOWROOM' } },
      update: {
        totalCA: s.totalCA,
        conservativeCA: s.conservativeCA,
        likelyCA: s.likelyCA,
        exceedCA: s.exceedCA,
        caAchievedPct: Math.round((s.totalCA / s.likelyCA) * 100),
        avisPositifs: s.avisPositifs,
        avisNegatifs: s.avisNegatifs,
        savTickets: s.savTickets,
        savPlaintes: s.savPlaintes,
        absences: s.absences,
        retards: s.retards,
        totalBonus: s.totalBonus,
        salesScore: s.salesScore,
        behaviorScore: s.behaviorScore,
        presenceScore: s.presenceScore,
        bonusScore: s.bonusScore,
        globalScore: s.globalScore,
        status: 'FROZEN',
        frozenAt: new Date(),
        totalDevisCreated: 120,
        totalDevisValidated: 85,
        totalDevisLost: 15,
        totalDevisOpened: 20,
        avgBasket: 15000
      },
      create: {
        showroomId: s.id,
        type: 'SHOWROOM',
        month,
        year,
        totalCA: s.totalCA,
        conservativeCA: s.conservativeCA,
        likelyCA: s.likelyCA,
        exceedCA: s.exceedCA,
        caAchievedPct: Math.round((s.totalCA / s.likelyCA) * 100),
        avisPositifs: s.avisPositifs,
        avisNegatifs: s.avisNegatifs,
        savTickets: s.savTickets,
        savPlaintes: s.savPlaintes,
        absences: s.absences,
        retards: s.retards,
        totalBonus: s.totalBonus,
        salesScore: s.salesScore,
        behaviorScore: s.behaviorScore,
        presenceScore: s.presenceScore,
        bonusScore: s.bonusScore,
        globalScore: s.globalScore,
        status: 'FROZEN',
        frozenAt: new Date(),
        totalDevisCreated: 120,
        totalDevisValidated: 85,
        totalDevisLost: 15,
        totalDevisOpened: 20,
        avgBasket: 15000
      }
    });
  }

  for (const u of users) {
    console.log(`   - Commercial: ${u.name} (${u.id})`);
    await prisma.monthlySnapshot.upsert({
      where: { userId_month_year_type: { userId: u.id, month, year, type: 'COMMERCIAL' } },
      update: {
        totalCA: u.totalCA,
        conservativeCA: u.conservativeCA,
        likelyCA: u.likelyCA,
        exceedCA: u.exceedCA,
        caAchievedPct: Math.round((u.totalCA / u.likelyCA) * 100),
        avisPositifs: u.avisPositifs,
        avisNegatifs: u.avisNegatifs,
        savTickets: u.savTickets,
        savPlaintes: u.savPlaintes,
        absences: u.absences,
        retards: u.retards,
        totalBonus: u.totalBonus,
        salesScore: u.salesScore,
        behaviorScore: u.behaviorScore,
        presenceScore: u.presenceScore,
        bonusScore: u.bonusScore,
        globalScore: u.globalScore,
        status: 'FROZEN',
        frozenAt: new Date(),
        totalDevisCreated: 45,
        totalDevisValidated: 30,
        totalDevisLost: 5,
        totalDevisOpened: 10,
        avgBasket: 22000
      },
      create: {
        userId: u.id,
        type: 'COMMERCIAL',
        month,
        year,
        totalCA: u.totalCA,
        conservativeCA: u.conservativeCA,
        likelyCA: u.likelyCA,
        exceedCA: u.exceedCA,
        caAchievedPct: Math.round((u.totalCA / u.likelyCA) * 100),
        avisPositifs: u.avisPositifs,
        avisNegatifs: u.avisNegatifs,
        savTickets: u.savTickets,
        savPlaintes: u.savPlaintes,
        absences: u.absences,
        retards: u.retards,
        totalBonus: u.totalBonus,
        salesScore: u.salesScore,
        behaviorScore: u.behaviorScore,
        presenceScore: u.presenceScore,
        bonusScore: u.bonusScore,
        globalScore: u.globalScore,
        status: 'FROZEN',
        frozenAt: new Date(),
        totalDevisCreated: 45,
        totalDevisValidated: 30,
        totalDevisLost: 5,
        totalDevisOpened: 10,
        avgBasket: 22000
      }
    });
  }

  console.log('✅ Snapshots seeded with Behavior, Presence and Bonus data! ❄️');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
