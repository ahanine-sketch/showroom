import prisma from './src/config/prisma';

console.log('Prisma properties:', Object.keys(prisma).filter(k => !k.startsWith('_')));
process.exit(0);
