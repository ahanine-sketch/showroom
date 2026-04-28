import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- USERS ---');
  const targetNames = ['HIMICH', 'BAZI'];
  for (const name of targetNames) {
    const users = await prisma.user.findMany({
      where: { fullName: { contains: name, mode: 'insensitive' } },
      select: { id: true, fullName: true, role: true }
    });
    console.log(`Searching for "${name}":`, users);
  }

  console.log('--- SHOWROOMS ---');
  const showrooms = await prisma.showroom.findMany({
    where: { name: { contains: 'Rabat', mode: 'insensitive' } },
    select: { id: true, name: true }
  });
  console.log(showrooms);

  const himich = (await prisma.user.findFirst({ where: { fullName: { contains: 'HIMICH', mode: 'insensitive' } } }));
  const rabat = (await prisma.showroom.findFirst({ where: { name: { contains: 'Rabat', mode: 'insensitive' } } }));

  if (himich) {
    console.log('--- HIMICH SNAPSHOTS ---');
    const sn = await prisma.monthlySnapshot.findMany({
        where: { userId: himich.id }
    });
    console.log(sn);
  }

  if (rabat) {
    console.log('--- RABAT SHOWROOM SNAPSHOTS ---');
    const sn = await prisma.monthlySnapshot.findMany({
        where: { showroomId: rabat.id }
    });
    console.log(sn);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
