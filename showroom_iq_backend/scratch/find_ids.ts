import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function find() {
  const users = await prisma.user.findMany({
    where: { fullName: { contains: 'BAZI' } },
    select: { id: true, fullName: true }
  });
  const showrooms = await prisma.showroom.findMany({
    where: { name: { contains: 'OUTLET' } },
    select: { id: true, name: true }
  });
  console.log('USERS:', JSON.stringify(users, null, 2));
  console.log('SHOWROOMS:', JSON.stringify(showrooms, null, 2));
}

find().finally(() => prisma.$disconnect());
