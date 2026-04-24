const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching database backup...');
  
  const tables = [
    'user',
    'showroom',
    'objective',
    'salesMetric',
    'dailyScore',
    'scoringConfig',
    'processEvaluation',
    'dailyLog',
    'formationProgress',
    'globalSettings',
    'bonusHistory',
    'clientReview'
  ];

  const backup = {};

  for (const table of tables) {
    console.log(`Backing up ${table}...`);
    try {
      backup[table] = await prisma[table].findMany();
    } catch (e) {
      console.error(`Failed to backup ${table}:`, e.message);
    }
  }

  fs.writeFileSync('database_backup.json', JSON.stringify(backup, null, 2));
  console.log('Backup saved to showroom_iq_backend/database_backup.json');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
