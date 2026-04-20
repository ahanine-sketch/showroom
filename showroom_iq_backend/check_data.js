const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, role: true, showroomId: true }
  });
  const showrooms = await prisma.showroom.findMany();
  
  console.log('--- USERS ---');
  console.log(users);
  console.log('--- SHOWROOMS ---');
  console.log(showrooms);
}

main().catch(console.error).finally(() => prisma.$disconnect());
