import { PrismaClient, EvaluationType } from '@prisma/client';
import { MonthlySnapshotService } from '../src/services/MonthlySnapshotService';

const prisma = new PrismaClient();

const BAZI_ID = 'a2751377-a20b-4de8-8b75-8700f8c65768';

interface MonthData {
  ca: number;
  devis: { created: number; validated: number; lost: number; opened: number };
  objectives: { c: number; l: number; e: number };
  presence: { date: number; status: string; notes: string }[];
  reviews: { rating: number; comment: string }[];
  evaluations: { type: EvaluationType; date: number; notes: string; warningLevel?: number }[];
  bonus?: number;
}

async function seedMonth(month: number, year: number, data: MonthData) {
  const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(year, month - 1));
  console.log(`🌱 Seeding test data for BAZI MOHAMMED (${monthName} ${year})...`);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Cleanup
  await prisma.salesMetric.deleteMany({ where: { userId: BAZI_ID, date: { gte: startDate, lte: endDate } } });
  await prisma.dailyLog.deleteMany({ where: { userId: BAZI_ID, date: { gte: startDate, lte: endDate } } });
  await prisma.clientReview.deleteMany({ where: { userId: BAZI_ID, date: { gte: startDate, lte: endDate } } });
  await prisma.processEvaluation.deleteMany({ where: { userId: BAZI_ID, date: { gte: startDate, lte: endDate } } });
  await prisma.bonusHistory.deleteMany({ where: { userId: BAZI_ID, month, year } });
  await prisma.objective.deleteMany({ where: { userId: BAZI_ID, month, year } });
  await prisma.monthlySnapshot.deleteMany({ where: { userId: BAZI_ID, month, year } });

  // 1. Sales Metrics
  await prisma.salesMetric.create({
    data: {
      userId: BAZI_ID,
      ca: data.ca,
      devisCreated: data.devis.created,
      devisValidated: data.devis.validated,
      devisLost: data.devis.lost,
      devisOpened: data.devis.opened,
      avgBasket: Math.round(data.ca / (data.devis.validated || 1)),
      savCount: data.evaluations.filter(e => e.type === EvaluationType.SAV).length,
      date: new Date(year, month - 1, 15, 12, 0, 0),
    }
  });

  // 2. Objectives
  await prisma.objective.create({
    data: {
      userId: BAZI_ID,
      month,
      year,
      type: 'GLOBAL',
      conservativeCA: data.objectives.c,
      likelyCA: data.objectives.l,
      exceedCA: data.objectives.e,
    }
  });

  // 3. Presence Logs
  await prisma.dailyLog.createMany({
    data: data.presence.map(p => ({
      userId: BAZI_ID,
      date: new Date(year, month - 1, p.date, 9, 0),
      activity: 'PRESENCE',
      status: p.status,
      notes: p.notes
    }))
  });

  // 4. Comportement (Reviews & Evaluations)
  await prisma.clientReview.createMany({
    data: data.reviews.map((r, i) => ({
      userId: BAZI_ID,
      name: `Client ${monthName} ${i + 1}`,
      rating: r.rating,
      comment: r.comment,
      date: new Date(year, month - 1, 10 + i)
    }))
  });

  await prisma.processEvaluation.createMany({
    data: data.evaluations.map(e => ({
      userId: BAZI_ID,
      type: e.type,
      notes: e.notes,
      warningLevel: e.warningLevel || 1,
      date: new Date(year, month - 1, e.date)
    }))
  });

  // 5. Bonus
  if (data.bonus) {
    await prisma.bonusHistory.create({
      data: {
        userId: BAZI_ID,
        amount: data.bonus,
        description: `Prime Performance ${monthName}`,
        month,
        year,
        date: endDate,
      }
    });
  }

  // 6. Freeze Snapshot
  console.log(`❄️ Freezing ${monthName} ${year} Snapshot...`);
  await MonthlySnapshotService.freezeCommercial(BAZI_ID, month, year, true);
}

async function main() {
  await prisma.user.upsert({
    where: { id: BAZI_ID },
    update: { status: 'ACTIVE' },
    create: {
      id: BAZI_ID,
      fullName: 'BAZI MOHAMMED',
      email: 'bazi.mohammed@example.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
      role: 'COMMERCIAL',
      status: 'ACTIVE',
    },
  });

  // --- JANVIER 2026 ---
  await seedMonth(1, 2026, {
    ca: 310000,
    devis: { created: 12, validated: 4, lost: 4, opened: 4 },
    objectives: { c: 450000, l: 550000, e: 650000 },
    presence: [{ date: 5, status: 'Absence', notes: 'Malade' }],
    reviews: [{ rating: 3, comment: "Moyen" }],
    evaluations: [
      { type: EvaluationType.SAV, date: 15, notes: "Problème SAV" },
      { type: EvaluationType.PROCESS, date: 20, notes: "Procédure non respectée", warningLevel: 2 }
    ],
    bonus: 0
  });

  // --- FÉVRIER 2026 ---
  await seedMonth(2, 2026, {
    ca: 540000,
    devis: { created: 25, validated: 15, lost: 3, opened: 7 },
    objectives: { c: 450000, l: 550000, e: 650000 },
    presence: [{ date: 10, status: 'Presence', notes: 'OK' }],
    reviews: [{ rating: 5, comment: "Excellent" }],
    evaluations: [
      { type: EvaluationType.PROCESS, date: 5, notes: "Oubli badge", warningLevel: 1 },
      { type: EvaluationType.PROCESS, date: 22, notes: "Dossier incomplet", warningLevel: 1 }
    ],
    bonus: 1200
  });

  // --- MARS 2026 ---
  await seedMonth(3, 2026, {
    ca: 710000,
    devis: { created: 45, validated: 32, lost: 5, opened: 8 },
    objectives: { c: 500000, l: 600000, e: 700000 },
    presence: [
      { date: 4, status: 'Presence', notes: 'OK' },
      { date: 12, status: 'Retard', notes: '15 min' }
    ],
    reviews: [
      { rating: 5, comment: "Bravo" },
      { rating: 4, comment: "Très pro" }
    ],
    evaluations: [
      { type: EvaluationType.PROCESS, date: 15, notes: "Retard ouverture showroom", warningLevel: 2 },
      { type: EvaluationType.SAV, date: 18, notes: "Oubli rappel client" }
    ],
    bonus: 3000
  });

  console.log('✅ Seeds complete for Jan, Feb, March 2026!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
