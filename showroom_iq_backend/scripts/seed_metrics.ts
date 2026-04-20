import { PrismaClient, EvaluationType, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('📊 Seeding Real-Time Metrics for April 2026...');

  const month = 4;
  const year = 2026;
  const today = new Date(2026, 3, 20); // April 20, 2026

  // 1. Get the admin and commercials
  const admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  const hajar = await prisma.user.findFirst({ where: { email: 'hajar@showroomiq.com' } });

  if (!admin || !hajar) {
    console.error('❌ Admin or Hajar not found. Run standard seed first.');
    return;
  }

  const showroomId = admin.showroomId || hajar.showroomId;
  if (!showroomId) {
    console.warn('⚠️ No showroom assigned. Creating a default "Showroom Rabat"...');
    const showroom = await prisma.showroom.create({
      data: { name: 'Showroom Rabat', location: 'Rabat', city: 'Rabat', managerId: admin.id }
    });
    await prisma.user.updateMany({ where: { role: { in: [Role.ADMIN, Role.COMMERCIAL] } }, data: { showroomId: showroom.id } });
  }

  // 2. Clear old metrics for April to avoid duplicates
  await prisma.salesMetric.deleteMany({ where: { date: { gte: new Date(2026, 3, 1), lte: new Date(2026, 3, 30) } } });
  await prisma.clientReview.deleteMany({ where: { date: { gte: new Date(2026, 3, 1), lte: new Date(2026, 3, 30) } } });
  await prisma.processEvaluation.deleteMany({ where: { date: { gte: new Date(2026, 3, 1), lte: new Date(2026, 3, 30) } } });
  await prisma.dailyLog.deleteMany({ where: { date: { gte: new Date(2026, 3, 1), lte: new Date(2026, 3, 30) } } });

  // 3. Seed Sales Metrics (Hajar)
  await prisma.salesMetric.create({
    data: {
      userId: hajar.id,
      date: today,
      ca: 45000,
      devisCreated: 10,
      devisValidated: 6,
      devisLost: 2,
      avgBasket: 18000
    }
  });

  // 4. Seed Client Reviews (Avis)
  await prisma.clientReview.createMany({
    data: [
      { userId: hajar.id, showroomId, name: 'Client A', rating: 5, comment: 'Excellent service !', date: today },
      { userId: hajar.id, showroomId, name: 'Client B', rating: 4, comment: 'Très bien.', date: today },
      { userId: hajar.id, showroomId, name: 'Client C', rating: 5, comment: 'Super accueil.', date: today },
      { userId: hajar.id, showroomId, name: 'Client D', rating: 5, comment: 'Vendeuse au top.', date: today },
    ]
  });

  // 5. Seed SAV & Process Evaluations
  await prisma.processEvaluation.createMany({
    data: [
      { userId: hajar.id, showroomId, type: EvaluationType.SAV, ticketsCount: 2, complaintsCount: 0, date: today, notes: 'Quelques retours mineurs' },
      { userId: hajar.id, showroomId, type: EvaluationType.PROCESS, warningLevel: 0, date: today, notes: 'Respect parfait des procédures' }
    ]
  });

  // 6. Seed Presence
  await prisma.dailyLog.createMany({
    data: [
      { userId: hajar.id, showroomId, activity: 'PRESENCE', status: 'Présent', date: new Date(2026, 3, 19) },
      { userId: hajar.id, showroomId, activity: 'PRESENCE', status: 'Présent', date: new Date(2026, 3, 20) }
    ]
  });

  // 7. Seed Showroom Objective fallback
  await prisma.objective.upsert({
    where: { id: 'showroom-rabat-apr-2026' }, // dummy ID for upsert
    update: { conservativeCA: 120000, likelyCA: 180000, exceedCA: 250000 },
    create: {
      id: 'showroom-rabat-apr-2026',
      showroomId: showroomId as string,
      month: 4,
      year: 2026,
      conservativeCA: 120000,
      likelyCA: 180000,
      exceedCA: 250000,
      type: 'SHOWROOM'
    }
  });

  console.log('✅ Real-time metrics seeded for Hajar El Rhiti (April 2026)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
