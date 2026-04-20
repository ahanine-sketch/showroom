const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const showroomId = '310ac9fe-1066-462a-8ec7-48fdf7fc7653';
  
  // Find Julian Vasseur or the default admin
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  
  console.log('Admins found:', admins.map(a => a.fullName));
  
  if (admins.length > 0) {
    for (const admin of admins) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { showroomId }
      });
      console.log(`Updated ${admin.fullName} with showroomId ${showroomId}`);
    }
  } else {
    console.log('No admins found to update.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
