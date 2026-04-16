
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.dailyLog.findMany({ take: 5 });
  console.log('DailyLogs:', JSON.stringify(logs, null, 2));
  
  const evals = await prisma.processEvaluation.findMany({ 
    where: { type: 'PRESENCE' },
    take: 5 
  });
  console.log('Presence Evaluations:', JSON.stringify(evals, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
