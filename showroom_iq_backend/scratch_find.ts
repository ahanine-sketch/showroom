import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { fullName: { contains: 'BAZI MOHAMMED', mode: 'insensitive' } },
  });
  console.log('User:', user);

  const showroom = await prisma.showroom.findFirst({
    where: { name: { contains: 'Rabat', mode: 'insensitive' } },
  });
  console.log('Showroom:', showroom);
}

main().catch(console.error).finally(() => prisma.$disconnect());
