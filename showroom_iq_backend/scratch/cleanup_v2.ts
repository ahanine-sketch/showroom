import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    const usersWithEmptyEmail = await prisma.user.findMany({
      where: { email: '' }
    });
    
    console.log(`Found ${usersWithEmptyEmail.length} users with empty string email.`);
    
    if (usersWithEmptyEmail.length > 0) {
      const result = await prisma.user.updateMany({
        where: { email: '' },
        data: { email: null }
      });
      console.log(`Updated ${result.count} users to have null email.`);
    }

    // Also check for duplicates before finishing
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, fullName: true } });
    console.log('Current users with NULL email:');
    allUsers.filter(u => u.email === null).forEach(u => {
      console.log(`- ${u.fullName} (${u.id})`);
    });

  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
