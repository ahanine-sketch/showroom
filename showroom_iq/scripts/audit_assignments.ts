import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('--- SHOWROOMS ---');
  const showrooms = await prisma.showroom.findMany({
    include: {
      manager: true,
      users: {
        where: { role: 'ADMIN' }
      }
    }
  });

  for (const s of showrooms) {
    console.log(`Showroom: ${s.name} (${s.id})`);
    console.log(`  Manager: ${s.manager?.fullName || 'NOT ASSIGNED'}`);
    console.log(`  Admins: ${s.users.map(u => u.fullName).join(', ') || 'NONE'}`);
  }

  console.log('\n--- ADMINS WITHOUT SHOWROOMS ---');
  const orphanAdmins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      showroomId: null
    }
  });
  for (const a of orphanAdmins) {
    console.log(`Admin: ${a.fullName} (${a.id})`);
  }

  console.log('\n--- COMMERCIALS WITHOUT SHOWROOMS ---');
  const orphanCommercials = await prisma.user.findMany({
    where: {
      role: 'COMMERCIAL',
      showroomId: null
    }
  });
  for (const c of orphanCommercials) {
    console.log(`Commercial: ${c.fullName} (${c.id})`);
  }
}

checkDatabase().then(() => prisma.$disconnect());
