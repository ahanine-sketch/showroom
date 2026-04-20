const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const showrooms = await prisma.showroom.findMany();
  
  for (const s of showrooms) {
    if (s.managerId) {
      console.log(`Setting showroomId ${s.id} for admin ${s.managerId}`);
      await prisma.user.update({
        where: { id: s.managerId },
        data: { showroomId: s.id }
      });
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
