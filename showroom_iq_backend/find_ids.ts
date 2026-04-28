import prisma from './src/config/prisma';

async function main() {
  const showroom = await prisma.showroom.findFirst({
    where: { name: { contains: 'OUTLET Rabat' } }
  });
  
  const user = await prisma.user.findFirst({
    where: { fullName: { contains: 'BAZI' } }
  });

  console.log('SHOWROOM_ID:', showroom?.id);
  console.log('USER_ID:', user?.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
