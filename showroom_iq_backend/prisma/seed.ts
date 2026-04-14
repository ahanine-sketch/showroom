import prisma from '../src/config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Owner: Ayman Hanine
  const ownerPassword = await bcrypt.hash('ayman123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'ayman@showroomiq.com' },
    update: {},
    create: {
      fullName: 'Ayman Hanine',
      email: 'ayman@showroomiq.com',
      passwordHash: ownerPassword,
      role: 'OWNER',
    },
  });
  console.log(`✅ Owner Created: ${owner.fullName}`);

  // 2. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@showroomiq.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@showroomiq.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin Created: ${admin.fullName}`);

  // 3. Create Default Scoring Configuration
  // This allows the scoring engine to work immediately
  const configs = [
    {
      metricName: 'CA',
      weight: 0.6,
      levels: [
        { threshold: 0, points: 0, label: 'Nul' },
        { threshold: 100000, points: 20, label: 'Faible' },
        { threshold: 300000, points: 50, label: 'Moyen' },
        { threshold: 500000, points: 80, label: 'Bien' },
        { threshold: 800000, points: 100, label: 'Excellent' },
      ],
    },
    {
      metricName: 'PROCESS',
      weight: 0.4,
      levels: [
        { threshold: 0, points: 0, label: 'Non Respecté' },
        { threshold: 50, points: 40, label: 'Partiel' },
        { threshold: 80, points: 80, label: 'Conforme' },
        { threshold: 95, points: 100, label: 'Parfait' },
      ],
    },
  ];

  for (const config of configs) {
    await prisma.scoringConfig.upsert({
      where: { metricName: config.metricName },
      update: { weight: config.weight, levels: config.levels },
      create: config,
    });
    console.log(`✅ Scoring Config Created: ${config.metricName}`);
  }

  // 4. Create Global Settings
  const globalSettings = [
    {
      key: 'siq_bonus_config',
      value: { min: 0, max: 10 }
    }
  ];

  for (const setting of globalSettings) {
    await prisma.globalSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
    console.log(`✅ Global Setting Created: ${setting.key}`);
  }

  // 5. Create Commercial User
  const commercialPassword = await bcrypt.hash('commercial123', 10);
  const commercial = await prisma.user.upsert({
    where: { email: 'hajar@showroomiq.com' },
    update: {},
    create: {
      fullName: 'Hajar El Rhiti',
      email: 'hajar@showroomiq.com',
      passwordHash: commercialPassword,
      role: 'COMMERCIAL',
    },
  });
  console.log(`✅ Commercial User Created: ${commercial.fullName} (ID: ${commercial.id})`);

  console.log('🏁 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
