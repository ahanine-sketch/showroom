const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.scoringConfig.findMany();
  console.log(JSON.stringify(configs, null, 2));
  const settings = await prisma.globalSettings.findMany();
  console.log(JSON.stringify(settings, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
